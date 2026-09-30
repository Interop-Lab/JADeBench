import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/[\r\n\t]/g, ' ');
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
  if (!slug || typeof slug !== 'string') return '';
  const cleaned = slug
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]/g, ' ');
  return startCase(cleaned);
}

function stripMeta(content) {
  if (!content || typeof content !== 'string') return content;
  let result = content;
  const yamlMatch = result.match(META_REGEX_YAML);
  if (yamlMatch) {
    result = result.slice(yamlMatch[0].length);
  }
  const commentMatch = result.match(META_REGEX);
  if (commentMatch) {
    result = result.slice(commentMatch[0].length);
  }
  return trim(result);
}

function processMeta(content) {
  if (!content || typeof content !== 'string') return {};
  const yamlMatch = content.match(META_REGEX_YAML);
  if (yamlMatch) {
    try {
      const parsed = yaml.load(yamlMatch[1]);
      return cleanObjectStrings(parsed || {});
    } catch (e) {
      return {};
    }
  }
  const commentMatch = content.match(META_REGEX);
  if (commentMatch) {
    try {
      const parsed = yaml.load(commentMatch[1]);
      return cleanObjectStrings(parsed || {});
    } catch (e) {
      return {};
    }
  }
  return {};
}

function processVars(content, vars) {
  if (!content || typeof content !== 'string') return content;
  if (!vars || typeof vars !== 'object') return content;
  
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value));
  }
  return result;
}

function extractDocument(filePath, basePath, options = {}) {
  const fullPath = basePath ? path.join(basePath, filePath) : filePath;
  const content = fs.readFileSync(fullPath, 'utf-8');
  const meta = processMeta(content);
  const body = stripMeta(content);
  
  const slug = path.basename(filePath, path.extname(filePath));
  const title = meta.title || slugToTitle(slug);
  
  return {
    meta,
    body,
    slug,
    title,
    path: filePath
  };
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

export default contentProcessors_default;
