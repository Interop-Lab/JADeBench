import path from "node:path";
import fs from "fs-extra";
import moment from "moment";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
import unescape from "lodash/unescape.js";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(directory) {
  return path.normalize(directory).replaceAll("\\", "/");
}

function getSlug(filePath, baseDir = process.cwd()) {
  const relativePath = normalizeDir(path.relative(baseDir, filePath));
  const extension = path.extname(relativePath);
  let slug = extension
    ? relativePath.slice(0, -extension.length)
    : relativePath;

  slug = slug.replace(/^\.?\//, "").replace(/\/index$/i, "");
  return slug;
}

function getLastModified(filePath, format = "YYYY-MM-DD", locale) {
  const modified = fs.statSync(filePath).mtime;

  if (locale) {
    return moment(modified).locale(locale).format(format);
  }

  return moment(modified).format(format);
}

function cleanString(value) {
  return trim(
    sanitizeHtml(String(value), {
      allowedTags: [],
      allowedAttributes: {}
    })
  );
}

function cleanObjectStrings(value) {
  if (typeof value === "string") {
    return cleanString(value);
  }

  if (Array.isArray(value)) {
    return value.map(cleanObjectStrings);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        snakeCase(key),
        cleanObjectStrings(item)
      ])
    );
  }

  return value;
}

function slugToTitle(slug) {
  const segment = normalizeDir(String(slug)).split("/").filter(Boolean).pop() || "";
  return startCase(kebabCase(segment));
}

function stripMeta(content) {
  return String(content)
    .replace(META_REGEX, "")
    .replace(META_REGEX_YAML, "")
    .trimStart();
}

function processMeta(content) {
  const source = String(content);
  const match = source.match(META_REGEX_YAML) || source.match(META_REGEX);

  if (!match) {
    return {};
  }

  const parsed = yaml.load(match[1]);
  return cleanObjectStrings(parsed && typeof parsed === "object" ? parsed : {});
}

function getVariable(variables, key) {
  return key.split(".").reduce(
    (value, part) => value == null ? undefined : value[part],
    variables
  );
}

function processVars(content, variables = {}) {
  return String(content).replace(
    /\{\{\s*([\w.-]+)\s*\}\}/g,
    (match, key) => {
      const value = getVariable(variables, key);
      return value == null ? match : String(value);
    }
  );
}

function extractDocument(filePath, baseDir = process.cwd(), variables = {}) {
  if (baseDir && typeof baseDir === "object") {
    variables = baseDir.vars ?? baseDir.variables ?? {};
    baseDir = baseDir.baseDir ?? baseDir.rootDir ?? process.cwd();
  }

  const source = fs.readFileSync(filePath, "utf8");
  const meta = processMeta(source);
  const slug = meta.slug || getSlug(filePath, baseDir);
  const content = processVars(stripMeta(source), {
    ...variables,
    ...meta,
    slug
  });

  return {
    ...meta,
    slug,
    title: meta.title || slugToTitle(slug),
    content,
    lastModified:
      meta.lastModified ??
      getLastModified(filePath)
  };
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "input",
  "iframe"
]);

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: [
    "src",
    "srcset",
    "alt",
    "title",
    "width",
    "height",
    "loading"
  ],
  input: ["checked", "type", "disabled"],
  h1: ["id"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  h5: ["id"],
  h6: ["id"],
  span: ["class"],
  code: ["class"],
  pre: ["class"]
};

function sanitizeHtmlOutput(markdown) {
  const html = marked.parse(unescape(String(markdown)));

  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes
  });
}

async function handler(input, options = {}) {
  let document;

  if (typeof input === "string") {
    const filePath = path.resolve(options.cwd || process.cwd(), input);
    document = extractDocument(
      filePath,
      options.baseDir || options.rootDir || path.dirname(filePath),
      options.vars || options.variables || {}
    );
  } else if (input && typeof input === "object") {
    document = { ...input };

    if (document.path && document.content == null) {
      const filePath = path.resolve(options.cwd || process.cwd(), document.path);
      document = {
        ...extractDocument(
          filePath,
          options.baseDir || options.rootDir || path.dirname(filePath),
          options.vars || options.variables || {}
        ),
        ...document
      };
    } else {
      document.content = processVars(
        stripMeta(document.content || ""),
        {
          ...(options.vars || options.variables || {}),
          ...document
        }
      );
      document.slug ||= document.path
        ? getSlug(
            document.path,
            options.baseDir || options.rootDir || process.cwd()
          )
        : "";
      document.title ||= slugToTitle(document.slug);
    }
  } else {
    throw new TypeError("Expected a file path or document object");
  }

  return {
    ...document,
    content: sanitizeHtmlOutput(document.content)
  };
}

export { handler as default };
