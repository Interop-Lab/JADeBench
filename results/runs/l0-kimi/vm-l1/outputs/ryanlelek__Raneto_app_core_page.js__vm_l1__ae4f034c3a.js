import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import { snakeCase } from 'lodash/snakeCase.js';
import { kebabCase } from 'lodash/kebabCase.js';
import { startCase } from 'lodash/startCase.js';
import { trim } from 'lodash/trim.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import { unescape } from 'lodash/unescape.js';
import { marked } from 'marked';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(dir) {
  return path.normalize(dir).replace(/\\/g, '/').replace(/\/$/, '');
}

function getSlug(str, options = {}) {
  if (options.snakeCase) {
    return snakeCase(str);
  }
  if (options.kebabCase) {
    return kebabCase(str);
  }
  return str;
}

function getLastModified(filePath, stat) {
  if (stat && stat.mtime) {
    return moment(stat.mtime).format('YYYY-MM-DD HH:mm:ss');
  }
  return '';
}

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

function cleanString(str) {
  if (!str) return '';
  return trim(unescape(str.replace(/&nbsp;/g, ' ')));
}

function cleanObjectStrings(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const result = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === 'string') {
      result[key] = cleanString(value);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = cleanObjectStrings(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function slugToTitle(slug) {
  if (!slug) return '';
  return startCase(slug.replace(/-/g, ' ').replace(/_/g, ' '));
}

function stripMeta(content) {
  if (!content) return content;
  let result = content;
  const yamlMatch = result.match(META_REGEX_YAML);
  if (yamlMatch) {
    result = result.substring(yamlMatch[0].length);
  }
  const blockMatch = result.match(META_REGEX);
  if (blockMatch) {
    result = result.substring(blockMatch[0].length);
  }
  return result.trim();
}

function processMeta(content) {
  if (!content) return {};
  const yamlMatch = content.match(META_REGEX_YAML);
  if (yamlMatch) {
    try {
      return yaml.load(yamlMatch[1]) || {};
    } catch (e) {
      return {};
    }
  }
  const blockMatch = content.match(META_REGEX);
  if (blockMatch) {
    try {
      return yaml.load(blockMatch[1]) || {};
    } catch (e) {
      return {};
    }
  }
  return {};
}

function processVars(content, vars = {}) {
  if (!content) return content;
  let result = content;
  for (const key of Object.keys(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, vars[key]);
  }
  return result;
}

function extractDocument(filePath, content, options = {}) {
  const meta = processMeta(content);
  const body = stripMeta(content);
  const html = marked.parse(body, { async: false });
  return {
    meta: cleanObjectStrings(meta),
    content: body,
    html: sanitizeHtmlOutput(html),
    slug: getSlug(path.basename(filePath, path.extname(filePath)), options),
    title: meta.title || slugToTitle(path.basename(filePath, path.extname(filePath))),
    lastModified: ''
  };
}

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'code', 'pre']);

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
  pre: ['class']
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes
  });
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

const sanitizeHtmlOutput_default = sanitizeHtmlOutput;

function handler(event, context) {
  const { filePath, content, options } = event;
  if (!filePath || !content) {
    throw new Error('filePath and content are required');
  }
  const doc = extractDocument(filePath, content, options);
  return {
    statusCode: 200,
    body: JSON.stringify(doc)
  };
}

const page_default = handler;

export { page_default as default };
