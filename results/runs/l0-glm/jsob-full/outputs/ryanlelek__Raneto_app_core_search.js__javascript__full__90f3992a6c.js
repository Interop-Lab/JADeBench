import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i,
    META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str, snake = false) {
  str = str.replaceAll('/', ' ').trim();
  if (snake) return snakeCase(str);
  return trim(kebabCase(str), '-');
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
  slug = slug.replaceAll('-', '').toLowerCase();
  return startCase(path.basename(slug).replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content))
    return content.replace(META_REGEX, '').trim();
  if (META_REGEX_YAML.test(content))
    return content.replace(META_REGEX_YAML, '').trim();
  return content.trim();
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const meta = {},
      match = content.match(META_REGEX),
      metaContent = match?.[1]?.trim() ?? '';
    if (metaContent) {
      const lines = metaContent.split('\n');
      for (const line of lines) {
        const idx = line.indexOf(': ');
        if (idx === -1) continue;
        const key = line.slice(0, idx).trim(),
          val = line.slice(idx + 2).trim();
        key && val && (meta[cleanString(key, true)] = val);
      }
    }
    return meta;
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML),
      yamlContent = match?.[1]?.trim() ?? '',
      parsed = yaml.load(yamlContent);
    return cleanObjectStrings(parsed);
  }
  return {};
}

function processVars(content, vars) {
  if (vars.vars && Array.isArray(vars.vars)) {
    vars.vars.forEach(v => {
      content = content.replaceAll(new RegExp('%' + v.name + '%', 'g'), v.value);
    });
  }
  if (vars.title !== undefined) {
    content = content.replaceAll('%title%', vars.title);
  }
  if (vars.url !== undefined) {
    content = content.replaceAll('%url%', vars.url);
  }
  return content;
}

async function extractDocument(basePath, filePath, options) {
  try {
    const content = await fs.readFile(filePath, 'utf8'),
      meta = processMeta(content),
      slug = filePath.replaceAll(basePath, '').toLowerCase(),
      title = meta.title ? meta.title : slugToTitle(slug),
      body = content;
    return { id: slug, title, body };
  } catch (err) {
    if (options) console.error(err);
    return null;
  }
}

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

import path2 from 'node:path';
import fs2 from 'fs-extra';
import moment from 'moment';

var normalizeDir = dir => dir.replaceAll('\\', '/'),
    getSlug = (basePath, filePath) => normalizeDir(basePath).replaceAll(normalizeDir(filePath), '').toLowerCase();

async function getLastModified(config, file, searchPath) {
  if (file.mtime !== undefined)
    return moment(file.mtime).format(config.dateFormat);
  const baseDir = path2.dirname(config.contentDir),
    searchDirs = [baseDir];
  config.searchDir && searchDirs.push(path2.dirname(config.searchDir));
  const isAllowed = dir => searchDirs.some(allowed => dir.startsWith(allowed + path2.sep) || dir === allowed),
    resolved = path2.resolve(searchPath);
  if (!isAllowed(resolved)) throw new Error('Search path is not allowed');
  const stat = await fs2.stat(resolved);
  if (!isAllowed(stat)) throw new Error('Search path is not allowed');
  const { mtime } = await fs2.stat(resolved);
  return moment(mtime).format(config.dateFormat);
}

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

import sanitizeHtml from 'sanitize-html';

var allowedTags = sanitizeHtml.defaults.allowedTags.concat(['iframe', 'style', 'script']);
const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };
allowedAttributes['*'] = ['class', 'id', 'style', 'dir', 'title', 'lang', 'align'],
allowedAttributes['iframe'] = ['src', 'width', 'height'],
allowedAttributes['h1'] = ['id'],
allowedAttributes['h2'] = ['id'],
allowedAttributes['h3'] = ['id'],
allowedAttributes['h4'] = ['id'],
allowedAttributes['h5'] = ['id'],
allowedAttributes['h6'] = ['id'],
allowedAttributes['a'] = ['href'],
allowedAttributes['img'] = ['src'],
allowedAttributes['span'] = ['class'];
var allowedAttributes_default = allowedAttributes;

