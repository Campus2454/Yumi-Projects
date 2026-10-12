
export async function POST(req: Request) {
  const body = await req.json();
  const pathAll = ['', '/main', '/dev'];

  for (const p of pathAll) {
    try {
      const res = await fetch(`https://api.yumistack.net/music${p}/player/search`, {
        method: 'POST',
        headers: {
          Authorization: 'Basic ' + btoa(`${process.env.API_USERNAME}:${process.env.API_PASSWORD}`),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: body.q, limit: body.limit }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log(`✅ [Success] ${body.q} | Tracks: ${data.tracks?.length} | Path: ${p || 'default'}`);
          
        return Response.json(data);
      } else {
        console.log(`⚠️ [Failed] ${body.q} | Status: ${res.status} | Path: ${p || 'default'}`);
      }
    } catch (error: any) {
      console.error(`❌ [Error] Path ${p || 'default'} is unreachable:`, error.message);
    }
  }

  return Response.json({ message: 'Failed to fetch search results from all APIs' }, { status: 500 });
}
