import path from "node:path";
import fs from "fs-extra";
import moment from "moment";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
import { glob } from "glob";
import lodash from "lodash";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const normalizeDir = directory =>
  path.normalize(directory).replace(/\\/g, "/");

const getSlug = (filename, baseDirectory) => {
  const relative = baseDirectory
    ? path.relative(baseDirectory, filename)
    : filename;

  return normalizeDir(relative)
    .replace(/\.(?:md|markdown)$/i, "")
    .replace(/(?:^|\/)index$/i, "")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map(part => kebabCase(part))
    .filter(Boolean)
    .join("/");
};

function getLastModified(filename, format, fallback) {
  try {
    const modified = fs.statSync(filename).mtime;
    return format ? moment(modified).format(format) : modified;
  } catch {
    return fallback;
  }
}

function cleanString(value) {
  if (typeof value !== "string") return value;
  return trim(value.replace(/\r\n?/g, "\n"));
}

function cleanObjectStrings(value) {
  if (Array.isArray(value)) {
    return value.map(cleanObjectStrings);
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = cleanObjectStrings(child);
    }
    return result;
  }

  return cleanString(value);
}

function slugToTitle(slug) {
  const lastPart = normalizeDir(String(slug ?? ""))
    .replace(/\/+$/g, "")
    .split("/")
    .pop();

  return startCase(lastPart || "");
}

function getMetaMatch(source) {
  return String(source ?? "").match(META_REGEX_YAML) ||
    String(source ?? "").match(META_REGEX);
}

function stripMeta(source) {
  const text = String(source ?? "");
  const match = getMetaMatch(text);
  return match ? text.slice(match[0].length).replace(/^\s*\n/, "") : text;
}

function processMeta(source) {
  const match = getMetaMatch(source);
  if (!match) return {};

  const raw = trim(match[1]);
  if (!raw) return {};

  try {
    const parsed = yaml.load(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? cleanObjectStrings(parsed)
      : {};
  } catch {
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? cleanObjectStrings(parsed)
        : {};
    } catch {
      return {};
    }
  }
}

function processVars(value, variables = {}) {
  if (Array.isArray(value)) {
    return value.map(item => processVars(item, variables));
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    const result = {};
    for (const [key, child] of Object.entries(value)) {
      result[key] = processVars(child, variables);
    }
    return result;
  }

  if (typeof value !== "string") return value;

  return value
    .replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
      const replacement = lodash.get(variables, key);
      return replacement == null ? match : String(replacement);
    })
    .replace(/\$\{\s*([\w.-]+)\s*\}/g, (match, key) => {
      const replacement = lodash.get(variables, key);
      return replacement == null ? match : String(replacement);
    });
}

function extractDocument(contents, filename, options = {}) {
  const metadata = processMeta(contents);
  const variables = {
    ...(options.vars || options.variables || {}),
    ...metadata
  };
  const content = processVars(stripMeta(contents), variables);
  const baseDirectory =
    options.baseDir || options.baseDirectory || options.cwd;
  const slug = metadata.slug || getSlug(filename || "", baseDirectory);
  const title = metadata.title || slugToTitle(slug);

  return {
    ...metadata,
    title,
    slug,
    content
  };
}

function metaBool(value, fallback = false) {
  if (value == null || value === "") return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  switch (String(value).trim().toLowerCase()) {
    case "true":
    case "yes":
    case "on":
    case "1":
      return true;
    case "false":
    case "no":
    case "off":
    case "0":
      return false;
    default:
      return fallback;
  }
}

async function processMarkdownFile(
  filename,
  baseDirectory,
  options = {},
  destination,
  collection
) {
  const contents = await fs.readFile(filename, "utf8");
  const document = extractDocument(contents, filename, {
    ...options,
    baseDir: baseDirectory || options.baseDir
  });

  if (metaBool(options.lastModified, false)) {
    document.lastModified = getLastModified(
      filename,
      options.dateFormat || options.lastModifiedFormat
    );
  }

  if (collection) collection.push(document);

  if (destination) {
    const outputFile = path.extname(destination)
      ? destination
      : path.join(destination, `${document.slug || "index"}.json`);
    await fs.ensureDir(path.dirname(outputFile));
    await fs.writeJson(outputFile, document, {
      spaces: options.spaces ?? 2
    });
  }

  return document;
}

async function processFile(filename, baseDirectory, options = {}, collection) {
  const extension = path.extname(filename).toLowerCase();

  if (extension === ".md" || extension === ".markdown") {
    return processMarkdownFile(
      filename,
      baseDirectory,
      options,
      undefined,
      collection
    );
  }

  if (extension === ".yaml" || extension === ".yml") {
    const value = yaml.load(await fs.readFile(filename, "utf8"));
    if (collection) collection.push(value);
    return value;
  }

  if (extension === ".json") {
    const value = await fs.readJson(filename);
    if (collection) collection.push(value);
    return value;
  }

  return undefined;
}

async function processDirectory(
  directory,
  pattern = "**/*.{md,markdown}",
  options = {},
  destination,
  collection = []
) {
  const files = await glob(pattern, {
    cwd: directory,
    absolute: true,
    nodir: true,
    dot: Boolean(options.dot),
    ignore: options.ignore
  });

  files.sort();

  for (const filename of files) {
    const document = await processFile(
      filename,
      directory,
      options,
      collection
    );

    if (document && destination && options.separateFiles) {
      const outputFile = path.join(
        destination,
        `${document.slug || "index"}.json`
      );
      await fs.ensureDir(path.dirname(outputFile));
      await fs.writeJson(outputFile, document, {
        spaces: options.spaces ?? 2
      });
    }
  }

  return collection;
}

async function run(input, options = {}) {
  if (Array.isArray(input)) {
    const documents = [];
    for (const filename of input) {
      await processFile(
        filename,
        options.baseDir || process.cwd(),
        options,
        documents
      );
    }
    return documents;
  }

  if (input && typeof input === "object") {
    options = input;
    input =
      options.input ||
      options.src ||
      options.source ||
      options.directory ||
      options.cwd;
  }

  const source = path.resolve(input || ".");
  const stat = await fs.stat(source);
  let result;

  if (stat.isDirectory()) {
    result = await processDirectory(
      source,
      options.pattern || "**/*.{md,markdown}",
      options,
      options.output || options.dest
    );
  } else {
    result = await processFile(
      source,
      options.baseDir || path.dirname(source),
      options
    );
  }

  const output = options.output || options.dest;
  if (output && !options.separateFiles) {
    const outputFile = path.extname(output)
      ? output
      : path.join(output, "contents.json");

    await fs.ensureDir(path.dirname(outputFile));

    if (/\.ya?ml$/i.test(outputFile)) {
      await fs.writeFile(outputFile, yaml.dump(result), "utf8");
    } else {
      await fs.writeJson(outputFile, result, {
        spaces: options.spaces ?? 2
      });
    }
  }

  return result;
}

function handler(input, callback) {
  const options =
    input && typeof input === "object" && !Array.isArray(input)
      ? input
      : {};
  const promise = run(input, options);

  if (typeof callback === "function") {
    promise.then(
      result => callback(null, result),
      error => callback(error)
    );
  }

  return promise;
}

export default handler;
