import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import unescape from 'lodash/unescape.js';
import { marked } from 'marked';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);
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
  pre: ['class'],
};

const normalizeDir = (directory) => directory.replaceAll('\\', '/');

const getSlug = (filePath, baseDirectory) => (
  normalizeDir(filePath).replaceAll(normalizeDir(baseDirectory), '').trim()
);

async function getLastModified(config, metadata, filePath) {
  if (metadata.modified) return moment(metadata.modified).format();

  const contentDirectory = path.resolve(config.content_dir);
  const themeDirectory = path.resolve(config.theme_dir);
  const resolvedFilePath = path.resolve(filePath);
  if (!resolvedFilePath.startsWith(contentDirectory) && !resolvedFilePath.startsWith(themeDirectory)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const stats = await fs.lstat(resolvedFilePath);
  return moment(stats.mtime).format();
}

function cleanString(value) {
  return trim(kebabCase(value.replaceAll('/', ' ')), '-');
}

function cleanObjectStrings(value) {
  return Object.keys(value).reduce((result, key) => {
    const cleanKey = snakeCase(key.replaceAll('/', ' ').trim());
    result[cleanKey] = String(value[key]).trim();
    return result;
  }, {});
}

function slugToTitle(slug) {
  const filename = path.basename(slug.replaceAll('.md', '').trim());
  return startCase(filename.replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  return content.replace(META_REGEX, '').replace(META_REGEX_YAML, '').trim();
}

function processMeta(content) {
  const match = content.match(META_REGEX) || content.match(META_REGEX_YAML);
  if (!match) return {};
  return cleanObjectStrings(yaml.load(match[1]) || {});
}

function processVars(content, config) {
  let processed = content;
  if (Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      processed = processed.replaceAll(`%${variable.name}%`, variable.content);
    });
  }
  if (config.base_url !== undefined) {
    processed = processed.replaceAll('%base_url%', config.base_url);
  }
  if (config.image_url !== undefined) {
    processed = processed.replaceAll('%image_url%', config.image_url);
  }
  return processed;
}

async function readDocument(baseDirectory, filePath) {
  const body = await fs.readFile(filePath, 'utf8');
  const id = getSlug(filePath, baseDirectory);
  const metadata = processMeta(body);
  const title = metadata.title || slugToTitle(id);
  return { id, title, body };
}

async function extractDocument(baseDirectory, filePath, _config) {
  try {
    return await readDocument(baseDirectory, filePath);
  } catch (error) {
    console.log(error);
    return null;
  }
}

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function handler(filePath, config) {
  const contentDirectory = path.normalize(config.content_dir);

  try {
    const document = await readDocument(contentDirectory, filePath);
    const source = processVars(stripMeta(document.body), config);
    const body = sanitizeHtmlOutput(marked(source));
    let excerpt = unescape(sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }));

    if (excerpt.length > 400) {
      excerpt = excerpt.slice(0, 400);
      const wordBoundary = excerpt.lastIndexOf(' ');
      if (wordBoundary >= 0) excerpt = excerpt.slice(0, wordBoundary);
      excerpt += '...';
    }

    return {
      slug: document.id,
      title: document.title,
      body,
      excerpt,
    };
  } catch {
    return null;
  }
}

export { handler as default };
