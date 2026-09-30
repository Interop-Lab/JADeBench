'use strict';

const yamlParser = require('js-yaml');

function parse(source) {
  try {
    const documents = [];
    yamlParser.loadAll(
      source,
      document => documents.push(document),
      { schema: yamlParser.FAILSAFE_SCHEMA },
    );

    if (documents.length !== 1) return false;

    const document = documents[0];
    if (document === null || document === undefined || typeof document !== 'object') {
      return false;
    }

    return document;
  } catch {
    return false;
  }
}

function convertLoose(source, loose) {
  if (!loose) return source;

  const lines = source.split('\n');
  for (let index = 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (!/^ +\S/.test(line) || line.trimStart().startsWith('#')) continue;

    const previous = lines[index - 1];
    const previousIndent = previous.match(/^ */)[0].length;
    const currentIndent = line.match(/^ */)[0].length;
    if (currentIndent <= previousIndent && previous.includes(':') && !/^\s*[^#]+:\s*/.test(line)) {
      lines[index] = `${' '.repeat(previousIndent + 1)}${line.trimStart()}`;
    }
  }

  return lines.join('\n');
}

function yaml(source, loose = false) {
  if (typeof source !== 'string') return false;
  return parse(convertLoose(source, loose));
}

module.exports = {
  default: yaml,
  yaml,
};
