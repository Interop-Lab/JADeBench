'use strict';

const ENCODINGS = Object.freeze({
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2'
});

const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const BASE_URL = 'https://tiktoken.pages.dev/js';
const STORAGE_KEY = 'llmfeeder_encoding_cache';
const CACHE_VERSION = '1';

let encodingCache = Object.create(null);
let initializationPromise = null;

function getStorage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch (_) {
    return null;
  }
}

function restoreCache() {
  const storage = getStorage();
  if (!storage) return;

  try {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY));
    if (
      saved &&
      saved.version === CACHE_VERSION &&
      saved.encodings &&
      typeof saved.encodings === 'object'
    ) {
      encodingCache = saved.encodings;
    }
  } catch (_) {
    // Ignore malformed or inaccessible persistent cache data.
  }
}

function persistCache() {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: CACHE_VERSION,
        encodings: encodingCache
      })
    );
  } catch (_) {
    // Storage is optional.
  }
}

function bytesToKey(bytes) {
  let key = '';
  for (let i = 0; i < bytes.length; i++) {
    key += String.fromCharCode(bytes[i]);
  }
  return key;
}

function decodeBase64(value) {
  if (typeof atob === 'function') {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(value, 'base64'));
  }

  throw new Error('Base64 decoding is not available');
}

function parseRanks(data) {
  const source =
    data.bpe_ranks ||
    data.mergeable_ranks ||
    data.ranks ||
    data.tokens ||
    data;

  const ranks = new Map();

  if (Array.isArray(source)) {
    for (let i = 0; i < source.length; i++) {
      const entry = source[i];

      if (Array.isArray(entry) && entry.length >= 2) {
        const token = entry[0];
        const rank = Number(entry[1]);
        if (typeof token === 'string' && Number.isFinite(rank)) {
          try {
            ranks.set(bytesToKey(decodeBase64(token)), rank);
          } catch (_) {
            ranks.set(token, rank);
          }
        }
      } else if (typeof entry === 'string') {
        try {
          ranks.set(bytesToKey(decodeBase64(entry)), i);
        } catch (_) {
          ranks.set(entry, i);
        }
      }
    }
  } else if (source && typeof source === 'object') {
    for (const token of Object.keys(source)) {
      const rank = Number(source[token]);
      if (!Number.isFinite(rank)) continue;

      try {
        ranks.set(bytesToKey(decodeBase64(token)), rank);
      } catch (_) {
        ranks.set(token, rank);
      }
    }
  } else if (typeof source === 'string') {
    const lines = source.trim().split(/\r?\n/);

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) continue;

      const rank = Number(parts[1]);
      if (!Number.isFinite(rank)) continue;

      try {
        ranks.set(bytesToKey(decodeBase64(parts[0])), rank);
      } catch (_) {
        ranks.set(parts[0], rank);
      }
    }
  }

  return ranks;
}

function createEncoder(data) {
  if (!data || typeof data !== 'object') {
    throw new TypeError('Invalid encoding data');
  }

  const ranks = parseRanks(data);
  const pattern = data.pat_str || data.pattern || null;
  let regex = null;

  if (pattern) {
    try {
      regex = new RegExp(pattern, 'gu');
    } catch (_) {
      try {
        regex = new RegExp(pattern, 'g');
      } catch (_) {
        regex = null;
      }
    }
  }

  return {
    ranks,
    pattern,
    specialTokens: data.special_tokens || Object.create(null),
    source: data,
    regex
  };
}

function serializeEncoding(encoder) {
  return encoder && encoder.source ? encoder.source : encoder;
}

function hydrateEncoding(value) {
  if (!value) return null;
  if (value.ranks instanceof Map) return value;

  try {
    return createEncoder(value.source || value);
  } catch (_) {
    return null;
  }
}

async function loadEncoding(name = DEFAULT_ENCODING) {
  const cached = hydrateEncoding(encodingCache[name]);
  if (cached) {
    encodingCache[name] = cached;
    return cached;
  }

  if (typeof fetch !== 'function') {
    throw new Error('fetch is not available');
  }

  const response = await fetch(`${BASE_URL}/${name}.json`);
  if (!response || !response.ok) {
    throw new Error(
      `Unable to load encoding "${name}"${
        response && response.status ? `: ${response.status}` : ''
      }`
    );
  }

  const data = await response.json();
  const encoder = createEncoder(data);
  encodingCache[name] = encoder;

  const persistent = Object.create(null);
  for (const key of Object.keys(encodingCache)) {
    persistent[key] = serializeEncoding(encodingCache[key]);
  }

  const previous = encodingCache;
  encodingCache = persistent;
  persistCache();
  encodingCache = previous;

  return encoder;
}

function splitBytesAt(bytes, index) {
  return [bytes.subarray(0, index), bytes.subarray(index)];
}

function bytePairEncode(bytes, ranks) {
  if (bytes.length === 0) return 0;
  if (bytes.length === 1) return 1;

  const wholeRank = ranks.get(bytesToKey(bytes));
  if (wholeRank !== undefined) return 1;

  let parts = [];
  for (let i = 0; i < bytes.length; i++) {
    parts.push(bytes.subarray(i, i + 1));
  }

  while (parts.length > 1) {
    let bestIndex = -1;
    let bestRank = Infinity;

    for (let i = 0; i < parts.length - 1; i++) {
      const left = parts[i];
      const right = parts[i + 1];
      const merged = new Uint8Array(left.length + right.length);
      merged.set(left);
      merged.set(right, left.length);

      const rank = ranks.get(bytesToKey(merged));
      if (rank !== undefined && rank < bestRank) {
        bestRank = rank;
        bestIndex = i;
      }
    }

    if (bestIndex < 0) break;

    const left = parts[bestIndex];
    const right = parts[bestIndex + 1];
    const merged = new Uint8Array(left.length + right.length);
    merged.set(left);
    merged.set(right, left.length);
    parts.splice(bestIndex, 2, merged);
  }

  return parts.length;
}

