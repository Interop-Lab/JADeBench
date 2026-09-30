import path from "node:path";
import fs from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import unescape from "lodash/unescape.js";
import yaml from "js-yaml";
import moment from "moment";
import sanitizeHtml from "sanitize-html";
import { marked } from "marked";
import lunr from "lunr";
import stemmerSupport from "lunr-languages/lunr.stemmer.support.js";
import multiLanguage from "lunr-languages/lunr.multi.js";
import tinyseg from "lunr-languages/tinyseg.js";
import lunrDa from "lunr-languages/lunr.da.js";
import lunrDe from "lunr-languages/lunr.de.js";
import lunrEs from "lunr-languages/lunr.es.js";
import lunrFi from "lunr-languages/lunr.fi.js";
import lunrFr from "lunr-languages/lunr.fr.js";
import lunrHu from "lunr-languages/lunr.hu.js";
import lunrJa from "lunr-languages/lunr.ja.js";
import lunrNo from "lunr-languages/lunr.no.js";
import lunrPt from "lunr-languages/lunr.pt.js";
import lunrRo from "lunr-languages/lunr.ro.js";
import lunrRu from "lunr-languages/lunr.ru.js";
import lunrSv from "lunr-languages/lunr.sv.js";
import lunrTr from "lunr-languages/lunr.tr.js";
import { glob } from "glob";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const languageLoaders = {
  da: lunrDa,
  de: lunrDe,
  es: lunrEs,
  fi: lunrFi,
  fr: lunrFr,
  hu: lunrHu,
  ja: lunrJa,
  no: lunrNo,
  pt: lunrPt,
  ro: lunrRo,
  ru: lunrRu,
  sv: lunrSv,
  tr: lunrTr,
};

let lunrInstance;

function cleanString(value) {
  return trim(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanObjectStrings(object) {
  for (const key of Object.keys(object)) {
    if (typeof object[key] === "string") object[key] = trim(object[key]);
  }
  return object;
}

function slugToTitle(slug) {
  return startCase(slug);
}

function stripMeta(content) {
  return content.replace(META_REGEX_YAML, "").replace(META_REGEX, "").trim();
}

function processMeta(content) {
  const match = content.match(META_REGEX_YAML) ?? content.match(META_REGEX);
  if (!match) return {};

  try {
    const parsed = yaml.load(match[1]) ?? {};
    return Object.fromEntries(
      Object.entries(parsed).map(([key, value]) => [snakeCase(key), value]),
    );
  } catch {
    return {};
  }
}

function processVars(content, config = {}) {
  let result = content;
  if (config.variables) {
    for (const [name, value] of Object.entries(config.variables)) {
      result = result.replaceAll(`%${name}%`, String(value));
    }
  }
  if (config.base_url) result = result.replaceAll("%base_url%", config.base_url);
  if (config.image_url) result = result.replaceAll("%image_url%", config.image_url);
  return result;
}

function normalizeDir(directory) {
  return directory.replaceAll("\\", "/");
}

function getSlug(file, contentDirectory) {
  const directory = normalizeDir(contentDirectory);
  const relative = normalizeDir(file).replace(directory, "");
  return relative.replace(/\.md$/i, "").replace(/\/index$/i, "/");
}

async function getLastModified(file, metadata = {}, config = {}) {
  if (metadata.modified) return moment(metadata.modified).format(config.datetime_format);
  const stat = await fs.stat(path.resolve(file));
  return moment(stat.mtime).format(config.datetime_format);
}

async function extractDocument(_source, file, config = {}) {
  try {
    const content = await fs.readFile(file, "utf8");
    const metadata = processMeta(content);
    const body = stripMeta(content);
    return {
      id: file,
      title: metadata.title ?? slugToTitle(path.basename(file, path.extname(file))),
      body,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
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

async function renderPage(file, config = {}) {
  try {
    const normalizedContentDir = normalizeDir(config.content_dir);
    const content = await fs.readFile(file, "utf8");
    const metadata = processMeta(content);
    const markdown = processVars(stripMeta(content), config);
    const body = sanitizeHtmlOutput(marked(markdown));
    const plainText = unescape(sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }));
    const excerptLength = config.excerpt_length;

    return {
      slug: getSlug(path.join(normalizedContentDir, `/${path.basename(file)}`), normalizedContentDir),
      title: metadata.title ?? slugToTitle(path.basename(file, path.extname(file))),
      body,
      excerpt: excerptLength ? plainText.slice(0, excerptLength) : plainText,
    };
  } catch (error) {
    if (config.debug) console.error(error);
    return null;
  }
}

function getLunr(config = {}) {
  if (lunrInstance) return lunrInstance;
  const extraLanguages = config.searchExtraLanguages ?? [];
  if (extraLanguages.length) {
    stemmerSupport(lunr);
    tinyseg(lunr);
    for (const language of extraLanguages) languageLoaders[language]?.(lunr);
    multiLanguage(lunr);
  }
  lunrInstance = lunr;
  return lunrInstance;
}

function getStemmers(config = {}) {
  const instance = getLunr(config);
  const languages = ["en", ...(config.searchExtraLanguages ?? [])];
  return languages
    .map((language) => instance[language]?.stemmer)
    .filter(Boolean);
}

function processSearchResult(query, _index, config, page) {
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlighted = page.excerpt.replace(
    new RegExp(escaped, "gi"),
    (match) => `<span class="search-query">${match}</span>`,
  );
  return { ...page, excerpt: highlighted, category: page.category ?? "" };
}

async function search(query, config = {}) {
  const contentDirectory = normalizeDir(config.content_dir);
  const files = await glob(path.join(contentDirectory, "**", "*.md"));
  const pages = (await Promise.all(files.map((file) => renderPage(file, config)))).filter(Boolean);

  const index = getLunr(config)(function buildIndex() {
    this.ref("slug");
    this.field("title");
    this.field("body");
    for (const page of pages) {
      this.add({
        ...page,
        body: unescape(sanitizeHtml(page.body, { allowedTags: [], allowedAttributes: {} })),
      });
    }
  });

  return index.search(query).map((result) => {
    const page = pages.find((candidate) => candidate.slug === result.ref);
    return processSearchResult(query, index, config, page);
  });
}

export default search;
