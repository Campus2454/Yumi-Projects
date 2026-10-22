const LOGO = 'https://assets.yumistack.net/photos/logo/yumi/001.webp';
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const CSS = `
:root{--bg:#060203;--ink:#fff3f1;--muted:#b99a97;--dim:#8a706d;--brand:#f13b3b;--ok:#3ddc97;--warn:#fbbf24;--down:#ff5a5f;color-scheme:dark}
*,*::before,*::after{box-sizing:border-box}
html{background:var(--bg)}
body{margin:0;min-height:100vh;color:var(--ink);font-family:'Kanit',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;padding:28px 18px;
	background:radial-gradient(1000px 600px at 12% -15%,rgba(241,59,59,.34),transparent 65%),radial-gradient(800px 600px at 105% 105%,rgba(130,0,0,.35),transparent 60%),var(--bg);background-attachment:fixed}
body::before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle,rgba(255,255,255,.03) 1px,transparent 1px) 0 0/22px 22px;}
a{color:inherit;text-decoration:none}
.card{position:relative;width:100%;max-width:480px;padding:36px 32px;border-radius:24px;
	background:linear-gradient(180deg,rgba(255,255,255,.08),rgba(255,255,255,.025));border:1px solid rgba(255,255,255,.1);
	box-shadow:inset 0 1px 0 rgba(255,255,255,.08),0 30px 60px -28px rgba(0,0,0,.9);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.brand{display:flex;align-items:center;gap:12px;font-weight:600;margin-bottom:26px}
.brand img{width:38px;height:38px;border-radius:11px;box-shadow:0 8px 24px -8px rgba(241,59,59,.6)}
.ico{width:64px;height:64px;border-radius:50%;display:grid;place-items:center;margin-bottom:18px;background:radial-gradient(circle at 35% 30%,color-mix(in srgb,var(--c) 70%,#fff),var(--c));box-shadow:0 0 50px color-mix(in srgb,var(--c) 50%,transparent);--c:var(--brand)}
.ico svg{width:28px;height:28px;fill:none;stroke:#0c0506;stroke-width:3.2;stroke-linecap:round;stroke-linejoin:round}
h1{margin:0;font-size:1.9rem;font-weight:700;line-height:1.2}
p{margin:10px 0 0;color:var(--muted);font-weight:300;line-height:1.7}
form{margin-top:26px;display:flex;flex-direction:column;gap:12px}
label{font-size:.9rem;color:var(--muted);font-weight:300}
input[type=email]{width:100%;padding:15px 18px;border-radius:14px;font:inherit;font-size:1rem;color:var(--ink);background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.12);outline:none;transition:border-color .2s,box-shadow .2s}
input[type=email]:focus{border-color:var(--brand);box-shadow:0 0 0 4px rgba(241,59,59,.18)}
input::placeholder{color:#6f5856}
button,.btn{display:inline-flex;align-items:center;justify-content:center;padding:15px 22px;border-radius:14px;border:0;cursor:pointer;font:inherit;font-weight:600;font-size:1rem;color:#fff;background:linear-gradient(180deg,#ff5a4d,var(--brand));box-shadow:0 10px 26px -10px rgba(241,59,59,.8);transition:transform .15s,filter .15s}
button:hover,.btn:hover{filter:brightness(1.08)}
button:active{transform:scale(.985)}
button:disabled{opacity:.6;cursor:wait}
.msg{margin-top:14px;min-height:1.4em;font-size:.92rem;font-weight:400}
.msg.ok{color:var(--ok)}.msg.err{color:var(--down)}.msg.warn{color:var(--warn)}
.foot{margin-top:26px;font-size:.82rem;color:var(--dim);font-weight:300;text-align:center}
.foot a{color:var(--muted);text-decoration:underline}
@media (max-width:480px){.card{padding:28px 22px}h1{font-size:1.6rem}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`;

const ICON = {
	mail: '<svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4 7l8 6 8-6"/></svg>',
	check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
	x: '<svg viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17"/></svg>',
	clock: '<svg viewBox="0 0 24 24"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg>',
	bell: '<svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 1 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 19a2 2 0 0 0 4 0"/></svg>',
};

const shell = (title: string, body: string) => `<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<meta name="theme-color" content="#060203" />
<title>${esc(title)}</title>
<link rel="icon" href="${LOGO}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet" />
<style>${CSS}</style>
</head>
<body>
<main class="card">
	<div class="brand"><img src="${LOGO}" alt="" />Yumi Status</div>
	${body}
</main>
</body>
</html>`;

