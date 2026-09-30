'use strict';

const { FAILSAFE_SCHEMA, load } = require('js-yaml');

const directiveNames = [
  'headingDivider',
  'style',
  'theme',
  'lang',
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

function createPatterns(directives) {
  return directives.flatMap((directive) => [
    `_?${directive}`,
    `"_?${directive}"`,
    `'_?${directive}'`,
  ]);
}

function convertLoose(source, directives) {
  const keys = createPatterns(directives).join('|');
  const pattern = new RegExp(`^((?:${keys})\\s*:)([ \\t]*)(.*)$`);
  const yamlSpecialChars = '["\'{|>~&*';

  return source
    .split(/\r?\n/)
    .map((line) =>
      line.replace(pattern, (match, prefix, spacing, value) => {
        if (!value || yamlSpecialChars.includes(value[0])) return match;
        return `${prefix}${spacing}"${value.replace(/"/g, '\\"')}"`;
      }),
    )
    .join('\n')
    .trim();
}

function parse(source) {
  try {
    const parsed = load(source, { schema: FAILSAFE_SCHEMA });
    return typeof parsed === 'object' && parsed !== null ? parsed : false;
  } catch {
    return false;
  }
}

function yaml(source, loose) {
  if (!loose) return parse(source);

  const customDirectives = Array.isArray(loose) ? loose : [];
  return parse(convertLoose(source, [...directiveNames, ...customDirectives]));
}

Object.defineProperty(exports, '__esModule', { value: true });
Object.defineProperties(exports, {
  default: { enumerable: true, get: () => yaml },
  yaml: { enumerable: true, get: () => yaml },
});
