import path from 'node:path';
import fsExtra from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import moment from 'moment';
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
import { glob } from 'glob';
import unescape from 'lodash/unescape.js';

var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str, useSnakeCase = false) {
  str = str.replaceAll('/', ' ').trim();
  if (useSnakeCase) return snakeCase(str);
  return trim(kebabCase(str), '-');
}

function cleanObjectStrings(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  slug = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(slug).replace(/[-_]/g, ' '));
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
    const match = content.match(META_REGEX);
    const metaBlock = match?.[1]?.trim() ?? '';
    if (metaBlock) {
      const lines = metaBlock.split('\n');
      const result = {};
      for (const line of lines) {
        const colonIndex = line.indexOf(': ');
        if (colonIndex <= 0) continue;
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 2).trim();
        if (key && value) {
          result[cleanString(key, true)] = value;
        }
      }
      return result;
    }
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const yamlBlock = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(yamlBlock);
    return cleanObjectStrings(parsed);
  }
  return {};
}

function processVars(content, vars) {
  if (vars.strings && Array.isArray(vars.strings)) {
    vars.strings.forEach(str => {
      content = content.replaceAll(new RegExp('%' + str.key + '%', 'g'), str.value);
    });
  }
  if (vars.tail !== void 0) {
    content = content.replaceAll('%tail%', vars.tail);
  }
  if (vars.tail !== void 0) {
    content = content.replaceAll('%tail%', vars.tail);
  }
  return content;
}

async function extractDocument(rootDir, filePath, verbose) {
  try {
    const content = await fsExtra.readFile(filePath, 'utf8');
    const meta = processMeta(content);
    const slug = filePath.replace(rootDir, '').trim();
    const title = meta.title ? meta.title : slugToTitle(slug);
    const body = content;
    return {
      id: slug,
      title: title,
      body: body
    };
  } catch (err) {
    if (verbose) {
      console.log(err);
    }
    return null;
  }
}

var contentProcessors_default = {
  cleanString: cleanString,
  cleanObjectStrings: cleanObjectStrings,
  extractDocument: extractDocument,
  slugToTitle: slugToTitle,
  stripMeta: stripMeta,
  processMeta: processMeta,
  processVars: processVars
};

function normalizeDir(dir) {
  return dir.replaceAll('\\', '/');
}

function getSlug(filePath, rootDir) {
  return normalizeDir(filePath).replace(normalizeDir(rootDir), '').trim();
}

async function getLastModified(config, date, filePath) {
  if (date !== void 0) {
    return moment(date).format(config.dateFormat);
  }
  const rootDir = path.resolve(config.root);
  const checkPaths = [rootDir];
  if (config.dir) {
    checkPaths.push(path.resolve(config.dir));
  }
  const isUnderRoot = checkPath => checkPaths.some(prefix => checkPath.startsWith(prefix + path.sep) || checkPath === prefix);
  const resolvedPath = path.resolve(filePath);
  if (!isUnderRoot(resolvedPath)) {
    throw new Error('File is not under root directory');
  }
  const stats = await fsExtra.stat(resolvedPath);
  if (!isUnderRoot(stats)) {
    throw new Error('File is not under root directory');
  }
  const { mtime } = await fsExtra.stat(resolvedPath);
  return moment(mtime).format(config.dateFormat);
}

var utils_default = {
  normalizeDir: normalizeDir,
  getLastModified: getLastModified,
  getSlug: getSlug
};

var allowedTags = sanitizeHtml.defaults.allowedTags.filter(tag => !['textarea', 'title'].includes(tag));

const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };
allowedAttributes.a = ['href', 'name', 'target', 'rel'];
allowedAttributes.img = ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'];
allowedAttributes.h1 = ['id'];
allowedAttributes.h2 = ['id'];
allowedAttributes.h3 = ['id'];
allowedAttributes.h4 = ['id'];
allowedAttributes.h5 = ['id'];
allowedAttributes.h6 = ['id'];
allowedAttributes.div = ['class'];
allowedAttributes.span = ['class'];
allowedAttributes.code = ['class'];