function getTextEncoder() {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder();
  }

  return {
    encode(value) {
      const encoded = unescape(encodeURIComponent(value));
      const bytes = new Uint8Array(encoded.length);
      for (let i = 0; i < encoded.length; i++) {
        bytes[i] = encoded.charCodeAt(i);
      }
      return bytes;
    }
  };
}

function countWithEncoder(text, encoder) {
  text = String(text);
  if (!text) return 0;

  const utf8 = getTextEncoder();
  const ranks = encoder.ranks;

  if (!ranks || ranks.size === 0) {
    return approximateCount(text);
  }

  if (!encoder.regex) {
    return bytePairEncode(utf8.encode(text), ranks);
  }

  let count = 0;
  let lastIndex = 0;
  encoder.regex.lastIndex = 0;

  for (;;) {
    const match = encoder.regex.exec(text);
    if (!match) break;

    if (match.index > lastIndex) {
      count += bytePairEncode(
        utf8.encode(text.slice(lastIndex, match.index)),
        ranks
      );
    }

    count += bytePairEncode(utf8.encode(match[0]), ranks);
    lastIndex = match.index + match[0].length;

    if (match[0].length === 0) {
      encoder.regex.lastIndex++;
    }
  }

  if (lastIndex < text.length) {
    count += bytePairEncode(utf8.encode(text.slice(lastIndex)), ranks);
  }

  return count;
}

function approximateCount(text) {
  text = String(text);
  if (!text) return 0;

  const pieces =
    text.match(
      /(?:\p{L}|\p{M})+|\p{N}+|[^\s\p{L}\p{M}\p{N}]+|\s+/gu
    ) || [];

  const utf8 = getTextEncoder();
  let count = 0;

  for (const piece of pieces) {
    if (/^\s+$/u.test(piece)) continue;
    const length = utf8.encode(piece).length;
    count += Math.max(1, Math.ceil(length / 4));
  }

  return count;
}

async function init(encoding = DEFAULT_ENCODING) {
  restoreCache();

  const cached = hydrateEncoding(encodingCache[encoding]);
  if (cached) {
    encodingCache[encoding] = cached;
    return true;
  }

  if (!initializationPromise) {
    initializationPromise = loadEncoding(encoding).finally(() => {
      initializationPromise = null;
    });
  }

  await initializationPromise;
  return true;
}

async function count(text, encoding = DEFAULT_ENCODING) {
  let encoder = hydrateEncoding(encodingCache[encoding]);

  if (!encoder) {
    try {
      encoder = await loadEncoding(encoding);
    } catch (_) {
      return approximateCount(text);
    }
  }

  encodingCache[encoding] = encoder;
  return countWithEncoder(text, encoder);
}

function countSync(text, encoding = DEFAULT_ENCODING) {
  const encoder = hydrateEncoding(encodingCache[encoding]);
  if (!encoder) return approximateCount(text);

  encodingCache[encoding] = encoder;
  return countWithEncoder(text, encoder);
}

function countWithLimit(text, limit, encoding = DEFAULT_ENCODING) {
  const tokenCount = countSync(text, encoding);
  const numericLimit = Number(limit);

  if (!Number.isFinite(numericLimit)) {
    return {
      count: tokenCount,
      limit: numericLimit,
      remaining: Infinity,
      overLimit: false
    };
  }

  return {
    count: tokenCount,
    limit: numericLimit,
    remaining: Math.max(0, numericLimit - tokenCount),
    overLimit: tokenCount > numericLimit
  };
}

function format(value) {
  const count = Number(value);
  if (!Number.isFinite(count)) return String(value);

  const absolute = Math.abs(count);
  if (absolute < 1000) return String(Math.round(count));
  if (absolute < 1000000) {
    return `${(count / 1000).toFixed(absolute < 10000 ? 1 : 0)}K`;
  }
  if (absolute < 1000000000) {
    return `${(count / 1000000).toFixed(absolute < 10000000 ? 1 : 0)}M`;
  }
  return `${(count / 1000000000).toFixed(absolute < 10000000000 ? 1 : 0)}B`;
}

function getStatus() {
  return {
    encoding: DEFAULT_ENCODING,
    initialized: !!hydrateEncoding(encodingCache[DEFAULT_ENCODING]),
    loading: initializationPromise !== null,
    cachedEncodings: Object.keys(encodingCache)
  };
}

function clearCache() {
  encodingCache = Object.create(null);
  initializationPromise = null;

  const storage = getStorage();
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY);
    } catch (_) {
      // Storage is optional.
    }
  }
}

const TokenCounter = {
  init,
  count,
  countSync,
  countWithLimit,
  format,
  getStatus,
  clearCache,
  ENCODINGS
};

if (typeof globalThis !== 'undefined') {
  globalThis.TokenCounter = TokenCounter;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenCounter;
}
