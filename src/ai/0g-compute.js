// 0G Compute — decentralized AI inference backend
// Drop-in replacement for claude.js using OpenAI-compatible API
// Setup: run `0g-compute-cli ui start-web` to get PROVIDER_URL and API_KEY

import { searchWeb, detectPrograms } from '../search/serper.js';

export async function parseIntent(userText, conversationHistory, onStatus) {
  const today = new Date().toISOString().split('T')[0];
  const providerUrl = localStorage.getItem('milechain_0g_provider_url') || '';
  const apiKey = localStorage.getItem('milechain_0g_api_key') || '';

  if (!providerUrl || !apiKey) {
    throw new Error('0G Compute not configured. Add provider URL and API key in settings.');
  }

  // Detect programs from current message + history
  const historyText = conversationHistory.map(m => m.content).join(' ');
  const mentionedPrograms = [
    ...new Set([
      ...detectPrograms(userText),
      ...detectPrograms(historyText),
    ]),
  ];

  // Fetch live transfer partner data
  let webContext = '';
  if (mentionedPrograms.length > 0) {
    onStatus?.(`🔍 Looking up transfer partners for ${mentionedPrograms.join(', ')}...`);
    const query = `${mentionedPrograms.join(' ')} airline transfer partners 2025 complete list`;
    const results = await searchWeb(query, 5);
    if (results) {
      webContext = `\n\nLIVE TRANSFER PARTNER DATA (treat as ground truth):\n${results}`;
    }
  }

  const systemPrompt = buildSystemPrompt(today, webContext);

  // OpenAI-compatible API call to 0G Compute
  const response = await fetch(`${providerUrl}/v1/proxy/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'qwen/qwen-2.5-7b-instruct',
      max_tokens: 512,
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));

  const raw = data.choices[0].message.content.trim();
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

function buildSystemPrompt(today, webContext) {
  return `You are an expert award flight search assistant. Gather all required info before searching.

REQUIRED before searching:
1. origin (specific airport IATA code — e.g. Chicago=ORD, New York=JFK, London=LHR)
2. destination (city or airport)
3. departDate
4. tripType (one-way or round trip; if round trip, need returnDate too)
5. cabin (economy, premium, business, first)
6. points (which loyalty/credit card points they have)
7. passengers (default 1)

RULES:
- If any required field is missing, ask for ALL missing fields at once in one friendly message
- Once you have everything, return the search JSON
- If user says "just search", use defaults: economy, 1 passenger, all programs

WHEN READY TO SEARCH — return ONLY valid JSON (no markdown, no explanation):
{
  "origin": "IATA code",
  "destination": "IATA code",
  "departDate": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD or null",
  "cabin": "economy|premium|business|first",
  "program": "comma-separated loyalty programs",
  "passengers": 1,
  "message": "friendly summary",
  "needsMoreInfo": false
}

WHEN MISSING INFO — return ONLY valid JSON:
{
  "needsMoreInfo": true,
  "clarifying_question": "your question"
}

Today is ${today}.
${webContext ? `\n${webContext}` : 'Use training knowledge for transfer partners.'}

CRITICAL: Respond with ONLY a raw JSON object. No explanation, no markdown, no \`\`\`json\`\`\` blocks. Start with { and end with }.`;
}