'use strict';

const ENCODINGS = Object.freeze({
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2'
});

const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const STORAGE_KEY = 'tokenCounterEncodings';
const CDN_ROOT = 'https://tiktoken.pages.dev/js';
let encodingCache = {};

function getExtensionStorage() {
  try {
    if (typeof browser !== 'undefined' && browser.storage) return browser.storage.local;
    if (typeof chrome !== 'undefined' && chrome.storage) return chrome.storage.local;
  } catch {}
  return null;
}

async function readStoredEncoding(name) {
  const storage = getExtensionStorage();
  if (!storage) return null;
  try {
    const stored = await storage.get(STORAGE_KEY);
    return stored?.[STORAGE_KEY]?.[name] || null;
  } catch {
    return null;
  }
}

async function storeEncoding(name, encoding) {
  const storage = getExtensionStorage();
  if (!storage) {
    console.log('TokenCounter: Could not save to storage');
    return;
  }
  try {
    const stored = await storage.get(STORAGE_KEY);
    const encodings = stored?.[STORAGE_KEY] || {};
    encodings[name] = encoding;
    await storage.set({ [STORAGE_KEY]: encodings });
  } catch {
    console.log('TokenCounter: Could not save to storage');
  }
}

async function loadEncoding(name = DEFAULT_ENCODING) {
  if (encodingCache[name]) return encodingCache[name];

  const stored = await readStoredEncoding(name);
  if (stored) {
    encodingCache[name] = stored;
    return stored;
  }

  console.log('TokenCounter: Could not load from storage, fetching from CDN');
  const response = await fetch(`${CDN_ROOT}/${name}.json`);
  if (!response.ok) throw new Error(`Failed to fetch encoding: ${response.status} ${response.statusText}`);
  const encoding = await response.json();
  encodingCache[name] = encoding;
  await storeEncoding(name, encoding);
  return encoding;
}

function fallbackCount(text) {
  if (!text || typeof text !== 'string') return 0;
  const pieces = text.match(/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu) || [];
  let count = 0;
  for (const piece of pieces) {
    const byteLength = new TextEncoder().encode(piece).length;
    count += Math.max(1, Math.ceil(byteLength / 4));
  }
  return count + 1;
}

function countWithEncoding(text, encoding) {
  if (!text || typeof text !== 'string') return 0;
  if (!encoding || typeof encoding !== 'object') return fallbackCount(text);

  const bytes = new TextEncoder().encode(text);
  const ranks = encoding.mergeable_ranks;
  let tokenCount = 0;
  let offset = 0;

  while (offset < bytes.length) {
    let matchedLength = -1;
    for (let length = 1; length <= Math.min(10, bytes.length - offset); length++) {
      const key = Array.from(bytes.slice(offset, offset + length)).join(',');
      if (ranks && ranks[key] !== undefined) matchedLength = length;
    }
    if (matchedLength > 0) offset += matchedLength;
    else offset++;
    tokenCount++;
  }
  return tokenCount;
}

const TokenCounter = {
  async init() {
    try {
      await loadEncoding(DEFAULT_ENCODING);
      return true;
    } catch (error) {
      console.error('TokenCounter: Failed to initialize:', error);
      return false;
    }
  },

  async count(text, encodingName = DEFAULT_ENCODING) {
    try {
      const encoding = await loadEncoding(encodingName);
      return countWithEncoding(text, encoding);
    } catch (error) {
      console.error('TokenCounter: Failed to load encoding:', error);
      console.log('TokenCounter: Using fallback counting');
      return fallbackCount(text);
    }
  },

  countSync(text) {
    const encoding = encodingCache[DEFAULT_ENCODING];
    return encoding ? countWithEncoding(text, encoding) : fallbackCount(text);
  },

  async countWithLimit(text, limit = 4096) {
    const count = await this.count(text);
    const percentage = Math.min(Math.round((count / limit) * 100), 999);
    return {
      count,
      limit,
      percentage,
      isOverLimit: count > limit,
      remaining: Math.max(0, limit - count)
    };
  },

  format(count, limit = null) {
    if (limit) {
      const percentage = Math.round((count / limit) * 100);
      return `${count.toLocaleString()} / ${limit.toLocaleString()} tokens (${percentage}%)`;
    }
    return `${count.toLocaleString()} tokens`;
  },

  getStatus() {
    const cachedEncodings = Object.keys(encodingCache);
    return {
      isReady: cachedEncodings.length > 0,
      cachedEncodings,
      defaultEncoding: DEFAULT_ENCODING
    };
  },

  async clearCache() {
    encodingCache = {};
    try {
      const storage = getExtensionStorage();
      if (storage) await storage.remove(STORAGE_KEY);
    } catch {
      console.log('TokenCounter: Could not clear storage');
    }
  },

  ENCODINGS
};

if (typeof module !== 'undefined' && module.exports) module.exports = TokenCounter;
