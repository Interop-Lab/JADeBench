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

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(dir) {
  return path.normalize(dir).replace(/\\/g, '/');
}

function getLastModified(filePath, stats, format) {
  const mtime = stats ? stats.mtime : fs.statSync(filePath).mtime;
  return moment(mtime).format(format || 'YYYY-MM-DD');
}

function getSlug(filePath, baseDir) {
  const relativePath = path.relative(baseDir, filePath);
  const parsed = path.parse(relativePath);
  const slug = path.join(parsed.dir, parsed.name).replace(/\\/g, '/');
  return slug;
}

function cleanString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/\r\n/g, '\n').trim();
}

function cleanObjectStrings(obj) {
  if (typeof obj === 'string') return cleanString(obj);
  if (Array.isArray(obj)) return obj.map(cleanObjectStrings);
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key of Object.keys(obj)) {
      result[key] = cleanObjectStrings(obj[key]);
    }
    return result;
  }
  return obj;
}

function slugToTitle(slug) {
  return startCase(slug.replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  let result = content;
  const yamlMatch = META_REGEX_YAML.exec(result);
  if (yamlMatch) {
    result = result.slice(yamlMatch[0].length).trim();
  }
  const commentMatch = META_REGEX.exec(result);
  if (commentMatch) {
    result = result.slice(commentMatch[0].length).trim();
  }
  return result;
}

function processMeta(meta) {
  if (!meta) return {};
  const processed = {};
  for (const key of Object.keys(meta)) {
    const value = meta[key];
    const cleanKey = snakeCase(key);
    processed[cleanKey] = cleanObjectStrings(value);
  }
  return processed;
}

function processVars(content, vars) {
  if (!vars) return content;
  let result = content;
  for (const key of Object.keys(vars)) {
    const value = vars[key];
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}

function extractDocument(filePath, baseDir, options) {
  const content = fs.readFileSync(filePath, 'utf8');
  const slug = getSlug(filePath, baseDir);
  const title = slugToTitle(slug);

  let meta = {};
  let body = content;

  const yamlMatch = META_REGEX_YAML.exec(body);
  if (yamlMatch) {
    meta = yaml.load(yamlMatch[1]) || {};
    body = body.slice(yamlMatch[0].length).trim();
  } else {
    const commentMatch = META_REGEX.exec(body);
    if (commentMatch) {
      try {
        meta = yaml.load(commentMatch[1]) || {};
      } catch (e) {
        meta = {};
      }
      body = body.slice(commentMatch[0].length).trim();
    }
  }

  meta = processMeta(meta);
  body = cleanString(body);

  if (options && options.vars) {
    body = processVars(body, options.vars);
  }

  return {
    slug,
    title,
    meta,
    content: body,
    path: filePath,
    relativePath: path.relative(baseDir, filePath),
  };
}

function metaBool(value, defaultValue) {
  if (value === undefined || value === null) return defaultValue || false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1' || value === 'yes';
  }
  return Boolean(value);
}

function handler(filePath, options) {
  options = options || {};
  const baseDir = options.baseDir || path.dirname(filePath);
  const doc = extractDocument(filePath, baseDir, options);

  const stats = fs.statSync(filePath);
  doc.lastModified = getLastModified(filePath, stats, options.dateFormat);

  return doc;
}

function processFile(filePath, baseDir, options, callback) {
  try {
    const doc = handler(filePath, { ...options, baseDir });
    if (callback) {
      callback(null, doc);
    }
    return doc;
  } catch (err) {
    if (callback) {
      callback(err);
    }
    throw err;
  }
}

function processDirectory(dirPath, options, callback, filePattern, recursive) {
  options = options || {};
  const pattern = filePattern || '**/*.md';
  const cwd = normalizeDir(dirPath);

  const files = glob.sync(pattern, { cwd, absolute: true });

  const results = [];
  for (const file of files) {
    try {
      const doc = processFile(file, cwd, options);
      results.push(doc);
    } catch (err) {
      if (callback) {
        callback(err);
      }
    }
  }

  if (callback) {
    callback(null, results);
  }
  return results;
}

function processMarkdownFile(filePath, options, callback, vars, dateFormat) {
  const opts = { ...options, vars, dateFormat };
  return processFile(filePath, null, opts, callback);
}

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug,
};

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

const contents_default = handler;

export { contents_default as default };
