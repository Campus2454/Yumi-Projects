import { NextResponse } from 'next/server';

export async function GET() {
  // Static bot information for the landing page
  const botInfo = {
    features: [
      {
        icon: 'music',
        title: 'เล่นเพลงคุณภาพสูง',
        description: 'รองรับ YouTube, Spotify, SoundCloud และอีกมากมาย ด้วยคุณภาพเสียงระดับ Hi-Fi ผ่าน Lavalink',
      },
      {
        icon: 'queue',
        title: 'จัดการคิวเพลงอัจฉริยะ',
        description: 'เพิ่ม ลบ สลับ เลื่อน เพลงในคิวได้อย่างง่ายดาย พร้อมระบบ Auto-Play อัตโนมัติ',
      },
      {
        icon: 'filter',
        title: 'ฟิลเตอร์เสียงหลากหลาย',
        description: 'Bassboost, Nightcore, 8D, Vaporwave และอีกกว่า 15 ฟิลเตอร์ ปรับแต่งเสียงได้ตามใจชอบ',
      },
      {
        icon: 'playlist',
        title: 'ระบบ Playlist ส่วนตัว',
        description: 'สร้าง บันทึก และแชร์เพลย์ลิสต์ของคุณ เข้าถึงได้ทุกที่ทุกเวลาผ่าน Web Dashboard',
      },
      {
        icon: 'dashboard',
        title: 'Web Dashboard ล้ำสมัย',
        description: 'ควบคุมเพลงผ่านเว็บไซต์ได้แบบ Real-time ไม่ต้องพิมพ์คำสั่งใน Discord',
      },
      {
        icon: 'uptime',
        title: 'ออนไลน์ 24/7',
        description: 'ระบบเสถียร ทำงานต่อเนื่องตลอด 24 ชั่วโมง ไม่มีหลัดไม่มีหาย พร้อมอัพเดตฟีเจอร์ใหม่ๆ',
      },
    ],
    commands: [
      { name: '/play', description: 'เล่นเพลงจาก URL หรือค้นหาชื่อเพลง' },
      { name: '/skip', description: 'ข้ามไปเพลงถัดไปในคิว' },
      { name: '/queue', description: 'ดูรายการเพลงทั้งหมดในคิว' },
      { name: '/nowplaying', description: 'ดูข้อมูลเพลงที่กำลังเล่นอยู่' },
      { name: '/filter', description: 'ปรับ Audio Filter ให้เพลง' },
      { name: '/volume', description: 'ปรับระดับเสียง 1-150%' },
      { name: '/loop', description: 'เปิด/ปิดการเล่นวนซ้ำ' },
      { name: '/playlist', description: 'จัดการเพลย์ลิสต์ส่วนตัว' },
    ],
    techStack: [
      { name: 'Discord.js', description: 'Framework หลักสำหรับ Discord Bot' },
      { name: 'Lavalink', description: 'Audio Server ประสิทธิภาพสูง' },
      { name: 'Kazagumo', description: 'Lavalink Wrapper ที่ดีที่สุด' },
      { name: 'Next.js', description: 'Web Dashboard ล้ำสมัย' },
    ],
  };

  return NextResponse.json(botInfo);
}
