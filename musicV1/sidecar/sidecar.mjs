#!/usr/bin/env node
// Music node sidecar. Zero dependencies, Node >= 22.
//
//   node sidecar.mjs watch                         health loop (every SIDECAR_INTERVAL_MS, default 5 min)
//   node sidecar.mjs check                         one health round, prints JSON, exit 1 if any node is down
//   node sidecar.mjs token nodelink <refreshToken> [visitorData]
//   node sidecar.mjs token lavalink <refreshToken|-> [poToken visitorData]
//   node sidecar.mjs releases                      compare pinned versions with upstream, notify
//   node sidecar.mjs update <stackDir> <ENV_VAR> <newValue> [nodeName]
//                                                  edit stack .env, recreate, health check, roll back on failure
//
// Reads ../.env (same file as the bot) plus process env. See README.md in this folder.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
loadEnvFile(path.resolve(here, '../.env'));

const env = (k, d) => process.env[k]?.trim() || d;
const INTERVAL = Number(env('SIDECAR_INTERVAL_MS', 300_000));
const WEBHOOK = env('SIDECAR_WEBHOOK_URL');
const STATE_FILE = path.resolve(here, env('SIDECAR_STATE_FILE', 'sidecar-state.json'));
// Same file the bot reads (bot/src/music/config.ts). The sidecar only adds/removes "youtube" in `disabled`.
const OVERRIDE_FILE = path.resolve(here, env('MUSIC_CONFIG_FILE', '../bot/music-sources.json'));
// Fail this many rounds in a row on every node before YouTube is switched off for the bot.
const YT_OFF_AFTER = Number(env('SIDECAR_YT_OFF_AFTER', 2));

// Test probes. Keep them few: every probe is a real request to the source.
const PROBES = [
  { source: 'youtube', id: env('SIDECAR_YT_PROBE', 'https://www.youtube.com/watch?v=jNQXAC9IVRw') },
  { source: 'soundcloud', id: env('SIDECAR_SC_PROBE', 'scsearch:lofi') },
];

// SIDECAR_NODELINK_HOST etc. win over the bot's NODELINK_HOST, so the sidecar can watch other nodes than prod uses.
const nodeEnv = k => env(`SIDECAR_${k}`) || env(k);
const NODES = [
  { name: 'NODELINK', kind: 'nodelink', host: nodeEnv('NODELINK_HOST'), pass: nodeEnv('NODELINK_PASS'), secure: nodeEnv('NODELINK_SECURE') === 'true' },
  { name: 'LAVALINK', kind: 'lavalink', host: nodeEnv('LAVALINK_HOST'), pass: nodeEnv('LAVALINK_PASS'), secure: nodeEnv('LAVALINK_SECURE') === 'true' },
].filter(n => n.host);

function loadEnvFile(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const base = n => `${n.secure ? 'https' : 'http'}://${n.host}`;

async function call(n, method, p, body) {
  const r = await fetch(base(n) + p, {
    method,
    headers: { Authorization: n.pass ?? '', 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20_000),
  });
  const text = await r.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return { status: r.status, ok: r.ok, json, text };
}

async function probeNode(n) {
  const out = { name: n.name, up: false, version: null, sources: {}, token: null, error: null };
  try {
    const v = await call(n, 'GET', '/version');
    if (!v.ok) throw new Error(`/version ${v.status}`);
    out.version = v.text.trim();
    out.up = true;
  } catch (e) {
    out.error = e.message;
    return out;
  }
  for (const p of PROBES) {
    try {
      const r = await call(n, 'GET', `/v4/loadtracks?identifier=${encodeURIComponent(p.id)}`);
      const t = r.json?.loadType;
      out.sources[p.source] = t === 'track' || t === 'search' || t === 'playlist'
        ? { ok: true }
        : { ok: false, error: r.json?.data?.message || `${r.status} ${t ?? ''}`.trim() };
    } catch (e) {
      out.sources[p.source] = { ok: false, error: e.message };
    }
  }
  // Only NodeLink can validate the stored refresh token without playing something.
  if (n.kind === 'nodelink') {
    try {
      const r = await call(n, 'GET', '/v4/youtube/config?validate=true');
      if (r.ok) out.token = { configured: !!r.json?.isConfigured, valid: r.json?.isValid ?? null };
    } catch {}
  }
  return out;
}

function readJson(file, def) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return def; }
}

function writeJson(file, data) {
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n');
  fs.renameSync(tmp, file);
}

async function notify(content) {
  console.log(`[sidecar] ${content}`);
  if (!WEBHOOK) return;
  try {
    await fetch(WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'Yumi Music Sidecar', content: content.slice(0, 1900) }),
      signal: AbortSignal.timeout(10_000),
    });
  } catch (e) {
    console.error('[sidecar] webhook failed:', e.message);
  }
}

