import path from "node:path";
import fs from "fs-extra";
import startCase from "lodash/startCase.js";
import yaml from "js-yaml";
import sanitizeHtml from "sanitize-html";
import unescape from "lodash/unescape.js";
import { marked } from "marked";
import lunr from "lunr";
import lunrStemmer from "lunr-languages/lunr.stemmer.support.js";
import lunrMulti from "lunr-languages/lunr.multi.js";
import lunrTinyseg from "lunr-languages/tinyseg.js";
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

function cleanString(value) {
  return typeof value === "string" ? value.trim() : value;
}

function cleanObjectStrings(value) {
  if (Array.isArray(value)) return value.map(cleanObjectStrings);
  if (!value || typeof value !== "object") return cleanString(value);
  for (const key of Object.keys(value)) value[key] = cleanObjectStrings(value[key]);
  return value;
}

function slugToTitle(slug) {
  return startCase(path.basename(slug).replaceAll(".md", "").replace(/[-_]/g, " "));
}

function stripMeta(content) {
  return content.replace(META_REGEX, "").replace(META_REGEX_YAML, "").trim();
}

function processMeta(content) {
  const yamlBlock = content.match(META_REGEX_YAML)?.[1];
  if (yamlBlock) return cleanObjectStrings(yaml.load(yamlBlock.trim()) ?? {});
  const commentBlock = content.match(META_REGEX)?.[1];
  if (!commentBlock) return {};
  const metadata = {};
  for (const line of commentBlock.trim().split("\n")) {
    const separator = line.indexOf(": ");
    if (separator !== -1) metadata[line.slice(0, separator)] = cleanString(line.slice(separator + 2));
  }
  return metadata;
}

function processVars(content, settings) {
  let result = content;
  for (const variable of settings.variables || []) {
    result = result.replaceAll(`%${variable.name}%`, variable.content);
  }
  if (settings.base_url) result = result.replaceAll("%base_url%", settings.base_url);
  if (settings.image_url) result = result.replaceAll("%image_url%", settings.image_url);
  return result;
}

function normalizeDir(directory) {
  return directory.replaceAll("\\", "/");
}

function getSlug(filename, contentDir) {
  return normalizeDir(filename).replace(normalizeDir(contentDir), "").replace(/\.md$/, "").replace(/^\//, "");
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(["img", "input", "del"]);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
  input: ["type", "checked", "disabled"],
  h1: ["id"], h2: ["id"], h3: ["id"], h4: ["id"], h5: ["id"], h6: ["id"],
  span: ["class"], code: ["class"], pre: ["class"],
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function loadPage(filename, settings) {
  const content = await fs.readFile(filename, "utf8");
  const metadata = processMeta(content);
  const slug = getSlug(filename, settings.content_dir);
  const body = sanitizeHtmlOutput(marked.parse(processVars(stripMeta(content), settings)));
  const title = metadata.title || slugToTitle(slug);
  const text = unescape(sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }));
  const maximumLength = settings.excerpt_length || 400;
  const excerpt = text.length > maximumLength
    ? `${text.slice(0, maximumLength).trimEnd().replace(/\s\S+$/, "")}...`
    : text;
  return { ...metadata, id: filename, title, slug, body, excerpt };
}

const languageLoaders = {
  da: lunrDa, de: lunrDe, es: lunrEs, fi: lunrFi, fr: lunrFr, hu: lunrHu,
  ja: lunrJa, no: lunrNo, pt: lunrPt, ro: lunrRo, ru: lunrRu, sv: lunrSv, tr: lunrTr,
};
let configuredLunr;

function getLunr(settings) {
  if (configuredLunr) return configuredLunr;
  lunrStemmer(lunr);
  lunrMulti(lunr);
  lunrTinyseg(lunr);
  for (const language of settings.searchExtraLanguages || []) languageLoaders[language]?.(lunr);
  configuredLunr = lunr;
  return configuredLunr;
}

function getStemmers(settings) {
  return getLunr(settings).multiLanguage("en", ...(settings.searchExtraLanguages || []));
}

function processSearchResult(result, documents, query, settings) {
  const document = documents.find(({ id }) => id === result.ref);
  if (!document) return null;
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return {
    ...document,
    category: document.slug.split("/").length > 1 ? document.slug.split("/")[0] : "",
    excerpt: document.excerpt.replace(new RegExp(`(${escapedQuery})`, "gim"), '<span class="search-query">$1</span>'),
    score: result.score,
    url: path.join(settings.base_url || "", document.slug),
  };
}

async function handler(request, settings) {
  const query = String(request.query?.q ?? request.query ?? "").trim();
  const files = await glob(path.join(settings.content_dir, "**", "*.md"));
  const documents = await Promise.all(files.map((file) => loadPage(file, settings)));
  const search = getLunr(settings);
  const index = search(function buildIndex() {
    this.use(getStemmers(settings));
    this.field("title", { boost: 10 });
    this.field("body");
    this.ref("id");
    documents.forEach((document) => this.add(document));
  });
  const normalizedQuery = query.replace(/[~*+\-^:]/g, " ").replace(/\s+/g, " ").trim();
  if (!normalizedQuery) return [];
  let results = index.search(normalizedQuery);
  if (!results.length) {
    results = index.search(normalizedQuery.split(" ").map((term) => `${term}~1 OR ${term}*`).join(" OR "));
  }
  return results.map((result) => processSearchResult(result, documents, normalizedQuery, settings)).filter(Boolean);
}

export { handler as default };
