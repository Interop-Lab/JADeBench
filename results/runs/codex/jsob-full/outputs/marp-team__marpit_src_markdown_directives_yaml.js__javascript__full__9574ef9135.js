const { FAILSAFE_SCHEMA, load } = require("js-yaml");

const headingLevels = [1, 2, 3, 4, 5, 6];

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const normalize = (item) =>
      Array.isArray(item) || Number.isNaN(item) ? item : Number.parseInt(item, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const levels = normalized.map(normalize);
      return { headingDivider: headingLevels.filter((level) => levels.includes(level)) };
    }
    if (value === "false") return { headingDivider: false };
    if (headingLevels.includes(normalized)) return { headingDivider: normalized };
    return {};
  },
  style: (value) => ({ style: value }),
  theme: (value, context) =>
    context.themeSet.has(value) ? { theme: value } : {},
  lang: (value) => ({ lang: value }),
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({
    class: Array.isArray(value) ? value.join(" ") : value,
  }),
  color: (value) => ({ color: value }),
  footer: (value) => (typeof value === "string" ? { footer: value } : {}),
  header: (value) => (typeof value === "string" ? { header: value } : {}),
  paginate(value) {
    const normalized = (value || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) return { paginate: normalized };
    return { paginate: normalized === "true" };
  },
});

const defaultDirectives = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

function createPatterns(directives) {
  const patterns = new Set();
  for (const directive of directives) {
    const pattern = `_?${directive.replace(
      /[.*+?^=!:${}()|[\]\\/]/g,
      "\\$&",
    )}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }
  return [...patterns.values()];
}

const yamlSpecialChars = `["'{|>~&*`;

function parse(source) {
  try {
    const result = load(source, { schema: FAILSAFE_SCHEMA });
    if (result === null || typeof result !== "object") return false;
    return result;
  } catch {
    return false;
  }
}

function convertLoose(source, directives) {
  const directivePattern = `(?:${createPatterns(directives).join("|")})`;
  const linePattern = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = "";

  for (const line of source.split(/\r?\n/)) {
    converted +=
      line.replace(linePattern, (match, prefix, rawValue) => {
        const value = rawValue.trim();
        if (value.length === 0 || yamlSpecialChars.includes(value[0])) return match;

        const indentationLength = rawValue.length - rawValue.trimLeft().length;
        const indentation = rawValue.substring(0, indentationLength);
        return `${prefix}${indentation}"${value.split('"').join('\\"')}"`;
      }) + "\n";
  }

  return converted.trim();
}

const yaml = (source, loose = false) =>
  parse(
    loose
      ? convertLoose(source, [
          ...defaultDirectives,
          ...(Array.isArray(loose) ? loose : []),
        ])
      : source,
  );

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "default", {
  enumerable: true,
  get: () => yaml,
});
Object.defineProperty(exports, "yaml", {
  enumerable: true,
  get: () => yaml,
});
