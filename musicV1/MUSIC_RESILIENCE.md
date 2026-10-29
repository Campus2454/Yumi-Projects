# ระบบเพลงทนบล็อก YouTube

ต่อจาก `handoff-music-bot.md` ไฟล์นี้บอกว่าทำอะไรไปแล้ว ตั้งค่ายังไง และยังต้องทดสอบอะไรบน server

## ภาพรวม

```
คำสั่งผู้ใช้ (/play, !play, autocomplete, เว็บ, restore)
  -> musicSearch()  bot/src/music/resolver.ts
       1. DB cache (SQLite)  เจอแล้วไม่ยิง node เลยถ้า node เดิม
       2. จำกัดอัตราค้นต่อผู้ใช้
       3. ไล่แหล่งตาม MUSIC_SOURCE_ORDER (ค่าเริ่มต้น soundcloud -> youtube_music -> youtube)
          ข้ามแหล่งที่ปิด / อยู่ใน negative cache / circuit breaker เปิด
          YouTube ยิงพร้อมกันได้แค่ MUSIC_YOUTUBE_CONCURRENCY คำขอ
       4. ลิงก์ YouTube ตอน YouTube ใช้ไม่ได้: เอาชื่อเพลงจาก oEmbed ไปค้นแหล่งอื่น
  -> เล่นบน node ที่ nodeResolver เลือก (NODELINK ก่อน แล้ว LAVALINK)
  -> เล่นไม่ได้ (playerException): ลบ cache ของเพลงนั้น ค้นเพลงเดียวกันจากแหล่งอื่น 1 ครั้ง

sidecar/sidecar.mjs (แยก process)
  ทุก 5 นาที: /version + loadtracks ทดสอบ YouTube/SoundCloud + เช็ค token (NodeLink)
  เปลี่ยนสถานะ -> Discord webhook
  YouTube พังทุก node 2 รอบติด -> เขียน "youtube" ลง bot/music-sources.json (บอทปิด YouTube เอง) หายแล้วเปิดคืน
  วันละครั้ง: เช็คเวอร์ชันใหม่ NodeLink / Lavalink / youtube-source / yt-cipher แล้วแจ้ง
```

## ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `bot/src/music/config.ts` | ค่าตั้งจาก env + ไฟล์ override `music-sources.json` (อ่านใหม่ทุก 10 วินาที ไม่ต้อง restart) |
| `bot/src/music/cache.ts` | SQLite (`node:sqlite`, ไม่มี dependency เพิ่ม) ตาราง `track_cache` + `negative_cache` ลบแถวเก่าวันละครั้ง |
| `bot/src/music/breaker.ts` | circuit breaker แยกตามแหล่ง (youtube กับ youtube_music ใช้ตัวเดียวกัน) |
| `bot/src/music/limiter.ts` | จำกัดต่อผู้ใช้ + semaphore สำหรับ YouTube |
| `bot/src/music/resolver.ts` | `musicSearch()` ใช้แทน `kazagumo.search()` ทุกจุด, `findAlternative()` |
| `bot/src/kazagumoManager.ts` | 2 node, `nodeResolver` ตามลำดับ, `reconnectTries`, fallback ตอนเล่นพัง, skip ตอน stuck |
| `bot/test/resolver.test.mts` | เทส resolver แบบ fake node (`yarn workspace bot test`) ไม่ยิงเน็ต |
| `sidecar/sidecar.mjs` | health check, webhook, ส่ง token, เช็ค release, update + rollback |
| `../nodelink/`, `../lavalink/` | docker-compose + config ของ node (อยู่ใน .gitignore ตามที่ตั้งไว้ ไม่ขึ้น git) |

## env ที่เพิ่มใน `musicV1/.env`

ทุกตัวมีค่าเริ่มต้น ไม่ใส่ก็ทำงานเหมือนเดิม (ถ้าไม่มี `NODELINK_HOST` บอทใช้ Lavalink ตัวเดียว)

```env
# node หลัก (ไม่ใส่ = ไม่ใช้ NodeLink)
NODELINK_HOST =host:3000
NODELINK_PASS =...
NODELINK_SECURE =false
# ลำดับ node ถ้า NodeLink มีปัญหากับ Kazagumo ให้สลับเป็น LAVALINK,NODELINK
MUSIC_NODE_PRIORITY =NODELINK,LAVALINK

# resolver
MUSIC_SOURCE_ORDER =soundcloud,youtube_music,youtube
MUSIC_AUTOCOMPLETE_ORDER =soundcloud,youtube_music
MUSIC_SOURCE_DISABLED =
MUSIC_NEGATIVE_TTL_MS =1800000
MUSIC_BREAKER_FAILURES =5
MUSIC_BREAKER_WINDOW_MS =120000
MUSIC_BREAKER_COOLDOWN_MS =300000
MUSIC_YOUTUBE_CONCURRENCY =2
MUSIC_USER_PLAY_LIMIT =6
MUSIC_USER_AUTOCOMPLETE_LIMIT =15

# sidecar
SIDECAR_WEBHOOK_URL =https://discord.com/api/webhooks/...
```

