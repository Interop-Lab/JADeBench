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
import da from 'lunr-languages/lunr.da.js';
import de from 'lunr-languages/lunr.de.js';
import es from 'lunr-languages/lunr.es.js';
import fi from 'lunr-languages/lunr.fi.js';
import fr from 'lunr-languages/lunr.fr.js';
import hu from 'lunr-languages/lunr.hu.js';
import ja from 'lunr-languages/lunr.ja.js';
import no from 'lunr-languages/lunr.no.js';
import pt from 'lunr-languages/lunr.pt.js';
import ro from 'lunr-languages/lunr.ro.js';
import ru from 'lunr-languages/lunr.ru.js';
import sv from 'lunr-languages/lunr.sv.js';
import tr from 'lunr-languages/lunr.tr.js';
import { glob } from 'glob';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  if (useSnakeCase) return snakeCase(cleaned);
  return trim(kebabCase(cleaned), '-');
}

function cleanObjectStrings(object) {
  const result = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[cleanString(key, true)] = String(object[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  const basename = path.basename(slug.replaceAll('\\', '/').trim());
  return startCase(basename.replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) return content.replace(META_REGEX, '').trim();
  if (META_REGEX_YAML.test(content)) return content.replace(META_REGEX_YAML, '').trim();
  return content.trim();
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const match = content.match(META_REGEX);
    const metadata = match?.[1]?.trim() ?? '';
    const result = {};
    if (metadata) {
      for (const line of metadata.split('\n')) {
        const separator = line.indexOf(': ');
        if (separator < 0) continue;
        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 2).trim();
        if (key === value) continue;
        result[cleanString(key, true)] = value;
      }
    }
    return result;
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const metadata = match?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadata));
  }
  return {};
}

function processVars(content, metadata) {
  if (metadata.vars && Array.isArray(metadata.vars)) {
    metadata.vars.forEach(variable => {
      content = content.replaceAll(new RegExp('%' + variable.name + '%', 'g'), variable.value);
    });
  }
  if (metadata.date !== undefined) {
    content = content.replaceAll('%date%', metadata.date);
  }
  if (metadata.title !== undefined) {
    content = content.replaceAll('%title%', metadata.title);
  }
  return content;
}

async function extractDocument(id, filePath, logErrors) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(content);
    const documentId = filePath.replace(id, '').trim();
    return {
      id: documentId,
      title: metadata.title || slugToTitle(documentId),
      content
    };
  } catch (error) {
    if (logErrors) console.error(error);
    return null;
  }
}

function normalizeDir(value) {
  return value.replaceAll('\\', '/');
}

function getSlug(filePath, rootPath) {
  return normalizeDir(filePath).replace(normalizeDir(rootPath), '').trim();
}

