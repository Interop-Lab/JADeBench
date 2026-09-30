import path from "node:path";
import fs from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
import moment from "moment";
import sanitizeHtml from "sanitize-html";
import unescape from "lodash/unescape.js";
import { marked } from "marked";
import lunr from "lunr";
import stemmerSupport from "lunr-languages/lunr.stemmer.support.js";
import multiLanguage from "lunr-languages/lunr.multi.js";
import tinyseg from "lunr-languages/tinyseg.js";
import loadDanish from "lunr-languages/lunr.da.js";
import loadGerman from "lunr-languages/lunr.de.js";
import loadSpanish from "lunr-languages/lunr.es.js";
import loadFinnish from "lunr-languages/lunr.fi.js";
import loadFrench from "lunr-languages/lunr.fr.js";
import loadHungarian from "lunr-languages/lunr.hu.js";
import loadJapanese from "lunr-languages/lunr.ja.js";
import loadNorwegian from "lunr-languages/lunr.no.js";
import loadPortuguese from "lunr-languages/lunr.pt.js";
import loadRomanian from "lunr-languages/lunr.ro.js";
import loadRussian from "lunr-languages/lunr.ru.js";
import loadSwedish from "lunr-languages/lunr.sv.js";
import loadTurkish from "lunr-languages/lunr.tr.js";
import { glob } from "glob";

const COMMENT_META_PATTERN = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META_PATTERN = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replaceAll("/", " ").trim();
  if (useSnakeCase) return snakeCase(cleaned);
  return trim(kebabCase(cleaned), "-");
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
  if (COMMENT_META_PATTERN.test(content)) {
    return content.replace(COMMENT_META_PATTERN, "").trim();
  }
  if (YAML_META_PATTERN.test(content)) {
    return content.replace(YAML_META_PATTERN, "").trim();
  }
  return content.trim();
}

function processMeta(content) {
  if (COMMENT_META_PATTERN.test(content)) {
    const metadata = {};
    const match = content.match(COMMENT_META_PATTERN);
    const block = match?.[1]?.trim() ?? "";

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

  if (YAML_META_PATTERN.test(content)) {
    const match = content.match(YAML_META_PATTERN);
    const block = match?.[1]?.trim() ?? "";
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(content, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      content = content.replaceAll(
        new RegExp(`%${variable.name}%`, "g"),
        variable.content,
      );
    });
  }
  if (config.base_url !== undefined) {
    content = content.replaceAll("%base_url%", config.base_url);
  }
  if (config.image_url !== undefined) {
    content = content.replaceAll("%image_url%", config.image_url);
  }
  return content;
}

async function extractDocument(contentRoot, filename, debug) {
  try {
    const body = await fs.readFile(filename, "utf8");
    const metadata = processMeta(body);
    const id = filename.replaceAll(contentRoot, "").trim();
    const title = metadata.title || slugToTitle(id);
    return { id, title, body };
  } catch (error) {
    if (debug) console.log(error);
    return null;
  }
}

function normalizeDir(directory) {
  return directory.replaceAll("\\", "/");
}

function getSlug(filename, contentDirectory) {
  return normalizeDir(filename)
    .replaceAll(normalizeDir(contentDirectory), "")
    .trim();
}

function isWithinRoot(filename, roots) {
  return roots.some(
    (root) => filename.startsWith(root + path.sep) || filename === root,
  );
}

async function getLastModified(config, metadata, filename) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(config.datetime_format);
  }

  const roots = [path.resolve(config.content_dir)];
  if (config.theme_dir) roots.push(path.resolve(config.theme_dir));

  const resolvedFilename = path.resolve(filename);
  if (!isWithinRoot(resolvedFilename, roots)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }

  const realFilename = await fs.realpath(resolvedFilename);
  if (!isWithinRoot(realFilename, roots)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }

  const { mtime } = await fs.stat(realFilename);
  return moment(mtime).format(config.datetime_format);
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "input",
  "del",
]);
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

