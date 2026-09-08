/**
 * keep-alive — wakes the backend and the agent.
 *
 * Render free instances sleep after ~15 min without incoming requests and
 * their cold start takes 30-60s, which breaks proxied chat requests. This
 * route, hosted on Vercel (always reachable), pings both `/health` endpoints
 * so a periodic caller (Vercel Cron on Pro, or a free uptime monitor on
 * Hobby) keeps them hot. Route Handlers with network calls are dynamic, so
 * this always executes a fresh fetch.
 *
 * NB: the Next rewrites proxy `/api/*` to the backend, so this route lives at
 * `/keep-alive` (outside `/api`) to avoid being rewritten.
 */
export async function GET() {
  const backendBase = (
    process.env.NEXT_PUBLIC_API_URL ??
    "https://better-call-ai-backend.onrender.com"
  ).replace(/\/$/, "");
  const agentBase = (
    process.env.AGENT_APP_URL ??
    "https://better-call-ai.onrender.com"
  ).replace(/\/$/, "");

  const ping = async (base: string) => {
    try {
      const res = await fetch(`${base}/health`, {
        signal: AbortSignal.timeout(20_000),
        cache: "no-store",
      });
      return { url: `${base}/health`, status: res.status };
    } catch {
      return { url: `${base}/health`, status: 0 };
    }
  };

  const [backend, agent] = await Promise.all([
    ping(backendBase),
    ping(agentBase),
  ]);

  return Response.json({ pong: new Date().toISOString(), backend, agent });
}