function setYoutubeDisabled(off) {
  const cfg = readJson(OVERRIDE_FILE, {});
  const disabled = new Set(cfg.disabled || []);
  const was = disabled.has('youtube');
  if (off === was) return false;
  off ? disabled.add('youtube') : disabled.delete('youtube');
  cfg.disabled = [...disabled];
  writeJson(OVERRIDE_FILE, cfg);
  return true;
}

async function round() {
  const results = await Promise.all(NODES.map(probeNode));
  const prev = readJson(STATE_FILE, { nodes: {}, ytFailRounds: 0 });
  const next = { at: new Date().toISOString(), nodes: {}, ytFailRounds: prev.ytFailRounds };

  for (const r of results) {
    const was = prev.nodes[r.name];
    next.nodes[r.name] = r;
    if (was && was.up !== r.up) await notify(r.up ? `✅ ${r.name} กลับมาแล้ว (${r.version})` : `🔴 ${r.name} ล่ม: ${r.error}`);
    for (const [src, s] of Object.entries(r.sources)) {
      const wasOk = was?.sources?.[src]?.ok;
      if (wasOk !== undefined && wasOk !== s.ok) {
        await notify(s.ok ? `✅ ${r.name}: ${src} ใช้ได้อีกครั้ง` : `⚠️ ${r.name}: ${src} ใช้ไม่ได้ — ${s.error}`);
      }
    }
    if (r.token && r.token.configured && r.token.valid === false && was?.token?.valid !== false) {
      await notify(`🔑 ${r.name}: refresh token ของ burner ใช้ไม่ได้แล้ว ให้ login burner ใหม่แล้วรัน \`node sidecar.mjs token nodelink <token>\``);
    }
  }

  const upNodes = results.filter(r => r.up);
  const ytOk = upNodes.some(r => r.sources.youtube?.ok);
  next.ytFailRounds = upNodes.length && !ytOk ? prev.ytFailRounds + 1 : 0;
  if (next.ytFailRounds >= YT_OFF_AFTER && setYoutubeDisabled(true)) {
    await notify(`🛑 YouTube ใช้ไม่ได้ทุก node ${next.ytFailRounds} รอบติด ปิด YouTube ในบอทชั่วคราว (ใช้แหล่งอื่นแทน)`);
  }
  if (ytOk && setYoutubeDisabled(false)) {
    await notify('🟢 YouTube กลับมาแล้ว เปิดให้บอทใช้อีกครั้ง');
  }

  writeJson(STATE_FILE, next);
  return results;
}

async function setToken(kind, refreshToken, a, b) {
  const n = NODES.find(x => x.kind === kind);
  if (!n) throw new Error(`no ${kind} node configured`);
  const rt = refreshToken && refreshToken !== '-' ? refreshToken : undefined;
  if (kind === 'nodelink') {
    const r = await call(n, 'PATCH', '/v4/youtube/config', { refreshToken: rt, visitorData: a });
    if (!r.ok) throw new Error(`PATCH failed ${r.status}: ${r.text}`);
    const check = await call(n, 'GET', '/v4/youtube/config?validate=true');
    console.log(JSON.stringify(check.json, null, 2));
  } else {
    const body = { ...(rt ? { refreshToken: rt, skipInitialization: true } : {}), ...(a ? { poToken: a, visitorData: b } : {}) };
    const r = await call(n, 'POST', '/youtube', body);
    if (!r.ok) throw new Error(`POST /youtube failed ${r.status}: ${r.text}`);
    console.log('ok');
  }
}

// --- releases -------------------------------------------------------------

async function gh(p) {
  const r = await fetch(`https://api.github.com${p}`, { headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(15_000) });
  if (!r.ok) throw new Error(`GitHub ${p} ${r.status}`);
  return r.json();
}

async function ghcrDigest(repo, tag) {
  const t = await (await fetch(`https://ghcr.io/token?scope=repository:${repo}:pull`)).json();
  const r = await fetch(`https://ghcr.io/v2/${repo}/manifests/${tag}`, {
    method: 'HEAD',
    headers: { Authorization: `Bearer ${t.token}`, Accept: 'application/vnd.oci.image.index.v1+json,application/vnd.docker.distribution.manifest.list.v2+json,application/vnd.docker.distribution.manifest.v2+json' },
  });
  return r.headers.get('docker-content-digest');
}

