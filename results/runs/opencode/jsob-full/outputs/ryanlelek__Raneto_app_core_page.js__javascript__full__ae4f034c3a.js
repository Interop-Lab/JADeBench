import path from "node:path";
import fs from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import unescape from "lodash/unescape.js";
import yaml from "js-yaml";
import moment from "moment";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";

const COMMENT_META = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(directory) {
  return directory.replaceAll("\\", "/");
}

function getSlug(filename, contentDirectory) {
  return normalizeDir(filename).replaceAll(normalizeDir(contentDirectory), "").trim();
}

async function getLastModified(options, page, filename) {
  if (page.modified !== undefined) {
    return moment(page.modified).format(options.datetime_format);
  }

  const permittedDirectories = [path.resolve(options.content_dir)];
  if (options.theme_dir) permittedDirectories.push(path.resolve(options.theme_dir));

  const isPermitted = (resolvedPath) => permittedDirectories.some(
    (directory) => resolvedPath.startsWith(directory + path.sep) || resolvedPath === directory,
  );

  const resolvedFilename = path.resolve(filename);
  if (!isPermitted(resolvedFilename)) {
    throw new Error("File path is outside permitted directories");
  }

  const realFilename = await fs.realpath(resolvedFilename);
  if (!isPermitted(realFilename)) {
    throw new Error("File path is outside permitted directories");
  }

  const { mtime } = await fs.stat(realFilename);
  return moment(mtime).format(options.datetime_format);
}

function cleanString(value, asKey = false) {
  const cleaned = value.replaceAll("/", " ").trim();
  return asKey ? snakeCase(cleaned) : trim(kebabCase(cleaned), "-");
}

function cleanObjectStrings(object) {
  const cleaned = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleaned[cleanString(key, true)] = String(object[key]).trim();
    }
  }
  return cleaned;
}

function slugToTitle(slug) {
  const filename = slug.replaceAll(".md", "").trim();
  return startCase(path.basename(filename).replaceAll(/[-_]/g, " "));
}

function stripMeta(content) {
  if (COMMENT_META.test(content)) return content.replace(COMMENT_META, "").trim();
  if (YAML_META.test(content)) return content.replace(YAML_META, "").trim();
  return content.trim();
}

function processMeta(content) {
  if (COMMENT_META.test(content)) {
    const metadata = {};
    const block = content.match(COMMENT_META)?.[1]?.trim() ?? "";

    if (block) {
      for (const line of block.split("\n")) {
        const separator = line.indexOf(": ");
        if (separator <= 0) continue;

        const key = line.substring(0, separator).trim();
        const value = line.substring(separator + 2).trim();
        if (key && value) metadata[cleanString(key, true)] = value;
      }
    }
    return metadata;
  }

  if (YAML_META.test(content)) {
    const block = content.match(YAML_META)?.[1]?.trim() ?? "";
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(content, options) {
  if (options.variables && Array.isArray(options.variables)) {
    options.variables.forEach((variable) => {
      content = content.replaceAll(
        new RegExp(`%${variable.name}%`, "g"),
        variable.value,
      );
    });
  }

  if (options.base_url !== undefined) {
    content = content.replaceAll("%base_url%", options.base_url);
  }
  if (options.image_url !== undefined) {
    content = content.replaceAll("%image_url%", options.image_url);
  }
  return content;
}

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

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function handler(filename, options) {
  const contentDirectory = normalizeDir(path.dirname(options.content_dir));

  try {
    const source = await fs.readFile(filename, "utf8");
    let slug = getSlug(filename, contentDirectory);
    if (slug.includes("index.md")) slug = slug.replaceAll("index.md", "");
    slug = slug.replaceAll(".md", "").trim();

    const metadata = processMeta(source);
    const markdown = processVars(stripMeta(source), options);
    const body = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title || slugToTitle(slug);

    const plainText = unescape(
      sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }),
    );
    const excerptLength = options.excerpt_length || 400;
    const excerpt = plainText.length > excerptLength
      ? `${plainText
          .slice(0, excerptLength)
          .trimEnd()
          .replace(/\s\S+$/, "")}...`
      : plainText;

    return { slug, title, body, excerpt };
  } catch (error) {
    if (options.debug) console.log(error);
    return null;
  }
}

export { handler as default };