function sanitizeHtmlOutput(html) {
  const options = {};
  options.allowedTags = allowedTags;
  options.allowedAttributes = allowedAttributes;
  return sanitizeHtml(html, options);
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

import path3 from 'node:path';
import fs3 from 'fs-extra';
import unescape from 'lodash/unescape.js';
import sanitizeHtml2 from 'sanitize-html';
import { marked } from 'marked';

async function handler(contentPath, config) {
  const slug = utils_default.getSlug(path3.relative(config.contentDir, contentPath));
  try {
    const raw = await fs3.readFile(contentPath, 'utf8');
    let processedSlug = utils_default.getSlug(contentPath, slug);
    processedSlug.includes('\\') && (processedSlug = processedSlug.replaceAll('\\', ''));
    processedSlug = processedSlug.replaceAll('.md', '').toLowerCase();
    const meta = contentProcessors_default.processMeta(raw),
      body = contentProcessors_default.processVars(contentProcessors_default.stripMeta(raw), config),
      html = sanitizeHtmlOutput_default(marked(body)),
      title = meta.title ? meta.title : contentProcessors_default.slugToTitle(processedSlug),
      sanitizeConfig = {};
    sanitizeConfig.allowedTags = [];
    sanitizeConfig.allowedAttributes = {};
    const plainText = unescape(sanitizeHtml2(html, sanitizeConfig)),
      snippetLength = config.snippetLength || 150,
      snippet = plainText.length > snippetLength ? plainText.slice(0, snippetLength).trim().replace(/\s\S+$/, '') + '…' : plainText,
      result = {};
    return result.id = processedSlug, result.title = title, result.body = html, result.snippet = snippet, result;
  } catch (err) {
    return config.debug && console.error(err), null;
  }
}

var page_default = handler;

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

const languageLoaders = {};
languageLoaders['da'] = lunrDa;
languageLoaders['de'] = lunrDe;
languageLoaders['es'] = lunrEs;
languageLoaders['fi'] = lunrFi;
languageLoaders['fr'] = lunrFr;
languageLoaders['hu'] = lunrHu;
languageLoaders['ja'] = lunrJa;
languageLoaders['no'] = lunrNo;
languageLoaders['pt'] = lunrPt;
languageLoaders['ro'] = lunrRo;
languageLoaders['ru'] = lunrRu;
languageLoaders['sv'] = lunrSv;
languageLoaders['tr'] = lunrTr;

var instance = null,
    stemmers = null;

function getLunr(config) {
  if (instance === null) {
    instance = lunr;
    lunrStemmerSupport(instance);
    lunrMulti(instance);
    tinyseg(instance);
    config.supportedLanguages.forEach(lang => {
      languageLoaders[lang] && languageLoaders[lang](instance);
    });
  }
  return instance;
}

function getStemmers(config) {
  if (stemmers === null) {
    const languages = ['en'].concat(config.supportedLanguages);
    stemmers = getLunr(config).multi(...languages);
  }
  return stemmers;
}

const lunr_default = {
  getLunr,
  getStemmers
};

import path4 from 'node:path';
import { glob } from 'glob';

async function handler2(query, config) {
  const basePath = utils_default.normalizeDir(path4.relative(config.contentDir)),
    files = await glob(path4.join(basePath, '**', '*.md')),
    documents = await Promise.all(files.map(file => contentProcessors_default.extractDocument(basePath, file, config.debug))),
    validDocs = documents.filter(doc => doc !== null),
    lunrInstance = lunr_default.getLunr(config),
    index = lunrInstance(function() {
      this.ref('id');
      this.field('title', { boost: 10 });
      this.field('body');
      validDocs.forEach(doc => this.add(doc), this);
      this.use(lunr_default.getStemmers(config));
    }),
    processedQuery = query.replaceAll(/[~*+\-^:]/g, ' ').replaceAll(/\s+/g, ' ').trim();

  if (!processedQuery) return [];

  let results = index.search(processedQuery);
  if (results.length === 0 && processedQuery.includes(' ')) {
    const terms = processedQuery.split(/\s+/).map(escapeTerm);
    results = index.search(terms.join(' '));
  }
  if (results.length === 0 && processedQuery.length > 2) {
    results = index.search(processedQuery + '~1');
  }
  if (results.length === 0) {
    results = index.search(processedQuery + '*');
  }
  if (results.length === 0) {
    const words = processedQuery.split(/\s+/).filter(w => w.length > 0),
      wildcardQuery = words.map(w => w + '~1').join(' ');
    wildcardQuery && (results = index.search(wildcardQuery));
  }

  const finalResults = await Promise.all(results.map(r => processSearchResult(basePath, config, query, r)));
  return finalResults.filter(r => r !== null);
}

async function processSearchResult(basePath, config, query, result) {
  const filePath = path4.join(basePath, result.ref),
    page = await page_default(filePath, config);
  if (!page) return null;
  const slugParts = page.id.split('/');
  page.category = slugParts.length > 1 ? slugParts[0] : null;
  if (page.snippet) {
    const escapedQuery = query.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.snippet = page.snippet.replaceAll(new RegExp('(' + escapedQuery + ')', 'gi'), '<mark>$1</mark>');
  }
  return page;
}

var search_default = handler2;

export { search_default as default };
