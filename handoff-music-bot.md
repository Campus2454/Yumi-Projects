# Handoff: บอทเพลง Discord ทนบล็อก YouTube (NodeLink + Lavalink)

สรุปจากแชทเดิม (29 ต.ค. 2026) เพื่อส่งต่อให้ Claude Code ทำงานต่อบนเครื่องผู้ใช้
ข้อมูลที่ระบุว่า "ยังไม่ยืนยัน" ต้องเช็คเองก่อนเชื่อ

## 1. เป้าหมาย

บอทเพลง discord.js (ใช้ Kazagumo + Shoukaku ต่อ Lavalink อยู่) มีปัญหา YouTube เปลี่ยน API / บล็อก IP / บล็อกบัญชีบ่อย
ต้องการระบบที่ **ทนบล็อก YouTube ได้มากที่สุด** และ **พังแล้วไม่ล้ม** (ตรวจเจอเร็ว สลับแหล่ง แจ้งเตือน กู้เอง)
ปัญหาไม่ได้อยู่ที่ตัวบอท

## 2. ข้อสรุปที่ตกลงกันแล้ว

- **ไม่ fork Lavalink และไม่เขียน plugin เอง** ตัวที่พังบ่อยคือ plugin youtube-source ไม่ใช่ core
- **NodeLink เป็น node หลัก, Lavalink เป็น node สำรอง** ต่อทั้งคู่ผ่าน Kazagumo
- **YouTube เป็นแหล่งสุดท้าย ไม่ใช่แกนหลัก** มาตรการหนักทั้งหมดใช้เฉพาะ YouTube แหล่งอื่นใช้ตรงๆ
- "ให้ระบบเปลี่ยนตาม YouTube เองอัตโนมัติ" ทำไม่ได้ 100% ทำได้แค่ ตรวจจับเร็ว + สลับ + แจ้ง + อัปเดตแบบมี rollback
- ถ้า Kazagumo เข้ากับ NodeLink v3 ไม่ได้และแก้ไม่คุ้ม ให้ใช้ **Lavalink เป็นหลักแทน** (ไม่เห็นว่า NodeLink ทำอะไรได้ที่ Lavalink ทำไม่ได้ ยกเว้นแก้โค้ดง่ายกว่าเพราะเป็น JS)

## 3. สถาปัตยกรรมเป้าหมาย

```
คำสั่งผู้ใช้
  -> resolver (circuit breaker + DB cache)
     -> [คลังตัวเอง | วิทยุ | SoundCloud/แหล่งอื่น | NodeLink | Lavalink + YouTube]
  -> เสียงเข้าห้อง

ข้างนอก: sidecar (health check, แจ้ง Discord webhook, อัปเดต token, auto-update + rollback)
```

ลำดับค้นหา: คลังตัวเอง -> SoundCloud/แหล่งอื่น -> **YouTube ท้ายสุด**
Spotify/Apple ใช้แค่ metadata แล้ว mirror ไปค้นที่อื่น (NodeLink ทำในตัว แต่ปลายทางมักจบที่ YouTube)

## 4. ตั้งค่าฝั่ง YouTube

### NodeLink (v3, ตัวหลัก)
- รันใน Docker **pin เวอร์ชัน/commit** (release ใหม่หลายตัวมี memory leak ซ้ำ ห้ามอัปแล้วใช้เลย)
- YouTube OAuth ด้วย **burner account** (`getOAuthToken: true` ตามเอกสาร)
- self-host **yt-cipher** ใส่ที่ `sources.youtube.cipher.url`
- เปิด SABR (YouTube ส่งแบบ SABR-only ให้หลาย client ตั้งแต่ ก.ย. 2026)
- อัปเดต `refreshToken` / `visitorData` ตอนรันผ่าน `PATCH /v4/youtube/config` **ไม่ต้อง restart**
- Route Planner (IP rotation) มีใน config

### Lavalink (ตัวสำรอง)
- plugin youtube-source เป็น **snapshot** ไม่ใช่ 1.18.2 (1.18.2 โหลดแทบไม่ได้หลัง SABR)
- ใช้ yt-cipher ตัวเดียวกัน (remote cipher), OAuth + poToken (remote ได้)
- IPv6 rotation (route planner)

### IP
- IPv6 rotation เป็นแกน ต้องมี block ใหญ่พอ อย่างน้อย /64 ดีสุด /48 (YouTube มักแบนทั้ง /64)
- ใช้ได้กับ YouTube เท่านั้น แหล่งอื่นออก IP ปกติ
- Datacenter proxy ไม่ช่วยมาก, residential/mobile proxy ดีกว่าแต่คิดเงินตามปริมาณข้อมูล เปิดเฉพาะตอนโดนบล็อกหนัก
- ลิงก์เสียง YouTube ผูกกับ IP ที่ขอ (ความรู้เดิม ยังไม่ยืนยัน) ขอลิงก์กับดึงเสียงต้องออก IP/proxy เดียวกัน
- IP แก้ไม่ได้: บัญชี burner โดนแบน, poToken/SABR/cipher, "Sign in to confirm you're not a bot" จากพฤติกรรมยิงรัว