function sanitizeHtmlOutput(html) {
  const options = {
    allowedTags: allowedTags,
    allowedAttributes: allowedAttributes
  };
  return sanitizeHtml(html, options);
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

async function handler(filePath, config) {
  const slug = utils_default.getSlug(path.resolve(config.root));
  try {
    const rawContent = await fsExtra.readFile(filePath, 'utf8');
    let id = utils_default.getSlug(filePath, slug);
    if (id.endsWith('.md')) {
      id = id.replace('.md', '');
    }
    id = id.replace('.md', '').trim();
    const meta = contentProcessors_default.processMeta(rawContent);
    const body = contentProcessors_default.processVars(contentProcessors_default.stripMeta(rawContent), config);
    const html = sanitizeHtmlOutput_default(marked(body));
    const title = meta.title ? meta.title : contentProcessors_default.slugToTitle(id);
    const sanitizeOptions = {
      allowedTags: [],
      allowedAttributes: {}
    };
    const excerpt = unescape(sanitizeHtml(html, sanitizeOptions));
    const excerptLength = config.excerptLength || 200;
    const excerptText = excerpt.length > excerptLength ? excerpt.slice(0, excerptLength).trim().replace(/\s\S+$/, '') + '...' : excerpt;
    return {
      id: id,
      title: title,
      html: html,
      excerpt: excerptText
    };
  } catch (err) {
    if (config.verbose) {
      console.log(err);
    }
    return null;
  }
}

var page_default = handler;

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
  tr: lunrTr
};

var instance = null;
var stemmers = null;

function getLunr(config) {
  if (instance === null) {
    instance = lunr;
    lunrStemmerSupport(instance);
    lunrMulti(instance);
    tinyseg(instance);
    config.searchLanguages.forEach(lang => {
      if (languageLoaders[lang]) {
        languageLoaders[lang](instance);
      }
    });
  }
  return instance;
}

function getStemmers(config) {
  if (stemmers === null) {
    const useStemmers = ['en'].concat(config.searchLanguages.filter(lang => lang !== 'en'));
    stemmers = getLunr(config).multiLanguage(...useStemmers);
  }
  return stemmers;
}

var lunr_default = {
  getLunr: getLunr,
  getStemmers: getStemmers
};

async function handler2(query, config) {
  const rootDir = utils_default.normalizeDir(path.resolve(config.root));
  const files = await glob(path.join(rootDir, '**', '*.md'));
  const documents = await Promise.all(files.map(file => contentProcessors_default.extractDocument(rootDir, file, config.verbose)));
  const validDocs = documents.filter(doc => doc !== null);
  const lunrInstance = lunr_default.getLunr(config);
  const idx = lunrInstance(function() {
    this.ref('id');
    this.field('title');
    validDocs.forEach(doc => this.add(doc), this);
    this.use(lunr_default.getStemmers(config));
  });
  let searchQuery = query.replace(/[~*+\-^:]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!searchQuery) {
    return [];
  }
  let results = idx.search(searchQuery);
  if (results.length === 0 && searchQuery.includes(' ')) {
    const terms = searchQuery.split(/\s+/).filter(term => term.length > 0);
    const expandedQuery = terms.map(term => term + '~1').join(' ');
    results = idx.search(expandedQuery);
  }
  if (results.length === 0 && searchQuery.length > 0) {
    results = idx.search(searchQuery + '~1');
  }
  if (results.length === 0) {
    results = idx.search(searchQuery + '*');
  }
  if (results.length === 0) {
    const terms = searchQuery.split(/\s+/).filter(term => term.length > 2);
    const expandedQuery = terms.map(term => term + '~1').join(' ');
    if (expandedQuery) {
      results = idx.search(expandedQuery);
    }
  }
  const processedResults = await Promise.all(results.map(result => processSearchResult(rootDir, config, query, result)));
  return processedResults.filter(result => result !== null);
}

async function processSearchResult(rootDir, config, query, result) {
  const filePath = path.join(rootDir, result.ref);
  const page = await page_default(filePath, config);
  if (!page) {
    return null;
  }
  const pathParts = page.id.split('/');
  page.category = pathParts.length > 1 ? pathParts[0] : null;
  if (page.excerpt) {
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    page.excerpt = page.excerpt.replace(new RegExp('(' + escapedQuery + ')', 'gi'), '<mark>$1</mark>');
  }
  return page;
}

var search_default = handler2;

export { search_default as default };
