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
import registerStemmerSupport from "lunr-languages/lunr.stemmer.support.js";
import registerMultiLanguage from "lunr-languages/lunr.multi.js";
import registerTinySeg from "lunr-languages/tinyseg.js";
import registerDanish from "lunr-languages/lunr.da.js";
import registerGerman from "lunr-languages/lunr.de.js";
import registerSpanish from "lunr-languages/lunr.es.js";
import registerFinnish from "lunr-languages/lunr.fi.js";
import registerFrench from "lunr-languages/lunr.fr.js";
import registerHungarian from "lunr-languages/lunr.hu.js";
import registerJapanese from "lunr-languages/lunr.ja.js";
import registerNorwegian from "lunr-languages/lunr.no.js";
import registerPortuguese from "lunr-languages/lunr.pt.js";
import registerRomanian from "lunr-languages/lunr.ro.js";
import registerRussian from "lunr-languages/lunr.ru.js";
import registerSwedish from "lunr-languages/lunr.sv.js";
import registerTurkish from "lunr-languages/lunr.tr.js";
import { glob } from "glob";

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  value = value.replaceAll("/", " ").trim();

  if (useSnakeCase) {
    return snakeCase(value);
  }

  return trim(kebabCase(value), "-");
}

function cleanObjectStrings(value) {
  const cleaned = {};

  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      cleaned[cleanString(key, true)] = ("" + value[key]).trim();
    }
  }

  return cleaned;
}

function slugToTitle(slug) {
  slug = slug.replaceAll(".md", "").trim();
  return startCase(path.basename(slug).replaceAll(/[-_]/g, " "));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) {
    return content.replace(META_REGEX, "").trim();
  }

  if (META_REGEX_YAML.test(content)) {
    return content.replace(META_REGEX_YAML, "").trim();
  }

  return content.trim();
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const metadata = {};
    const metadataBlock = content.match(META_REGEX)?.[1]?.trim() ?? "";

    if (metadataBlock) {
      for (const line of metadataBlock.split("\n")) {
        const separatorIndex = line.indexOf(": ");
        if (separatorIndex <= 0) {
          continue;
        }

        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 2).trim();
        if (key && value) {
          metadata[cleanString(key, true)] = value;
        }
      }
    }

    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const metadataBlock = content.match(META_REGEX_YAML)?.[1]?.trim() ?? "";
    return cleanObjectStrings(yaml.load(metadataBlock));
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

async function extractDocument(contentDirectory, filename, debug) {
  try {
    const content = await fs.readFile(filename, "utf8");
    const metadata = processMeta(content);
    const id = filename.replaceAll(contentDirectory, "").trim();
    const title = metadata.title || slugToTitle(id);

    return { id, title, body: content };
  } catch (error) {
    if (debug) {
      console.log(error);
    }
    return null;
  }
}

const contentProcessors = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

const normalizeDir = (directory) => directory.replaceAll("\\", "/");

const getSlug = (filename, contentDirectory) =>
  normalizeDir(filename).replaceAll(normalizeDir(contentDirectory), "").trim();

async function getLastModified(config, metadata, filename) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(config.datetime_format);
  }

  const allowedDirectories = [path.resolve(config.content_dir)];
  if (config.theme_dir) {
    allowedDirectories.push(path.resolve(config.theme_dir));
  }

  const isWithinAllowedDirectory = (candidatePath) =>
    allowedDirectories.some(
      (allowedDirectory) =>
        candidatePath.startsWith(allowedDirectory + path.sep) ||
        allowedDirectory === candidatePath,
    );

  const resolvedFilename = path.resolve(filename);
  if (!isWithinAllowedDirectory(resolvedFilename)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }

  const realFilename = await fs.realpath(resolvedFilename);
  if (!isWithinAllowedDirectory(realFilename)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }

  const { mtime } = await fs.lstat(realFilename);
  return moment(mtime).format(config.datetime_format);
}

const utils = { normalizeDir, getLastModified, getSlug };

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

