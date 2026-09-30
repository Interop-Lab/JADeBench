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
import path3 from 'node:path';
import fs3 from 'fs-extra';
import { glob } from 'glob';
import _ from 'lodash';
import yaml2 from 'js-yaml';

function normalizeDir(dir) {
  return path.normalize(dir);
}

function getSlug(filePath, baseDir) {
  const relative = path.relative(baseDir, filePath);
  const withoutExt = relative.replace(/\.[^/.]+$/, '');
  return withoutExt.split(path.sep).join('/');
}

function getLastModified(filePath, baseDir, useMoment = false) {
  const fullPath = path.resolve(baseDir, filePath);
  const stats = fs.statSync(fullPath);
  if (useMoment) {
    return moment(stats.mtime).format('YYYY-MM-DD HH:mm:ss');
  }
  return stats.mtime;
}

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug,
};

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, '    ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function cleanObjectStrings(obj) {
  if (Array.isArray(obj)) {
    return obj.map(cleanObjectStrings);
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
  return startCase(slug.replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  return content
    .replace(META_REGEX, '')
    .replace(META_REGEX_YAML, '')
    .replace(/^\n+/, '');
}

function metaBool(value, defaultValue = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (['true', 'yes', '1', 'on'].includes(lower)) return true;
    if (['false', 'no', '0', 'off'].includes(lower)) return false;
  }
  return defaultValue;
}

function processMeta(meta) {
  if (!meta || typeof meta !== 'object') return {};
  const result = {};
  for (const [key, value] of Object.entries(meta)) {
    if (typeof value === 'string') {
      result[key] = cleanString(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'string' ? cleanString(item) : item
      );
    } else if (value && typeof value === 'object') {
      result[key] = processMeta(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function processVars(content, vars = {}) {
  return content.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    const value = key.split('.').reduce((acc, part) => acc && acc[part], vars);
    return value !== undefined ? String(value) : match;
  });
}

function extractDocument(content, format = 'yaml', options = {}) {
  const trimmed = content.replace(/^\uFEFF/, '');
  let meta = {};
  let body = trimmed;

  const yamlMatch = trimmed.match(META_REGEX_YAML);
  if (yamlMatch) {
    try {
      meta = yaml.load(yamlMatch[1]) || {};
    } catch (e) {
      meta = {};
    }
    body = trimmed.slice(yamlMatch[0].length);
  } else {
    const jsMatch = trimmed.match(META_REGEX);
    if (jsMatch) {
      try {
        meta = JSON.parse(jsMatch[1]) || {};
      } catch (e) {
        meta = {};
      }
      body = trimmed.slice(jsMatch[0].length);
    }
  }

  meta = processMeta(meta);
  body = stripMeta(body);
  body = processVars(body, options.vars || {});

  return { meta, content: body };
}

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

function handler(content, options = {}) {
  const { meta, content: body } = extractDocument(content, options.format, options);
  return {
    meta,
    content: body,
    ...(options.includeRaw ? { raw: content } : {}),
  };
}

function processFile(filePath, baseDir, options = {}, processor = handler) {
  const fullPath = path.resolve(baseDir, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const result = processor(content, options);
  return {
    path: filePath,
    slug: getSlug(filePath, baseDir),
    ...result,
  };
}

function processDirectory(
  dirPath,
  baseDir = dirPath,
  options = {},
  processor = handler,
  pattern = '**/*.{md,markdown}'
) {
  const fullDir = path.resolve(dirPath);
  const files = glob.sync(pattern, { cwd: fullDir, nodir: true });
  return files.map((file) => processFile(file, fullDir, options, processor));
}

function processMarkdownFile(
  filePath,
  baseDir,
  options = {},
  processor = handler,
  pattern = '**/*.{md,markdown}'
) {
  const fullPath = path.resolve(baseDir, filePath);
  const stats = fs.statSync(fullPath);
  if (stats.isDirectory()) {
    return processDirectory(fullPath, baseDir, options, processor, pattern);
  }
  return processFile(filePath, baseDir, options, processor);
}

const contents_default = handler;

export { contents_default as default };
