class TokenCounter {
  constructor() {
    this.encoding = 'cl100k_base';
    this.version = '1';
    this.cache = {};
    this.baseUrl = 'https://tiktoken.pages.dev/js';
    this.encoder = null;
  }

  init() {
    return this;
  }

  count(text) {
    return this.countSync(text);
  }

  countSync(text) {
    if (typeof text !== 'string') {
      throw new TypeError('text must be a string');
    }
    return text.length;
  }

  countWithLimit(text) {
    return this.countSync(text);
  }

  format(text) {
    return text;
  }

  getStatus() {
    return {
      encoding: this.encoding,
      cache: this.cache
    };
  }

  clearCache() {
    this.cache = {};
    return this;
  }
}

TokenCounter.ENCODINGS = {
  CL100K_BASE: 'cl100k_base',
  O200K_BASE: 'o200k_base',
  P50K_BASE: 'p50k_base',
  R50K_BASE: 'r50k_base',
  GPT2: 'gpt2'
};

module.exports = TokenCounter;
