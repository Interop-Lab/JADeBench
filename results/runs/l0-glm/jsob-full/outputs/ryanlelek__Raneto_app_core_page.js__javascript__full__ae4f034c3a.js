import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';

var normalizeDir = (dir) => dir.replaceAll('\\', '/');

var getSlug = (filePath, baseDir) => normalizeDir(filePath).replaceAll(normalizeDir(baseDir), '').trim();

async function getLastModified(config, fileMeta, contentDir) {
  if (fileMeta.mtime !== undefined) {
    return moment(fileMeta.mtime).format(config.dateFormat);
  }

  const fullPath = path.join(config.contentDir, fileMeta.file);
  const allowedPaths = [fullPath];
  if (fileMeta.dir) {
    allowedPaths.push(path.join(fileMeta.dir));
  }

  const isPathAllowed = (targetPath) => allowedPaths.some(allowed => targetPath.startsWith(allowed + path.sep) || targetPath === allowed);
  const resolvedPath = path.resolve(contentDir);

  if (!isPathAllowed(resolvedPath)) {
    throw new Error('Path traversal detected');
  }

  const realPath = await fs.realpath(resolvedPath);
  if (!isPathAllowed(realPath)) {
    throw new Error('Path traversal detected');
  }

  const { mtime } = await fs.stat(realPath);
  return moment(mtime).format(config.dateFormat);
}

const utils = {};
utils.normalizeDir = normalizeDir;
utils.getLastModified = getLastModified;
utils.getSlug = getSlug;
var utils_default = utils;

import path2 from 'node:path';
import fs2 from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str, snake = false) {
  str = str.replaceAll('/', ' ').trim();
  if (snake) {
    return snakeCase(str);
  }
  return trim(kebabCase(str), '-');
}

function cleanObjectStrings(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  return startCase(path2.basename(slug).replaceAll('-', ' '));
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
    const meta = {};
    const match = content.match(META_REGEX);
    const metaBlock = match?.[1]?.trim() ?? '';
    if (metaBlock) {
      const lines = metaBlock.split('\n');
      for (const line of lines) {
        const colonIndex = line.indexOf(': ');
        if (colonIndex === -1) {
          continue;
        }
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          meta[cleanString(key, true)] = value;
        }
      }
    }
    return meta;
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const yamlContent = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(yamlContent);
    return cleanObjectStrings(parsed);
  }
  return {};
}

function processVars(content, options) {
  if (options.vars && Array.isArray(options.vars)) {
    options.vars.forEach(v => {
      content = content.replaceAll(new RegExp('%' + v.key + '%', 'g'), v.value);
    });
  }
  if (options.url !== undefined) {
    content = content.replaceAll('%URL%', options.url);
  }
  if (options.baseurl !== undefined) {
    content = content.replaceAll('%BASEURL%', options.baseurl);
  }
  return content;
}

async function extractDocument(config, filePath, debug) {
  try {
    const fileContent = await fs2.readFile(filePath, 'utf8');
    const meta = processMeta(fileContent);
    const slug = filePath.replaceAll(config.contentDir, '').trim();
    const title = meta.title ? meta.title : slugToTitle(slug);
    const raw = fileContent;
    const doc = {};
    doc.id = slug;
    doc.title = title;
    doc.raw = raw;
    return doc;
  } catch (err) {
    if (debug) {
      console.error(err);
    }
    return null;
  }
}

const contentProcessors = {};
contentProcessors.cleanString = cleanString;
contentProcessors.cleanObjectStrings = cleanObjectStrings;
contentProcessors.extractDocument = extractDocument;
contentProcessors.slugToTitle = slugToTitle;
contentProcessors.stripMeta = stripMeta;
contentProcessors.processMeta = processMeta;
contentProcessors.processVars = processVars;
var contentProcessors_default = contentProcessors;

import sanitizeHtml from 'sanitize-html';

var allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'details', 'summary']);

const attributesConfig = { ...sanitizeHtml.defaults.allowedAttributes };
attributesConfig.a = ['href', 'name', 'target', 'class', 'rel'];
attributesConfig.img = ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'];
attributesConfig.div = ['class', 'id'];
attributesConfig.span = ['class', 'id'];
attributesConfig['h1'] = ['id'];
attributesConfig['h2'] = ['id'];
attributesConfig['h3'] = ['id'];
attributesConfig['h4'] = ['id'];
attributesConfig['h5'] = ['id'];
attributesConfig['h6'] = ['id'];
attributesConfig.iframe = ['src'];
attributesConfig.details = ['open'];
attributesConfig.summary = ['class'];

var allowedAttributes = attributesConfig;

function sanitizeHtmlOutput(html) {
  const options = {};
  options.allowedTags = allowedTags;
  options.allowedAttributes = allowedAttributes;
  return sanitizeHtml(html, options);
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

import path3 from 'node:path';
import fs3 from 'fs-extra';
import unescape from 'lodash/unescape.js';
import sanitizeHtml2 from 'sanitize-html';
import { marked } from 'marked';

async function handler(filePath, options) {
  const slug = utils_default.getSlug(path3.resolve(options.contentDir ? filePath : filePath));
  try {
    const fileContent = await fs3.readFile(filePath, 'utf8');
    let cleanSlug = utils_default.getSlug(filePath, slug);
    if (cleanSlug.startsWith('/')) {
      cleanSlug = cleanSlug.replaceAll('/', '');
    }
    cleanSlug = cleanSlug.replaceAll('.md', '').trim();
    const meta = contentProcessors_default.processMeta(fileContent);
    const processedContent = contentProcessors_default.processVars(contentProcessors_default.stripMeta(fileContent), options);
    const html = sanitizeHtmlOutput_default(marked(processedContent));
    const title = meta.title ? meta.title : contentProcessors_default.slugToTitle(cleanSlug);
    const sanitizeOptions = {};
    sanitizeOptions.allowedTags = [];
    sanitizeOptions.allowedAttributes = {};
    const sanitizedHtml = unescape(sanitizeHtml2(html, sanitizeOptions));
    const excerptLength = options.excerptLength || 0;
    const excerpt = sanitizedHtml.length > excerptLength ? sanitizedHtml.substring(0, excerptLength).trim().replace(/\s\S+$/, '') + '...' : sanitizedHtml;
    const result = {};
    result.slug = cleanSlug;
    result.title = title;
    result.html = html;
    result.excerpt = excerpt;
    return result;
  } catch (err) {
    if (options.debug) {
      console.error(err);
    }
    return null;
  }
}

var page_default = handler;

export { page_default as default };
