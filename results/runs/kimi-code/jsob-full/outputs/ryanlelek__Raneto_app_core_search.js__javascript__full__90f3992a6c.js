import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import unescape from 'lodash/unescape.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import lunr from 'lunr';
import stemmerSupport from 'lunr-languages/lunr.stemmer.support.js';
import multiLanguage from 'lunr-languages/lunr.multi.js';
import tinyseg from 'lunr-languages/tinyseg.js';
import loadDanish from 'lunr-languages/lunr.da.js';
import loadGerman from 'lunr-languages/lunr.de.js';
import loadSpanish from 'lunr-languages/lunr.es.js';
import loadFinnish from 'lunr-languages/lunr.fi.js';
import loadFrench from 'lunr-languages/lunr.fr.js';
import loadHungarian from 'lunr-languages/lunr.hu.js';
import loadJapanese from 'lunr-languages/lunr.ja.js';
import loadNorwegian from 'lunr-languages/lunr.no.js';
import loadPortuguese from 'lunr-languages/lunr.pt.js';
import loadRomanian from 'lunr-languages/lunr.ro.js';
import loadRussian from 'lunr-languages/lunr.ru.js';
import loadSwedish from 'lunr-languages/lunr.sv.js';
import loadTurkish from 'lunr-languages/lunr.tr.js';
import { glob } from 'glob';

const COMMENT_META = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  return useSnakeCase ? snakeCase(cleaned) : trim(kebabCase(cleaned), '-');
}

function cleanObjectStrings(object) {
  const result = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      result[cleanString(key, true)] = String(object[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  const withoutExtension = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(withoutExtension).replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (COMMENT_META.test(content)) return content.replace(COMMENT_META, '').trim();
  if (YAML_META.test(content)) return content.replace(YAML_META, '').trim();
  return content.trim();
}

function processMeta(content) {
  if (COMMENT_META.test(content)) {
    const metadata = {};
    const block = content.match(COMMENT_META)?.[1]?.trim() ?? '';
    for (const line of block.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator <= 0) continue;
      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      if (key && value) metadata[cleanString(key, true)] = value;
    }
    return metadata;
  }

  if (YAML_META.test(content)) {
    const block = content.match(YAML_META)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(content, config) {
  if (Array.isArray(config.variables)) {
    for (const variable of config.variables) {
      content = content.replaceAll(new RegExp(`%${variable.name}%`, 'g'), variable.value);
    }
  }
  if (config.base_url !== undefined) content = content.replaceAll('%base_url%', config.base_url);
  if (config.image_url !== undefined) content = content.replaceAll('%image_url%', config.image_url);
  return content;
}

async function extractDocument(contentDirectory, filename, debug) {
  try {
    const content = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(content);
    const id = filename.replaceAll(contentDirectory, '').trim();
    return {
      id,
      title: metadata.title || slugToTitle(id),
      body: content,
    };
  } catch (error) {
    if (debug) console.log(error);
    return null;
  }
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
  input: ['type', 'checked', 'disabled'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  span: ['class'],
  code: ['class'],
  pre: ['class'],
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

function normalizeDirectory(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filename, contentDirectory) {
  return normalizeDirectory(filename).replaceAll(normalizeDirectory(contentDirectory), '').trim();
}

async function loadPage(filename, config) {
  const contentDirectory = normalizeDirectory(path.resolve(config.content_dir));
  try {
    const source = await fs.readFile(filename, 'utf8');
    let slug = getSlug(filename, contentDirectory);
    if (slug.includes('index.md')) slug = slug.replaceAll('index.md', '');
    slug = slug.replaceAll('.md', '').trim();

    const metadata = processMeta(source);
    const markdown = processVars(stripMeta(source), config);
    const html = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title || slugToTitle(slug);
    const text = unescape(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }));
    const excerptLength = config.excerpt_length || 400;
    const excerpt = text.length > excerptLength
      ? `${text.slice(0, excerptLength).trim().replace(/\s\S+$/, '')}...`
      : text;

    return { slug, title, body: html, excerpt };
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
    for (const language of config.searchExtraLanguages) {
      languageLoaders[language]?.(lunrInstance);
    }
  }
  return lunrInstance;
}

function getStemmers(config) {
  if (stemmers === null) {
    stemmers = getLunr(config).multiLanguage('en', ...config.searchExtraLanguages);
  }
  return stemmers;
}

async function processSearchResult(contentDirectory, config, query, result) {
  const page = await loadPage(path.join(contentDirectory, result.ref), config);
  if (!page) return null;

  const slugParts = page.slug.split('/');
  page.category = slugParts.length > 1 ? slugParts[0] : null;

  if (page.body) {
    const escapedQuery = query.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.excerpt = page.excerpt.replaceAll(
      new RegExp(`(${escapedQuery})`, 'gim'),
      '<span class="search-query">$1</span>',
    );
  }
  return page;
}

async function search(query, config) {
  const contentDirectory = normalizeDirectory(path.resolve(config.content_dir));
  const filenames = await glob(path.join(contentDirectory, '**', '*.md'));
  const documents = (await Promise.all(
    filenames.map(filename => extractDocument(contentDirectory, filename, config.debug)),
  )).filter(document => document !== null);

  const lunrApi = getLunr(config);
  const index = lunrApi(function buildIndex() {
    this.use(getStemmers(config));
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('body');
    documents.forEach(document => this.add(document), this);
  });

  const cleanedQuery = query
    .replaceAll(/[~*+\-^:]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
  if (!cleanedQuery) return [];

  let results = index.search(cleanedQuery);
  if (results.length === 0 && cleanedQuery.includes(' ')) {
    results = index.search(cleanedQuery.split(/\s+/).join('~1 '));
  }
  if (results.length === 0 && cleanedQuery.length > 2) {
    results = index.search(`${cleanedQuery}~1`);
  }
  if (results.length === 0) {
    results = index.search(`${cleanedQuery}*`);
  }
  if (results.length === 0) {
    const fuzzyTerms = cleanedQuery
      .split(/\s+/)
      .filter(term => term.length > 1)
      .map(term => `${term}~1`)
      .join(' OR ');
    if (fuzzyTerms) results = index.search(fuzzyTerms);
  }

  const pages = await Promise.all(
    results.map(result => processSearchResult(contentDirectory, config, query, result)),
  );
  return pages.filter(page => page !== null);
}

export { search as default };
