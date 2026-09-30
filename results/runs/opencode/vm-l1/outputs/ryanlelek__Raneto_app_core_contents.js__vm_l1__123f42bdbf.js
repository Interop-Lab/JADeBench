import path from "node:path";
import fs from "fs-extra";
import moment from "moment";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
import { glob } from "glob";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

/** Normalize separators without resolving relative path segments. */
function normalizeDir(directory) {
  return directory.replaceAll("\\", "/");
}

/** Build a URL-safe slug relative to a configured content directory. */
function getSlug(filename, contentDirectory) {
  const normalizedFile = normalizeDir(filename);
  const normalizedRoot = normalizeDir(contentDirectory);
  return normalizedFile
    .replace(normalizedRoot, "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/\.[^.\/]+$/, "");
}

async function getLastModified(filename, format, fallback) {
  try {
    const stats = await fs.stat(filename);
    const date = moment(stats.mtime);
    return format ? date.format(format) : date.toISOString();
  } catch {
    return fallback;
  }
}

/** Convert free-form text into a stable, lower-case identifier. */
function cleanString(value) {
  return kebabCase(trim(String(value)));
}

function cleanObjectStrings(value) {
  if (Array.isArray(value)) return value.map(cleanObjectStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, cleanObjectStrings(child)]),
    );
  }
  return typeof value === "string" ? cleanString(value) : value;
}

function slugToTitle(slug) {
  return startCase(slug);
}

function frontMatterMatch(document) {
  return document.match(META_REGEX_YAML) || document.match(META_REGEX);
}

function stripMeta(document) {
  const match = frontMatterMatch(document);
  return match ? document.slice(match[0].length).trim() : document;
}

function processMeta(document) {
  const match = frontMatterMatch(document);
  if (!match) return {};
  return yaml.load(match[1]) || {};
}

/** Replace common template-variable forms with values from an object. */
function processVars(document, variables = {}) {
  return document.replace(
    /(?:\{\{\s*([\w.-]+)\s*\}\}|\$\{\s*([\w.-]+)\s*\})/g,
    (source, mustacheName, dollarName) => {
      const name = mustacheName || dollarName;
      const value = name.split(".").reduce((object, key) => object?.[key], variables);
      return value == null ? source : String(value);
    },
  );
}

function metaBool(value, fallback = false) {
  if (value == null) return fallback;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return Boolean(value);
}

async function extractDocument(source, filename, options = {}) {
  const metadata = processMeta(source);
  const content = processVars(stripMeta(source), options.variables);
  const slug = metadata.slug || getSlug(filename, options.contentDirectory || "");

  const document = {
    ...metadata,
    content,
    slug,
    title: metadata.title || slugToTitle(path.basename(slug)),
    source: filename,
  };

  if (!document.date) {
    document.date = await getLastModified(
      filename,
      options.dateFormat,
      options.defaultDate,
    );
  }

  return document;
}

async function processMarkdownFile(filename, contentDirectory, outputDirectory, options, documents) {
  const source = await fs.readFile(filename, "utf8");
  const document = await extractDocument(source, filename, {
    ...options,
    contentDirectory,
  });

  if (metaBool(document.draft, false) && !metaBool(options.includeDrafts, false)) return;

  documents.push(document);

  if (outputDirectory) {
    const outputName = `${document.slug || path.basename(filename, path.extname(filename))}.json`;
    const destination = path.join(outputDirectory, outputName);
    await fs.ensureDir(path.dirname(destination));
    await fs.writeJson(destination, document, { spaces: 2 });
  }
}

async function processFile(filename, contentDirectory, outputDirectory, options = {}, documents = []) {
  const extension = path.extname(filename).toLowerCase();
  if (extension === ".md" || extension === ".markdown") {
    await processMarkdownFile(filename, contentDirectory, outputDirectory, options, documents);
    return documents;
  }

  if (outputDirectory && metaBool(options.copyAssets, true)) {
    const destination = path.join(outputDirectory, path.relative(contentDirectory, filename));
    await fs.ensureDir(path.dirname(destination));
    await fs.copy(filename, destination);
  }
  return documents;
}

async function processDirectory(contentDirectory, outputDirectory, pattern = "**/*", options = {}, documents = []) {
  const filenames = await glob(pattern, {
    cwd: contentDirectory,
    absolute: true,
    nodir: true,
    dot: metaBool(options.dot, false),
    ignore: options.ignore,
  });

  await Promise.all(
    filenames.map((filename) =>
      processFile(filename, contentDirectory, outputDirectory, options, documents),
    ),
  );
  return documents;
}

/**
 * Load configured content directories and return their extracted documents.
 * A string configuration is treated as a directory; object configurations can
 * additionally provide an output directory, glob, and processor options.
 */
async function handler(rootDirectory, configuration = {}) {
  const root = path.resolve(rootDirectory || ".");
  const configuredDirectories = configuration.content_dir
    ?? configuration.contentDir
    ?? configuration.directories
    ?? "content";
  const entries = Array.isArray(configuredDirectories)
    ? configuredDirectories
    : [configuredDirectories];

  const documents = [];
  for (const entry of entries) {
    const settings = typeof entry === "string" ? { name: entry } : entry;
    const directory = path.resolve(root, settings.path || settings.name || "content");
    const output = settings.output || configuration.output_dir || configuration.outputDir;
    const outputDirectory = output ? path.resolve(root, output) : undefined;
    await processDirectory(
      directory,
      outputDirectory,
      settings.glob || configuration.glob || "**/*",
      { ...configuration, ...settings },
      documents,
    );
  }

  return documents;
}

export default handler;
