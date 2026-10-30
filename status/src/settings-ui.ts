import { LANGS, prefs, t, tMany, tzLabel } from './i18n.js';

/* ------------------------------------------------------------------ */
/*  ปุ่มฟันเฟือง + หน้าต่างตั้งค่า (ภาษา, เขตเวลา, รูปแบบเวลา, อัปเดตอัตโนมัติ,  */
/*  ลดภาพเคลื่อนไหว, อีเมลแจ้งเตือน) ใช้ทุกหน้า รวมหน้าแอดมิน                */
/*  ค่าเก็บใน cookie ys_* (1 ปี) ผู้ที่รับอีเมลบนอุปกรณ์นี้ (cookie ys_sub)     */
/*  จะถูกอัปเดตภาษาและเขตเวลาของอีเมลใน DB ด้วย                            */
/* ------------------------------------------------------------------ */

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const flag = (cc: string) => `<img class="flag" src="https://flagcdn.com/w40/${cc}.png" alt="" width="22" height="16" loading="lazy">`;

export const GEAR = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';

/** ปุ่มฟันเฟือง (ใส่ทางขวาของปุ่มรีเฟรช) */
export const gearButton = () => `<button class="btn" type="button" data-set-open title="${esc(t('settings'))}" aria-label="${esc(t('settings'))}">${GEAR}</button>`;

export const SET_CSS = `
.flag{width:22px;height:16px;border-radius:3px;object-fit:cover;box-shadow:0 0 0 1px rgba(255,255,255,.15);flex:none}
.setm{position:fixed;inset:0;z-index:80;display:grid;place-items:center;padding:16px;background:rgba(3,1,2,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .2s}
.setm.open{opacity:1;pointer-events:auto}
.setm .box{position:relative;width:100%;max-width:520px;max-height:min(88vh,760px);overflow:auto;padding:26px 24px 20px;border-radius:24px;background:linear-gradient(180deg,rgba(40,20,22,.98),rgba(18,8,10,.98));border:1px solid rgba(255,255,255,.12);box-shadow:0 30px 70px -25px rgba(0,0,0,.95);transform:translateY(12px) scale(.98);transition:transform .25s;color:var(--ink,#fff3f1)}
.setm.open .box{transform:none}
.setm h3{margin:0;font-size:1.3rem;font-weight:700;padding-right:44px}
.setm .lead{margin:6px 0 0;color:var(--muted,#b99a97);font-weight:300;font-size:.9rem}
.setm .sec{margin-top:20px}
.setm .sec>label,.setm .sec>.lb{display:block;margin-bottom:8px;font-size:.88rem;color:var(--muted,#b99a97)}
.setm .srch{width:100%;padding:11px 14px;border-radius:12px;font:inherit;font-size:.95rem;color:inherit;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);outline:none}
.setm .srch:focus{border-color:var(--brand,#f13b3b);box-shadow:0 0 0 3px rgba(241,59,59,.18)}
.setm .opts{margin-top:8px;display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:6px;max-height:200px;overflow:auto;padding:2px}
.setm .opt{display:flex;align-items:center;gap:10px;padding:9px 11px;border-radius:12px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);color:inherit;font:inherit;font-size:.92rem;text-align:left;cursor:pointer;transition:background .15s,border-color .15s}
.setm .opt:hover{background:rgba(255,255,255,.08)}
.setm .opt.on{border-color:var(--brand,#f13b3b);background:rgba(241,59,59,.16)}
.setm .opt small{display:block;color:var(--dim,#8a706d);font-size:.75rem}
.setm .tzl{grid-template-columns:1fr}
.setm .seg2{display:inline-flex;gap:2px;padding:4px;border-radius:12px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);flex-wrap:wrap}
.setm .seg2 button{padding:7px 14px;border-radius:9px;border:0;background:none;color:var(--muted,#b99a97);font:inherit;font-size:.9rem;cursor:pointer}
.setm .seg2 button.on{color:#fff;background:linear-gradient(180deg,#ff5a4d,var(--brand,#f13b3b))}
.setm .row2{display:flex;justify-content:space-between;align-items:center;gap:14px;padding:12px 0;border-top:1px solid rgba(255,255,255,.07)}
.setm .row2 small{display:block;color:var(--dim,#8a706d);font-size:.78rem;font-weight:300}
.setm .sw{position:relative;width:46px;height:26px;flex:none;border-radius:99px;border:0;background:rgba(255,255,255,.15);cursor:pointer;transition:background .2s}
.setm .sw::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .2s}
.setm .sw.on{background:var(--ok,#3ddc97)}.setm .sw.on::after{transform:translateX(20px)}
.setm .mail{padding:14px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);font-size:.92rem}
.setm .mail small{display:block;margin-top:4px;color:var(--dim,#8a706d);font-weight:300}
.setm .mail .act{margin-top:10px;display:flex;flex-wrap:wrap;gap:8px}
.setm .ghost{padding:9px 14px;border-radius:11px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.05);color:inherit;font:inherit;font-size:.88rem;cursor:pointer}
.setm .ghost:hover{background:rgba(255,255,255,.1)}
.setm .foot2{margin-top:20px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
.setm .save{padding:12px 26px;border-radius:13px;border:0;color:#fff;font:inherit;font-weight:600;cursor:pointer;background:linear-gradient(180deg,#ff5a4d,var(--brand,#f13b3b));box-shadow:0 10px 26px -10px rgba(241,59,59,.8)}
.setm .x{position:absolute;top:14px;right:14px;width:36px;height:36px;display:grid;place-items:center;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:inherit;cursor:pointer}
.setm .x svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.setm .empty2{padding:10px;color:var(--dim,#8a706d);font-size:.9rem}
html.calm *,html.calm *::before,html.calm *::after{animation:none!important;transition:none!important}
`;

