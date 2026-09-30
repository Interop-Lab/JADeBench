import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import path2 from 'node:path';
import fs2 from 'fs-extra';
import moment from 'moment';
import sanitizeHtml from 'sanitize-html';
import path3 from 'node:path';
import fs3 from 'fs-extra';
import unescape from 'lodash/unescape.js';
import sanitizeHtml2 from 'sanitize-html';
import { marked } from 'marked';
import lunr from 'lunr';
import lunrStemmerSupport from 'lunr-languages/lunr.stemmer.support.js';
import lunrMulti from 'lunr-languages/lunr.multi.js';
import lunrTinyseg from 'lunr-languages/tinyseg.js';
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
import path4 from 'node:path';
import { glob } from 'glob';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str) {
  return unescape(trim(str));
}

function cleanObjectStrings(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectStrings(item));
  }
  const result = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    result[key] = typeof value === 'string' ? cleanString(value) : cleanObjectStrings(value);
  }
  return result;
}

function slugToTitle(slug) {
  return startCase(slug);
}

function stripMeta(content) {
  const match = META_REGEX.exec(content);
  if (match) {
    return content.slice(match[0].length);
  }
  const yamlMatch = META_REGEX_YAML.exec(content);
  if (yamlMatch) {
    return content.slice(yamlMatch[0].length);
  }
  return content;
}

function processMeta(content) {
  const match = META_REGEX.exec(content);
  if (match) {
    return yaml.load(match[1]);
  }
  const yamlMatch = META_REGEX_YAML.exec(content);
  if (yamlMatch) {
    return yaml.load(yamlMatch[1]);
  }
  return {};
}

function processVars(content, vars) {
  if (!vars) return content;
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g'), String(value));
  }
  return result;
}

function extractDocument(content, options, context) {
  const meta = processMeta(content);
  const body = stripMeta(content);
  const processedBody = processVars(body, meta);
  return {
    meta: cleanObjectStrings(meta),
    content: cleanString(processedBody)
  };
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

var normalizeDir = (dir) => {
  return path.normalize(dir).replace(/\\/g, '/');
};

var getSlug = (filepath, basePath) => {
  const relativePath = path.relative(basePath || '.', filepath);
  return kebabCase(relativePath.replace(/\.[^.]+$/, ''));
};

function getLastModified(filepath, basePath, format) {
  const stats = fs.statSync(filepath);
  return moment(stats.mtime).format(format || 'YYYY-MM-DD');
}

var utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

var allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);
var allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ['src', 'srcset', 'alt', 'width', 'height', 'loading'],
  input: ['type', 'checked', 'disabled'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  span: ['class'],
  code: ['class'],
  pre: ['class']
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes
  });
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

function handler(options, context) {
  return {
    ...options,
    sanitizeHtmlOutput
  };
}

var page_default = handler;

var languageLoaders = {
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

function getLunr(language) {
  if (instance) return instance;
  instance = lunr;
  return instance;
}

function getStemmers(language) {
  if (stemmers) return stemmers;
  stemmers = languageLoaders;
  return stemmers;
}

var lunr_default = {
  getLunr,
  getStemmers
};

function handler2(data, options) {
  const lunrInstance = getLunr(options?.language);
  const index = lunr.Index.load(data);
  return index;
}

function processSearchResult(result, query, options, context) {
  return result;
}

var search_default = handler2;

export { search_default as default };
