var TokenCounter = (function () {
  "use strict";

  const DATA_BASE_URL = "https://tiktoken.pages.dev/js";

  const ENCODINGS = {
    CL100K_BASE: "cl100k_base",
    P50K_BASE: "p50k_base",
    R50K_BASE: "r50k_base",
    P50K_EDIT: "p50k_edit",
    O200K_BASE: "o200k_base"
  };

  const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
  const CACHE_KEY = "tokenCounterCache";
  const CACHE_VERSION = "1";

  let encodingCache = {};

  function getExtensionAPI() {
    return typeof browser !== "undefined" ? browser : chrome;
  }

  async function loadEncoding(encoding = DEFAULT_ENCODING) {
    if (encodingCache[encoding]) {
      return encodingCache[encoding];
    }

    try {
      const extensionAPI = getExtensionAPI();
      const stored = await extensionAPI.storage.local.get(CACHE_KEY);
      const cache = stored[CACHE_KEY];

      if (
        cache &&
        cache.version === CACHE_VERSION &&
        cache[encoding]
      ) {
        encodingCache[encoding] = cache[encoding];
        return encodingCache[encoding];
      }
    } catch (error) {
      console.warn("Unable to read tokenizer data from extension storage.");
    }

    try {
      const response = await fetch(
        DATA_BASE_URL + "/" + encoding + ".json"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load tokenizer encoding: " + response.status
        );
      }

      const data = await response.json();
      encodingCache[encoding] = data;

      try {
        const extensionAPI = getExtensionAPI();
        const stored = await extensionAPI.storage.local.get(CACHE_KEY);
        const persistentCache = stored[CACHE_KEY] || {
          version: CACHE_VERSION
        };

        persistentCache[encoding] = data;

        await extensionAPI.storage.local.set({
          [CACHE_KEY]: persistentCache
        });
      } catch (error) {
        console.warn("Unable to cache tokenizer data in extension storage.");
      }

      return data;
    } catch (error) {
      console.error("Failed to load tokenizer encoding.", error);
      throw error;
    }
  }

  function estimateTokenCount(text) {
    if (!text || typeof text !== "string") {
      return 0;
    }

    const pieces =
      text.match(
        /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu
      ) || [];

    let count = 0;
    const encoder = new TextEncoder();

    for (const piece of pieces) {
      const byteLength = encoder.encode(piece).length;
      count += Math.max(1, Math.ceil(byteLength / 4));
    }

    return count + 1;
  }

  function countWithEncoding(text, encodingData) {
    if (!text || typeof text !== "string") {
      return 0;
    }

    const bytes = new TextEncoder().encode(text);
    let tokenCount = 0;
    let offset = 0;

    while (offset < bytes.length) {
      let bestRank = -1;
      let bestLength = 1;
      const maximumLength = Math.min(32, bytes.length - offset);

      for (let length = 1; length <= maximumLength; length++) {
        const byteKey = Array.from(
          bytes.slice(offset, offset + length)
        ).join(",");

        if (
          encodingData.ranks &&
          encodingData.ranks[byteKey] !== undefined &&
          encodingData.ranks[byteKey] > bestRank
        ) {
          bestRank = encodingData.ranks[byteKey];
          bestLength = length;
        }
      }

      tokenCount++;
      offset += bestLength;
    }

    return tokenCount;
  }

  return {
    async init() {
      try {
        await loadEncoding(DEFAULT_ENCODING);
        return true;
      } catch (error) {
        console.error("Failed to initialize token counter.", error);
        return false;
      }
    },

    async count(text, encoding = DEFAULT_ENCODING) {
      try {
        const encodingData = await loadEncoding(encoding);
        return countWithEncoding(text, encodingData);
      } catch (error) {
        console.warn("Using approximate token count.");
        return estimateTokenCount(text);
      }
    },

    countSync(text) {
      const encodingData = encodingCache[DEFAULT_ENCODING];

      if (encodingData) {
        return countWithEncoding(text, encodingData);
      }

      return estimateTokenCount(text);
    },

    async countWithLimit(text, limit = 4096) {
      const count = await this.count(text);
      const rawPercentage = (count / limit) * 100;

      return {
        count: count,
        limit: limit,
        percentage: Math.min(
          Math.round(rawPercentage * 10) / 10,
          100
        ),
        isOverLimit: count > limit,
        remaining: Math.max(0, limit - count)
      };
    },

    format(count, limit = null) {
      if (limit) {
        const percentage = Math.round((count / limit) * 100);

        return (
          count.toLocaleString() +
          " / " +
          limit.toLocaleString() +
          " tokens (" +
          percentage +
          "%)"
        );
      }

      return count.toLocaleString() + " tokens";
    },

    getStatus() {
      const cachedEncodings = Object.keys(encodingCache);

      return {
        isReady: cachedEncodings.length > 0,
        cachedEncodings: cachedEncodings,
        defaultEncoding: DEFAULT_ENCODING
      };
    },

    async clearCache() {
      encodingCache = {};

      try {
        const extensionAPI = getExtensionAPI();
        await extensionAPI.storage.local.remove(CACHE_KEY);
      } catch (error) {
        console.warn("Unable to clear tokenizer cache.");
      }
    },

    ENCODINGS: ENCODINGS
  };
})();

if (typeof module !== "undefined" && module.exports) {
  module.exports = TokenCounter;
}
