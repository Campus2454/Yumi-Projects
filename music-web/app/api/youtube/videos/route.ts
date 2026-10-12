import { cookies } from 'next/headers'

export async function POST(req: Request) {
    const body = await req.json();
    const cookieStore = await cookies()
    const regionCode = body.regionCode || cookieStore.get('locale')?.value || req.headers.get('cf-ipcountry') || req.headers.get('accept-language')?.split(',')[0]?.split('-')[1] || 'US';

    const params = new URLSearchParams({
        part: 'snippet,contentDetails,statistics',
        chart: body.chart || 'mostPopular',
        regionCode: regionCode,
        videoCategoryId: '10',
        maxResults: String(body.maxResults || 10),
        key: process.env.YOUTUBE_API_KEY as string
    });

    const url = `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`;
    const res = await fetch(url);
    const data = await res.json();
    
    return Response.json({ ...data, regionCode });
}
