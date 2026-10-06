// Vercel serverless function: AI proxy for the diet app.
// Env vars (Vercel > Settings > Environment Variables):
//   ANTHROPIC_API_KEY  (required)  your Anthropic API key
//   ALLOWED_EMAILS     (required)  comma separated Google emails allowed to use AI
//   MAX_PER_DAY        (optional)  default 60 requests per user per day
//   ANTHROPIC_MODEL    (optional)  default claude-sonnet-5-5
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAtTCYMyFrGuVAfVHK8MpQS_DvQhxWpUkk';
const hits = new Map(); // best effort, resets when the function instance restarts

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'method' });
  const key = process.env.ANTHROPIC_API_KEY;
  const allowed = (process.env.ALLOWED_EMAILS || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (!key || !allowed.length) return res.status(500).json({ error: 'server_not_configured' });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'no_token' });
  let user;
  try {
    const r = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_API_KEY, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ idToken: token })
    });
    if (!r.ok) return res.status(401).json({ error: 'bad_token' });
    user = ((await r.json()).users || [])[0];
  } catch (e) { return res.status(502).json({ error: 'auth_unreachable' }); }
  if (!user || !user.email || !user.emailVerified) return res.status(401).json({ error: 'bad_user' });
  if (!allowed.includes(String(user.email).toLowerCase())) return res.status(403).json({ error: 'not_allowed' });

  const day = new Date().toISOString().slice(0, 10), hk = user.localId + ':' + day;
  const max = +process.env.MAX_PER_DAY || 60, n = (hits.get(hk) || 0) + 1;
  if (n > max) return res.status(429).json({ error: 'daily_limit' });
  hits.set(hk, n);
  if (hits.size > 500) for (const k of hits.keys()) if (!k.endsWith(day)) hits.delete(k);

  const b = req.body || {};
  if (!Array.isArray(b.messages) || !b.messages.length || b.messages.length > 20) return res.status(400).json({ error: 'bad_request' });
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5', max_tokens: Math.min(+b.max_tokens || 1200, 2000), messages: b.messages })
    });
    const txt = await r.text();
    res.status(r.status).setHeader('content-type', 'application/json').send(txt);
  } catch (e) { res.status(502).json({ error: 'upstream' }); }
};
