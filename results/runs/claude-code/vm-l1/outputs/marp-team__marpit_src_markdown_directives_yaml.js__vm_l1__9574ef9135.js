const jsYaml = require("js-yaml");

const globals = Object.assign(Object.create(null), {
  headingDivider(value) {
    if (value === false || value === "false") return { headingDivider: false };

    const headings = (Array.isArray(value) ? value : [value])
      .map((heading) => Number.parseInt(heading, 10))
      .filter(
        (heading, index, values) =>
          heading >= 1 && heading <= 6 && !values.includes(heading, index + 1),
      );

    return { headingDivider: headings };
  },

  style(value) {
    return { style: value };
  },

  theme(value, marpit) {
    return marpit.themeSet.has(value) ? { theme: value } : {};
  },

  lang(value) {
    return { lang: value };
  },
});

const locals = Object.assign(Object.create(null), {
  backgroundColor: (value) => ({ backgroundColor: value }),
  backgroundImage: (value) => ({ backgroundImage: value }),
  backgroundPosition: (value) => ({ backgroundPosition: value }),
  backgroundRepeat: (value) => ({ backgroundRepeat: value }),
  backgroundSize: (value) => ({ backgroundSize: value }),

  class(value) {
    return { class: Array.isArray(value) ? value.join(" ") : value };
  },

  color: (value) => ({ color: value }),

  footer(value) {
    return typeof value === "string" ? { footer: value } : {};
  },

  header(value) {
    return typeof value === "string" ? { header: value } : {};
  },

  paginate(value) {
    const normalized = String(value || "").toLowerCase();
    return {
      paginate: ["hold", "skip"].includes(normalized)
        ? normalized
        : normalized === "true",
    };
  },
});

const defaultDirectives = [...Object.keys(globals), ...Object.keys(locals)];
const yamlSpecialChars = "[\"'{|>~&*";

function createPatterns(directives) {
  const patterns = new Set();

  for (const directive of directives) {
    const pattern = `_?${directive.replace(/[.*+?^=!:${}()|[\]\\/]/g, "\\$&")}`;
    patterns.add(pattern);
    patterns.add(`"${pattern}"`);
    patterns.add(`'${pattern}'`);
  }

  return [...patterns.values()];
}

function parse(source) {
  try {
    const parsed = jsYaml.load(source, { schema: jsYaml.FAILSAFE_SCHEMA });
    return parsed && typeof parsed === "object" ? parsed : false;
  } catch {
    return false;
  }
}

function convertLoose(source, directives) {
  const directivePattern = `(?:${createPatterns(directives).join("|")})`;
  const looseYaml = new RegExp(`^(${directivePattern}\\s*:)(.+)$`);

  return source
    .split(/\r?\n/)
    .map((line) =>
      line.replace(looseYaml, (match, key, rawValue) => {
        const value = rawValue.trim();
        if (!value || yamlSpecialChars.includes(value[0])) return match;
        return `${key} "${value}"`;
      }),
    )
    .join("\n");
}

function yaml(source, directives = defaultDirectives) {
  const selectedDirectives = Array.isArray(directives)
    ? directives
    : defaultDirectives;
  return parse(convertLoose(source, selectedDirectives));
}

Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperties(exports, {
  default: { enumerable: true, get: () => yaml },
  yaml: { enumerable: true, get: () => yaml },
});
