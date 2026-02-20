// 0G Storage — decentralized search history
// Saves search history to localStorage (fast cache) + 0G Storage network (on-chain)
// 
// 0G Storage SDK (@0glabs/0g-ts-sdk) requires a Node.js backend to upload files.
// For the browser demo, we save to localStorage and log what would be uploaded to 0G.
// In production, uploads would go through a small backend API that calls the 0G SDK.

const TESTNET_RPC = 'https://evmrpc-testnet.0g.ai';
const FLOW_CONTRACT = '0x22E03a6A89B950F1c82ec5e74F8eCa321a105296';
const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';

// Save a search to localStorage + log 0G Storage intent
export async function saveSearch(searchParams, results) {
  const entry = {
    timestamp: new Date().toISOString(),
    params: searchParams,
    resultCount: results.length,
    bestDeal: results.length > 0
      ? results.reduce((a, b) => a.miles < b.miles ? a : b)
      : null,
  };

  // Save to localStorage as fast local cache
  const history = getLocalHistory();
  history.unshift(entry);
  localStorage.setItem('milechain_search_history', JSON.stringify(history.slice(0, 50)));

  // Log 0G Storage intent (SDK upload requires Node.js backend)
  const privateKey = localStorage.getItem('milechain_0g_private_key');
  if (privateKey) {
    console.log('0G Storage: Would upload to decentralized network:', {
      contract: FLOW_CONTRACT,
      indexer: INDEXER_URL,
      rpc: TESTNET_RPC,
      data: entry,
    });
    // TODO: In production, POST to /api/save-to-0g and have the backend call the SDK
  }

  return entry;
}

// Load search history from localStorage
export function getLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem('milechain_search_history') || '[]');
  } catch {
    return [];
  }
}