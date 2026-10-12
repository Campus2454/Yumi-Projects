import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = Date.now();

  // Check bot API reachability as a proxy for bot online status
  let botOnline = false;
  let botLatency = 0;
  let botData: any = null;

  try {
    const start = Date.now();
    const res = await fetch("https://api.yumistack.net/discord/statistics", {
      headers: {
        Referer: "https://yumistack.net/",
        Origin: "https://yumistack.net",
      },
      signal: AbortSignal.timeout(8000),
    });
    botLatency = Date.now() - start;

    if (res.ok) {
      botData = await res.json();
      botOnline = true;
    }
  } catch {
    botOnline = false;
  }

  // Check web dashboard status
  let webOnline = false;
  let webLatency = 0;
  try {
    const start = Date.now();
    const res = await fetch("https://yumistack.net", {
      method: "HEAD",
      signal: AbortSignal.timeout(8000),
    });
    webLatency = Date.now() - start;
    webOnline = res.ok || res.status === 301 || res.status === 302;
  } catch {
    webOnline = false;
  }

  // Services status
  const services = [
    {
      id: "bot",
      name: "Yumi Bot",
      description: "Discord Bot หลัก",
      status: botOnline ? "operational" : "down",
      latency: botLatency,
    },
    {
      id: "api",
      name: "Yumi API",
      description: "REST API สำหรับข้อมูลบอท",
      status: botOnline ? "operational" : "down",
      latency: botLatency,
    },
    {
      id: "web",
      name: "Web Dashboard",
      description: "แดชบอร์ดควบคุมเพลงผ่านเว็บ",
      status: webOnline ? "operational" : "down",
      latency: webLatency,
    },
    {
      id: "lavalink",
      name: "Lavalink Audio",
      description: "เซิร์ฟเวอร์เสียงคุณภาพสูง",
      status: botOnline ? "operational" : "unknown",
      latency: null,
    },
  ];

  const allOperational = services.every((s) => s.status === "operational");
  const someDown = services.some((s) => s.status === "down");

  return NextResponse.json({
    overall: someDown ? "partial_outage" : allOperational ? "operational" : "unknown",
    services,
    stats: botData,
    checkedAt: new Date(now).toISOString(),
  });
}
