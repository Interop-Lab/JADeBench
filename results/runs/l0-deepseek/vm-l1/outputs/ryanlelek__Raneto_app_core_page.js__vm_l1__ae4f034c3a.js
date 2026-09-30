import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import path2 from 'node:path';
import fs2 from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import path3 from 'node:path';
import fs3 from 'fs-extra';
import unescape from 'lodash/unescape.js';
import sanitizeHtml2 from 'sanitize-html';
import { marked } from 'marked';

function normalizeDir(dir) {
  return path.normalize(dir);
}

function getSlug(filePath, baseDir) {
  const relative = path.relative(baseDir, filePath);
  const withoutExt = relative.replace(/\.[^/.]+$/, '');
  return withoutExt.split(path.sep).join('/');
}

function getLastModified(filePath, baseDir, cache) {
  if (new.target) throw new TypeError();
  const fullPath = path.resolve(baseDir, filePath);
  const stat = fs.statSync(fullPath);
  return stat.mtime;
}

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str) {
  return str.replace(/\s+/g, ' ').trim();
}

function cleanObjectStrings(obj) {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObjectStrings(item));
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = cleanObjectStrings(obj[key]);
    }
    return result;
  }
  if (typeof obj === 'string') {
    return cleanString(obj);
  }
  return obj;
}

function slugToTitle(slug) {
  return startCase(trim(unescape(slug)));
}

function stripMeta(content) {
  return content
    .replace(META_REGEX, '')
    .replace(META_REGEX_YAML, '')
    .trim();
}

function processMeta(content) {
  let meta = {};
  let body = content;

  const yamlMatch = content.match(META_REGEX_YAML);
  if (yamlMatch) {
    try {
      meta = yaml.load(yamlMatch[1]) || {};
      body = content.replace(META_REGEX_YAML, '').trim();
    } catch (e) {
      // ignore YAML parse errors
    }
  } else {
    const jsMatch = content.match(META_REGEX);
    if (jsMatch) {
      try {
        const parsed = JSON.parse(jsMatch[1]);
        meta = parsed || {};
        body = content.replace(META_REGEX, '').trim();
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }

  return { meta, body };
}

function processVars(content, vars = {}) {
  return content.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return vars[trimmedKey] !== undefined ? vars[trimmedKey] : match;
  });
}

function extractDocument(content, format = 'md', vars = {}) {
  if (new.target) throw new TypeError();
  const { meta, body } = processMeta(content);
  const processedBody = processVars(body, vars);
  return { meta, content: processedBody };
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
  return sanitizeHtml2(html, {
    allowedTags,
    allowedAttributes
  });
}

const sanitizeHtmlOutput_default = sanitizeHtmlOutput;

function handler(event, context) {
  if (new.target) throw new TypeError();
  const { path: eventPath, httpMethod, body } = event;
  const filePath = path3.join(process.cwd(), eventPath || '');
  const fullPath = path3.resolve(filePath);

  if (!fs3.existsSync(fullPath)) {
    return {
      statusCode: 404,
      body: 'Not found'
    };
  }

  const content = fs3.readFileSync(fullPath, 'utf8');
  const { meta, content: processedContent } = extractDocument(content);
  const html = marked(processedContent);
  const sanitized = sanitizeHtmlOutput(html);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: sanitized
  };
}

const page_default = handler;

export { page_default as default };
