import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import path3 from 'node:path';
import fs2 from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import path2 from 'node:path';
import fs3 from 'fs-extra';
import unescape from 'lodash/unescape.js';
import sanitizeHtml2 from 'sanitize-html';
import { marked } from 'marked';

var normalizeDir = (dir) => {
  return dir.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/\/$/, '') || '/';
};

var getSlug = (filePath, basePath) => {
  let slug = path.relative(basePath, filePath).replace(/\\/g, '/');
  slug = slug.replace(/\.(md|markdown|html)$/i, '');
  slug = slug.replace(/\/index$/, '') || 'index';
  return slug;
};

function getLastModified(filePath, basePath, options) {
  const stat = fs.statSync(filePath);
  return moment(stat.mtime).format('YYYY-MM-DDTHH:mm:ssZ');
}

var utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str) {
  return trim(str).replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function cleanObjectStrings(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectStrings(item));
  }
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      result[key] = cleanString(obj[key]);
    } else if (typeof obj[key] === 'object') {
      result[key] = cleanObjectStrings(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

function slugToTitle(slug) {
  return startCase(slug.replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  return content.replace(META_REGEX, '').replace(META_REGEX_YAML, '').trim();
}

function processMeta(content) {
  let meta = {};
  let match = content.match(META_REGEX);
  if (match) {
    const metaContent = match[1].trim();
    meta = yaml.load(metaContent) || {};
  } else {
    match = content.match(META_REGEX_YAML);
    if (match) {
      const metaContent = match[1].trim();
      meta = yaml.load(metaContent) || {};
    }
  }
  return cleanObjectStrings(meta);
}

function processVars(content, vars) {
  if (!vars) return content;
  let result = content;
  for (const key in vars) {
    const regex = new RegExp('\\{\\{' + key + '\\}\\}', 'g');
    result = result.replace(regex, vars[key]);
  }
  return result;
}

function extractDocument(filePath, basePath, options) {
  const slug = getSlug(filePath, basePath);
  const rawContent = fs.readFileSync(filePath, 'utf8');
  const meta = processMeta(rawContent);
  const content = stripMeta(rawContent);
  const title = meta.title || slugToTitle(slug);
  const lastModified = getLastModified(filePath, basePath, options);
  let html = marked(content);
  html = processVars(html, meta);
  html = sanitizeHtmlOutput(html);
  return {
    slug,
    title,
    content: html,
    meta,
    lastModified
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

var allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'details', 'summary']);

var allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  'img': ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
  'input': ['type', 'checked', 'disabled'],
  'h1': ['id'],
  'h2': ['id'],
  'h3': ['id'],
  'h4': ['id'],
  'h5': ['id'],
  'h6': ['id'],
  'span': ['class'],
  'code': ['class'],
  'pre': ['class']
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ['http', 'https', 'mailto', 'tel']
  });
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

function handler(req, res) {
  const { filePath, basePath, options } = req;
  try {
    const doc = extractDocument(filePath, basePath, options);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(doc));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
}

var page_default = handler;

export { page_default as default };
