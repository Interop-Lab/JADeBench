const { FAILSAFE_SCHEMA, load } = require("js-yaml");

const DEFAULT_DIRECTIVES = [
  "headingDivider",
  "style",
  "theme",
  "lang",
  "backgroundColor",
  "backgroundImage",
  "backgroundPosition",
  "backgroundRepeat",
  "backgroundSize",
  "class",
  "color",
  "footer",
  "header",
  "paginate",
];

const YAML_SPECIAL_CHARACTERS = `["'{|>~&*`;
const REGEXP_SPECIAL_CHARACTERS = /[.*+?^=!:${}()|[\]\\/]/g;

function createDirectivePatterns(directives) {
  const patterns = new Set();

  for (const directive of directives) {
    const pattern = `_?${directive.replace(REGEXP_SPECIAL_CHARACTERS, "\\$&")}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }

  return [...patterns.values()];
}

function quoteLooseDirectiveValues(source, directives) {
  const directivePattern = `(?:${createDirectivePatterns(directives).join("|")})`;
  const directiveLine = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = "";

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(directiveLine, (match, key, value) => {
      const trimmedValue = value.trim();
      if (
        trimmedValue.length === 0 ||
        YAML_SPECIAL_CHARACTERS.includes(trimmedValue[0])
      ) {
        return match;
      }

      const indentationLength = value.length - value.trimLeft().length;
      const indentation = value.substring(0, indentationLength);
      const escapedValue = trimmedValue.split('"').join('\\"');
      return `${key}${indentation}"${escapedValue}"`;
    });
    converted += "\n";
  }

  return converted.trim();
}

function parse(source) {
  try {
    const value = load(source, { schema: FAILSAFE_SCHEMA });
    if (value === null || typeof value !== "object") return false;
    return value;
  } catch {
    return false;
  }
}

function yaml(source, loose = false) {
  const input = loose
    ? quoteLooseDirectiveValues(source, [
        ...DEFAULT_DIRECTIVES,
        ...(Array.isArray(loose) ? loose : []),
      ])
    : source;

  return parse(input);
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => yaml,
});
Object.defineProperty(exports, "yaml", {
  enumerable: true,
  get: () => yaml,
});
