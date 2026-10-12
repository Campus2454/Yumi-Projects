import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const botToken = process.env.DISCORD_BOT_TOKEN;

  try {
    // 1. ดึงรายชื่อเซิร์ฟเวอร์ของผู้ใช้
    const userRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: authHeader }
    });
    const userGuilds = await userRes.json();

    // 2. ดึงรายชื่อเซิร์ฟเวอร์ของบอท
    // (หมายเหตุ: ถ้าบอทคุณอยู่ระดับ 65k เซิร์ฟเวอร์ API ของ Discord จะส่งมาแค่ 200 เซิร์ฟเวอร์แรก 
    // ในระยะยาวแนะนำให้ส่งข้อมูลไปเช็คผ่าน API Express ฝั่งบอทจะครอบคลุมและไวกว่าครับ)
    const botRes = await fetch('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bot ${botToken}` }
    });
    const botGuilds = await botRes.json();

    if (!Array.isArray(userGuilds)) {
      return NextResponse.json({ ...userGuilds, error: 'something wrong!' }, { status: userRes.status || 500 });
    };

    if (!Array.isArray(botGuilds)) {
      return NextResponse.json({ ...botGuilds, error: 'something wrong!' }, { status: botRes.status || 500 });
    };

    // 3. กรองหาเซิร์ฟเวอร์ที่ตรงกัน (Mutual Guilds)
    const botGuildIds = new Set(botGuilds.map((g: any) => g.id));
    const mutualGuilds = userGuilds.filter((g: any) => botGuildIds.has(g.id));

    return NextResponse.json(userGuilds);
    return NextResponse.json(mutualGuilds);
  } catch (error) {
    console.error("API Mutual Guilds Error:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}