/** ข้อมูลการรับอีเมลของอุปกรณ์นี้ (มาจาก cookie ys_sub) */
export type SubInfo = { email: string } | null;

const maskEmail = (e: string) => {
	const [u, d] = e.split('@');
	return `${u.slice(0, 2)}${'•'.repeat(Math.max(1, Math.min(6, u.length - 2)))}@${d}`;
};

export function settingsModal(sub: SubInfo = null): string {
	const p = prefs();
	const langs = LANGS.map(l => `<button type="button" class="opt${l.code === p.lang ? ' on' : ''}" data-lang="${l.code}" data-q="${esc(`${l.name} ${l.en} ${l.code}`.toLowerCase())}">${flag(l.flag)}<span>${esc(l.name)}<small>${esc(l.en)}</small></span></button>`).join('');
	const clock = (v: string, k: 'set_clock_auto' | 'set_clock_24' | 'set_clock_12') =>
		`<button type="button" data-h12="${v}" class="${(p.h12 === null ? 'auto' : p.h12 ? '12' : '24') === v ? 'on' : ''}">${esc(t(k))}</button>`;
	const sw = (key: string, on: boolean) => `<button type="button" class="sw${on ? ' on' : ''}" data-sw="${key}" role="switch" aria-checked="${on}"></button>`;
	const mail = sub
		? `<div class="mail">${esc(t('set_email_on', { email: maskEmail(sub.email) }))}<small>${esc(t('set_email_note'))}</small>
			<div class="act"><button type="button" class="ghost" data-unsub>${esc(t('set_unsub'))}</button></div><p class="msg" id="setmsg" role="status"></p></div>`
		: `<div class="mail">${esc(t('set_email_none'))}<div class="act"><button type="button" class="ghost" data-sub-open data-set-close>${esc(t('link_subscribe'))}</button></div></div>`;
	return `
<div class="setm" id="setm" aria-hidden="true">
	<div class="box" role="dialog" aria-modal="true" aria-labelledby="sett">
		<button class="x" type="button" data-set-close aria-label="${esc(t('close'))}"><svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg></button>
		<h3 id="sett">${esc(t('set_title'))}</h3>
		<p class="lead">${esc(t('set_lead'))}</p>
		<div class="sec"><label for="langq">${esc(t('set_lang'))}</label>
			<input class="srch" id="langq" type="search" placeholder="${esc(t('set_lang_search'))}" autocomplete="off">
			<div class="opts" id="langs">${langs}</div></div>
		<div class="sec"><label for="tzq">${esc(t('set_tz'))}</label>
			<input class="srch" id="tzq" type="search" placeholder="${esc(t('set_tz_search'))}" autocomplete="off">
			<div class="opts tzl" id="tzs" data-cur="${esc(p.tz)}" data-cur-label="${esc(tzLabel(p.tz))}"></div></div>
		<div class="sec"><span class="lb">${esc(t('set_clock'))}</span>
			<div class="seg2" id="clock">${clock('auto', 'set_clock_auto')}${clock('24', 'set_clock_24')}${clock('12', 'set_clock_12')}</div></div>
		<div class="sec">
			<div class="row2"><div>${esc(t('set_refresh'))}<small>${esc(t('set_refresh_note'))}</small></div>${sw('refresh', p.refresh)}</div>
			<div class="row2"><div>${esc(t('set_calm'))}</div>${sw('calm', p.calm)}</div></div>
		<div class="sec"><span class="lb">${esc(t('set_email'))}</span>${mail}</div>
		<div class="foot2"><button type="button" class="ghost" data-reset>${esc(t('set_reset'))}</button><button type="button" class="save" data-save>${esc(t('set_save'))}</button></div>
	</div>
</div>`;
}

