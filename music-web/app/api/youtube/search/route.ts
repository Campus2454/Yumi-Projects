import { cookies } from 'next/headers'

export async function POST(req: Request) {
    const body = await req.json();
    const cookieStore = await cookies();
    const regionCode = body.regionCode || cookieStore.get('locale')?.value || req.headers.get('cf-ipcountry') || req.headers.get('accept-language')?.split(',')[0]?.split('-')[1] || 'US';

    // 1. จัดการคำค้นหา: ถ้าค้นหา Channel ไม่ต้องต่อท้ายด้วยคีย์เวิร์ดลบ Shorts/TikTok
    const searchQuery = body.type === 'channel' ? body.q : `${body.q} -shorts -tiktok -reel`;

    const params = new URLSearchParams({
            part: 'snippet',
            q: searchQuery,
            maxResults: String(body.maxResults || 10),
            type: body.type || 'video',
            regionCode: regionCode,
            key: process.env.YOUTUBE_API_KEY as string
    });

    // 2. เช็กเงื่อนไข: ใส่ videoCategoryId เฉพาะตอนที่เป็น type 'video' และไม่ได้ตั้งค่าเป็น 'any'
    if ((body.type === 'video' || !body.type) && body.videoCategoryId && body.videoCategoryId !== 'any') {
        params.append('videoCategoryId', body.videoCategoryId);
    }

    // สำหรับพารามิเตอร์อื่นๆ ที่บังคับว่าต้องเป็น type 'video' เท่านั้น
    if (body.type === 'video' || !body.type) {
        if (body.videoDuration && body.videoDuration !== 'any') params.append('videoDuration', body.videoDuration);
        if (body.videoDefinition && body.videoDefinition !== 'any') params.append('videoDefinition', body.videoDefinition);
        if (body.videoDimension && body.videoDimension !== 'any') params.append('videoDimension', body.videoDimension);
        if (body.videoSyndicated && body.videoSyndicated !== 'any') params.append('videoSyndicated', body.videoSyndicated);
        if (body.videoLicense && body.videoLicense !== 'any') params.append('videoLicense', body.videoLicense);
        if (body.videoEmbeddable && body.videoEmbeddable !== 'any') params.append('videoEmbeddable', body.videoEmbeddable);
    }

    const url = `https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    
    // ถ้ามี error จาก YouTube API ให้โยน error กลับไปตรงๆ จะได้ debug ง่ายขึ้น
    if (!res.ok) {
        return Response.json({ error: data.error }, { status: res.status });
    }
    
    return Response.json({ ...data, regionCode });
}
