import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import unescape from 'lodash/unescape.js';
import yaml from 'js-yaml';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import lunr from 'lunr';
import addStemmerSupport from 'lunr-languages/lunr.stemmer.support.js';
import addMultiLanguage from 'lunr-languages/lunr.multi.js';
import addTinyseg from 'lunr-languages/tinyseg.js';
import addDanish from 'lunr-languages/lunr.da.js';
import addGerman from 'lunr-languages/lunr.de.js';
import addSpanish from 'lunr-languages/lunr.es.js';
import addFinnish from 'lunr-languages/lunr.fi.js';
import addFrench from 'lunr-languages/lunr.fr.js';
import addHungarian from 'lunr-languages/lunr.hu.js';
import addJapanese from 'lunr-languages/lunr.ja.js';
import addNorwegian from 'lunr-languages/lunr.no.js';
import addPortuguese from 'lunr-languages/lunr.pt.js';
import addRomanian from 'lunr-languages/lunr.ro.js';
import addRussian from 'lunr-languages/lunr.ru.js';
import addSwedish from 'lunr-languages/lunr.sv.js';
import addTurkish from 'lunr-languages/lunr.tr.js';
import { glob } from 'glob';

const COMMENT_META = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, asKey = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  return asKey ? snakeCase(cleaned) : trim(kebabCase(cleaned), '-');
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
  const withoutExtension = slug.replaceAll('.md', '').toLowerCase();
  return startCase(path.basename(withoutExtension).replaceAll(/[-_]/g, ' '));
}

function stripMeta(source) {
  if (COMMENT_META.test(source)) return source.replace(COMMENT_META, '').trim();
  if (YAML_META.test(source)) return source.replace(YAML_META, '').trim();
  return source.trim();
}

function processMeta(source) {
  if (COMMENT_META.test(source)) {
    const metadata = {};
    const block = source.match(COMMENT_META)?.[1]?.trim() ?? '';
    if (!block) return metadata;

    for (const line of block.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator === -1) continue;
      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      if (key && value) metadata[cleanString(key, true)] = value;
    }
    return metadata;
  }

  if (YAML_META.test(source)) {
    const block = source.match(YAML_META)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(source, options) {
  if (Array.isArray(options.variables)) {
    for (const variable of options.variables) {
      source = source.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.value,
      );
    }
  }
  if (options.base_url !== undefined) {
    source = source.replaceAll('%base_url%', options.base_url);
  }
  if (options.image_url !== undefined) {
    source = source.replaceAll('%image_url%', options.image_url);
  }
  return source;
}

async function extractDocument(baseDirectory, filename, debug) {
  try {
    const source = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(source);
    const id = filename.replaceAll(baseDirectory, '').trim();
    return {
      id,
      title: metadata.title || slugToTitle(id),
      content: source,
    };
  } catch (error) {
    if (debug) console.error(error);
    return null;
  }
}

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filename, baseDirectory) {
  return normalizeDir(filename).replaceAll(normalizeDir(baseDirectory), '').trim();
}