async function releases() {
  const pinned = {
    nodelink: env('PIN_NODELINK', 'v3.9.0'),
    lavalink: env('PIN_LAVALINK', '4.2.2'),
    youtubeSource: env('PIN_YT_PLUGIN', '2be8e542d3f6f178e048dca565892684c2e40177'),
    ytCipher: env('PIN_YT_CIPHER', 'sha256:4c5ec381ff57336cfc24822d2b526a5ad7cd0171f61065a1bbc87bb736842449'),
  };
  const latest = {};
  const errors = [];
  const tryGet = async (k, fn) => { try { latest[k] = await fn(); } catch (e) { errors.push(`${k}: ${e.message}`); } };
  await tryGet('nodelink', async () => (await gh('/repos/PerformanC/NodeLink/releases/latest')).tag_name);
  await tryGet('lavalink', async () => (await gh('/repos/lavalink-devs/Lavalink/releases/latest')).tag_name);
  await tryGet('youtubeSource', async () => (await gh('/repos/lavalink-devs/youtube-source/commits?per_page=1'))[0].sha);
  await tryGet('ytCipher', () => ghcrDigest('kikkia/yt-cipher', 'master'));

  const prev = readJson(STATE_FILE, {});
  const seen = prev.releasesSeen || {};
  const lines = [];
  for (const k of Object.keys(pinned)) {
    if (!latest[k] || latest[k] === pinned[k] || seen[k] === latest[k]) continue;
    lines.push(`• ${k}: ใช้อยู่ \`${pinned[k].slice(0, 19)}\` มีใหม่ \`${latest[k].slice(0, 19)}\``);
    seen[k] = latest[k];
  }
  if (lines.length) await notify(`📦 มีเวอร์ชันใหม่ (ยังไม่ได้อัปเดต ทดสอบด้วย \`sidecar.mjs update\` ก่อน):\n${lines.join('\n')}`);
  writeJson(STATE_FILE, { ...readJson(STATE_FILE, {}), releasesSeen: seen });
  console.log(JSON.stringify({ pinned, latest, errors }, null, 2));
}

// --- update with rollback ---------------------------------------------------

function setEnvLine(file, key, value) {
  const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n') : [];
  const i = lines.findIndex(l => l.match(new RegExp(`^\\s*#?\\s*${key}=`)));
  if (i >= 0) lines[i] = `${key}=${value}`; else lines.push(`${key}=${value}`);
  fs.writeFileSync(file, lines.join('\n'));
}

async function waitHealthy(nodeName, ms) {
  const n = NODES.find(x => x.name === nodeName);
  if (!n) throw new Error(`unknown node ${nodeName}`);
  const end = Date.now() + ms;
  let last;
  while (Date.now() < end) {
    await new Promise(r => setTimeout(r, 15_000));
    last = await probeNode(n);
    // Require the node up and at least one non-YouTube source working. YouTube itself may be blocked
    // for reasons the update did not cause, so it is reported, not required.
    if (last.up && Object.entries(last.sources).some(([s, v]) => s !== 'youtube' && v.ok)) return last;
  }
  throw new Error(`not healthy: ${JSON.stringify(last)}`);
}

async function update(stackDir, key, value, nodeName) {
  const dir = path.resolve(stackDir);
  const envFile = path.join(dir, '.env');
  const backup = `${envFile}.bak-${Date.now()}`;
  if (fs.existsSync(envFile)) fs.copyFileSync(envFile, backup);
  const compose = (...args) => execFileSync('docker', ['compose', ...args], { cwd: dir, stdio: 'inherit' });
  const target = nodeName || (dir.includes('nodelink') ? 'NODELINK' : 'LAVALINK');

  setEnvLine(envFile, key, value);
  try {
    compose('up', '-d', '--build');
    const h = await waitHealthy(target, Number(env('SIDECAR_UPDATE_WAIT_MS', 180_000)));
    await notify(`⬆️ อัปเดต ${target} ${key}=${value.slice(0, 19)} ผ่าน health check (YouTube: ${h.sources.youtube?.ok ? 'ok' : 'fail'})`);
  } catch (e) {
    await notify(`↩️ อัปเดต ${target} ${key}=${value.slice(0, 19)} ไม่ผ่าน rollback: ${e.message.slice(0, 300)}`);
    if (fs.existsSync(backup)) fs.copyFileSync(backup, envFile);
    compose('up', '-d', '--build');
    process.exitCode = 1;
  }
}

// --- main -------------------------------------------------------------------

const [cmd, ...args] = process.argv.slice(2);
if (!NODES.length && cmd !== 'releases') {
  console.error('No nodes configured (NODELINK_HOST / LAVALINK_HOST).');
  process.exit(2);
}
switch (cmd) {
  case 'check': {
    const r = await round();
    console.log(JSON.stringify(r, null, 2));
    process.exitCode = r.every(x => x.up) ? 0 : 1;
    break;
  }
  case 'watch': {
    let lastReleaseCheck = 0;
    for (;;) {
      try { await round(); } catch (e) { console.error('[sidecar] round failed:', e); }
      if (Date.now() - lastReleaseCheck > 86_400_000) {
        lastReleaseCheck = Date.now();
        try { await releases(); } catch (e) { console.error('[sidecar] releases failed:', e.message); }
      }
      await new Promise(r => setTimeout(r, INTERVAL));
    }
  }
  case 'token': await setToken(args[0], args[1], args[2], args[3]); break;
  case 'releases': await releases(); break;
  case 'update': await update(args[0], args[1], args[2], args[3]); break;
  default:
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n'));
}