## 5. ชั้นป้องกัน (เรียงตามคุ้มสุด)

**ลดจำนวนครั้งที่ยิง YouTube (ได้ผลสุด)**
1. ค้นแหล่งอื่นก่อน
2. DB cache ถาวร + negative cache สั้นๆ
3. preload แค่เพลงถัดไป, จำกัดอัตราค้นต่อผู้ใช้, queue ยิง YouTube ทีละไม่กี่คำขอ

**ทำให้ดูเป็นผู้ใช้ปกติ**
4. OAuth/token burner + poToken + visitorData หมุนเวียน
5. IPv6 rotation
6. residential proxy สำรอง
7. สลับหลาย client (ตัวไหนโดน SABR ใช้ตัวที่ยังได้ลิงก์ตรง)

**พังแล้วไม่ล้ม**
8. circuit breaker: error เกินเกณฑ์ -> พัก YouTube -> แหล่งอื่น + แจ้งผู้ใช้ชัดเจน ("YouTube ใช้ไม่ได้ตอนนี้")
9. burner 2 บัญชีหมุนเวียน
10. หลาย node คนละ IP/บัญชี
11. health check + แจ้ง Discord + อัปเดตแบบมี rollback

ใช้ของที่ Shoukaku มีให้: `moveOnDisconnect`, `nodeResolver`, `reconnectTries` ไม่ต้องเขียนเอง
สวิตช์ใน config เปิด/ปิดแหล่งได้โดยไม่ต้อง redeploy

## 6. DB cache

เก็บ: คำค้น (normalize) -> แหล่ง + id + ชื่อ/ศิลปิน/ความยาว, สถานะเล่นได้/ไม่ได้, เวลาใช้ล่าสุด, จำนวนครั้งใช้
**ไม่เก็บ:** ลิงก์สตรีม (หมดอายุเร็ว) และไฟล์เสียง (DB บวม + เสี่ยงลิขสิทธิ์/ข้อตกลง) ยกเว้นเพลงที่มีสิทธิ์ใช้

```sql
CREATE TABLE track_cache (
  query_norm   TEXT PRIMARY KEY,
  source       TEXT NOT NULL,
  source_id    TEXT NOT NULL,
  title        TEXT,
  artist       TEXT,
  duration_ms  INTEGER,
  fail_count   INTEGER DEFAULT 0,
  hit_count    INTEGER DEFAULT 1,
  pinned       INTEGER DEFAULT 0,
  last_used_at INTEGER NOT NULL
);
-- ลบเพลงที่ไม่มีใครค้นนาน (รันวันละครั้ง) ข้ามแถว pinned
DELETE FROM track_cache
WHERE pinned = 0
  AND last_used_at < strftime('%s','now') - 90*86400
  AND hit_count < 3;
```

กฎ: เล่นไม่ได้ -> ลบแถวแล้วค้นใหม่ตามลำดับแหล่ง / negative cache 10 นาที-1 ชม. (ไม่ถาวร) / normalize คำค้น (ตัวเล็ก, ตัดช่องว่าง, ตัด "official video") / คอลัมน์ `pinned` กันเพลงฮิตโดนลบ
(SQL ข้างบนเป็นสไตล์ SQLite ปรับตาม DB จริง)

## 7. Sidecar (สคริปต์ Node ข้างนอก)

- ทุก 5 นาที: ยิง `/v4/loadtracks` ด้วยเพลงทดสอบ + เช็ค config
- ผิดปกติ: แจ้ง Discord webhook, สลับ node/แหล่ง
- token เสีย: เตือนให้คนไป login ใหม่ ได้ token ใหม่ส่ง PATCH เข้า NodeLink
- auto-update: เช็ค release ใหม่ของ NodeLink/plugin/yt-cipher/yt-dlp -> ดึงมาทดสอบ -> ผ่าน health check ค่อยใช้ -> ไม่ผ่าน rollback

## 8. ข้อห้าม / ขอบเขต

- **ห้ามเขียนสคริปต์สร้างบัญชี Google อัตโนมัติ** หรือเลี่ยง captcha/2FA เป็นการหลบระบบป้องกัน
- ผู้ใช้ login burner เอง ใส่ refresh token ใน `.env` เอง **ไม่แตะรหัสผ่านและไม่ใช้บัญชีหลัก**
- ดึงเสียงจาก YouTube ผิดข้อตกลงของ YouTube หมุนบัญชี/IP ยิ่งอยู่ในเขตเสี่ยง บอทเล็กมักไม่โดนตาม แต่ผู้ใช้รับความเสี่ยงเอง
- บอทใหญ่ (Jockie, FredBoat, Hydra) เป็น closed source ไม่มีสูตรลับให้ลอก

