// MileChain — main app entry point
// Wires together UI, AI, search, and storage modules

import { initForm, selectCabin, syncFormFromParsed, getFormParams } from './ui/form.js';
import { addMessage, addTyping, removeTyping, removeStatusMessages, autoResize } from './ui/chat.js';
import { displayResults, showLoading, showError, filterResults } from './ui/results.js';
import { getMockResults } from './search/mock.js';
import { saveSearch, getLocalHistory } from './storage/0g-storage.js';

// ── AI backend — 0G Compute (default), Claude (fallback)
import { parseIntent } from './ai/0g-compute.js';
// import { parseIntent } from './ai/claude.js'; // ← uncomment to use Claude instead

// ── STATE ──
let conversationHistory = [];

// ── INIT ──
window.onload = () => {
  initForm();
  loadKeys();
};

function loadKeys() {
  const claudeKey = localStorage.getItem('milechain_claude_key') || '';
  const zeroGUrl = localStorage.getItem('milechain_0g_provider_url') || '';
  const hasAnyKey = claudeKey || zeroGUrl;
  if (hasAnyKey) {
    document.getElementById('claudeKeyInput').value = claudeKey;
    document.getElementById('seatsKeyInput').value = localStorage.getItem('milechain_seats_key') || '';
    document.getElementById('serperKeyInput').value = localStorage.getItem('milechain_serper_key') || '';
    document.getElementById('zeroGProviderInput').value = zeroGUrl;
    document.getElementById('zeroGApiKeyInput').value = localStorage.getItem('milechain_0g_api_key') || '';
    document.getElementById('zeroGPrivateKeyInput').value = localStorage.getItem('milechain_0g_private_key') || '';
    document.getElementById('apiModal').style.display = 'none';
    updateStatusBadge();
  }
}

// ── KEY MANAGEMENT ──
window.saveKeys = () => {
  const claudeKey = document.getElementById('claudeKeyInput').value.trim();
  const zeroGUrl = document.getElementById('zeroGProviderInput').value.trim();
  const zeroGApiKey = document.getElementById('zeroGApiKeyInput').value.trim();
  if (!zeroGUrl && !zeroGApiKey && !claudeKey) {
    alert('Add 0G Compute provider URL and API key, or Claude API key.');
    return;
  }

  localStorage.setItem('milechain_claude_key', claudeKey);
  localStorage.setItem('milechain_seats_key', document.getElementById('seatsKeyInput').value.trim());
  localStorage.setItem('milechain_serper_key', document.getElementById('serperKeyInput').value.trim());
  localStorage.setItem('milechain_0g_provider_url', zeroGUrl);
  localStorage.setItem('milechain_0g_api_key', zeroGApiKey);
  localStorage.setItem('milechain_0g_private_key', document.getElementById('zeroGPrivateKeyInput').value.trim());

  document.getElementById('apiModal').style.display = 'none';
  updateStatusBadge();
};

function updateStatusBadge() {
  const badge = document.getElementById('statusBadge');
  const has0G = localStorage.getItem('milechain_0g_provider_url');
  const hasSeats = localStorage.getItem('milechain_seats_key');

  if (has0G) {
    badge.innerHTML = '<span style="color:#00FF88">●</span> 0G COMPUTE';
  } else if (hasSeats) {
    badge.innerHTML = '<span style="color:#00FF88">●</span> LIVE DATA';
  } else {
    badge.innerHTML = '<span style="color:#FF6B35">●</span> MOCK DATA';
  }
}

// ── CABIN SELECTION (exposed globally for inline HTML onclick) ──
window.selectCabin = selectCabin;
window.filterResults = filterResults;

// ── MANUAL SEARCH ──
window.doManualSearch = async () => {
  const params = getFormParams();
  if (!params.origin || !params.destination) {
    alert('Please enter origin and destination');
    return;
  }
  await searchAndDisplay(params);
};

// ── CHAT ──
window.handleKey = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
};

window.autoResize = autoResize;

window.fillHint = (text) => {
  document.getElementById('chatInput').value = text;
  sendMessage();
};

window.sendMessage = async () => {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const zeroGUrl = localStorage.getItem('milechain_0g_provider_url');
  const zeroGApiKey = localStorage.getItem('milechain_0g_api_key');
  const claudeKey = localStorage.getItem('milechain_claude_key');
  const hasAI = (zeroGUrl && zeroGApiKey) || claudeKey;
  if (!hasAI) {
    document.getElementById('apiModal').style.display = 'flex';
    return;
  }

  addMessage('user', text);
  input.value = '';
  input.style.height = 'auto';

  conversationHistory.push({ role: 'user', content: text });

  const typingId = addTyping();

  try {
    const parsed = await parseIntent(text, conversationHistory, (status) => {
      removeTyping(typingId);
      addMessage('assistant', status);
    });

    removeTyping(typingId);
    removeStatusMessages();

    if (parsed.needsMoreInfo) {
      addMessage('assistant', parsed.clarifying_question);
      conversationHistory.push({ role: 'assistant', content: parsed.clarifying_question });
      return;
    }

    if (parsed.error) {
      addMessage('assistant', parsed.error);
      conversationHistory.push({ role: 'assistant', content: parsed.error });
      return;
    }

    syncFormFromParsed(parsed);

    const replyMsg = parsed.message || `Searching ${parsed.origin} → ${parsed.destination} in ${parsed.cabin} class...`;
    addMessage('assistant', replyMsg);
    conversationHistory.push({ role: 'assistant', content: replyMsg });

    await searchAndDisplay(parsed);

  } catch (err) {
    removeTyping(typingId);
    removeStatusMessages();
    addMessage('assistant', 'Something went wrong: ' + err.message);
    console.error(err);
  }
};

// ── SEARCH & DISPLAY ──
async function searchAndDisplay(params) {
  showLoading();
  try {
    const results = getMockResults(params); // swap for seats.aero / 0G when ready
    displayResults(results, params);

    // Save search to 0G Storage (or localStorage fallback)
    await saveSearch(params, results);

    if (results.length > 0) {
      const best = results.reduce((a, b) => a.miles < b.miles ? a : b);
      addMessage('assistant', `Found <strong>${results.length} options</strong>! Best deal: <strong>${best.miles.toLocaleString()} miles</strong> via ${best.program} on ${best.carrier}.`);
    }
  } catch (err) {
    showError('Search failed: ' + err.message);
  }
}

window.openBooking = (url, carrier) => {
  addMessage('assistant', `Redirecting you to ${carrier} to complete your booking.`);
  if (url !== '#') window.open(url, '_blank');
};
