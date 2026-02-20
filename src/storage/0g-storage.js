// 0G Storage — decentralized search history
// Saves/loads user search history on the 0G decentralized storage network
// SDK: @0glabs/0g-ts-sdk ethers

import { Blob as ZgBlob, Indexer } from '@0glabs/0g-ts-sdk';
import { ethers } from 'ethers';

const TESTNET_RPC = 'https://evmrpc-testnet.0g.ai';
const INDEXER_URL = 'https://indexer-storage-testnet-turbo.0g.ai';

// Save a search to 0G Storage (and localStorage as cache)
export async function saveSearch(searchParams, results) {
  const entry = {
    timestamp: new Date().toISOString(),
    params: searchParams,
    resultCount: results.length,
    bestDeal: results.length > 0
      ? results.reduce((a, b) => a.miles < b.miles ? a : b)
      : null,
  };

  // Always save to localStorage as fast local cache
  const history = getLocalHistory();
  history.unshift(entry);
  localStorage.setItem('milechain_search_history', JSON.stringify(history.slice(0, 50)));

  // If 0G private key is configured, also save to decentralized storage
  const privateKey = localStorage.getItem('milechain_0g_private_key');
  if (privateKey) {
    try {
      await saveToZeroG(entry, privateKey);
      console.log('Search saved to 0G Storage');
    } catch (e) {
      console.warn('0G Storage save failed, using localStorage:', e.message);
    }
  }

  return entry;
}

// Load search history from localStorage (0G sync could be added later)
export function getLocalHistory() {
  try {
    return JSON.parse(localStorage.getItem('milechain_search_history') || '[]');
  } catch {
    return [];
  }
}

// Upload data to 0G Storage network
async function saveToZeroG(data, privateKey) {
  const provider = new ethers.JsonRpcProvider(TESTNET_RPC);
  const signer = new ethers.Wallet(privateKey, provider);
  const indexer = new Indexer(INDEXER_URL);

  // Create file from blob for browser
  const jsonStr = JSON.stringify(data);
  const nativeBlob = new Blob([jsonStr], { type: 'application/json' });
  const file = new File([nativeBlob], 'search.json', { type: 'application/json' });
  const zgFile = new ZgBlob(file);

  const [tree, treeErr] = await zgFile.merkleTree();
  if (treeErr !== null) {
    throw new Error('Merkle tree error: ' + treeErr);
  }

  const [result, uploadErr] = await indexer.upload(zgFile, TESTNET_RPC, signer);
  if (uploadErr !== null) {
    throw new Error('Upload failed: ' + uploadErr.message);
  }

  return result;
}
