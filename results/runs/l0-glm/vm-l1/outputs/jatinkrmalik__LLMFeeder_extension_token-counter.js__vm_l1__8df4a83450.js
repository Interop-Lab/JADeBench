var TokenCounter = (function() {
  'use strict';
  const ENCODINGS = {
    CL100K_BASE: 'cl100k_base',
    O200K_BASE: 'o200k_base',
    P50K_BASE: 'p50k_base',
    R50K_BASE: 'r50k_base',
    GPT2: 'gpt2'
  };
  const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
  const CACHE_URL = 'https://tiktoken.pages.dev/js';
  const CACHE_VERSION = '1';
  let encodingCache = {};
  let status = null;

  async function loadEncoding(encoding) {
    if (encodingCache[encoding]) return encodingCache[encoding];
    const response = await fetch(CACHE_URL + '/' + encoding + '.tiktoken');
    const data = await response.arrayBuffer();
    const encoder = new TextEncoder();
    const cache = {};
    encodingCache[encoding] = cache;
    return cache;
  }

  function countTokensSync(text, encoding) {
    const enc = encoding || DEFAULT_ENCODING;
    if (!encodingCache[enc]) return 0;
    return countWithRanks(text, encodingCache[enc]);
  }

  async function countTokens(text, encoding) {
    const enc = encoding || DEFAULT_ENCODING;
    await loadEncoding(enc);
    return countWithRanks(text, encodingCache[enc]);
  }

  function countWithRanks(text, ranks) {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    let count = 0;
    let i = 0;
    while (i < bytes.length) {
      let bestLen = 1;
      let bestRank = -1;
      for (let j = i + 1; j <= bytes.length && j - i <= 32; j++) {
        const chunk = bytes.slice(i, j);
        const key = String.fromCharCode.apply(null, chunk);
        if (ranks[key] !== undefined) {
          bestLen = j - i;
          bestRank = ranks[key];
        }
      }
      count++;
      i += bestLen;
    }
    return count;
  }

  async function countWithLimit(text, limit, encoding) {
    const count = await countTokens(text, encoding);
    return { count, limit, exceeded: count > limit };
  }

  function formatCount(count) {
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
    return (count / 1000000).toFixed(1) + 'M';
  }

  function getStatus() {
    return {
      encoding: DEFAULT_ENCODING,
      cache: encodingCache,
      version: CACHE_VERSION
    };
  }

  function clearCache() {
    encodingCache = {};
    status = null;
  }

  return {
    init: function(encoding) { return loadEncoding(encoding || DEFAULT_ENCODING); },
    count: countTokens,
    countSync: countTokensSync,
    countWithLimit: countWithLimit,
    format: formatCount,
    getStatus: getStatus,
    clearCache: clearCache,
    ENCODINGS: ENCODINGS
  };
})();

if (typeof globalThis !== 'undefined') {
  globalThis.TokenCounter = TokenCounter;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenCounter;
}