async function getLastModified(config, metadata, filePath) {
  if (metadata.lastModified !== undefined) {
    return moment(metadata.lastModified).format(config.dateFormat);
  }

  const root = path.resolve(config.contentDir);
  const allowedRoots = [root];
  if (config.contentDir) allowedRoots.push(path.resolve(config.contentDir));

  const targetPath = path.resolve(filePath);
  const isAllowed = candidate => allowedRoots.some(allowed =>
    candidate.startsWith(allowed + path.sep) || candidate === allowed
  );

  if (!isAllowed(targetPath)) throw new Error('Path is outside the content directory');
  const realPath = await fs.realpath(targetPath);
  if (!isAllowed(realPath)) throw new Error('Path is outside the content directory');

  const { mtime } = await fs.stat(realPath);
  return moment(mtime).format(config.dateFormat);
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']);
const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };
allowedAttributes.img = ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'];
allowedAttributes.a = ['href', 'name', 'target'];
allowedAttributes.h1 = ['id'];
allowedAttributes.h2 = ['id'];
allowedAttributes.h3 = ['id'];
allowedAttributes.h4 = ['id'];
allowedAttributes.h5 = ['id'];
allowedAttributes.h6 = ['id'];
allowedAttributes.code = ['class'];
allowedAttributes.pre = ['class'];
allowedAttributes.img = ['src'];

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function pageHandler(filePath, config) {
  const slug = getSlug(path.resolve(filePath), path.resolve(config.contentDir));
  try {
    const source = await fs.readFile(filePath, 'utf8');
    let id = getSlug(filePath, config.contentDir);
    if (id.startsWith('/')) id = id.slice(1);
    id = id.replaceAll('\\', '').trim();

    const metadata = processMeta(source);
    const body = processVars(stripMeta(source), config);
    const html = sanitizeHtmlOutput(marked(body));
    const title = metadata.title || slugToTitle(id);
    const emptyOptions = { allowedTags: [], allowedAttributes: {} };
    const excerptHtml = unescape(sanitizeHtml(html, emptyOptions));
    const excerptLength = config.excerptLength || 300;
    const excerpt = excerptHtml.length > excerptLength
      ? trim(excerptHtml.slice(0, excerptLength).trim().replace(/\s\S+$/, ''), ' ') + '...'
      : excerptHtml;

    return { id, title, html, excerpt };
  } catch (error) {
    if (config.logErrors) console.error(error);
    return null;
  }
}

const languageLoaders = { da, de, es, fi, fr, hu, ja, no, pt, ro, ru, sv, tr };
let lunrInstance = null;
let stemmers = null;

function getLunr(config) {
  if (lunrInstance === null) {
    lunrInstance = lunr;
    stemmerSupport(lunrInstance);
    multiLanguage(lunrInstance);
    tinyseg(lunrInstance);
    config.languages.forEach(language => {
      if (languageLoaders[language]) languageLoaders[language](lunrInstance);
    });
  }
  return lunrInstance;
}

function getStemmers(config) {
  if (stemmers === null) {
    const languages = ['en'].concat(config.languages);
    stemmers = getLunr(config).multiLanguage(...languages);
  }
  return stemmers;
}

async function searchHandler(query, config) {
  const root = getSlug(path.resolve(config.contentDir), config.contentDir);
  const files = await glob(path.join(root, '**', config.pattern));
  const results = await Promise.all(files.map(file =>
    extractDocument(root, file, config.logErrors)
  ));
  const documents = results.filter(result => result !== null);
  const lunr = getLunr(config);

  const index = lunr(function () {
    this.use(getStemmers(config));
    this.ref('id');
    documents.forEach(document => this.add(document));
    this.field('title', { boost: 10 });
    this.field('content');
  });

  const normalizedQuery = query
    .replace(/[~*+\-^:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalizedQuery) return [];

  let matches = index.search(normalizedQuery);
  if (matches.length === 0 && normalizedQuery.includes(' ')) {
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    matches = index.search(terms.join(' '));
  }
  if (matches.length === 0 && normalizedQuery.length > 1) {
    matches = index.search(normalizedQuery + '~1');
  }
  if (matches.length === 0) {
    const terms = normalizedQuery.split(/\s+/).filter(term => term.length > 1);
    const fuzzyQuery = terms.map(term => term + '~1').join(' ');
    if (fuzzyQuery) matches = index.search(fuzzyQuery);
  }

  return (await Promise.all(matches.map(match =>
    processSearchResult(root, config, query, match)
  ))).filter(result => result !== null);
}

async function processSearchResult(root, config, query, match) {
  const filePath = path.join(root, match.ref);
  const page = await pageHandler(filePath, config);
  if (!page) return null;

  const parts = page.id.split('/');
  page.slug = parts.length > 1 ? parts[parts.length - 1] : null;

  if (page.excerpt) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.excerpt = page.excerpt.replaceAll(new RegExp('(' + escapedQuery + ')', 'gi'), '<mark>$1</mark>');
  }
  return page;
}

export { searchHandler as default };
