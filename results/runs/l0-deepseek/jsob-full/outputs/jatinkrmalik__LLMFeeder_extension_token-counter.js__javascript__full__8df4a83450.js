const ENCODINGS = {
  CL100K_BASE: "cl100k_base",
  O200K_BASE: "o200k_base",
  P50K_BASE: "p50k_base",
  P50K_EDIT: "p50k_edit",
  R50K_BASE: "r50k_base"
};

const DEFAULT_ENCODING = ENCODINGS.CL100K_BASE;
const STORAGE_KEY = "tokenCounterCache";
const STORAGE_VERSION = "1";

let cache = {};
let storageArea = null;

const BASE_URL = "https://tiktoken.pages.dev/js";

async function fetchEncoding(encoding = DEFAULT_ENCODING) {
  if (cache[encoding]) return cache[encoding];

  try {
    const area = typeof browser !== "undefined" ? browser.storage : chrome.storage;
    const stored = await area.local.get(STORAGE_KEY);
    if (stored[STORAGE_KEY] && stored[STORAGE_KEY].version === STORAGE_VERSION && stored[STORAGE_KEY][encoding]) {
      cache[encoding] = stored[STORAGE_KEY][encoding];
      return cache[encoding];
    }
  } catch (error) {
    console.error("Failed to read from browser storage", error);
  }

  try {
    const response = await fetch(`${BASE_URL}/${encoding}.js`);
    if (!response.ok) {
      throw new Error(`Failed to fetch encoding: ${response.status}`);
    }
    const script = await response.text();
    cache[encoding] = script;

    try {
      const area = typeof browser !== "undefined" ? browser.storage : chrome.storage;
      const stored = await area.local.get(STORAGE_KEY);
      const data = stored[STORAGE_KEY] || { version: STORAGE_VERSION };
      data[encoding] = script;
      await area.local.set({ [STORAGE_KEY]: data });
    } catch (error) {
      console.error("Failed to write to browser storage", error);
    }

    return script;
  } catch (error) {
    console.error("Failed to fetch encoding", error);
    throw error;
  }
}

function countTokens(text, encodings) {
  if (!text || typeof text !== "string") return 0;

  const pattern = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
  const matches = text.match(pattern) || [];
  let count = 0;

  for (const match of matches) {
    const bytes = new TextEncoder().encode(match).length;
    count += Math.max(1, Math.ceil(bytes / 4));
  }

  return count + 1;
}

function countTokensWithRank(text, ranks) {
  if (!text || typeof text !== "string") return 0;

  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  let count = 0;
  let position = 0;

  while (position < bytes.length) {
    let bestRank = -1;
    let bestLength = 0;

    for (let length = 1; length <= Math.min(4, bytes.length - position); length++) {
      const slice = Array.from(bytes.slice(position, position + length)).join(",");
      if (ranks[slice] !== undefined && ranks[slice] > bestRank) {
        bestRank = ranks[slice];
        bestLength = length;
      }
    }

    count++;
    position += bestLength;
  }

  return count;
}

const TokenCounter = {
  async init() {
    try {
      await fetchEncoding(DEFAULT_ENCODING);
      return true;
    } catch (error) {
      console.error("Failed to initialize TokenCounter", error);
      return false;
    }
  },

  async count(text, encoding = DEFAULT_ENCODING) {
    try {
      const ranks = await fetchEncoding(encoding);
      return countTokensWithRank(text, ranks);
    } catch (error) {
      console.error("Failed to count tokens", error);
      return countTokens(text, {});
    }
  },

  countSync(text) {
    const ranks = cache[DEFAULT_ENCODING];
    if (ranks) {
      return countTokensWithRank(text, ranks);
    }
    return countTokens(text, {});
  },

  async countWithLimit(text, limit = 1000) {
    const count = await this.count(text);
    const percentage = Math.min((count / limit) * 100, 100);
    return {
      count,
      limit,
      percentage: Math.round(percentage),
      isOverLimit: count > limit,
      remaining: Math.max(0, limit - count)
    };
  },

  format(count, limit = null) {
    if (limit) {
      const percentage = Math.round((count / limit) * 100);
      return `${count.toLocaleString()} / ${limit.toLocaleString()} (${percentage}%)`;
    }
    return count.toLocaleString();
  },

  getStatus() {
    const cachedEncodings = Object.keys(cache);
    return {
      isReady: cachedEncodings.length > 0,
      cachedEncodings,
      defaultEncoding: DEFAULT_ENCODING
    };
  },

  async clearCache() {
    cache = {};
    try {
      const area = typeof browser !== "undefined" ? browser.storage : chrome.storage;
      await area.local.remove(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear browser storage", error);
    }
  },

  ENCODINGS
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = TokenCounter;
}
