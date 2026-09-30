'use strict';

const CDN_BASE = 'https://tiktoken.pages.dev/js';
const CACHE_NAME = 'llmfeeder_encoding_cache';
const DEFAULT_ENCODING = 'cl100k_base';
const ENCODINGS = Object.freeze({ CL100K_BASE: 'cl100k_base', O200K_BASE: 'o200k_base', P50K_BASE: 'p50k_base', R50K_BASE: 'r50k_base', GPT2: 'gpt2' });
let encodings = {};
let initialization = null;

function openCache() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('IndexedDB unavailable'));
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('encodings')) request.result.createObjectStore('encodings');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readStoredEncoding(name) {
  const database = await openCache();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction('encodings', 'readonly').objectStore('encodings').get(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally { database.close(); }
}

async function storeEncoding(name, value) {
  const database = await openCache();
  try {
    await new Promise((resolve, reject) => {
      const request = database.transaction('encodings', 'readwrite').objectStore('encodings').put(value, name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } finally { database.close(); }
}

async function loadEncoding(name = DEFAULT_ENCODING) {
  if (encodings[name]) return encodings[name];
  try {
    const stored = await readStoredEncoding(name);
    if (stored) return encodings[name] = stored;
  } catch {
    console.log('TokenCounter: Could not load from storage, fetching from CDN');
  }
  const response = await fetch(`${CDN_BASE}/${name}.json`);
  if (!response.ok) throw new Error(`Failed to fetch encoding: ${response.status}`);
  const value = await response.json();
  encodings[name] = value;
  try { await storeEncoding(name, value); }
  catch { console.log('TokenCounter: Could not save encoding to storage'); }
  return value;
}

function fallbackCount(text) {
  if (typeof text !== 'string' || !text) return 0;
  const pieces = text.match(/ ?[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]+|\s/gu) || [];
  const encoder = new TextEncoder();
  return pieces.reduce((sum, piece) => sum + Math.max(1, Math.ceil(encoder.encode(piece).length / 4)), 1);
}

function makeRanks(encoding) {
  const entries = Array.isArray(encoding?.bpe_ranks) ? encoding.bpe_ranks : Object.entries(encoding?.bpe_ranks || {});
  const ranks = new Map();
  for (const [token, rank] of entries) {
    let bytes;
    try {
      bytes = typeof Buffer === 'undefined'
        ? Uint8Array.from(atob(token), character => character.charCodeAt(0))
        : Uint8Array.from(Buffer.from(token, 'base64'));
    } catch { bytes = new TextEncoder().encode(token); }
    ranks.set(Array.from(bytes).join(','), Number(rank));
  }
  return ranks;
}

function bytePairCount(bytes, ranks) {
  let parts = Array.from(bytes, byte => [byte]);
  while (parts.length > 1) {
    let bestIndex = -1;
    let bestRank = Infinity;
    for (let index = 0; index + 1 < parts.length; index++) {
      const rank = ranks.get(parts[index].concat(parts[index + 1]).join(','));
      if (rank !== undefined && rank < bestRank) { bestRank = rank; bestIndex = index; }
    }
    if (bestIndex < 0) break;
    parts.splice(bestIndex, 2, parts[bestIndex].concat(parts[bestIndex + 1]));
  }
  return parts.length;
}

function encodedCount(text, encoding) {
  if (typeof text !== 'string' || !text) return 0;
  const ranks = makeRanks(encoding);
  if (!ranks.size) return fallbackCount(text);
  const pattern = encoding.pat_str ? new RegExp(encoding.pat_str, 'gu') : /[\s\S]+/gu;
  const encoder = new TextEncoder();
  let total = 0;
  for (const match of text.matchAll(pattern)) total += bytePairCount(encoder.encode(match[0]), ranks);
  return total;
}

async function init() {
  if (encodings[DEFAULT_ENCODING]) return true;
  if (!initialization) initialization = loadEncoding().then(() => true).catch(error => {
    console.error('TokenCounter: Initialization failed:', error);
    return false;
  }).finally(() => { initialization = null; });
  return initialization;
}

async function count(text, encoding = DEFAULT_ENCODING) {
  try { return encodedCount(text, await loadEncoding(encoding)); }
  catch (error) {
    console.error('TokenCounter: Failed to load encoding:', error);
    console.log('TokenCounter: Using fallback counting');
    return fallbackCount(text);
  }
}

function countSync(text, encoding = DEFAULT_ENCODING) {
  return encodings[encoding] ? encodedCount(text, encodings[encoding]) : fallbackCount(text);
}

async function countWithLimit(text, limit = 4096, encoding = DEFAULT_ENCODING) {
  const tokenCount = await count(text, encoding);
  return { count: tokenCount, limit, percentage: Math.round(tokenCount / limit * 1000) / 10, isOverLimit: tokenCount > limit, remaining: Math.max(0, limit - tokenCount) };
}

function format(value) { return `${value.toLocaleString()} tokens`; }
function getStatus() { return { isReady: Boolean(encodings[DEFAULT_ENCODING]), cachedEncodings: Object.keys(encodings), defaultEncoding: DEFAULT_ENCODING }; }

async function clearCache() {
  encodings = {};
  if (typeof indexedDB === 'undefined') {
    console.log('TokenCounter: Could not clear storage');
    return;
  }
  try {
    await new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(CACHE_NAME);
      request.onsuccess = resolve;
      request.onerror = () => reject(request.error);
      request.onblocked = () => reject(new Error('Cache database is blocked'));
    });
  } catch { console.log('TokenCounter: Could not clear storage'); }
}

const TokenCounter = { init, count, countSync, countWithLimit, format, getStatus, clearCache, ENCODINGS };
globalThis.TokenCounter = TokenCounter;
module.exports = TokenCounter;
