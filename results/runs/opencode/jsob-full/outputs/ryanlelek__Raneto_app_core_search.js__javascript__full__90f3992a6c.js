import path from "node:path";
import fs from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import unescape from "lodash/unescape.js";
import yaml from "js-yaml";
import sanitizeHtml from "sanitize-html";
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

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  value = value.replaceAll("/", " ").trim();
  return useSnakeCase ? snakeCase(value) : trim(kebabCase(value), "-");
}

function cleanObjectStrings(object) {
  const cleaned = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) cleaned[cleanString(key, true)] = String(object[key]).trim();
  }
  return cleaned;
}

function slugToTitle(slug) {
  slug = slug.replaceAll(".md", "").trim();
  return startCase(path.basename(slug).replaceAll(/[-_]/g, " "));
}

function stripMeta(markdown) {
  if (META_REGEX.test(markdown)) return markdown.replace(META_REGEX, "").trim();
  if (META_REGEX_YAML.test(markdown)) return markdown.replace(META_REGEX_YAML, "").trim();
  return markdown.trim();
}

function processMeta(markdown) {
  if (META_REGEX.test(markdown)) {
    const metadata = {};
    const block = markdown.match(META_REGEX)?.[1]?.trim() ?? "";
    for (const line of block.split("\n")) {
      const separator = line.indexOf(": ");
      if (separator <= 0) continue;
      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      if (key && value) metadata[cleanString(key, true)] = value;
    }
    return metadata;
  }
  if (META_REGEX_YAML.test(markdown)) {
    const block = markdown.match(META_REGEX_YAML)?.[1]?.trim() ?? "";
    return cleanObjectStrings(yaml.load(block));
  }
  return {};
}

function processVars(markdown, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      markdown = markdown.replaceAll(new RegExp(`%${variable.name}%`, "g"), variable.content);
    });
  }
  if (config.base_url !== undefined) markdown = markdown.replaceAll("%base_url%", config.base_url);
  if (config.image_url !== undefined) markdown = markdown.replaceAll("%image_url%", config.image_url);
  return markdown;
}

async function extractDocument(contentDirectory, filePath, debug) {
  try {
    const body = await fs.readFile(filePath, "utf8");
    const metadata = processMeta(body);
    const id = filePath.replaceAll(contentDirectory, "").trim();
    return { id, title: metadata.title || slugToTitle(id), body };
  } catch (error) {
    if (debug) console.log(error);
    return null;
  }
}

const contentProcessors = {
  cleanString,
  cleanObjectStrings,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
  extractDocument,
};

const normalizeDir = (directory) => directory.replaceAll("\\", "/");
const getSlug = (filePath, contentDirectory) =>
  normalizeDir(filePath).replaceAll(normalizeDir(contentDirectory), "").trim();

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(["img", "input", "del"]);
const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };
allowedAttributes.img = ["src", "srcset", "alt", "title", "width", "height", "loading"];
allowedAttributes.input = ["type", "checked", "disabled"];
for (let level = 1; level <= 6; level++) allowedAttributes[`h${level}`] = ["id"];
allowedAttributes.span = ["class"];
allowedAttributes.code = ["class"];
allowedAttributes.pre = ["class"];

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function renderPage(filePath, config) {
  const contentDirectory = normalizeDir(path.normalize(config.content_dir));
  try {
    const markdown = await fs.readFile(filePath, "utf8");
    let slug = getSlug(filePath, contentDirectory);
    if (slug.includes("index.md")) slug = slug.replaceAll("index.md", "");
    slug = slug.replaceAll(".md", "").trim();

    const metadata = processMeta(markdown);
    const renderedBody = sanitizeHtmlOutput(marked(processVars(stripMeta(markdown), config)));
    const title = metadata.title || slugToTitle(slug);
    const plainText = unescape(sanitizeHtml(renderedBody, { allowedTags: [], allowedAttributes: {} }));
    const excerptLength = config.excerpt_length || 400;
    const excerpt =
      plainText.length > excerptLength
        ? `${plainText.slice(0, excerptLength).trimEnd().replace(/\s\S+$/, "")}...`
        : plainText;
    return { slug, title, body: renderedBody, excerpt };
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
let stemmers = null;

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
  if (stemmers === null) {
    const languages = ["en"].concat(config.searchExtraLanguages);
    stemmers = getLunr(config).multiLanguage(...languages);
  }
  return stemmers;
}

async function processSearchResult(contentDirectory, config, query, searchResult) {
  const page = await renderPage(path.join(contentDirectory, searchResult.ref), config);
  if (!page) return null;

  const slugParts = page.slug.split("/");
  page.category = slugParts.length > 1 ? slugParts[0] : null;
  if (page.excerpt) {
    const escapedQuery = query.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.excerpt = page.excerpt.replaceAll(
      new RegExp(`(${escapedQuery})`, "gim"),
      '<span class="search-query">$1</span>',
    );
  }
  return page;
}

async function search(query, config) {
  const contentDirectory = normalizeDir(path.normalize(config.content_dir));
  const files = await glob(path.join(contentDirectory, "**", "*.md"));
  const documents = (
    await Promise.all(files.map((file) => extractDocument(contentDirectory, file, config.debug)))
  ).filter((document) => document !== null);

  const searchEngine = getLunr(config);
  const index = searchEngine(function buildIndex() {
    this.use(getStemmers(config));
    this.field("title", { boost: 10 });
    this.field("body");
    this.ref("id");
    documents.forEach((document) => this.add(document), this);
  });

  const normalizedQuery = query.replaceAll(/[~*+\-^:]/g, " ").replaceAll(/\s+/g, " ").trim();
  if (!normalizedQuery) return [];

  let results = index.search(normalizedQuery);
  if (results.length === 0 && normalizedQuery.includes(" ")) {
    results = index.search(normalizedQuery.split(/\s+/).join(" OR "));
  }
  if (results.length === 0 && normalizedQuery.length > 2) results = index.search(`${normalizedQuery}~1`);
  if (results.length === 0) results = index.search(`${normalizedQuery}*`);
  if (results.length === 0) {
    const fuzzyTerms = normalizedQuery
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .map((term) => `${term}~1`)
      .join(" OR ");
    if (fuzzyTerms) results = index.search(fuzzyTerms);
  }

  const pages = await Promise.all(
    results.map((result) => processSearchResult(contentDirectory, config, query, result)),
  );
  return pages.filter((page) => page !== null);
}

export { search as default };
