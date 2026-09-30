import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import unescape from 'lodash/unescape.js';
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

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

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
  const filename = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(filename).replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) {
    return content.replace(META_REGEX, '').trim();
  }

  if (META_REGEX_YAML.test(content)) {
    return content.replace(META_REGEX_YAML, '').trim();
  }

  return content.trim();
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const result = {};
    const metadata = content.match(META_REGEX)?.[1]?.trim() ?? '';

    if (metadata) {
      for (const line of metadata.split('\n')) {
        const separator = line.indexOf(': ');
        if (separator <= 0) continue;

        const key = line.substring(0, separator).trim();
        const value = line.substring(separator + 2).trim();
        if (key && value) result[cleanString(key, true)] = value;
      }
    }

    return result;
  }

  if (META_REGEX_YAML.test(content)) {
    const metadata = content.match(META_REGEX_YAML)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadata));
  }

  return {};
}

function processVars(content, options) {
  if (options.variables && Array.isArray(options.variables)) {
    options.variables.forEach(variable => {
      content = content.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.content,
      );
    });
  }

  if (options.base_url !== undefined) {
    content = content.replaceAll('%base_url%', options.base_url);
  }

  if (options.image_url !== undefined) {
    content = content.replaceAll('%image_url%', options.image_url);
  }

  return content;
}

async function extractDocument(rootPath, filePath, debug) {
  try {
    const body = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(body);
    const id = filePath.replaceAll(rootPath, '').trim();
    const title = metadata.title || slugToTitle(id);

    return { id, title, body };
  } catch (error) {
    if (debug) console.log(error);
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

const normalizeDir = directory => directory.replaceAll('\\', '/');

const getSlug = (filePath, contentDirectory) =>
  normalizeDir(filePath).replaceAll(normalizeDir(contentDirectory), '').trim();

async function getLastModified(options, metadata, filePath) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(options.datetime_format);
  }

  const contentDirectory = path.resolve(options.content_dir);
  const allowedDirectories = [contentDirectory];
  if (options.theme_dir) {
    allowedDirectories.push(path.resolve(options.theme_dir));
  }

  const isAllowed = resolvedPath =>
    allowedDirectories.some(
      allowedDirectory =>
        resolvedPath.startsWith(`${allowedDirectory}${path.sep}`) ||
        resolvedPath === allowedDirectory,
    );

  const resolvedPath = path.resolve(filePath);
  if (!isAllowed(resolvedPath)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const realPath = await fs.realpath(resolvedPath);
  if (!isAllowed(realPath)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const { mtime } = await fs.lstat(realPath);
  return moment(mtime).format(options.datetime_format);
}

const utils = {
  normalizeDir,
  getLastModified,
  getSlug,
};

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  'img',
  'input',
  'del',
]);
const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };

allowedAttributes.img = [
  'src',
  'srcset',
  'alt',
  'title',
  'width',
  'height',
  'loading',
];
allowedAttributes.input = ['type', 'checked', 'disabled'];
allowedAttributes.h1 = ['id'];
allowedAttributes.h2 = ['id'];
allowedAttributes.h3 = ['id'];
allowedAttributes.h4 = ['id'];
allowedAttributes.h5 = ['id'];
allowedAttributes.h6 = ['id'];
allowedAttributes.span = ['class'];
allowedAttributes.code = ['class'];
allowedAttributes.pre = ['class'];

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function processPage(filePath, options) {
  const contentDirectory = utils.normalizeDir(path.normalize(options.content_dir));

  try {
    const source = await fs.readFile(filePath, 'utf8');
    let slug = utils.getSlug(filePath, contentDirectory);

    if (slug.includes('index.md')) {
      slug = slug.replaceAll('index.md', '');
    }
    slug = slug.replaceAll('.md', '').trim();

    const metadata = contentProcessors.processMeta(source);
    const markdown = contentProcessors.processVars(
      contentProcessors.stripMeta(source),
      options,
    );
    const body = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title || contentProcessors.slugToTitle(slug);
    const plainText = unescape(
      sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }),
    );

    const excerptLength = options.excerpt_length || 400;
    const excerpt =
      plainText.length > excerptLength
        ? `${plainText
            .slice(0, excerptLength)
            .trimEnd()
            .replace(/\s\S+$/, '')}...`
        : plainText;

    return { slug, title, body, excerpt };
  } catch (error) {
    if (options.debug) console.log(error);
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

function getLunr(options) {
  if (lunrInstance === null) {
    lunrInstance = lunr;
    stemmerSupport(lunrInstance);
    multiLanguage(lunrInstance);
    tinyseg(lunrInstance);

    options.searchExtraLanguages.forEach(language => {
      if (languageLoaders[language]) {
        languageLoaders[language](lunrInstance);
      }
    });
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

const lunrHelpers = { getLunr, getStemmers };

async function processSearchResult(contentDirectory, options, query, result) {
  const filePath = path.join(contentDirectory, result.ref);
  const page = await processPage(filePath, options);
  if (!page) return null;

  const slugParts = page.slug.split('/');
  page.category = slugParts.length > 1 ? slugParts[0] : null;

  if (page.excerpt) {
    const escapedQuery = query.replaceAll(
      /[.*+?^${}()|[\]\\]/g,
      String.raw`\$&`,
    );
    page.excerpt = page.excerpt.replaceAll(
      new RegExp(`(${escapedQuery})`, 'gim'),
      '<span class="search-query">$1</span>',
    );
  }

  return page;
}

async function search(query, options) {
  const contentDirectory = utils.normalizeDir(path.normalize(options.content_dir));
  const files = await glob(path.join(contentDirectory, '**', '*.md'));
  const extractedDocuments = await Promise.all(
    files.map(filePath =>
      contentProcessors.extractDocument(
        contentDirectory,
        filePath,
        options.debug,
      ),
    ),
  );
  const documents = extractedDocuments.filter(document => document !== null);
  const lunrLibrary = lunrHelpers.getLunr(options);
  const index = lunrLibrary(function buildIndex() {
    this.use(lunrHelpers.getStemmers(options));
    this.field('title', { boost: 10 });
    this.field('body');
    this.ref('id');
    documents.forEach(document => this.add(document), this);
  });

  const sanitizedQuery = query
    .replaceAll(/[~*+\-^:]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
  if (!sanitizedQuery) return [];

  let results = index.search(sanitizedQuery);

  if (results.length === 0 && sanitizedQuery.includes(' ')) {
    results = index.search(sanitizedQuery.split(/\s+/).join(' OR '));
  }

  if (results.length === 0 && sanitizedQuery.length > 2) {
    results = index.search(`${sanitizedQuery}~1`);
  }

  if (results.length === 0) {
    results = index.search(`${sanitizedQuery}*`);
  }

  if (results.length === 0) {
    const fuzzyQuery = sanitizedQuery
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => `${term}~1`)
      .join(' OR ');

    if (fuzzyQuery) results = index.search(fuzzyQuery);
  }

  const pages = await Promise.all(
    results.map(result =>
      processSearchResult(contentDirectory, options, query, result),
    ),
  );
  return pages.filter(page => page !== null);
}

export { search as default };
