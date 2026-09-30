"use strict";

const jsYaml = require("js-yaml");

const globalDirectives = {
  headingDivider(value) {
    const dividers = (Array.isArray(value) ? value : [value])
      .map((divider) => Number.parseInt(divider, 10))
      .filter((divider) => divider >= 1 && divider <= 6);

    if (dividers.length === 0) return {};
    return { headingDivider: dividers.length === 1 ? dividers[0] : dividers };
  },
  style: (value) => ({ style: value }),
  theme(value, { themeSet }) {
    const theme = String(value);
    return themeSet.has(theme) ? { theme } : {};
  },
  lang: (value) => ({ lang: value }),
};

const localDirectives = {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: value }),
  color: (value) => ({ color: value }),
  footer: (value) => ({ footer: value }),
  header: (value) => ({ header: value }),
  paginate: (value) => ({
    paginate: typeof value === "string" && value.toLowerCase() === "true",
  }),
};

const directiveNames = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

/** Return the accepted plain, double-quoted, and single-quoted key forms. */
function createPatterns(directives) {
  return directives.flatMap((directive) => [
    `_?${directive}`,
    `"_?${directive}"`,
    `'_?${directive}'`,
  ]);
}

// Values beginning with one of these characters already have explicit YAML
// syntax and must not be wrapped in quotes.
const yamlSpecialChars = "[\"'{|>~&*";

/**
 * Quote loose scalar directive values while preserving the original layout.
 * This keeps values such as `true`, `2`, and `null` as directive strings.
 */
function convertLoose(source, directives) {
  const keys = createPatterns(directives).join("|");
  const directiveLine = new RegExp(`^(\\s*(?:${keys})\\s*:\\s*)(.*)$`);

  return source
    .split("\n")
    .map((line) => {
      const match = directiveLine.exec(line);
      if (!match) return line;

      const value = match[2];
      if (!value || yamlSpecialChars.includes(value[0])) return line;
      return `${match[1]}${JSON.stringify(value)}`;
    })
    .join("\n");
}

/** Parse YAML with scalar type inference disabled. */
function parse(source) {
  try {
    const value = jsYaml.load(source, { schema: jsYaml.FAILSAFE_SCHEMA });
    return value && typeof value === "object" ? value : false;
  } catch {
    return false;
  }
}

function yaml(source) {
  return parse(source);
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", { enumerable: true, get: () => yaml });
Object.defineProperty(exports, "yaml", { enumerable: true, get: () => yaml });
