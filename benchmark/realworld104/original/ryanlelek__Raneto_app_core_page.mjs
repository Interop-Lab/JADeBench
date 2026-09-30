// ../work/ryanlelek__Raneto/app/core/utils.js
import path from "node:path";
import fs from "fs-extra";
import moment from "moment";
var normalizeDir = (dir) => dir.replaceAll("\\", "/");
var getSlug = (filePath, contentDir) => normalizeDir(filePath).replaceAll(normalizeDir(contentDir), "").trim();
async function getLastModified(config, meta, filePath) {
  if (meta.modified !== void 0) {
    return moment(meta.modified).format(config.datetime_format);
  }
  const contentRoot = path.resolve(config.content_dir);
  const allowedRoots = [contentRoot];
  if (config.theme_dir) {
    allowedRoots.push(path.resolve(config.theme_dir));
  }
  const isWithinAllowed = (p) => allowedRoots.some((root) => p.startsWith(root + path.sep) || p === root);
  const resolved = path.resolve(filePath);
  if (!isWithinAllowed(resolved)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const realPath = await fs.realpath(resolved);
  if (!isWithinAllowed(realPath)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const { mtime } = await fs.lstat(realPath);
  return moment(mtime).format(config.datetime_format);
}
var utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

// ../work/ryanlelek__Raneto/app/functions/contentProcessors.js
import path2 from "node:path";
import fs2 from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(str, useUnderscore = false) {
  str = str.replaceAll("/", " ").trim();
  if (useUnderscore) {
    return snakeCase(str);
  }
  return trim(kebabCase(str), "-");
}
function cleanObjectStrings(obj) {
  const cleanObj = {};
  for (const field in obj) {
    if (Object.hasOwn(obj, field)) {
      cleanObj[cleanString(field, true)] = `${obj[field]}`.trim();
    }
  }
  return cleanObj;
}
function slugToTitle(slug) {
  slug = slug.replaceAll(".md", "").trim();
  return startCase(path2.basename(slug).replaceAll(/[-_]/g, " "));
}
function stripMeta(markdownContent) {
  if (META_REGEX.test(markdownContent)) {
    return markdownContent.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(markdownContent)) {
    return markdownContent.replace(META_REGEX_YAML, "").trim();
  }
  return markdownContent.trim();
}
function processMeta(markdownContent) {
  if (META_REGEX.test(markdownContent)) {
    const meta = {};
    const metaArr = markdownContent.match(META_REGEX);
    const metaString = metaArr?.[1]?.trim() ?? "";
    if (metaString) {
      const lines = metaString.split("\n");
      for (const line of lines) {
        const colonIndex = line.indexOf(": ");
        if (colonIndex <= 0) {
          continue;
        }
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 2).trim();
        if (key && value) {
          meta[cleanString(key, true)] = value;
        }
      }
    }
    return meta;
  }
  if (META_REGEX_YAML.test(markdownContent)) {
    const metaArr = markdownContent.match(META_REGEX_YAML);
    const metaString = metaArr?.[1]?.trim() ?? "";
    const yamlObject = yaml.load(metaString);
    return cleanObjectStrings(yamlObject);
  }
  return {};
}
function processVars(markdownContent, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((v) => {
      markdownContent = markdownContent.replaceAll(
        new RegExp(`%${v.name}%`, "g"),
        v.content
      );
    });
  }
  if (config.base_url !== void 0) {
    markdownContent = markdownContent.replaceAll("%base_url%", config.base_url);
  }
  if (config.image_url !== void 0) {
    markdownContent = markdownContent.replaceAll(
      "%image_url%",
      config.image_url
    );
  }
  return markdownContent;
}
async function extractDocument(contentDir, filePath, debug) {
  try {
    const file = await fs2.readFile(filePath, "utf8");
    const meta = processMeta(file);
    const id = filePath.replaceAll(contentDir, "").trim();
    const title = meta.title ? meta.title : slugToTitle(id);
    const body = file;
    return { id, title, body };
  } catch (e) {
    if (debug) {
      console.log(e);
    }
    return null;
  }
}
var contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

// ../work/ryanlelek__Raneto/app/functions/sanitizeHtmlOutput.js
import sanitizeHtml from "sanitize-html";
var allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "input",
  "del"
]);
var allowedAttributes = {
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
  pre: ["class"]
};
function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}
var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

// ../work/ryanlelek__Raneto/app/core/page.js
import path3 from "node:path";
import fs3 from "fs-extra";
import unescape from "lodash/unescape.js";
import sanitizeHtml2 from "sanitize-html";
import { marked } from "marked";
async function handler(filePath, config) {
  const contentDir = utils_default.normalizeDir(path3.normalize(config.content_dir));
  try {
    const file = await fs3.readFile(filePath, "utf8");
    let slug = utils_default.getSlug(filePath, contentDir);
    if (slug.includes("index.md")) {
      slug = slug.replaceAll("index.md", "");
    }
    slug = slug.replaceAll(".md", "").trim();
    const meta = contentProcessors_default.processMeta(file);
    const content = contentProcessors_default.processVars(
      contentProcessors_default.stripMeta(file),
      config
    );
    const body = sanitizeHtmlOutput_default(marked(content));
    const title = meta.title ? meta.title : contentProcessors_default.slugToTitle(slug);
    const cleanText = unescape(
      sanitizeHtml2(body, { allowedTags: [], allowedAttributes: {} })
    );
    const maxLength = config.excerpt_length || 400;
    const excerpt = cleanText.length > maxLength ? cleanText.slice(0, maxLength).trimEnd().replace(/\s\S+$/, "") + "..." : cleanText;
    return {
      slug,
      title,
      body,
      excerpt
    };
  } catch (e) {
    if (config.debug) {
      console.log(e);
    }
    return null;
  }
}
var page_default = handler;
export {
  page_default as default
};
