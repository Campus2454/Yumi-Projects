import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://api.yumistack.net/discord/statistics', {
      headers: {
        'Referer': 'https://yumistack.net/',
        'Origin': 'https://yumistack.net'
      },
      // Cache ข้อมูลไว้ 20 วินาที จะได้ไม่ยิงรีเควสไปหาเขารัวๆ
      // next: { revalidate: 20 } 
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Proxy Error:", error);
    return NextResponse.json({ members: 0, guilds: 0 }, { status: 500 });
  }
}