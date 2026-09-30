import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';
import lunr from 'lunr';
import lunrStemmerSupport from 'lunr-languages/lunr.stemmer.support.js';
import lunrMulti from 'lunr-languages/lunr.multi.js';
import tinyseg from 'lunr-languages/tinyseg.js';
import lunrDa from 'lunr-languages/lunr.da.js';
import lunrDe from 'lunr-languages/lunr.de.js';
import lunrEs from 'lunr-languages/lunr.es.js';
import lunrFi from 'lunr-languages/lunr.fi.js';
import lunrFr from 'lunr-languages/lunr.fr.js';
import lunrHu from 'lunr-languages/lunr.hu.js';
import lunrJa from 'lunr-languages/lunr.ja.js';
import lunrNo from 'lunr-languages/lunr.no.js';
import lunrPt from 'lunr-languages/lunr.pt.js';
import lunrRo from 'lunr-languages/lunr.ro.js';
import lunrRu from 'lunr-languages/lunr.ru.js';
import lunrSv from 'lunr-languages/lunr.sv.js';
import lunrTr from 'lunr-languages/lunr.tr.js';
import moment from 'moment';
import { glob } from 'glob';

var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  value = value.replaceAll('/', ' ').trim();
  if (useSnakeCase) {
    return snakeCase(value);
  }
  return trim(kebabCase(value), '-');
}

function cleanObjectStrings(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  slug = slug.replaceAll('-', '').trim();
  return startCase(path.basename(slug).replaceAll(/[-_]/g, ' '));
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
    const match = content.match(META_REGEX);
    const meta = match?.[1]?.trim() ?? '';
    if (meta) {
      const lines = meta.split('\n');
      for (const line of lines) {
        const separatorIndex = line.indexOf(': ');
        if (separatorIndex === -1) continue;
        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 2).trim();
        if (key && value) {
          result[cleanString(key, true)] = value;
        }
      }
    }
    return result;
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const meta = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(meta);
    return cleanObjectStrings(parsed);
  }
  return {};
}

function processVars(content, vars) {
  if (vars.variables && Array.isArray(vars.variables)) {
    vars.variables.forEach(variable => {
      content = content.replaceAll(new RegExp('%' + variable.name + '%', 'g'), variable.value);
    });
  }
  if (vars.title !== undefined) {
    content = content.replaceAll('%title%', vars.title);
  }
  if (vars.slug !== undefined) {
    content = content.replaceAll('%slug%', vars.slug);
  }
  return content;
}

async function extractDocument(root, filePath, debug = false) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const meta = processMeta(content);
    const slug = filePath.replaceAll(root, '').trim();
    const title = meta.title ? meta.title : slugToTitle(slug);
    const body = content;
    const result = {};
    result.id = slug;
    result.title = title;
    result.body = body;
    return result;
  } catch (error) {
    if (debug) {
      console.error(error);
    }
    return null;
  }
}

const contentProcessors = {};
contentProcessors.cleanString = cleanString;
contentProcessors.cleanObjectStrings = cleanObjectStrings;
contentProcessors.extractDocument = extractDocument;
contentProcessors.slugToTitle = slugToTitle;
contentProcessors.stripMeta = stripMeta;
contentProcessors.processMeta = processMeta;
contentProcessors.processVars = processVars;
var contentProcessors_default = contentProcessors;

var normalizeDir = dir => dir.replaceAll('\\', '/');
var getSlug = (root, filePath) => normalizeDir(filePath).replaceAll(normalizeDir(root), '').trim();

async function getLastModified(root, options, filePath) {
  if (options.date !== undefined) {
    return moment(options.date).format(root.dateFormat);
  }
  const rootDir = path.dirname(root.root);
  const searchDirs = [rootDir];
  if (root.parent) {
    searchDirs.push(path.dirname(root.parent));
  }
  const isAllowed = file => searchDirs.some(dir => file.startsWith(dir + path.sep) || file === dir);
  const resolvedPath = path.resolve(filePath);
  if (!isAllowed(resolvedPath)) {
    throw new Error('File is outside of the allowed directories');
  }
  const stat = await fs.stat(resolvedPath);
  if (!isAllowed(stat)) {
    throw new Error('File is outside of the allowed directories');
  }
  const { mtime } = await fs.stat(resolvedPath);
  return moment(mtime).format(root.dateFormat);
}

const utils = {};
utils.normalizeDir = normalizeDir;
utils.getLastModified = getLastModified;
utils.getSlug = getSlug;
var utils_default = utils;

var allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'iframe']);
const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };
allowedAttributes.a = ['href', 'name', 'target', 'rel', 'download', 'class'];
allowedAttributes.img = ['src', 'alt', 'title'];
allowedAttributes.h1 = ['id'];
allowedAttributes.h2 = ['id'];
allowedAttributes.h3 = ['id'];
allowedAttributes.h4 = ['id'];
allowedAttributes.h5 = ['id'];
allowedAttributes.h6 = ['id'];
allowedAttributes.iframe = ['src'];
allowedAttributes.video = ['src'];
allowedAttributes.code = ['class'];