แหล่งที่ใส่ใน order ได้: `soundcloud`, `bandcamp`, `deezer`, `jiosaavn`, `youtube_music`, `youtube`
(deezer/jiosaavn มีแค่ใน NodeLink และ deezer ต้องมี ARL)

ปิดแหล่งทันทีโดยไม่ redeploy: เขียน `bot/music-sources.json` เช่น `{ "disabled": ["youtube"] }`
ไฟล์นี้ทับค่า env ทั้ง key (sidecar ก็เขียนไฟล์นี้)

## สิ่งที่ตอบได้จากการอ่านโค้ด NodeLink v3.9.0 (ข้อ 9 ใน handoff)

- **proxy แยกต่อแหล่งได้**: `sources.youtube.proxies` (มีระบบให้คะแนน proxy ในตัว) และหลายแหล่งมี `proxy` ของตัวเอง
- **Route Planner**: รับ CIDR IPv4/IPv6 กลยุทธ์ `RotateOnBan` / `RoundRobin` / `LoadBalance` (สุ่ม offset ใน block)
  bind `localAddress` ให้ทุกคำขอขาออกของ NodeLink **ไม่ใช่แค่ YouTube** ต้องใช้ `network_mode: host` และ route block เข้าเครื่อง
- **SABR**: NodeLink จัดการเองเมื่อ YouTube ตอบ `protocol: sabr` ไม่มีสวิตช์ให้เปิด
- **token ตอนรัน**: `PATCH /v4/youtube/config` รับ `refreshToken`, `visitorData` และ `GET ...?validate=true` เช็ค token ได้
  refresh token ใส่เป็น array ได้ (`clients.settings.TV.refreshToken`) เลยใส่ burner 2 บัญชีได้ ยังไม่ได้ดูว่าสลับยังไง
- **plugin**: v3.9.0 มีโฟลเดอร์ `plugins/` และ `config.plugins` (มี sample plugin) ยังไม่ได้ลองเพิ่ม source
- **fallback ในตัว**: `sources.youtube.fallbackSources` NodeLink ลองแหล่งอื่นเองตอน YouTube เล่นไม่ได้
- **ไม่มี image สำเร็จรูป**: ต้อง build จาก git tag และ Dockerfile ใช้ `npm install` โดยไม่มี lockfile (build ซ้ำอาจได้ dep ใหม่)

## ยังไม่ได้ทดสอบ (ต้องทำบน server ไม่ใช่เครื่อง sync)

ยังไม่ได้รัน docker และไม่ได้ยิง YouTube จริงเลย ที่ทดสอบแล้วมีแค่ type-check, เทส resolver แบบ fake node, เทส sidecar กับ fake server

1. `cd nodelink && cp .env.example .env` ใส่รหัส แล้ว `docker compose up -d --build`
2. `cd lavalink && cp .env.example .env` แล้ว `docker compose up -d`
   (เช็คว่า image `lavalink:4.2.2` มี `wget` สำหรับ healthcheck ถ้าไม่มีใช้ `LAVALINK_TAG=4.2.2-alpine`)
3. `node sidecar/sidecar.mjs check` ต้องเห็นทั้ง 2 node `up: true`
4. ทดสอบ Kazagumo + NodeLink ด้วยบอท dev: เชื่อมต่อ, ค้นหา, เล่น, seek, filter, ปิด NodeLink ระหว่างเล่น (ต้องย้ายไป Lavalink), เปิดกลับ, รันค้าง 24 ชม. ดู RAM
5. **encoded track ข้าม node**: เพลงที่ค้นบน NodeLink แล้วถูกย้ายไป Lavalink (moveOnDisconnect) ยังเล่นต่อได้ไหม ถ้าไม่ได้ต้องให้ resolve ใหม่ตอนย้าย
6. login burner: `YT_GET_OAUTH_TOKEN=true` ครั้งเดียว ดูลิงก์ใน log ได้ token แล้วรัน `node sidecar/sidecar.mjs token nodelink <token>`
7. เทียบ client YouTube (`YT_CLIENTS_PLAYBACK`) แล้วจดผลลงไฟล์

## ข้อควรรู้

- ค้น SoundCloud ก่อน: ถ้าชื่อไม่ตรงคำค้น (`MUSIC_MATCH_RATIO`) หรือเป็นคลิป preview 30 วินาที จะข้ามไปแหล่งถัดไป
  คำค้นภาษาไทยบน SoundCloud มักไม่เจอ เลยตกไป YouTube Music ถ้าคุณภาพผลลัพธ์แย่ให้ตั้ง `MUSIC_SOURCE_ORDER=youtube_music,youtube,soundcloud` (cache ยังช่วยลดคำขอ)
- autocomplete เดิมยิง YouTube ทุกตัวอักษร ตอนนี้ใช้ cache ก่อน จำผล 10 นาที และจำกัดต่อผู้ใช้
- ห้ามใช้บัญชี Google หลัก ใช้ burner เท่านั้น และใช้คนละบัญชีระหว่าง NodeLink กับ Lavalink