function sanitizeHtmlOutput(content) {
  return sanitizeHtml(content, { allowedTags, allowedAttributes });
}

async function loadPage(filename, config) {
  const normalizedContentDirectory = utils.normalizeDir(
    path.normalize(config.content_dir),
  );

  try {
    const source = await fs.readFile(filename, "utf8");
    let slug = utils.getSlug(filename, normalizedContentDirectory);
    if (slug.includes("index.md")) {
      slug = slug.replaceAll("index.md", "");
    }
    slug = slug.replaceAll(".md", "").trim();

    const metadata = contentProcessors.processMeta(source);
    const markdown = contentProcessors.processVars(
      contentProcessors.stripMeta(source),
      config,
    );
    const body = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title || contentProcessors.slugToTitle(slug);
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
    if (config.debug) {
      console.log(error);
    }
    return null;
  }
}

const languageLoaders = {
  da: registerDanish,
  de: registerGerman,
  es: registerSpanish,
  fi: registerFinnish,
  fr: registerFrench,
  hu: registerHungarian,
  ja: registerJapanese,
  no: registerNorwegian,
  pt: registerPortuguese,
  ro: registerRomanian,
  ru: registerRussian,
  sv: registerSwedish,
  tr: registerTurkish,
};

let lunrInstance = null;
let stemmers = null;

function getLunr(config) {
  if (lunrInstance === null) {
    lunrInstance = lunr;
    registerStemmerSupport(lunrInstance);
    registerMultiLanguage(lunrInstance);
    registerTinySeg(lunrInstance);

    config.searchExtraLanguages.forEach((language) => {
      if (languageLoaders[language]) {
        languageLoaders[language](lunrInstance);
      }
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

const lunrUtilities = { getLunr, getStemmers };

async function searchHandler(query, config) {
  const normalizedContentDirectory = utils.normalizeDir(
    path.normalize(config.content_dir),
  );
  const filenames = await glob(
    path.join(normalizedContentDirectory, "**", "*.md"),
  );
  const documents = (
    await Promise.all(
      filenames.map((filename) =>
        contentProcessors.extractDocument(
          normalizedContentDirectory,
          filename,
          config.debug,
        ),
      ),
    )
  ).filter((document) => document !== null);

  const lunrSearch = lunrUtilities.getLunr(config);
  const index = lunrSearch(function buildIndex() {
    this.use(lunrUtilities.getStemmers(config));
    this.field("title", { boost: 10 });
    this.field("body");
    this.ref("id");
    documents.forEach((document) => this.add(document), this);
  });

  const normalizedQuery = query
    .replaceAll(/[~*+\-^:]/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim();

  if (!normalizedQuery) {
    return [];
  }

  let results = index.search(normalizedQuery);

  if (results.length === 0 && normalizedQuery.includes(" ")) {
    const anyTermQuery = normalizedQuery.split(/\s+/).join(" OR ");
    results = index.search(anyTermQuery);
  }

  if (results.length === 0 && normalizedQuery.length > 2) {
    results = index.search(`${normalizedQuery}~1`);
  }

  if (results.length === 0) {
    results = index.search(`${normalizedQuery}*`);
  }

  if (results.length === 0) {
    const longTermsQuery = normalizedQuery
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .map((term) => `${term}~1`)
      .join(" OR ");

    if (longTermsQuery) {
      results = index.search(longTermsQuery);
    }
  }

  return (
    await Promise.all(
      results.map((result) =>
        processSearchResult(
          normalizedContentDirectory,
          config,
          normalizedQuery,
          result,
        ),
      ),
    )
  ).filter((result) => result !== null);
}

async function processSearchResult(contentDirectory, config, query, result) {
  const filename = path.join(contentDirectory, result.ref);
  const page = await loadPage(filename, config);

  if (!page) {
    return null;
  }

  const slugSegments = page.slug.split("/");
  page.category = slugSegments.length > 1 ? slugSegments[0] : null;

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

export { searchHandler as default };
