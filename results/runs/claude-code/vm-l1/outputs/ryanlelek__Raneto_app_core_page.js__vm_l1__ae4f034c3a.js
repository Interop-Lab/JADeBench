import path from "node:path";
import fs from "fs-extra";
import moment from "moment";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import unescape from "lodash/unescape.js";
import yaml from "js-yaml";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(["img", "input", "del"]);
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

function normalizeDir(directory) {
  return directory.replaceAll("\\", "/");
}

function getSlug(filePath, contentDirectory) {
  return normalizeDir(filePath)
    .replaceAll(normalizeDir(contentDirectory), "")
    .trim();
}

async function getLastModified(file, settings, extraAllowedDirectories = []) {
  if (file.modified) {
    return moment(file.modified).format(settings.datetime_format);
  }

  const allowedDirectories = [
    path.resolve(settings.content_dir),
    path.resolve(settings.theme_dir),
    ...extraAllowedDirectories.map((directory) => path.resolve(directory)),
  ];
  const realPath = await fs.realpath(file.path);
  const isAllowed = allowedDirectories.some(
    (directory) => realPath === directory || realPath.startsWith(`${directory}${path.sep}`),
  );

  if (!isAllowed) {
    throw new Error("Access denied: file path is outside allowed directories");
  }

  const stats = await fs.lstat(realPath);
  return moment(stats.mtime).format(settings.datetime_format);
}

function cleanString(value) {
  if (!value) return false;
  const cleaned = value.replaceAll("/", " ").trim();
  return kebabCase(snakeCase(cleaned), "-");
}

function cleanObjectStrings(value) {
  for (const key of Object.keys(value)) {
    if (!Object.hasOwn(value, key)) continue;

    const cleanKey = cleanString(key);
    if (cleanKey !== key) {
      value[cleanKey] = value[key];
      delete value[key];
    }

    if (typeof value[cleanKey] === "string") {
      value[cleanKey] = value[cleanKey].trim();
    }
  }
  return value;
}

function slugToTitle(slug) {
  const basename = path.basename(slug.replaceAll(".md", "").trim());
  return startCase(basename.replace(/[-_]/g, " "));
}

function stripMeta(document) {
  if (META_REGEX.test(document)) {
    return document.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(document)) {
    return document.replace(META_REGEX_YAML, "").trim();
  }
  return document.trim();
}

function processMeta(document) {
  if (META_REGEX.test(document)) {
    const metadata = {};
    const block = document.match(META_REGEX)?.[1]?.trim() ?? "";

    for (const line of block.split("\n")) {
      const separator = line.indexOf(": ");
      if (separator === -1) continue;

      const key = cleanString(line.substring(0, separator), true);
      metadata[key] = line.substring(separator + 2).trim();
    }
    return metadata;
  }

  if (META_REGEX_YAML.test(document)) {
    const block = document.match(META_REGEX_YAML)?.[1]?.trim() ?? "";
    return cleanObjectStrings(yaml.load(block) ?? {});
  }

  return {};
}

function processVars(document, settings) {
  let output = document;
  const variables = settings.variables;

  if (Array.isArray(variables)) {
    variables.forEach((variable) => {
      output = output.replaceAll(`%${variable.name}%`, variable.value);
    });
  }

  output = output.replaceAll("%base_url%", settings.base_url ?? "");
  output = output.replaceAll("%image_url%", settings.image_url ?? "");
  return output;
}

async function extractDocument(filePath, slug, settings) {
  try {
    const source = await fs.readFile(filePath, "utf8");
    const metadata = processMeta(source);
    return {
      ...metadata,
      title: metadata.title || slugToTitle(slug),
      id: slug,
      body: processVars(stripMeta(source), settings),
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function handler(filePath, settings) {
  try {
    const contentDirectory = normalizeDir(path.normalize(settings.content_dir));
    const source = await fs.readFile(filePath, "utf8");
    const relativePath = getSlug(filePath, contentDirectory);
    const slug = (relativePath.includes("index.md")
      ? relativePath.replaceAll("index.md", "")
      : relativePath.replaceAll(".md", ""))
      .trim();
    const metadata = processMeta(source);
    const markdown = processVars(stripMeta(source), settings);
    const body = sanitizeHtmlOutput(marked(markdown));
    const title = sanitizeHtml(
      unescape(metadata.title || slugToTitle(slug)),
      { allowedTags, allowedAttributes },
    );
    const excerptLength = settings.excerpt_length || 400;
    const excerpt = body.length > excerptLength
      ? body.slice(0, excerptLength).trimEnd().replace(/\s\S+$/, "...")
      : body;

    const page = {
      ...metadata,
      title,
      slug,
      body,
      excerpt,
    };

    if (settings.debug) console.log(page);
    return page;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export default handler;
