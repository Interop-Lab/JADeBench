import path from "node:path";
import fs from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";

/** A leading block-comment metadata header. */
const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;

/** A leading YAML front-matter header. */
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

/**
 * Turn arbitrary text into the normalized slug used for content IDs.
 */
function cleanString(value) {
  return kebabCase(value);
}

/**
 * Copy an object's own entries and normalize every value to a trimmed string.
 * Non-objects intentionally produce an empty object; arrays are treated as
 * objects with numeric keys.
 */
function cleanObjectStrings(value) {
  return Object.keys(Object(value ?? {})).reduce((result, key) => {
    result[key] = trim(String(value[key]));
    return result;
  }, {});
}

/** Convert a file/URL-style slug to a display title. */
function slugToTitle(slug) {
  return startCase(slug);
}

function matchMetadata(source) {
  return META_REGEX.exec(source) || META_REGEX_YAML.exec(source);
}

/** Remove front matter and surrounding whitespace from content. */
function stripMeta(source) {
  return trim(String(source).replace(META_REGEX, "").replace(META_REGEX_YAML, ""));
}

/**
 * Parse either comment-style metadata or YAML front matter. Values are
 * returned as strings, matching the rest of the content-processing API.
 */
function processMeta(source) {
  const match = matchMetadata(String(source));
  if (!match) return {};

  let metadata;
  try {
    metadata = yaml.load(match[1]);
  } catch {
    return {};
  }
  return cleanObjectStrings(metadata);
}

/**
 * Expand configured URL variables in a string. This processor deliberately
 * leaves values alone when the corresponding setting is absent.
 */
function processVars(value, config) {
  if (typeof value !== "string") return value;

  const variables = config.variables;
  let result = value;
  if (Array.isArray(variables)) {
    for (const variable of variables) {
      if (typeof variable === "function") result = variable(result);
    }
  }

  if (config.base_url) result = result.replace(/\{\{\s*base_url\s*\}\}/gi, config.base_url);
  if (config.image_url) result = result.replace(/\{\{\s*image_url\s*\}\}/gi, config.image_url);
  return result;
}

/**
 * Read a content file and build the small document record consumed by the
 * caller. The first argument is retained for API compatibility.
 */
async function extractDocument(_sourceRoot, filePath, config = {}) {
  if (!filePath) return undefined;

  try {
    const body = await fs.readFile(filePath, "utf8");
    const metadata = processMeta(body);
    const id = filePath;
    const title = metadata.title || slugToTitle(path.basename(filePath, ".md"));

    return {
      id,
      title: processVars(title, config),
      body: processVars(body, config),
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

const contentProcessors = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

export default contentProcessors;
