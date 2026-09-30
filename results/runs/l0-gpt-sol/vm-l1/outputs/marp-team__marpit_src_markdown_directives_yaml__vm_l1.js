const jsYaml = require('js-yaml');

const globals = Object.create(null);
const locals = Object.create(null);

const globalDirectiveNames = [
  'headingDivider',
  'style',
  'theme',
  'lang'
];

const localDirectiveNames = [
  'backgroundColor',
  'backgroundImage',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundSize',
  'class',
  'color',
  'footer',
  'header',
  'paginate'
];

for (const name of globalDirectiveNames) {
  globals[name] = value => value;
}

for (const name of localDirectiveNames) {
  locals[name] = value => value;
}

const directives_default = [
  ...Object.keys(globals),
  ...Object.keys(locals)
];

const yamlSpecialChars = '["\'{|>~&*';

function createPatterns(value) {
  return new RegExp(`^${value}:`);
}

function parse(value) {
  if (value == null || value === '') return value;
  return jsYaml.load(String(value));
}

function convertLoose(value, fallback) {
  if (value == null) return fallback;

  if (typeof value !== 'string') return value;

  const text = value.trim();

  if (text === '') return fallback;
  if (text === 'null' || text === '~') return null;
  if (text === 'true') return true;
  if (text === 'false') return false;

  if (/^[+-]?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(text)) {
    return Number(text);
  }

  try {
    return parse(text);
  } catch {
    return value;
  }
}

function yaml(value, options) {
  if (value == null || value === '') return {};

  const source = String(value);
  const result = parse(source);

  if (result == null) return {};
  if (typeof result !== 'object' || Array.isArray(result)) return result;

  return result;
}

module.exports = {
  default: yaml,
  yaml
};
