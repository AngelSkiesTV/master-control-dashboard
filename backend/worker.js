// AngelSkies Master Control - Cloudflare Worker API
// Endpoints: POST /login, POST /log, GET /logs/export, GET /node/:name
// Secrets (set with `wrangler secret put`): PASSWORD_HASH, PIN_HASH, TOKEN_SECRET
// Bindings: DB (D1), RATE (KV)

const ALLOWED_ORIGIN = "https://angelskiestv.github.io";
const TOKEN_TTL = 60 * 60 * 8; // 8 hours
const MAX_FAILS = 5, LOCK_SECONDS = 900;

const enc = new TextEncoder();
const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
async function sha256(s) { return [...new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(s)))].map(b => b.toString(16).padStart(2, "0")).join(""); }
async function hmac(secret, data) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64u(await crypto.subtle.sign("HMAC", key, enc.encode(data)));
}
function safeEq(a, b) { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

async function makeToken(env) {
  const payload = b64u(enc.encode(JSON.stringify({ sub: "kmo", exp: Math.floor(Date.now() / 1000) + TOKEN_TTL })));
  return payload + "." + await hmac(env.TOKEN_SECRET, payload);
}
async function verify(req, env) {
  const t = (req.headers.get("Authorization") || "").replace("Bearer ", "");
  const [p, s] = t.split(".");
  if (!p || !s || !safeEq(s, await hmac(env.TOKEN_SECRET, p))) return false;
  const { exp } = JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
  return exp > Date.now() / 1000;
}

const cors = { "Access-Control-Allow-Origin": ALLOWED_ORIGIN, "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json", ...cors } });

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(req.url);
    const ip = req.headers.get("CF-Connecting-IP") || "unknown";

    if (url.pathname === "/login" && req.method === "POST") {
      const key = "fail:" + ip;
      const fails = parseInt(await env.RATE.get(key) || "0");
      if (fails >= MAX_FAILS) return json({ error: "Too many attempts. Try again later." }, 429);
      const { password = "", pin = "" } = await req.json().catch(() => ({}));
      const ok = safeEq(await sha256(password), env.PASSWORD_HASH) & safeEq(await sha256(pin), env.PIN_HASH);
      if (!ok) { await env.RATE.put(key, String(fails + 1), { expirationTtl: LOCK_SECONDS }); return json({ error: "Invalid credentials" }, 401); }
      await env.RATE.delete(key);
      return json({ token: await makeToken(env), expiresIn: TOKEN_TTL });
    }

    if (url.pathname === "/log" && req.method === "POST") {
      const b = await req.json().catch(() => ({}));
      await env.DB.prepare("INSERT INTO traffic (ts, ip, event, node, agent) VALUES (?, ?, ?, ?, ?)")
        .bind(new Date().toISOString(), ip, String(b.event || "visit").slice(0, 64), String(b.node || "").slice(0, 64), (req.headers.get("User-Agent") || "").slice(0, 256)).run();
      return json({ ok: true });
    }

    if (url.pathname === "/logs/export" && req.method === "GET") {
      if (!await verify(req, env)) return json({ error: "Unauthorized" }, 401);
      const { results } = await env.DB.prepare("SELECT * FROM traffic ORDER BY id DESC LIMIT 10000").all();
      return json({ logs: results });
    }

    if (url.pathname.startsWith("/node/") && req.method === "GET") {
      if (!await verify(req, env)) return json({ error: "Unauthorized" }, 401);
      return json({ ok: true, node: url.pathname.slice(6) });
    }

    return json({ error: "Not found" }, 404);
  }
};
