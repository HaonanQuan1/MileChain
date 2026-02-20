// Serper.dev web search — used to fetch live transfer partner rules

export async function searchWeb(query, count = 5) {
  const apiKey = localStorage.getItem('milechain_serper_key') || '';
  if (!apiKey) return null;

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': apiKey,
      },
      body: JSON.stringify({ q: query, num: count }),
    });

    const data = await res.json();
    return data.organic
      ?.map(r => `SOURCE: ${r.link}\n${r.title}\n${r.snippet}`)
      .join('\n\n') || null;
  } catch (e) {
    console.error('Serper search failed:', e);
    return null;
  }
}

// Detect which loyalty programs are mentioned in text
export function detectPrograms(text) {
  const programs = [];
  if (/amex|membership rewards/i.test(text)) programs.push('Amex Membership Rewards');
  if (/chase|ultimate rewards/i.test(text)) programs.push('Chase Ultimate Rewards');
  if (/citi|thankyou/i.test(text)) programs.push('Citi ThankYou');
  if (/capital one/i.test(text)) programs.push('Capital One Miles');
  if (/bilt/i.test(text)) programs.push('Bilt Rewards');
  if (/alaska/i.test(text)) programs.push('Alaska Mileage Plan');
  if (/united/i.test(text)) programs.push('United MileagePlus');
  if (/delta/i.test(text)) programs.push('Delta SkyMiles');
  return programs;
}
