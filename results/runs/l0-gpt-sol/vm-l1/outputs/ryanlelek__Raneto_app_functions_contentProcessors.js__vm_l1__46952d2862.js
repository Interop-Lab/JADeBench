import path from "node:path";
import fs from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value) {
  if (typeof value !== "string") return value;

  return trim(
    value
      .replace(/\r\n?/g, "\n")
      .replace(/^\s*\*\s?/gm, "")
  );
}

function cleanObjectStrings(value) {
  if (typeof value === "string") return cleanString(value);

  if (Array.isArray(value)) {
    return value.map(cleanObjectStrings);
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      value[key] = cleanObjectStrings(value[key]);
    }
  }

  return value;
}

function slugToTitle(slug) {
  return startCase(String(slug ?? "").replace(/[-_]+/g, " "));
}

function stripMeta(source) {
  return String(source ?? "")
    .replace(META_REGEX, "")
    .replace(META_REGEX_YAML, "");
}

function processMeta(source) {
  const text = String(source ?? "");
  const match = text.match(META_REGEX_YAML) || text.match(META_REGEX);

  if (!match) return {};

  const metadata = yaml.load(cleanString(match[1]));
  if (metadata == null) return {};

  if (typeof metadata === "object") {
    return cleanObjectStrings(metadata);
  }

  return cleanObjectStrings({ value: metadata });
}

function processVars(source, variables = {}) {
  if (source == null) return source;
  if (!variables || typeof variables !== "object") return String(source);

  return String(source).replace(
    /\{\{\s*([A-Za-z_$][\w$.-]*)\s*\}\}/g,
    (match, name) => {
      const parts = name.split(".");
      let value = variables;

      for (const part of parts) {
        if (value == null || !Object.prototype.hasOwnProperty.call(value, part)) {
          return match;
        }
        value = value[part];
      }

      return value == null ? "" : String(value);
    }
  );
}

function extractDocument(filePath, rootOrVariables, maybeVariables) {
  const source = fs.readFileSync(filePath, "utf8");
  const variables =
    maybeVariables && typeof maybeVariables === "object"
      ? maybeVariables
      : rootOrVariables && typeof rootOrVariables === "object"
        ? rootOrVariables
        : {};

  const metadata = processMeta(source);
  const content = processVars(stripMeta(source), variables);
  const extension = path.extname(filePath);
  const basename = path.basename(filePath, extension);
  const slug = metadata.slug || kebabCase(basename);
  const title = metadata.title || slugToTitle(slug);

  const document = {
    ...metadata,
    content,
    slug,
    title
  };

  if (typeof rootOrVariables === "string") {
    const relativePath = path.relative(rootOrVariables, filePath);
    document.path = relativePath;
    document.id = snakeCase(relativePath.slice(0, -path.extname(relativePath).length));
  }

  return document;
}

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

export { contentProcessors_default as default };
