// Claude API — fallback AI backend
// To switch to 0G Compute, update the import in src/main.js

import { searchWeb, detectPrograms } from '../search/serper.js';

export async function parseIntent(userText, conversationHistory, onStatus) {
  const today = new Date().toISOString().split('T')[0];
  const apiKey = localStorage.getItem('milechain_claude_key') || import.meta.env.VITE_CLAUDE_API_KEY || '';

  // Detect programs from current message + history
  const historyText = conversationHistory.map(m => m.content).join(' ');
  const mentionedPrograms = [
    ...new Set([
      ...detectPrograms(userText),
      ...detectPrograms(historyText),
    ]),
  ];

  // Fetch live transfer partner data if programs detected
  let webContext = '';
  if (mentionedPrograms.length > 0) {
    onStatus?.(`🔍 Looking up transfer partners for ${mentionedPrograms.join(', ')}...`);
    const query = `${mentionedPrograms.join(' ')} airline transfer partners 2025 complete list`;
    const results = await searchWeb(query, 5);
    if (results) {
      webContext = `\n\nLIVE TRANSFER PARTNER DATA (treat as ground truth):\n${results}`;
    } else {
      onStatus?.('⚠️ No Serper key — using built-in knowledge. Add one in settings for live data.');
    }
  }

  const systemPrompt = buildSystemPrompt(today, webContext);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: systemPrompt,
      messages: conversationHistory,
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'API error');

  const raw = data.content[0].text.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

function buildSystemPrompt(today, webContext) {
  return `You are an expert award flight search assistant. Gather all required info before searching.

REQUIRED before searching:
1. origin (city or airport)
2. destination (city or airport)
3. departDate
4. tripType (one-way or round trip; if round trip, need returnDate too)
5. cabin (economy, premium, business, first)
6. points (which loyalty/credit card points they have)
7. passengers (default 1)

RULES:
- If any required field is missing, ask for ALL missing fields at once in one friendly message (max 2-3 questions)
- Once you have everything, return the search JSON
- If user says "just search", use defaults: economy, 1 passenger, all programs

WHEN READY TO SEARCH — return ONLY this JSON:
{
  "origin": "IATA code",
  "destination": "IATA code",
  "departDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD or null",
  "cabin": "economy|premium|business|first",
  "program": "comma-separated loyalty programs based on user points",
  "passengers": 1,
  "message": "friendly summary",
  "needsMoreInfo": false
}

WHEN MISSING INFO — return ONLY this JSON:
{
  "needsMoreInfo": true,
  "clarifying_question": "your friendly question here"
}

Today is ${today}.
${webContext ? `\n${webContext}` : 'No live web data — use training knowledge for transfer partners.'}
CRITICAL: Respond with ONLY a raw JSON object. No explanation, no markdown, no \`\`\`json\`\`\` blocks. Start with { and end with }.`;
}