async function getLastModified(options, metadata, filename) {
  if (metadata.updated !== undefined) {
    return moment(metadata.updated).format(options.lastModifiedFormat);
  }

  const allowedDirectories = [path.resolve(options.contentDir)];
  if (options.rootDir) allowedDirectories.push(path.resolve(options.rootDir));
  const isAllowed = (candidate) => allowedDirectories.some(
    (directory) => candidate.startsWith(`${directory}${path.sep}`) || candidate === directory,
  );

  const requestedPath = path.resolve(filename);
  if (!isAllowed(requestedPath)) {
    throw new Error('File path is outside allowed directories');
  }
  const realPath = await fs.realpath(requestedPath);
  if (!isAllowed(realPath)) {
    throw new Error('File path is outside allowed directories');
  }

  const { mtime } = await fs.stat(realPath);
  return moment(mtime).format(options.lastModifiedFormat);
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ['alt', 'src', 'srcset', 'title', 'width', 'height', 'loading'],
  input: ['type', 'checked', 'disabled'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  code: ['class'],
  a: ['href'],
  span: ['class'],
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function readPage(filename, options) {
  const contentDirectory = normalizeDir(path.dirname(options.content_dir));

  try {
    const source = await fs.readFile(filename, 'utf8');
    let slug = getSlug(filename, contentDirectory);
    if (slug.endsWith('index.md')) slug = slug.replaceAll('index.md', '');
    slug = slug.replaceAll('.md', '').trim();

    const metadata = processMeta(source);
    const markdown = processVars(stripMeta(source), options);
    const content = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title || slugToTitle(slug);
    const plainText = unescape(sanitizeHtml(content, {
      allowedTags: [],
      allowedAttributes: {},
    }));
    const maximumLength = options.excerpt_length || 1000;
    const excerpt = plainText.length > maximumLength
      ? `${plainText.slice(0, maximumLength).trimEnd().replace(/\s\S+$/, '')}...`
      : plainText;

    return { slug, title, content, excerpt };
  } catch (error) {
    if (options.debug) console.error(error);
    return null;
  }
}

const languageLoaders = {
  da: addDanish,
  de: addGerman,
  es: addSpanish,
  fi: addFinnish,
  fr: addFrench,
  hu: addHungarian,
  ja: addJapanese,
  no: addNorwegian,
  pt: addPortuguese,
  ro: addRomanian,
  ru: addRussian,
  sv: addSwedish,
  tr: addTurkish,
};

let lunrInstance = null;
let stemmers = null;

function getLunr(options) {
  if (lunrInstance === null) {
    lunrInstance = lunr;
    addStemmerSupport(lunrInstance);
    addMultiLanguage(lunrInstance);
    addTinyseg(lunrInstance);
    for (const language of options.searchExtraLanguages) {
      if (languageLoaders[language]) languageLoaders[language](lunrInstance);
    }
  }
  return lunrInstance;
}

function getStemmers(options) {
  if (stemmers === null) {
    const languages = ['en'].concat(options.searchExtraLanguages);
    stemmers = getLunr(options).multiLanguage(...languages);
  }
  return stemmers;
}

async function processSearchResult(contentDirectory, options, query, result) {
  const page = await readPage(path.join(contentDirectory, result.ref), options);
  if (!page) return null;

  const slugParts = page.slug.split('/');
  page.category = slugParts.length > 1 ? slugParts[0] : null;

  if (page.excerpt) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.excerpt = page.excerpt.replaceAll(
      new RegExp(`(${escapedQuery})`, 'gim'),
      '<span class="search-query">$1</span>',
    );
  }
  return page;
}

export default async function search(query, options) {
  const contentDirectory = normalizeDir(path.dirname(options.content_dir));
  const filenames = await glob(path.join(contentDirectory, '**', '*.md'));
  const documents = (await Promise.all(
    filenames.map((filename) => extractDocument(contentDirectory, filename, options.debug)),
  )).filter((document) => document !== null);

  const lunrApi = getLunr(options);
  const index = lunrApi(function buildIndex() {
    this.ref('id');
    this.field('title', { boost: 10 });
    this.field('content');
    this.use(getStemmers(options));
    documents.forEach((document) => this.add(document), this);
  });

  const cleanedQuery = query
    .replaceAll(/[~*+\-^:]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
  if (!cleanedQuery) return [];

  let results = index.search(cleanedQuery);
  if (results.length === 0 && cleanedQuery.includes(' ')) {
    results = index.search(cleanedQuery.split(/\s+/).join(' OR '));
  }
  if (results.length === 0 && cleanedQuery.length > 2) {
    results = index.search(`${cleanedQuery}~1`);
  }
  if (results.length === 0) results = index.search(`${cleanedQuery}*`);
  if (results.length === 0) {
    const fuzzyTerms = cleanedQuery
      .split(/\s+/)
      .filter((term) => term.length > 2)
      .map((term) => `${term}~1`)
      .join(' OR ');
    if (fuzzyTerms) results = index.search(fuzzyTerms);
  }

  return (await Promise.all(
    results.map((result) => processSearchResult(contentDirectory, options, query, result)),
  )).filter((result) => result !== null);
}