async function loadPage(filename, config) {
  const contentDirectory = normalizeDir(path.normalize(config.content_dir));

  try {
    const source = await fs.readFile(filename, "utf8");
    let slug = getSlug(filename, contentDirectory);
    if (slug.includes("index.md")) slug = slug.replaceAll("index.md", "");
    slug = slug.replaceAll(".md", "").trim();

    const metadata = processMeta(source);
    const markdown = processVars(stripMeta(source), config);
    const body = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title || slugToTitle(slug);
    const plainText = unescape(
      sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }),
    );
    const excerptLength = config.excerpt_length || 400;
    const excerpt =
      plainText.length > excerptLength
        ? plainText
            .slice(0, excerptLength)
            .trimEnd()
            .replace(/\s\S+$/, "") + "..."
        : plainText;

    return { slug, title, body, excerpt };
  } catch (error) {
    if (config.debug) console.log(error);
    return null;
  }
}

const languageLoaders = {
  da: loadDanish,
  de: loadGerman,
  es: loadSpanish,
  fi: loadFinnish,
  fr: loadFrench,
  hu: loadHungarian,
  ja: loadJapanese,
  no: loadNorwegian,
  pt: loadPortuguese,
  ro: loadRomanian,
  ru: loadRussian,
  sv: loadSwedish,
  tr: loadTurkish,
};

let lunrInstance = null;
let searchStemmers = null;

function getLunr(config) {
  if (lunrInstance === null) {
    lunrInstance = lunr;
    stemmerSupport(lunrInstance);
    multiLanguage(lunrInstance);
    tinyseg(lunrInstance);
    config.searchExtraLanguages.forEach((language) => {
      if (languageLoaders[language]) languageLoaders[language](lunrInstance);
    });
  }
  return lunrInstance;
}

function getStemmers(config) {
  if (searchStemmers === null) {
    const languages = ["en"].concat(config.searchExtraLanguages);
    searchStemmers = getLunr(config).multiLanguage(...languages);
  }
  return searchStemmers;
}

async function processSearchResult(contentRoot, config, query, result) {
  const filename = path.join(contentRoot, result.ref);
  const page = await loadPage(filename, config);
  if (!page) return null;

  const slugParts = page.slug.split("/");
  page.category = slugParts.length > 1 ? slugParts[0] : null;

  if (page.excerpt) {
    const escapedQuery = query.replaceAll(
      /[.*+?^${}()|[\]\\]/g,
      String.raw`\$&`,
    );
    page.excerpt = page.excerpt.replaceAll(
      new RegExp(`(${escapedQuery})`, "gim"),
      '<span class="search-query">$1</span>',
    );
  }
  return page;
}

async function search(query, config) {
  const contentRoot = normalizeDir(path.normalize(config.content_dir));
  const filenames = await glob(path.join(contentRoot, "**", "*.md"));
  const extracted = await Promise.all(
    filenames.map((filename) =>
      extractDocument(contentRoot, filename, config.debug),
    ),
  );
  const documents = extracted.filter((document) => document !== null);
  const lunrApi = getLunr(config);
  const index = lunrApi(function () {
    this.use(getStemmers(config));
    this.field("title", { boost: 10 });
    this.field("body");
    this.ref("id");
    documents.forEach((document) => this.add(document), this);
  });

  const cleanedQuery = query
    .replaceAll(/[~*+\-^:]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();
  if (!cleanedQuery) return [];

  let results = index.search(cleanedQuery);
  if (results.length === 0 && cleanedQuery.includes(" ")) {
    results = index.search(cleanedQuery.split(/\s+/).join(" OR "));
  }
  if (results.length === 0 && cleanedQuery.length > 2) {
    results = index.search(`${cleanedQuery}~1`);
  }
  if (results.length === 0) {
    results = index.search(`${cleanedQuery}*`);
  }
  if (results.length === 0) {
    const fuzzyQuery = cleanedQuery
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .map((term) => `${term}~1`)
      .join(" OR ");
    if (fuzzyQuery) results = index.search(fuzzyQuery);
  }

  const pages = await Promise.all(
    results.map((result) =>
      processSearchResult(contentRoot, config, query, result),
    ),
  );
  return pages.filter((page) => page !== null);
}

export { search as default };
