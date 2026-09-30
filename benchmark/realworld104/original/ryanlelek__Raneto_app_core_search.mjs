// ../work/ryanlelek__Raneto/app/functions/contentProcessors.js
import path from "node:path";
import fs from "fs-extra";
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
  return startCase(path.basename(slug).replaceAll(/[-_]/g, " "));
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
    const file = await fs.readFile(filePath, "utf8");
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

// ../work/ryanlelek__Raneto/app/core/utils.js
import path2 from "node:path";
import fs2 from "fs-extra";
import moment from "moment";
var normalizeDir = (dir) => dir.replaceAll("\\", "/");
var getSlug = (filePath, contentDir) => normalizeDir(filePath).replaceAll(normalizeDir(contentDir), "").trim();
async function getLastModified(config, meta, filePath) {
  if (meta.modified !== void 0) {
    return moment(meta.modified).format(config.datetime_format);
  }
  const contentRoot = path2.resolve(config.content_dir);
  const allowedRoots = [contentRoot];
  if (config.theme_dir) {
    allowedRoots.push(path2.resolve(config.theme_dir));
  }
  const isWithinAllowed = (p) => allowedRoots.some((root) => p.startsWith(root + path2.sep) || p === root);
  const resolved = path2.resolve(filePath);
  if (!isWithinAllowed(resolved)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const realPath = await fs2.realpath(resolved);
  if (!isWithinAllowed(realPath)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const { mtime } = await fs2.lstat(realPath);
  return moment(mtime).format(config.datetime_format);
}
var utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
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

// ../work/ryanlelek__Raneto/app/core/lunr.js
import lunr from "lunr";
import lunr_stemmer from "lunr-languages/lunr.stemmer.support.js";
import lunr_multi from "lunr-languages/lunr.multi.js";
import lunr_tinyseg from "lunr-languages/tinyseg.js";
import lunr_da from "lunr-languages/lunr.da.js";
import lunr_de from "lunr-languages/lunr.de.js";
import lunr_es from "lunr-languages/lunr.es.js";
import lunr_fi from "lunr-languages/lunr.fi.js";
import lunr_fr from "lunr-languages/lunr.fr.js";
import lunr_hu from "lunr-languages/lunr.hu.js";
import lunr_ja from "lunr-languages/lunr.ja.js";
import lunr_no from "lunr-languages/lunr.no.js";
import lunr_pt from "lunr-languages/lunr.pt.js";
import lunr_ro from "lunr-languages/lunr.ro.js";
import lunr_ru from "lunr-languages/lunr.ru.js";
import lunr_sv from "lunr-languages/lunr.sv.js";
import lunr_tr from "lunr-languages/lunr.tr.js";
var languageLoaders = {
  da: lunr_da,
  de: lunr_de,
  es: lunr_es,
  fi: lunr_fi,
  fr: lunr_fr,
  hu: lunr_hu,
  ja: lunr_ja,
  no: lunr_no,
  pt: lunr_pt,
  ro: lunr_ro,
  ru: lunr_ru,
  sv: lunr_sv,
  tr: lunr_tr
};
var instance = null;
var stemmers = null;
function getLunr(config) {
  if (instance === null) {
    instance = lunr;
    lunr_stemmer(instance);
    lunr_multi(instance);
    lunr_tinyseg(instance);
    config.searchExtraLanguages.forEach((lang) => {
      if (languageLoaders[lang]) {
        languageLoaders[lang](instance);
      }
    });
  }
  return instance;
}
function getStemmers(config) {
  if (stemmers === null) {
    const languages = ["en"].concat(config.searchExtraLanguages);
    stemmers = getLunr(config).multiLanguage(...languages);
  }
  return stemmers;
}
var lunr_default = {
  getLunr,
  getStemmers
};

// ../work/ryanlelek__Raneto/app/core/search.js
import path4 from "node:path";
import { glob } from "glob";
async function handler2(query, config) {
  const contentDir = utils_default.normalizeDir(path4.normalize(config.content_dir));
  const rawDocuments = await glob(path4.join(contentDir, "**", "*.md"));
  const potentialDocuments = await Promise.all(
    rawDocuments.map(
      (filePath) => contentProcessors_default.extractDocument(contentDir, filePath, config.debug)
    )
  );
  const documents = potentialDocuments.filter((doc) => doc !== null);
  const lunrInstance = lunr_default.getLunr(config);
  const idx = lunrInstance(function() {
    this.use(lunr_default.getStemmers(config));
    this.field("title", { boost: 10 });
    this.field("body");
    this.ref("id");
    documents.forEach((doc) => this.add(doc), this);
  });
  const cleanQuery = query.replaceAll(/[~*+\-^:]/g, " ").replaceAll(/\s+/g, " ").trim();
  if (!cleanQuery) {
    return [];
  }
  let results = idx.search(cleanQuery);
  if (results.length === 0 && cleanQuery.includes(" ")) {
    const orQuery = cleanQuery.split(/\s+/).join(" OR ");
    results = idx.search(orQuery);
  }
  if (results.length === 0 && cleanQuery.length > 2) {
    results = idx.search(`${cleanQuery}~1`);
  }
  if (results.length === 0) {
    results = idx.search(`${cleanQuery}*`);
  }
  if (results.length === 0) {
    const words = cleanQuery.split(/\s+/).filter((word) => word.length > 2);
    const fuzzyQuery = words.map((word) => `${word}~1`).join(" OR ");
    if (fuzzyQuery) {
      results = idx.search(fuzzyQuery);
    }
  }
  const searchResults = await Promise.all(
    results.map(
      (result) => processSearchResult(contentDir, config, query, result)
    )
  );
  return searchResults.filter((result) => result !== null);
}
async function processSearchResult(contentDir, config, query, result) {
  const fullPath = path4.join(contentDir, result.ref);
  const page = await page_default(fullPath, config);
  if (!page) {
    return null;
  }
  const parts = page.slug.split("/");
  page.category = parts.length > 1 ? parts[0] : null;
  if (page.excerpt) {
    const escaped = query.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.excerpt = page.excerpt.replaceAll(
      new RegExp(`(${escaped})`, "gim"),
      '<span class="search-query">$1</span>'
    );
  }
  return page;
}
var search_default = handler2;
export {
  search_default as default
};
