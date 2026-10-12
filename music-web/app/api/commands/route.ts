import { NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    {
      id: 'music',
      name: 'เพลง',
      description: 'คำสั่งสำหรับเล่นและควบคุมเพลง',
      color: '#b91c1c',
      commands: [
        { name: '/play', usage: '/play <ชื่อเพลง หรือ URL>', description: 'เล่นเพลงจาก YouTube, Spotify, SoundCloud หรือค้นหาด้วยชื่อเพลง', aliases: ['p'] },
        { name: '/pause', usage: '/pause', description: 'หยุดเพลงชั่วคราว / เล่นต่อ', aliases: [] },
        { name: '/resume', usage: '/resume', description: 'เล่นเพลงต่อจากที่หยุดไว้', aliases: [] },
        { name: '/stop', usage: '/stop', description: 'หยุดเล่นเพลงและล้างคิวทั้งหมด', aliases: [] },
        { name: '/skip', usage: '/skip', description: 'ข้ามไปเพลงถัดไปในคิว', aliases: ['s'] },
        { name: '/previous', usage: '/previous', description: 'กลับไปเล่นเพลงก่อนหน้า', aliases: ['prev'] },
        { name: '/seek', usage: '/seek <เวลา>', description: 'เลื่อนไปยังตำแหน่งเวลาที่ต้องการ เช่น 1:30', aliases: [] },
        { name: '/nowplaying', usage: '/nowplaying', description: 'แสดงข้อมูลเพลงที่กำลังเล่นอยู่ พร้อม Progress Bar', aliases: ['np'] },
        { name: '/lyrics', usage: '/lyrics [ชื่อเพลง]', description: 'ค้นหาเนื้อเพลงจากเพลงที่กำลังเล่น หรือชื่อที่ระบุ', aliases: [] },
        { name: '/grab', usage: '/grab', description: 'บันทึกเพลงที่กำลังเล่นส่งเข้า DM ของคุณ', aliases: ['save'] },
      ],
    },
    {
      id: 'queue',
      name: 'คิวเพลง',
      description: 'จัดการรายการเพลงในคิว',
      color: '#2563eb',
      commands: [
        { name: '/queue', usage: '/queue [หน้า]', description: 'แสดงรายการเพลงทั้งหมดในคิว แบ่งเป็นหน้า', aliases: ['q'] },
        { name: '/shuffle', usage: '/shuffle', description: 'สุ่มเรียงลำดับเพลงในคิวใหม่', aliases: [] },
        { name: '/loop', usage: '/loop <off/track/queue>', description: 'เปิด/ปิดการเล่นวนซ้ำ (เพลงเดียว หรือทั้งคิว)', aliases: [] },
        { name: '/remove', usage: '/remove <ลำดับ>', description: 'ลบเพลงออกจากคิวตามลำดับที่ระบุ', aliases: [] },
        { name: '/move', usage: '/move <จาก> <ไป>', description: 'ย้ายเพลงในคิวไปตำแหน่งที่ต้องการ', aliases: [] },
        { name: '/skipto', usage: '/skipto <ลำดับ>', description: 'ข้ามไปเล่นเพลงลำดับที่ระบุในคิว', aliases: [] },
        { name: '/clear', usage: '/clear', description: 'ล้างเพลงทั้งหมดออกจากคิว', aliases: [] },
        { name: '/autoplay', usage: '/autoplay', description: 'เปิด/ปิดระบบเล่นเพลงแนะนำอัตโนมัติ', aliases: [] },
      ],
    },
    {
      id: 'filters',
      name: 'ฟิลเตอร์',
      description: 'ปรับแต่งเสียงเพลงด้วยเอฟเฟกต์ต่างๆ',
      color: '#7c3aed',
      commands: [
        { name: '/filter', usage: '/filter <ชื่อฟิลเตอร์>', description: 'เปิด/ปิด Audio Filter เช่น bassboost, nightcore, 8d', aliases: [] },
        { name: '/bassboost', usage: '/bassboost [ระดับ]', description: 'ปรับ Bass Boost ตั้งแต่ระดับ low, medium, high', aliases: ['bb'] },
        { name: '/nightcore', usage: '/nightcore', description: 'เปิด/ปิดเอฟเฟกต์ Nightcore (เร็ว + เสียงสูง)', aliases: ['nc'] },
        { name: '/vaporwave', usage: '/vaporwave', description: 'เปิด/ปิดเอฟเฟกต์ Vaporwave (ช้า + เสียงต่ำ)', aliases: ['vw'] },
        { name: '/8d', usage: '/8d', description: 'เปิด/ปิดเอฟเฟกต์ 8D Audio (หมุนรอบทิศ)', aliases: [] },
        { name: '/karaoke', usage: '/karaoke', description: 'เปิด/ปิดโหมดคาราโอเกะ (ลดเสียงร้อง)', aliases: [] },
        { name: '/speed', usage: '/speed <0.5-2.0>', description: 'ปรับความเร็วของเพลง', aliases: [] },
        { name: '/volume', usage: '/volume <1-150>', description: 'ปรับระดับเสียง 1-150%', aliases: ['vol'] },
        { name: '/reset', usage: '/reset', description: 'รีเซ็ตฟิลเตอร์ทั้งหมดกลับเป็นค่าเริ่มต้น', aliases: [] },
      ],
    },
    {
      id: 'playlist',
      name: 'เพลย์ลิสต์',
      description: 'สร้างและจัดการเพลย์ลิสต์ส่วนตัว',
      color: '#059669',
      commands: [
        { name: '/playlist create', usage: '/playlist create <ชื่อ>', description: 'สร้างเพลย์ลิสต์ใหม่', aliases: [] },
        { name: '/playlist add', usage: '/playlist add <ชื่อ> [เพลง]', description: 'เพิ่มเพลงที่กำลังเล่น หรือเพลงที่ระบุเข้าเพลย์ลิสต์', aliases: [] },
        { name: '/playlist load', usage: '/playlist load <ชื่อ>', description: 'โหลดเพลย์ลิสต์เข้าคิวเพลง', aliases: [] },
        { name: '/playlist list', usage: '/playlist list', description: 'แสดงรายการเพลย์ลิสต์ทั้งหมดของคุณ', aliases: [] },
        { name: '/playlist delete', usage: '/playlist delete <ชื่อ>', description: 'ลบเพลย์ลิสต์', aliases: [] },
        { name: '/playlist info', usage: '/playlist info <ชื่อ>', description: 'แสดงรายละเอียดของเพลย์ลิสต์', aliases: [] },
      ],
    },
    {
      id: 'utility',
      name: 'อื่นๆ',
      description: 'คำสั่งทั่วไปและข้อมูลบอท',
      color: '#d97706',
      commands: [
        { name: '/help', usage: '/help [คำสั่ง]', description: 'แสดงรายการคำสั่งทั้งหมด หรือข้อมูลคำสั่งที่ระบุ', aliases: ['h'] },
        { name: '/ping', usage: '/ping', description: 'ตรวจสอบ Latency ของบอท', aliases: [] },
        { name: '/invite', usage: '/invite', description: 'แสดงลิงก์เชิญบอทเข้าเซิร์ฟเวอร์', aliases: [] },
        { name: '/support', usage: '/support', description: 'แสดงลิงก์เข้าร่วม Support Server', aliases: [] },
        { name: '/vote', usage: '/vote', description: 'โหวตให้บอทบน Top.gg', aliases: [] },
        { name: '/info', usage: '/info', description: 'แสดงข้อมูลและสถิติของบอท', aliases: [] },
      ],
    },
  ];

  const totalCommands = categories.reduce((sum, cat) => sum + cat.commands.length, 0);

  return NextResponse.json({ categories, totalCommands });
}