function sanitizeHtmlOutput(html) {
  const options = {};
  options.allowedTags = allowedTags;
  options.allowedAttributes = allowedAttributes;
  return sanitizeHtml(html, options);
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

async function handler(filePath, options) {
  const root = utils_default.normalizeDir(path.dirname(options.contentDir));
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let slug = utils_default.getSlug(filePath, root);
    if (slug.startsWith('/')) {
      slug = slug.replaceAll('/', '');
    }
    slug = slug.replaceAll('\\', '').trim();
    const meta = contentProcessors_default.processMeta(content);
    const body = contentProcessors_default.processVars(contentProcessors_default.stripMeta(content), options);
    const html = sanitizeHtmlOutput_default(marked(body));
    const title = meta.title ? meta.title : contentProcessors_default.slugToTitle(slug);
    const result = {};
    result.toc = [];
    result.attributes = {};
    const excerpt = sanitizeHtml(html, result);
    const excerptLength = options.excerptLength || 140;
    const excerptText = excerpt.length > excerptLength ? excerpt.substring(0, excerptLength).trim().replace(/\s\S+$/, '') : excerpt;
    const output = {};
    output.slug = slug;
    output.title = title;
    output.html = html;
    output.excerpt = excerptText;
    return output;
  } catch (error) {
    if (options.debug) {
      console.error(error);
    }
    return null;
  }
}

var page_default = handler;

const languageLoaders = {};
languageLoaders.da = lunrDa;
languageLoaders.de = lunrDe;
languageLoaders.es = lunrEs;
languageLoaders.fi = lunrFi;
languageLoaders.fr = lunrFr;
languageLoaders.hu = lunrHu;
languageLoaders.ja = lunrJa;
languageLoaders.no = lunrNo;
languageLoaders.pt = lunrPt;
languageLoaders.ro = lunrRo;
languageLoaders.ru = lunrRu;
languageLoaders.sv = lunrSv;
languageLoaders.tr = lunrTr;

var instance = null;
var stemmers = null;

function getLunr(options) {
  if (instance === null) {
    instance = lunr;
    lunrStemmerSupport(instance);
    lunrMulti(instance);
    tinyseg(instance);
    options.languages.forEach(language => {
      if (languageLoaders[language]) {
        languageLoaders[language](instance);
      }
    });
  }
  return instance;
}

function getStemmers(options) {
  if (stemmers === null) {
    const languages = ['en'].concat(options.languages);
    stemmers = getLunr(options).stemmer(...languages);
  }
  return stemmers;
}

const lunrExports = {};
lunrExports.getLunr = getLunr;
lunrExports.getStemmers = getStemmers;
var lunr_default = lunrExports;

async function handler2(query, options) {
  const root = utils_default.normalizeDir(path.dirname(options.contentDir));
  const files = await glob(path.join(root, '**', '*.md'));
  const documents = await Promise.all(files.map(file => contentProcessors_default.extractDocument(root, file, options.debug)));
  const validDocuments = documents.filter(doc => doc !== null);
  const idx = lunr_default.getLunr(options);
  const index = idx(function() {
    this.ref('id');
    this.field('title');
    this.field('body');
    this.field('excerpt');
    validDocuments.forEach(doc => this.add(doc), this);
    this.use(lunr_default.getStemmers(options));
  });
  let searchQuery = query.replaceAll(/[~*+\-^:]/g, ' ').replaceAll(/\s+/g, ' ').trim();
  if (!searchQuery) {
    return [];
  }
  let results = index.search(searchQuery);
  if (results.length === 0 && searchQuery.includes(' ')) {
    const terms = searchQuery.split(/\s+/).filter(term => term.length > 0);
    results = index.query(terms);
  }
  if (results.length === 0 && searchQuery.length > 2) {
    results = index.search(searchQuery + '~1');
  }
  if (results.length === 0) {
    const terms = searchQuery.split(/\s+/).filter(term => term.length > 2);
    const fuzzyTerms = terms.map(term => term + '~1').join(' ');
    if (fuzzyTerms) {
      results = index.search(fuzzyTerms);
    }
  }
  const processed = await Promise.all(results.map(result => processSearchResult(root, options, query, result)));
  return processed.filter(result => result !== null);
}

async function processSearchResult(root, options, query, result) {
  const filePath = path.join(root, result.ref);
  const page = await page_default(filePath, options);
  if (!page) {
    return null;
  }
  const parts = page.slug.split('/');
  page.category = parts.length > 1 ? parts[0] : null;
  if (page.excerpt) {
    const escapedQuery = query.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.excerpt = page.excerpt.replaceAll(new RegExp('(' + escapedQuery + ')', 'gi'), '<mark>$1</mark>');
  }
  return page;
}

var search_default = handler2;

export { search_default as default };
