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
  return trim(str)
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/\u200b/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n');
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
  if (typeof slug !== 'string') return slug;
  return startCase(trim(slug.replace(/[-_]+/g, ' ')));
}

function stripMeta(content) {
  if (typeof content !== 'string') return content;
  return content
    .replace(META_REGEX, '')
    .replace(META_REGEX_YAML, '')
    .replace(/^\s+/, '');
}

function processMeta(content) {
  if (typeof content !== 'string') return { content, meta: {} };
  let meta = {};
  let body = content;

  const yamlMatch = body.match(META_REGEX_YAML);
  if (yamlMatch) {
    try {
      meta = yaml.load(yamlMatch[1]) || {};
    } catch (_) {
      meta = {};
    }
    body = body.replace(META_REGEX_YAML, '');
  } else {
    const commentMatch = body.match(META_REGEX);
    if (commentMatch) {
      try {
        meta = yaml.load(commentMatch[1]) || {};
      } catch (_) {
        meta = {};
      }
      body = body.replace(META_REGEX, '');
    }
  }

  return { content: body.replace(/^\s+/, ''), meta };
}

function processVars(content, vars = {}) {
  if (typeof content !== 'string') return content;
  return content.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (match, key) => {
    const value = key.split('.').reduce((acc, part) => acc && acc[part], vars);
    return value !== undefined ? String(value) : match;
  });
}

function extractDocument(content, options = {}) {
  const { meta = {}, vars = {} } = options;
  const processed = processMeta(content);
  const mergedVars = { ...vars, ...processed.meta };
  const body = processVars(processed.content, mergedVars);
  return {
    content: body,
    meta: processed.meta,
  };
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

export { contentProcessors_default as default };