/** ตั้ง cookie ครั้งแรกจากอุปกรณ์ (ภาษาและเขตเวลา) แล้วโหลดหน้าใหม่ 1 ครั้ง ใส่ใน <head> */
export function firstVisitScript(): string {
	const codes = JSON.stringify(LANGS.map(l => l.code));
	return `<script>(function(){try{
if(/(?:^|; )ys_tz=/.test(document.cookie))return;
var L=${codes},n=(navigator.languages||[navigator.language||'th']),lang='th';
for(var i=0;i<n.length;i++){var b=String(n[i]).toLowerCase().split('-')[0];if(L.indexOf(b)>=0){lang=b;break;}}
var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Bangkok',y='; path=/; max-age=31536000; samesite=lax';
if(!/(?:^|; )ys_lang=/.test(document.cookie))document.cookie='ys_lang='+lang+y;
document.cookie='ys_tz='+encodeURIComponent(tz)+y;
if(!sessionStorage.getItem('ys_init')){sessionStorage.setItem('ys_init','1');location.reload();}
}catch(e){}})();</script>`;
}

/** ตัวจัดการหน้าต่างตั้งค่า */
export function settingsScript(): string {
	const s = JSON.stringify(tMany(['set_tz_auto', 'set_no_match', 'set_unsub_done', 'sub_error']));
	return `(function(){
var m=document.getElementById('setm');if(!m)return;
var S=${s},st={lang:null,tz:null,h12:null,refresh:null,calm:null},last=null;
var y='; path=/; max-age=31536000; samesite=lax';
function ck(k){var r=document.cookie.match(new RegExp('(?:^|; )'+k+'=([^;]*)'));return r?decodeURIComponent(r[1]):null;}
function open(){last=document.activeElement;m.classList.add('open');m.setAttribute('aria-hidden','false');renderTz('');}
function close(){m.classList.remove('open');m.setAttribute('aria-hidden','true');if(last&&last.focus)last.focus();}
document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest)return;
	if(t.closest('[data-set-open]')){e.preventDefault();open();return;}
	if(t===m||t.closest('[data-set-close]'))close();});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&m.classList.contains('open'))close();});
/* ภาษา */
var lq=document.getElementById('langq'),langs=document.getElementById('langs');
lq.addEventListener('input',function(){var q=lq.value.trim().toLowerCase(),b=langs.querySelectorAll('.opt'),n=0;
	for(var i=0;i<b.length;i++){var ok=!q||b[i].getAttribute('data-q').indexOf(q)>=0;b[i].style.display=ok?'':'none';if(ok)n++;}});
langs.addEventListener('click',function(e){var b=e.target.closest('[data-lang]');if(!b)return;
	var all=langs.querySelectorAll('.opt');for(var i=0;i<all.length;i++)all[i].classList.remove('on');b.classList.add('on');st.lang=b.getAttribute('data-lang');});
/* เขตเวลา */
var tzq=document.getElementById('tzq'),tzs=document.getElementById('tzs'),dev=Intl.DateTimeFormat().resolvedOptions().timeZone||'Asia/Bangkok';
var cur=tzs.getAttribute('data-cur'),zones=[];
try{zones=Intl.supportedValuesOf('timeZone');}catch(e){zones=[cur,dev,'UTC'];}
function off(z){try{return new Intl.DateTimeFormat('en-US',{timeZone:z,timeZoneName:'shortOffset'}).formatToParts(new Date()).filter(function(p){return p.type==='timeZoneName';})[0].value;}catch(e){return '';}}
function item(z,label,sub){var on=(st.tz||cur)===z;return '<button type="button" class="opt'+(on?' on':'')+'" data-tz="'+z+'"><span>'+label+'<small>'+sub+'</small></span></button>';}
function renderTz(q){q=q.trim().toLowerCase();var h='';
	if(!q)h+=item(dev,S.set_tz_auto,dev.replace(/_/g,' ')+' ('+off(dev)+')');
	var list=zones.filter(function(z){return !q||z.toLowerCase().replace(/_/g,' ').indexOf(q)>=0;});
	if(!q){list=list.filter(function(z){return z!==dev;});list.sort(function(a,b){return a===cur?-1:b===cur?1:0;});}
	list.slice(0,60).forEach(function(z){h+=item(z,z.replace(/_/g,' '),off(z));});
	tzs.innerHTML=h||'<div class="empty2">'+S.set_no_match+'</div>';}
tzq.addEventListener('input',function(){renderTz(tzq.value);});
tzs.addEventListener('click',function(e){var b=e.target.closest('[data-tz]');if(!b)return;st.tz=b.getAttribute('data-tz');renderTz(tzq.value);});
/* รูปแบบเวลา และสวิตช์ */
document.getElementById('clock').addEventListener('click',function(e){var b=e.target.closest('[data-h12]');if(!b)return;
	var all=this.querySelectorAll('button');for(var i=0;i<all.length;i++)all[i].classList.remove('on');b.classList.add('on');st.h12=b.getAttribute('data-h12');});
m.addEventListener('click',function(e){var b=e.target.closest('[data-sw]');if(!b)return;var on=!b.classList.contains('on');
	b.classList.toggle('on',on);b.setAttribute('aria-checked',on);st[b.getAttribute('data-sw')]=on;});
/* บันทึก / คืนค่า */
m.querySelector('[data-save]').addEventListener('click',function(){
	if(st.lang)document.cookie='ys_lang='+st.lang+y;
	if(st.tz)document.cookie='ys_tz='+encodeURIComponent(st.tz)+y;
	if(st.h12)document.cookie='ys_h12='+st.h12+y;
	if(st.refresh!==null)document.cookie='ys_refresh='+(st.refresh?1:0)+y;
	if(st.calm!==null)document.cookie='ys_calm='+(st.calm?1:0)+y;
	var body={lang:st.lang||ck('ys_lang'),tz:st.tz||ck('ys_tz'),h12:st.h12||ck('ys_h12')};
	fetch('/api/subscription/prefs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(function(){}).then(function(){location.reload();});
});
m.querySelector('[data-reset]').addEventListener('click',function(){
	['ys_lang','ys_tz','ys_h12','ys_refresh','ys_calm'].forEach(function(k){document.cookie=k+'=; path=/; max-age=0';});
	try{sessionStorage.removeItem('ys_init');}catch(e){}location.reload();});
var un=m.querySelector('[data-unsub]');
if(un)un.addEventListener('click',function(){un.disabled=true;
	fetch('/api/subscription/unsubscribe',{method:'POST'}).then(function(r){var msg=document.getElementById('setmsg');
		if(msg){msg.textContent=r.ok?S.set_unsub_done:S.sub_error;msg.className='msg '+(r.ok?'ok':'err');}
		if(r.ok)un.remove();else un.disabled=false;});});
})();`;
}
