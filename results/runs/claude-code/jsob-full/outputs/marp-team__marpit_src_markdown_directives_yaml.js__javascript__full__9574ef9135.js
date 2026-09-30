const jsYaml = require('js-yaml');

const globalDirectives = [
  'headingDivider',
  'style',
  'theme',
  'lang',
];

const localDirectives = [
  'backgroundColor',
  'backgroundImage',
  'backgroundPosition',
  'backgroundRepeat',
  'backgroundSize',
  'class',
  'color',
  'footer',
  'header',
  'paginate',
];

const directives = [...globalDirectives, ...localDirectives];
const yamlSpecialChars = `["'{|>~&*`;

function createPatterns(names) {
  const patterns = new Set();

  for (const name of names) {
    const escapedName = name.replace(/[.*+?^=!:${}()|[\]\\/]/g, '\\$&');
    const directiveName = `_?${escapedName}`;

    patterns.add(directiveName);
    patterns.add(`"${directiveName}"`);
    patterns.add(`'${directiveName}'`);
  }

  return [...patterns.values()];
}

function parse(source) {
  try {
    const result = jsYaml.load(source, { schema: jsYaml.FAILSAFE_SCHEMA });

    if (result === null || typeof result !== 'object') return false;
    return result;
  } catch {
    return false;
  }
}

function convertLoose(source, directiveNames) {
  const directivePattern = `(?:${createPatterns(directiveNames).join('|')})`;
  const directiveLine = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = '';

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(directiveLine, (match, prefix, rawValue) => {
      const value = rawValue.trim();

      if (value.length === 0 || yamlSpecialChars.includes(value[0])) return match;

      const indentationLength = rawValue.length - rawValue.trim().length;
      const indentation = rawValue.substring(0, indentationLength);
      const escapedValue = value.split('"').join('\\"');

      return `${prefix}${indentation}"${escapedValue}"`;
    }) + '\n';
  }

  return converted.trim();
}

function yaml(source, loose = false) {
  const input = loose
    ? convertLoose(source, [
        ...directives,
        ...(Array.isArray(loose) ? loose : []),
      ])
    : source;

  return parse(input);
}

Object.defineProperty(module.exports, '__esModule', { value: true });
Object.defineProperties(module.exports, {
  default: { enumerable: true, get: () => yaml },
  yaml: { enumerable: true, get: () => yaml },
});
