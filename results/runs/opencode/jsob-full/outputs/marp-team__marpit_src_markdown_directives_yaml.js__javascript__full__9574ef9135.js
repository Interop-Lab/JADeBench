"use strict";

// CommonJS helpers emitted by the original bundler.
const yamlExports = {};
Object.defineProperty(yamlExports, "__esModule", { value: true });
Object.defineProperty(yamlExports, "default", {
  enumerable: true,
  get: () => yamlDefault,
});
Object.defineProperty(yamlExports, "yaml", {
  enumerable: true,
  get: () => yaml,
});
module.exports = yamlExports;

const jsYaml = require("js-yaml");

const headingLevels = [1, 2, 3, 4, 5, 6];

const globals = Object.freeze(Object.assign(Object.create(null), {
  headingDivider(value) {
    const normalize = item =>
      Array.isArray(item) || Number.isInteger(item)
        ? item
        : Number.parseInt(item, 10);

    const normalized = normalize(value);
    if (Array.isArray(normalized)) {
      const selected = normalized.map(normalize);
      return {
        headingDivider: headingLevels.filter(level => selected.includes(level)),
      };
    }
    if (value === "false")
      return { headingDivider: false };
    if (headingLevels.includes(normalized))
      return { headingDivider: normalized };
    return {};
  },

  style: value => ({ style: value }),

  theme: (value, options) =>
    options.theme.includes(value) ? { theme: value } : {},

  lang: value => ({ lang: value }),
}));

const locals = Object.freeze(Object.assign(Object.create(null), {
  backgroundColor: value => ({ backgroundColor: value }),
  backgroundImage: value => ({ backgroundImage: value }),
  backgroundPosition: value => ({ backgroundPosition: value }),
  backgroundRepeat: value => ({ backgroundRepeat: value }),
  backgroundSize: value => ({ backgroundSize: value }),
  class: value => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: value => ({ color: value }),
  footer: value => typeof value === "string" ? { footer: value } : {},
  header: value => typeof value === "string" ? { header: value } : {},
  paginate(value) {
    const normalized = (value || "").toString().toLowerCase();
    if (["true", "false"].includes(normalized))
      return { paginate: normalized === "true" };
    return { paginate: false };
  },
}));

const directives = [...Object.keys(globals), ...Object.keys(locals)];

function createPatterns(names) {
  const patterns = new Set();
  for (const name of names) {
    const escaped = name.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&");
    const pattern = `_?${escaped}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }
  return [...patterns.values()];
}

const yamlSpecialChars = `["'{|>~&*`;

function parse(source) {
  try {
    const result = jsYaml.load(source, { schema: jsYaml.FAILSAFE_SCHEMA });
    if (result === null || typeof result !== "object")
      return false;
    return result;
  } catch {
    return false;
  }
}

function convertLoose(source, names) {
  const pattern = `(?:${createPatterns(names).join("|")})`;
  const directive = new RegExp(`^(${pattern}\\s*:\\s*)(.*)$`);
  let converted = "";

  for (const line of source.split(/\r?\n/)) {
    converted += line.replace(directive, (match, prefix, rawValue) => {
      const value = rawValue.trim();
      if (value.length === 0 || yamlSpecialChars.includes(value[0]))
        return match;

      const leadingWhitespace = rawValue.length - rawValue.trimStart().length;
      const indentation = rawValue.substring(0, leadingWhitespace);
      return `${prefix}${indentation}"${value
        .replaceAll('"', '\\"')}"`;
    }) + "\n";
  }

  return converted.trim();
}

function yaml(source, loose = false) {
  return parse(
    loose
      ? convertLoose(source, [
          ...directives,
          ...(Array.isArray(loose) ? loose : []),
        ])
      : source,
  );
}

const yamlDefault = yaml;
