// Proxy Parla → Claude. La clé API reste côté serveur (ANTHROPIC_API_KEY).
// POST /chat  { system: string, messages: [{ role: 'user'|'assistant', content: string }] }
//          →  { text: string }
import Anthropic from '@anthropic-ai/sdk';
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = 'claude-haiku-4-5';
const client = new Anthropic();

function send(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  });
  res.end(JSON.stringify(body));
}

/** Valide la requête : on ne relaie qu'une conversation courte en texte. */
function validate(body) {
  const { system, messages } = body ?? {};
  if (typeof system !== 'string' || system.length > 4000) return null;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 60) return null;
  const clean = messages.map((m) => ({ role: m?.role, content: m?.content }));
  const ok = clean.every(
    (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.length <= 1000,
  );
  return ok && clean[0].role === 'user' ? { system, messages: clean } : null;
}

createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method !== 'POST' || req.url !== '/chat') return send(res, 404, { error: 'not_found' });

  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 100_000) return send(res, 413, { error: 'too_large' });
  }
  let input;
  try {
    input = validate(JSON.parse(raw));
  } catch {
    input = null;
  }
  if (!input) return send(res, 400, { error: 'bad_request' });

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: input.system,
      messages: input.messages,
    });
    const text = response.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('');
    send(res, 200, { text });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return send(res, 429, { error: 'rate_limited' });
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API ${error.status}:`, error.message);
      return send(res, 502, { error: 'upstream' });
    }
    console.error(error);
    send(res, 500, { error: 'internal' });
  }
}).listen(PORT, () => console.log(`Parla proxy sur http://localhost:${PORT}/chat`));
