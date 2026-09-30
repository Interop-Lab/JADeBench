const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __export = (target, exports) => {
  for (const name in exports) {
    __defProp(target, name, {
      get: exports[name],
      enumerable: true,
    });
  }
};

const __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (const name of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, name) && name !== except) {
        __defProp(target, name, {
          get: () => source[name],
          enumerable:
            !(descriptor = __getOwnPropDesc(source, name)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

const __toCommonJS = (moduleExports) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), moduleExports);

const yamlExports = {};
__export(yamlExports, {
  default: () => yaml,
  yaml: () => yaml,
});
module.exports = __toCommonJS(yamlExports);

const globalDirectives = Object.assign(Object.create(null), {
  headingDivider(value) {
    const validDividers = [1, 2, 3, 4, 5, 6];
    const normalize = (item) =>
      Array.isArray(item) || Number.isNaN(item)
        ? item
        : Number.parseInt(item, 10);
    const normalized = normalize(value);

    if (Array.isArray(normalized)) {
      const requestedDividers = normalized.map(normalize);
      return {
        headingDivider: validDividers.filter((divider) =>
          requestedDividers.includes(divider),
        ),
      };
    }
    if (value === "false") {
      return { headingDivider: false };
    }
    if (validDividers.includes(normalized)) {
      return { headingDivider: normalized };
    }
    return {};
  },

  style(value) {
    return { style: value };
  },

  theme(value, context) {
    return context.themeSet.has(value) ? { theme: value } : {};
  },

  lang(value) {
    return { lang: value };
  },
});

const localDirectives = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),
  class: (value) => ({ class: Array.isArray(value) ? value.join(" ") : value }),
  color: (value) => ({ color: value }),
  footer: (value) => (typeof value === "string" ? { footer: value } : {}),
  header: (value) => (typeof value === "string" ? { header: value } : {}),
  paginate(value) {
    const normalized = (value || "").toLowerCase();
    if (["hold", "skip"].includes(normalized)) {
      return { paginate: normalized };
    }
    return { paginate: normalized === "true" };
  },
});

const defaultDirectives = [
  ...Object.keys(globalDirectives),
  ...Object.keys(localDirectives),
];

const jsYaml = require("js-yaml");
const yamlSpecialChars = "[\"'{|>~&*";

function createPatterns(directives) {
  const patterns = new Set();
  const specialPatternCharacters = /[.*+?^=!:${}()|[\]\\/]/g;

  for (const directive of directives) {
    const pattern = `_?${directive.replace(specialPatternCharacters, "\\$&")}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }

  return [...patterns.values()];
}

function parse(document) {
  try {
    const result = jsYaml.load(document, { schema: jsYaml.FAILSAFE_SCHEMA });
    if (result === null || typeof result !== "object") {
      return false;
    }
    return result;
  } catch {
    return false;
  }
}

function convertLoose(document, directives) {
  const directivePattern = `(?:${createPatterns(directives).join("|")})`;
  const directiveLine = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);
  let converted = "";

  for (const line of document.split(/\r?\n/)) {
    converted += `${line.replace(directiveLine, (match, prefix, value) => {
      const trimmedValue = value.trim();
      if (
        trimmedValue.length === 0 ||
        yamlSpecialChars.includes(trimmedValue[0])
      ) {
        return match;
      }

      const indentation = value.length - value.trimLeft().length;
      const leadingWhitespace = value.substring(0, indentation);
      const escapedValue = trimmedValue.split('"').join('\\"');
      return `${prefix}${leadingWhitespace}"${escapedValue}"`;
    })}\n`;
  }

  return converted.trim();
}

const yaml = (document, loose = false) => {
  const input = loose
    ? convertLoose(document, [
        ...defaultDirectives,
        ...(Array.isArray(loose) ? loose : []),
      ])
    : document;
  return parse(input);
};