## 9. ยังไม่ยืนยัน (ต้องทดสอบ/เช็คเอกสาร)

- **Kazagumo + NodeLink v3:** NodeLink ยืนยัน Shoukaku v1/v2 แต่ README v3 เขียนว่ายัง "ตรวจสอบอยู่" ต้องเทส: เชื่อมต่อ, ค้นหา, เล่น, seek, filter, reconnect, รันค้าง 24 ชม.
- NodeLink v3 ตั้ง proxy **แยกต่อแหล่ง** ได้ไหม (ไม่งั้นใช้ resolver ข้างนอกส่งเฉพาะ YouTube ผ่าน proxy)
- ระบบ plugin ของ NodeLink (เอกสารขัดกัน: v3.4.0 มี plugin system แต่หน้า "NodeLink vs Lavalink" บอกเพิ่มเองไม่ได้) เพิ่ม source ได้ไหม ถ้าไม่ได้ให้ fork แก้ตรงๆ
- Route Planner ของ NodeLink รองรับ IPv6 rotation แบบไหน
- เนื้อหาจากเว็บหลายแห่งเป็นบล็อก SEO และ repo เล็กๆ ของคนทั่วไป ยังไม่มี maintainer ใหญ่ยืนยัน เช็คเองก่อนเชื่อ

## 10. ทางสำรองถ้าอยากลดการพึ่ง YouTube เพิ่ม

- **Resolver ข้างนอก (Node + yt-dlp)** หาลิงก์เสียงตรง ส่งให้ node เล่นเป็น http ธรรมดา yt-dlp มีทีมใหญ่แก้เร็ว ต้องใช้ IP/proxy เดียวกับ node และ SABR ก็กระทบ yt-dlp ต้องสลับ client/PO token
- **Discord Activity:** เว็บแอปใน iframe เสียงเล่นฝั่งผู้ใช้ IP เราไม่โดนแบน ฝัง YouTube IFrame player (ยังไม่ได้ตรวจ CSP, ไม่มี filter/EQ, ต้องเขียนเว็บเพิ่ม)
- **แหล่งไม่ต้องสู้:** Navidrome/Jellyfin ของตัวเอง, วิทยุ Icecast/Shoutcast, Jamendo/Internet Archive/Free Music Archive/SoundCloud

## 11. ข้อมูลที่ยังขาด (ถามผู้ใช้ก่อนลงมือ)

1. บอทกับ node รันที่ไหน (VPS/PC บ้าน, OS, มี Docker ไหม)
2. IPv6 block ขนาดเท่าไร ผู้ให้บริการไหน
3. DB อะไร (SQLite / MongoDB / Postgres)
4. repo โค้ดบอท + config Kazagumo ปัจจุบัน
5. มี residential proxy ไหม
6. error จริงที่เจอ (login required / No supported audio streams / 403) และเวอร์ชัน plugin ที่ใช้อยู่

## 12. แผนงานสำหรับ Claude Code (เรียงลำดับ)

**A. โครงรัน:** `docker-compose.yml` (NodeLink pin เวอร์ชัน + Lavalink + yt-cipher) + `application.yml` + NodeLink config + `.env.example`
**B. ต่อ Kazagumo:** 2 node, `moveOnDisconnect`, `nodeResolver`, `reconnectTries`
**C. Resolver + circuit breaker + DB cache** (ลำดับแหล่ง, negative cache, สวิตช์เปิด/ปิดแหล่ง)
**D. ทดสอบ Kazagumo + NodeLink v3** ตามรายการในข้อ 9 ถ้าพังหนักให้ใช้ Lavalink เป็นหลัก
**E. Sidecar:** health check, Discord webhook, PATCH token, auto-update + rollback
**F. IPv6 Route Planner**, proxy สำรอง
**G. วนทดสอบจริงบนเครื่องที่ออก YouTube ได้** เทียบ client/ค่าตั้งต่างๆ จนได้ชุดที่ทนสุด บันทึกผลเป็นไฟล์

### วิธีทำงานที่ผู้ใช้อนุญาตไว้
- ลองวิธีไปเรื่อยๆ จนได้ชุดที่มีประสิทธิภาพสุด ใช้ plugin/วิธีอะไรก็ได้
- ถ้าโควต้าหมด ให้รอรีเซ็ตแล้วทำต่อเอง (ใช้ scheduled task/wakeup)
- ทำบน branch ใหม่ ไม่แตะ main
- ใช้ subagent/ทำงานขนานได้ตามเหมาะสม
