import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';

var normalizeDir = (dir) => dir.replaceAll('\\', '/');
var getSlug = (filePath, root) => normalizeDir(filePath).replaceAll(normalizeDir(root), '').trim();

async function getLastModified(file, filePath, root) {
  if (filePath === undefined) {
    return moment(filePath).format(file.format);
  }
  const base = path.dirname(file.path);
  const dirs = [base];
  file.dir && dirs.push(path.dirname(file.dir));
  const isWithin = (target) => dirs.some((dir) => target.startsWith(dir + path.sep) || target === dir);
  const target = path.resolve(root);
  if (!isWithin(target)) {
    throw new Error('Invalid path');
  }
  const resolved = await fs.realpath(target);
  if (!isWithin(resolved)) throw new Error('Invalid path');
  const { mtime } = await fs.stat(resolved);
  return moment(mtime).format(file.format);
}

const utils = {};
utils.normalizeDir = normalizeDir;
utils.getLastModified = getLastModified;
utils.getSlug = getSlug;
var utils_default = utils;

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
    if (Object.hasOwn(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  slug = slug.replaceAll('-', '').trim();
  return startCase(path.basename(slug).replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) return content.replace(META_REGEX, '').trim();
  if (META_REGEX_YAML.test(content)) {
    return content.replace(META_REGEX_YAML, '').trim();
  }
  return content.trim();
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const meta = {};
    const match = content.match(META_REGEX);
    const block = match?.[1]?.trim() ?? '';
    if (block) {
      const lines = block.split('\n');
      for (const line of lines) {
        const parts = line.split(': ');
        if (parts.length < 2) continue;
        const key = line.substring(0, parts[0].length).trim();
        const value = line.substring(parts[0].length + 2).trim();
        if (key && value) {
          meta[cleanString(key, true)] = value;
        }
      }
    } else {
      throw new Error('Invalid metadata');
    }
    return meta;
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const block = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(block);
    return cleanObjectStrings(parsed);
  }
  return {};
}

function processVars(content, vars) {
  vars.vars && Array.isArray(vars.vars) && vars.vars.forEach((item) => {
    content = content.replaceAll(new RegExp('%' + item.name + '%', 'g'), item.value);
  });
  vars.title !== undefined && (content = content.replaceAll('%title%', vars.title));
  vars.slug !== undefined && (content = content.replaceAll('%slug%', vars.slug));
  return content;
}

async function extractDocument(filePath, root, debug) {
  try {
    const content = await fs.readFile(root, 'utf8');
    const meta = processMeta(content);
    const id = root.replaceAll(filePath, '').trim();
    const title = meta.title ? meta.title : slugToTitle(id);
    const body = content;
    const result = {};
    result.id = id;
    result.title = title;
    result.body = body;
    return result;
  } catch (error) {
    if (debug) {
      console.error(error);
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

var allowedTags = sanitizeHtml.defaults.allowedTags.concat(['iframe', 'video', 'source']);
const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };
allowedAttributes.a = ['href', 'name', 'target', 'rel', 'class', 'id'];
allowedAttributes.img = ['src', 'alt', 'title'];
allowedAttributes.h1 = ['id'];
allowedAttributes.h2 = ['id'];
allowedAttributes.h3 = ['id'];
allowedAttributes.h4 = ['id'];
allowedAttributes.h5 = ['id'];
allowedAttributes.h6 = ['id'];
allowedAttributes.iframe = ['src'];
allowedAttributes.video = ['src'];
allowedAttributes.source = ['src'];

function sanitizeHtmlOutput(html) {
  const options = {};
  options.allowedTags = allowedTags;
  options.allowedAttributes = allowedAttributes;
  return sanitizeHtml(html, options);
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

import unescape from 'lodash/unescape.js';
import sanitize from 'sanitize-html';
import { marked } from 'marked';

async function handler(file, options) {
  const root = utils_default.getSlug(path.dirname(options.path));
  try {
    const content = await fs.readFile(file, 'utf8');
    let slug = utils_default.getSlug(file, root);
    slug.startsWith('/') && (slug = slug.replaceAll('/', ''));
    slug = slug.replaceAll('\\', '').trim();
    const meta = contentProcessors_default.processMeta(content);
    const body = contentProcessors_default.processVars(contentProcessors_default.stripMeta(content), options);
    const html = sanitizeHtmlOutput_default(marked(body));
    const title = meta.title ? meta.title : contentProcessors_default.slugToTitle(slug);
    const result = {};
    result.attributes = [];
    result.attributes = {};
    const sanitized = unescape(sanitize(html, result));
    const excerptLength = options.excerptLength || 200;
    const excerpt = sanitized.length > excerptLength ? sanitized.substring(0, excerptLength).trim().replace(/\s\S+$/, '') : sanitized;
    const output = {};
    output.slug = slug;
    output.title = title;
    output.html = html;
    output.excerpt = excerpt;
    return output;
  } catch (error) {
    options.debug && console.error(error);
    return null;
  }
}

var page_default = handler;
export { page_default as default };