const icon = (c: string, svg: string) => `<div class="ico" style="--c:${c}">${svg}</div>`;

/** หน้ากรอกอีเมล */
export function renderSubscribePage(): string {
	return shell('รับการแจ้งเตือน - Yumi Status', `
	<h1>รับการแจ้งเตือนสถานะระบบ</h1>
	<p>ใส่อีเมลของคุณ เราจะส่งอีเมลยืนยันให้หนึ่งฉบับ เมื่อกดยืนยันแล้วคุณจะได้รับแจ้งเตือนเมื่อมีบริการหยุดทำงาน และเมื่อกลับมาทำงานปกติ</p>
	<form id="f" novalidate>
		<label for="em">อีเมลของคุณ</label>
		<input id="em" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required maxlength="254" />
		<button type="submit" id="go">รับการแจ้งเตือน</button>
		<div class="msg" id="msg" role="status" aria-live="polite"></div>
	</form>
	<div class="foot">เราจะไม่ส่งอีเมลอื่นนอกจากการแจ้งเตือนสถานะ และคุณยกเลิกได้ทุกเมื่อ</div>
	<script>
	(function(){
		var f=document.getElementById('f'),m=document.getElementById('msg'),b=document.getElementById('go'),e=document.getElementById('em');
		function say(t,c){m.textContent=t;m.className='msg '+(c||'');}
		f.addEventListener('submit',function(ev){
			ev.preventDefault();
			var v=(e.value||'').trim();
			if(!v){say('กรุณาใส่อีเมล','err');return;}
			b.disabled=true;say('กำลังส่ง…');
			fetch('/api/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:v})})
			.then(function(r){return r.json().then(function(j){return {s:r.status,j:j}})})
			.then(function(x){
				if(x.s===429){say('ขอบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่','warn');}
				else if(x.j.ok){say('ส่งลิงก์ยืนยันไปที่อีเมลของคุณแล้ว กรุณาเช็ค inbox หรือ spam','ok');f.reset();}
				else{say(x.j.error||'เกิดข้อผิดพลาด ลองใหม่อีกครั้ง','err');}
			})
			.catch(function(){say('เชื่อมต่อไม่ได้ ลองใหม่อีกครั้ง','err');})
			.finally(function(){b.disabled=false;});
		});
	})();
	</script>`);
}

/** ผลการกดลิงก์ยืนยัน */
export function renderConfirmResult(kind: 'ok' | 'invalid' | 'expired'): string {
	const map = {
		ok: { c: '#3ddc97', i: ICON.check, t: 'ยืนยันสำเร็จ', p: 'คุณจะได้รับการแจ้งเตือนสถานะระบบ Yumi จากนี้เป็นต้นไป' },
		expired: { c: '#fbbf24', i: ICON.clock, t: 'ลิงก์หมดอายุแล้ว', p: 'กรุณาใส่อีเมลในหน้ารับการแจ้งเตือนอีกครั้งเพื่อรับลิงก์ใหม่' },
		invalid: { c: '#ff5a5f', i: ICON.x, t: 'ลิงก์ไม่ถูกต้อง', p: 'ลิงก์นี้อาจถูกใช้ไปแล้วหรือไม่ถูกต้อง ลองสมัครใหม่อีกครั้ง' },
	}[kind];
	return shell(`${map.t} - Yumi Status`, `
	${icon(map.c, map.i)}
	<h1>${map.t}</h1>
	<p>${map.p}</p>
	<div style="margin-top:26px"><a class="btn" href="/subscribe">กลับหน้ารับการแจ้งเตือน</a></div>`);
}

/** ผลการยกเลิก */
export function renderUnsubResult(ok: boolean): string {
	return shell(`ยกเลิกการรับแจ้งเตือน - Yumi Status`, ok ? `
	${icon('#b99a97', ICON.bell)}
	<h1>ยกเลิกเรียบร้อย</h1>
	<p>คุณจะไม่ได้รับอีเมลแจ้งเตือนจากระบบ Yumi Status อีกต่อไป หากต้องการกลับมารับอีกให้สมัครใหม่ได้ทุกเมื่อ</p>
	<div style="margin-top:26px"><a class="btn" href="/subscribe">สมัครใหม่</a></div>` : `
	${icon('#ff5a5f', ICON.x)}
	<h1>ลิงก์ไม่ถูกต้อง</h1>
	<p>ไม่พบอีเมลที่ตรงกับลิงก์นี้ หรือคุณได้ยกเลิกไปแล้ว</p>`);
}