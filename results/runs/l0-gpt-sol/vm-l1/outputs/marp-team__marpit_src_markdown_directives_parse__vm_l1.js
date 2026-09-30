const yaml = require('js-yaml');

function parse(source) {
  if (typeof source !== 'string') {
    throw new TypeError('Expected a string');
  }

  const match = source.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/);

  if (!match) {
    return {
      attributes: {},
      body: source
    };
  }

  const attributes = yaml.load(match[1]) || {};

  return {
    attributes:
      attributes && typeof attributes === 'object' && !Array.isArray(attributes)
        ? attributes
        : {},
    body: source.slice(match[0].length)
  };
}

module.exports = { parse };
