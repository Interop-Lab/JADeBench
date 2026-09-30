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

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(["img", "input", "iframe"]);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
  input: ["type", "checked", "disabled"],
  h1: ["id"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  h5: ["id"],
  h6: ["id"],
  span: ["class"],
  code: ["class"],
  pre: ["class"],
};

const normalizeDir = (directory) => directory.replaceAll("\\", "/");

const getSlug = (filename, contentDirectory) =>
  normalizeDir(filename)
    .replaceAll(normalizeDir(contentDirectory), "")
    .trim();

async function getLastModified(filename, settings, document) {
  if (document.modified) return document.modified;

  const allowedDirectories = [
    path.resolve(settings.content_dir),
    path.resolve(settings.theme_dir),
  ];
  const realFilename = await fs.realpath(filename);
  if (!allowedDirectories.some((directory) => realFilename.startsWith(directory))) {
    throw new Error("Access denied: file path is outside allowed directories");
  }

  const stat = await fs.lstat(realFilename);
  return moment(stat.mtime).format(settings.datetime_format);
}

function cleanString(value) {
  return kebabCase(snakeCase(value.replaceAll("/", " ").trim())).replaceAll("_", "-");
}

function cleanObjectStrings(value) {
  const result = {};
  for (const [key, item] of Object.entries(value)) result[key] = String(item);
  return result;
}

function slugToTitle(slug) {
  const basename = path.basename(slug.replaceAll(".md", "").trim());
  return startCase(basename.replace(/[-_]/g, " "));
}

function stripMeta(source) {
  if (META_REGEX.test(source)) return source.replace(META_REGEX, "").trim();
  if (META_REGEX_YAML.test(source)) return source.replace(META_REGEX_YAML, "").trim();
  return source.trim();
}

function processMeta(source) {
  if (META_REGEX.test(source)) {
    const block = source.match(META_REGEX)?.[1]?.trim() ?? "";
    const metadata = {};
    for (const line of block.split("\n")) {
      const separator = line.indexOf(": ");
      if (separator < 0) continue;
      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      metadata[key] = value;
    }
    return metadata;
  }

  if (META_REGEX_YAML.test(source)) {
    const block = source.match(META_REGEX_YAML)?.[1]?.trim() ?? "";
    return cleanObjectStrings(yaml.load(block) ?? {});
  }

  return {};
}

function processVars(value, settings) {
  const variables = Array.isArray(settings.variables) ? settings.variables : [];
  variables.forEach((variable) => {
    value = value.replaceAll(variable.key, variable.value);
  });
  return value
    .replaceAll("%base_url%", settings.base_url)
    .replaceAll("%image_url%", settings.image_url);
}

async function extractDocument(filename, settings, id) {
  const source = await fs.readFile(filename, "utf8");
  const metadata = processMeta(source);
  const slug = getSlug(filename, settings.content_dir).replaceAll(".md", "").trim();
  return {
    ...metadata,
    title: metadata.title || slugToTitle(slug),
    id,
    body: stripMeta(source),
  };
}

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function handler(filename, settings) {
  const normalizedFilename = normalizeDir(path.normalize(filename));
  const source = await fs.readFile(normalizedFilename, "utf8");
  let slug = getSlug(normalizedFilename, settings.content_dir);
  if (slug.includes("index.md")) slug = slug.replaceAll("index.md", "");
  slug = slug.replaceAll(".md", "").trim();

  const metadata = processMeta(source);
  for (const key of Object.keys(metadata)) {
    metadata[key] = processVars(metadata[key], settings);
  }
  const markdown = processVars(stripMeta(source), settings);
  const body = sanitizeHtmlOutput(marked(markdown));
  const title = metadata.title || slugToTitle(slug);

  const plainText = trim(
    sanitizeHtml(unescape(body), { allowedTags: [], allowedAttributes: {} }),
  );
  const excerptLength = settings.excerpt_length ?? 400;
  const excerpt =
    plainText.length > excerptLength
      ? `${plainText.slice(0, excerptLength).trimEnd().replace(/\s\S+$/, "")}...`
      : plainText;

  const document = {
    ...metadata,
    title,
    slug,
    body,
    excerpt,
  };
  document.modified = await getLastModified(normalizedFilename, settings, document);

  if (settings.debug) console.log(document);
  return document;
}

export default handler;
