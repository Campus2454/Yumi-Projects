// Real playback probe: joins a Discord voice channel with the dev bot and plays each query on
// each node, then reports whether the position actually advanced. Search-only checks miss the
// common failure where loadtracks works but the stream does not ("No streaming data found").
//
//   node sidecar/voiceprobe.mjs <guildId> <voiceChannelId> [seconds] < queries.txt
//   node sidecar/voiceprobe.mjs <guildId> <voiceChannelId> 10 "ytsearch:lisa money" "scsearch:lofi"
//
// Nodes come from NODELINK_* / LAVALINK_* in ../.env (or PROBE_NODES='[{name,url,auth}]').
// Stop the dev bot first if it uses the same token and guild, two sessions fight over voice.
import { Client, GatewayIntentBits } from 'discord.js';
import { Shoukaku, Connectors } from 'shoukaku';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: root + '.env', quiet: true });
const env = (k) => process.env[k]?.trim().replace(/^'|'$/g, '') || '';

const [guildId, channelId, secArg, ...rest] = process.argv.slice(2);
if (!guildId || !channelId) { console.error('usage: voiceprobe.mjs <guildId> <voiceChannelId> [seconds] [query...]'); process.exit(2); }
const seconds = Number(secArg) || 10;
const queries = rest.length ? rest : readFileSync(0, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'));

const nodes = process.env.PROBE_NODES ? JSON.parse(process.env.PROBE_NODES) : [
  env('NODELINK_HOST') && { name: 'NODELINK', url: env('NODELINK_HOST'), auth: env('NODELINK_PASS') },
  env('LAVALINK_HOST') && { name: 'LAVALINK', url: env('LAVALINK_HOST'), auth: env('LAVALINK_PASS') },
].filter(Boolean);

let target = nodes[0].name;
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const shoukaku = new Shoukaku(new Connectors.DiscordJS(client), nodes, {
  reconnectTries: 2, restTimeout: 30,
  nodeResolver: (all) => all.get(target),
});
shoukaku.on('error', (name, e) => console.error(`[${name}] error: ${e.message}`));

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function probe(nodeName, query) {
  const node = shoukaku.nodes.get(nodeName);
  const t0 = Date.now();
  const res = await node.rest.resolve(query).catch(e => ({ loadType: 'error', data: { message: e.message } }));
  const track = res?.loadType === 'track' ? res.data : res?.loadType === 'search' ? res.data[0]
    : res?.loadType === 'playlist' ? res.data.tracks[0] : null;
  if (!track) return { ok: false, stage: 'load', msg: res?.data?.message || res?.loadType || 'no result' };
  const loadMs = Date.now() - t0;

  target = nodeName;
  const player = await shoukaku.joinVoiceChannel({ guildId, channelId, shardId: 0, deaf: true });
  let error = null, started = 0, pos = 0;
  player.on('exception', (e) => { error = e.exception?.message || 'exception'; });
  player.on('stuck', () => { error = error || 'stuck'; });
  player.on('start', () => { started = Date.now(); });
  player.on('update', (u) => { pos = u.state?.position ?? pos; });
  const t1 = Date.now();
  await player.playTrack({ track: { encoded: track.encoded } });
  const until = Date.now() + seconds * 1000;
  while (Date.now() < until && !error) await sleep(500);
  // Ask the node directly, update events are only every few seconds.
  const live = await node.rest.getPlayer(guildId).catch(() => null);
  pos = live?.state?.position ?? pos;
  await shoukaku.leaveVoiceChannel(guildId);
  await sleep(1500);
  const info = track.info;
  return {
    ok: !error && pos >= (seconds - 4) * 1000,
    stage: error ? 'play' : 'ok', msg: error || '',
    title: `${info.sourceName}:${info.identifier} ${info.title}`.slice(0, 70),
    loadMs, startMs: started ? started - t1 : null, posMs: pos,
  };
}

client.once('clientReady', async () => {
  await sleep(3000); // nodes connect
  const results = [];
  for (const q of queries) for (const n of nodes) {
    if (!shoukaku.nodes.get(n.name) || shoukaku.nodes.get(n.name).state !== 1) { results.push({ node: n.name, q, ok: false, stage: 'node', msg: 'not connected' }); continue; }
    const r = await probe(n.name, q).catch(e => ({ ok: false, stage: 'crash', msg: e.message }));
    results.push({ node: n.name, q, ...r });
    console.log(`${r.ok ? 'PASS' : 'FAIL'} ${n.name.padEnd(8)} ${q.padEnd(40)} ${r.stage} pos=${r.posMs ?? '-'} start=${r.startMs ?? '-'}ms load=${r.loadMs ?? '-'}ms ${r.title || ''} ${r.msg || ''}`);
  }
  if (process.env.PROBE_JSON) console.log(JSON.stringify(results));
  client.destroy(); process.exit(0);
});
client.login(env('PROBE_TOKEN') || env('BOT_TOKEN_DEV'));
