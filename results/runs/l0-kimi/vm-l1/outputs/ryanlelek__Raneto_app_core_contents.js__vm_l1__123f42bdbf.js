import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import path2 from 'node:path';
import fs2 from 'fs-extra';
import { glob } from 'glob';
import _ from 'lodash';
import yaml from 'js-yaml';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(dirPath) {
  return path.normalize(dirPath).replace(/\\/g, '/');
}

function getLastModified(filePath, fsModule = fs) {
  try {
    const stats = fsModule.statSync(filePath);
    return moment(stats.mtime).format('YYYY-MM-DD HH:mm:ss');
  } catch (error) {
    return null;
  }
}

function getSlug(filePath, basePath) {
  const relativePath = path.relative(basePath, filePath);
  const parsed = path.parse(relativePath);
  const slug = parsed.name;
  return slug;
}

function cleanString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
}

function cleanObjectStrings(obj) {
  if (typeof obj === 'string') {
    return cleanString(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanObjectStrings);
  }
  if (obj && typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = cleanObjectStrings(obj[key]);
    }
    return result;
  }
  return obj;
}

function slugToTitle(slug) {
  if (!slug) return '';
  return startCase(slug.replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (typeof content !== 'string') return content;
  let result = content;
  result = result.replace(META_REGEX_YAML, '');
  result = result.replace(META_REGEX, '');
  return result.trim();
}

function processMeta(content) {
  if (typeof content !== 'string') return {};
  
  const yamlMatch = content.match(META_REGEX_YAML);
  if (yamlMatch) {
    try {
      return yaml.load(yamlMatch[1]) || {};
    } catch (e) {
      return {};
    }
  }
  
  const jsdocMatch = content.match(META_REGEX);
  if (jsdocMatch) {
    try {
      return yaml.load(jsdocMatch[1]) || {};
    } catch (e) {
      return {};
    }
  }
  
  return {};
}

function processVars(content, variables = {}) {
  if (typeof content !== 'string') return content;
  
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

function extractDocument(filePath, basePath, options = {}) {
  const fullPath = path.resolve(basePath, filePath);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const meta = processMeta(content);
  const body = stripMeta(content);
  
  return {
    meta: cleanObjectStrings(meta),
    body: cleanString(body),
    slug: getSlug(fullPath, basePath),
    title: meta.title || slugToTitle(getSlug(fullPath, basePath)),
    lastModified: getLastModified(fullPath)
  };
}

function metaBool(value, defaultValue = false) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return lower === 'true' || lower === 'yes' || lower === '1';
  }
  if (typeof value === 'number') return value !== 0;
  return defaultValue;
}

async function handler(event, context) {
  const { dirPath, options = {} } = event;
  
  if (!dirPath) {
    throw new Error('dirPath is required');
  }
  
  const normalizedPath = normalizeDir(dirPath);
  
  if (options.recursive) {
    return await processDirectory(normalizedPath, options);
  } else {
    return await processFile(normalizedPath, options);
  }
}

async function processFile(filePath, options = {}, fsModule = fs, pathModule = path) {
  const stats = await fsModule.stat(filePath);
  
  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }
  
  const content = await fsModule.readFile(filePath, 'utf-8');
  const meta = processMeta(content);
  const body = stripMeta(content);
  
  const result = {
    path: filePath,
    slug: getSlug(filePath, options.basePath || pathModule.dirname(filePath)),
    title: meta.title || slugToTitle(getSlug(filePath, options.basePath || pathModule.dirname(filePath))),
    meta: cleanObjectStrings(meta),
    body: cleanString(body),
    lastModified: getLastModified(filePath, fsModule)
  };
  
  if (options.processVars) {
    result.body = processVars(result.body, options.variables || {});
  }
  
  return result;
}

async function processDirectory(dirPath, options = {}, fsModule = fs, pathModule = path, globModule = glob) {
  const stats = await fsModule.stat(dirPath);
  
  if (!stats.isDirectory()) {
    throw new Error(`Path is not a directory: ${dirPath}`);
  }
  
  const pattern = options.pattern || '**/*.md';
  const fullPattern = pathModule.join(dirPath, pattern);
  
  const files = await globModule(fullPattern, {
    cwd: dirPath,
    absolute: true,
    ...options.globOptions
  });
  
  const results = [];
  for (const file of files) {
    try {
      const doc = await processFile(file, { ...options, basePath: dirPath }, fsModule, pathModule);
      results.push(doc);
    } catch (error) {
      if (!options.skipErrors) {
        throw error;
      }
    }
  }
  
  if (options.sortBy) {
    results.sort((a, b) => {
      const aVal = _.get(a, options.sortBy);
      const bVal = _.get(b, options.sortBy);
      if (options.sortOrder === 'desc') {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }
  
  return results;
}

async function processMarkdownFile(filePath, basePath, options = {}, fsModule = fs, pathModule = path) {
  const fullPath = pathModule.resolve(basePath, filePath);
  const content = await fsModule.readFile(fullPath, 'utf-8');
  
  const meta = processMeta(content);
  const body = stripMeta(content);
  
  const result = {
    meta: cleanObjectStrings(meta),
    body: cleanString(body),
    slug: getSlug(fullPath, basePath),
    title: meta.title || slugToTitle(getSlug(fullPath, basePath)),
    lastModified: getLastModified(fullPath, fsModule)
  };
  
  if (options.processVars) {
    result.body = processVars(result.body, options.variables || {});
  }
  
  return result;
}

const utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

const contents_default = handler;

export {
  contents_default as default,
  handler,
  processDirectory,
  processFile,
  processMarkdownFile,
  extractDocument,
  processVars,
  processMeta,
  stripMeta,
  slugToTitle,
  cleanObjectStrings,
  cleanString,
  getLastModified,
  getSlug,
  normalizeDir,
  metaBool,
  utils_default,
  contentProcessors_default,
  META_REGEX,
  META_REGEX_YAML
};
