/** โมดัลรับการแจ้งเตือนทางอีเมล: แสดงเป็น popup ในหน้าแรก (ปิดได้ด้วยปุ่ม X, คลิกนอกกล่อง, หรือกด Esc) */

export const SUB_CSS = `
.modal{position:fixed;inset:0;z-index:70;display:grid;place-items:center;padding:20px;background:rgba(3,1,2,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .2s}
.modal.open{opacity:1;pointer-events:auto}
.modal .box{position:relative;width:100%;max-width:440px;padding:30px 28px 24px;border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.03));border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 30px 70px -25px rgba(0,0,0,.95);transform:translateY(12px) scale(.98);transition:transform .25s}
.modal.open .box{transform:none}
.modal h3{margin:0;font-size:1.35rem;font-weight:700;line-height:1.3;padding-right:44px}
.modal .lead{margin:8px 0 0;color:var(--muted);font-weight:300;font-size:.95rem;line-height:1.7}
.modal form{margin-top:20px;display:flex;flex-direction:column;gap:10px}
.modal label{font-size:.85rem;color:var(--muted);font-weight:300}
.modal input{width:100%;padding:14px 16px;border-radius:14px;font:inherit;font-size:1rem;color:var(--ink);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);outline:none;transition:border-color .2s,box-shadow .2s}
.modal input:focus{border-color:var(--brand);box-shadow:0 0 0 4px rgba(241,59,59,.18)}
.modal input::placeholder{color:#6f5856}
.modal .go{margin-top:4px;padding:14px;border-radius:14px;border:0;color:#fff;font:inherit;font-weight:600;font-size:1rem;cursor:pointer;background:linear-gradient(180deg,#ff5a4d,var(--brand));box-shadow:0 10px 26px -10px rgba(241,59,59,.8);transition:filter .15s}
.modal .go:hover{filter:brightness(1.08)}
.modal .go:disabled{opacity:.6;cursor:wait}
.modal .msg{min-height:1.4em;margin:2px 0 0;font-size:.9rem;font-weight:400;text-align:center}
.modal .msg.ok{color:var(--ok)}.modal .msg.err{color:var(--down)}.modal .msg.warn{color:var(--warn)}
.modal .x{position:absolute;top:16px;right:16px;width:36px;height:36px;display:grid;place-items:center;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:var(--ink);cursor:pointer;transition:background .2s}
.modal .x:hover{background:rgba(255,255,255,.12)}
.modal .x svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round}
.modal .fine{margin-top:14px;font-size:.8rem;color:var(--dim);font-weight:300;text-align:center}
.linkbtn{background:none;border:0;padding:0;color:var(--muted);text-decoration:underline;text-underline-offset:4px;font:inherit;cursor:pointer}
.linkbtn:hover{color:var(--ink)}
@media (prefers-reduced-motion:reduce){.modal,.modal .box{transition:none!important}}
`;

export const SUB_MODAL = `
<div class="modal" id="subm" aria-hidden="true">
	<div class="box" role="dialog" aria-modal="true" aria-labelledby="subt">
		<button class="x" type="button" data-sub-close aria-label="ปิด">
			<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>
		</button>
		<h3 id="subt">รับการแจ้งเตือนสถานะระบบ</h3>
		<p class="lead">ใส่อีเมลของคุณ เราจะส่งลิงก์ยืนยันให้หนึ่งฉบับ เมื่อยืนยันแล้วจะได้รับแจ้งเตือนเมื่อมีบริการหยุดทำงาน และเมื่อกลับมาทำงานปกติ</p>
		<form id="subf" novalidate>
			<label for="subem">อีเมลของคุณ</label>
			<input id="subem" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required maxlength="254">
			<button class="go" type="submit" id="subgo">รับการแจ้งเตือน</button>
			<p class="msg" id="submsg" role="status" aria-live="polite"></p>
		</form>
		<div class="fine">ยกเลิกได้ทุกเมื่อ เราจะไม่ส่งอีเมลอื่นนอกจากการแจ้งเตือนสถานะ</div>
	</div>
</div>`;

/** ตัวจัดการโมดัล: เปิดจากปุ่ม [data-sub-open], ปิดด้วย X / คลิกนอกกล่อง / Esc, ส่งอีเมลผ่าน /api/subscribe */
export const SUB_JS = `(function(){
var m=document.getElementById('subm');
if(!m)return;
var f=document.getElementById('subf'),em=document.getElementById('subem'),go=document.getElementById('subgo'),msg=document.getElementById('submsg');
var lastFocus=null;
function say(t,c){if(msg){msg.textContent=t;msg.className='msg '+(c||'');}}
function open(){
	lastFocus=document.activeElement;
	m.classList.add('open');m.setAttribute('aria-hidden','false');
	if(em)setTimeout(function(){em.focus();},50);
}
function close(){
	m.classList.remove('open');m.setAttribute('aria-hidden','true');
	try{
		var u=new URL(location.href);
		if(u.searchParams.has('subscribe')){u.searchParams.delete('subscribe');history.replaceState(null,'',u.pathname+u.search+u.hash);}
	}catch(err){}
	if(lastFocus&&lastFocus.focus)lastFocus.focus();
}
document.addEventListener('click',function(e){
	var t=e.target;
	if(!t||!t.closest)return;
	var o=t.closest('[data-sub-open]');
	if(o){e.preventDefault();open();return;}
	if(t===m||t.closest('[data-sub-close]'))close();
},false);
document.addEventListener('keydown',function(e){
	if(e.key==='Escape'&&m.classList.contains('open'))close();
});
if(f){
	f.addEventListener('submit',function(e){
		e.preventDefault();
		var v=((em&&em.value)||'').trim();
		if(!v){say('กรุณาใส่อีเมล','err');return;}
		if(go)go.disabled=true;say('กำลังส่ง…');
		fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:v})})
		.then(function(r){return r.json().then(function(j){return {s:r.status,j:j};});})
		.then(function(x){
			if(x.s===429)say('ขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่','warn');
			else if(x.j.ok){say('ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว กรุณาเช็ค inbox หรือ spam','ok');f.reset();}
			else say(x.j.error||'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง','err');
		})
		.catch(function(){say('เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง','err');})
		.finally(function(){if(go)go.disabled=false;});
	});
}
if(/[?&]subscribe=1/.test(location.search))open();
})();`;