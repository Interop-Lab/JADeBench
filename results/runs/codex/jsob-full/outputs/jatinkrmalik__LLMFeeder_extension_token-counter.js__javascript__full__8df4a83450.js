'use strict';

const ENCODINGS = {
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2'
};

const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const CACHE_KEY = 'llmfeeder_encoding_cache';
const CACHE_VERSION = '1';
const ENCODING_BASE_URL = 'https://tiktoken.pages.dev/js';
let cache = {};

function browserStorage() {
  if (typeof browser !== 'undefined') return browser.storage.local;
  if (typeof chrome !== 'undefined') return chrome.storage.local;
  return null;
}

function extensionBase() {
  if (typeof browser !== 'undefined' && browser.runtime?.getURL) return browser.runtime.getURL('');
  if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) return chrome.runtime.getURL('');
  return '';
}

function byteKey(bytes) {
  return Array.from(bytes).join(',');
}

function rankTable(encoding) {
  return encoding?.ranks || encoding?.mergeable_ranks || encoding?.mergeableRanks || {};
}

function rankFor(table, bytes) {
  const key = byteKey(bytes);
  if (Object.prototype.hasOwnProperty.call(table, key)) return table[key];
  return undefined;
}

function heuristicCount(text) {
  if (!text || typeof text !== 'string') return 0;
  const parts = text.match(/'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu) || [];
  let count = 0;
  const encoder = new TextEncoder();
  for (const part of parts) count += Math.max(1, Math.ceil(encoder.encode(part).length / 4));
  return count + 1;
}

function countWithEncoding(text, encoding) {
  if (!text || typeof text !== 'string') return 0;
  if (!encoding || typeof encoding !== 'object') return heuristicCount(text);
  const ranks = rankTable(encoding);
  if (!ranks || typeof ranks !== 'object' || !Object.keys(ranks).length) return heuristicCount(text);
  const parts = text.match(new RegExp(encoding.pat_str || encoding.pattern || /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu)) || [];
  const encoder = new TextEncoder();
  let count = 0;
  for (const part of parts) {
    const bytes = encoder.encode(part);
    if (!bytes.length) continue;
    let pieces = Array.from(bytes, byte => Uint8Array.of(byte));
    while (pieces.length > 1) {
      let bestIndex = -1;
      let bestRank = Infinity;
      for (let index = 0; index + 1 < pieces.length; index++) {
        const merged = new Uint8Array(pieces[index].length + pieces[index + 1].length);
        merged.set(pieces[index]);
        merged.set(pieces[index + 1], pieces[index].length);
        const rank = rankFor(ranks, merged);
        if (rank !== undefined && rank < bestRank) {
          bestIndex = index;
          bestRank = rank;
        }
      }
      if (bestIndex < 0) break;
      const merged = new Uint8Array(pieces[bestIndex].length + pieces[bestIndex + 1].length);
      merged.set(pieces[bestIndex]);
      merged.set(pieces[bestIndex + 1], pieces[bestIndex].length);
      pieces.splice(bestIndex, 2, merged);
    }
    count += pieces.length;
  }
  return count;
}

async function loadEncoding(name = DEFAULT_ENCODING) {
  if (cache[name]) return cache[name];
  const storage = browserStorage();
  try {
    if (storage?.get) {
      const stored = await storage.get(CACHE_KEY);
      if (stored?.[CACHE_KEY]?.version === CACHE_VERSION && stored[CACHE_KEY][name]) {
        cache[name] = stored[CACHE_KEY][name];
        return cache[name];
      }
    }
  } catch (error) {
    console.error('TokenCounter: Failed to read encoding cache:', error);
  }

  try {
    const response = await fetch(`${ENCODING_BASE_URL}/${name}.json`);
    if (!response.ok) throw new Error(`Failed to load encoding: ${response.status}`);
    const encoding = await response.json();
    cache[name] = encoding;
    try {
      if (storage?.get && storage?.set) {
        const stored = await storage.get(CACHE_KEY);
        const value = stored?.[CACHE_KEY] || { version: CACHE_VERSION };
        value.version = CACHE_VERSION;
        value[name] = encoding;
        await storage.set({ [CACHE_KEY]: value });
      }
    } catch (error) {
      console.error('TokenCounter: Failed to cache encoding:', error);
    }
    return encoding;
  } catch (error) {
    console.error('TokenCounter: Failed to load encoding:', error);
    throw error;
  }
}

const TokenCounter = {
  async init() {
    try {
      await loadEncoding(DEFAULT_ENCODING);
      return true;
    } catch (error) {
      console.error('TokenCounter: Initialization failed:', error);
      return false;
    }
  },

  async count(text, encoding = DEFAULT_ENCODING) {
    try {
      return countWithEncoding(text, await loadEncoding(encoding));
    } catch (error) {
      console.error('TokenCounter: Count failed:', error);
      return heuristicCount(text);
    }
  },

  countSync(text) {
    const encoding = cache[DEFAULT_ENCODING];
    return encoding ? countWithEncoding(text, encoding) : heuristicCount(text);
  },

  async countWithLimit(text, limit = 4096) {
    const count = await this.count(text);
    const percentage = Math.round((count / limit) * 100);
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
    return {
      isReady: Object.keys(cache).length > 0,
      cachedEncodings: Object.keys(cache),
      defaultEncoding: DEFAULT_ENCODING
    };
  },

  async clearCache() {
    cache = {};
    try {
      const storage = browserStorage();
      if (storage?.remove) await storage.remove(CACHE_KEY);
      else if (storage?.set) await storage.set({ [CACHE_KEY]: { version: CACHE_VERSION } });
    } catch (error) {
      console.error('TokenCounter: Failed to clear cache:', error);
    }
  },

  ENCODINGS
};

if (typeof module !== 'undefined' && module.exports) module.exports = TokenCounter;
