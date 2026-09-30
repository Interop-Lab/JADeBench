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

const BLOCK_META_PATTERN = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META_PATTERN = /^\uFEFF?---([\s\S]*?)---/i;
const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'kbd']);
const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
  input: ['type', 'checked', 'disabled'],
  h1: ['id'], h2: ['id'], h3: ['id'], h4: ['id'], h5: ['id'], h6: ['id'],
  span: ['class'], code: ['class'], pre: ['class'],
};

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filePath, contentDirectory) {
  return trim(normalizeDir(filePath).replaceAll(normalizeDir(contentDirectory), ''), '/');
}

async function getLastModified(config, metadata, filePath) {
  if (metadata.modified) return moment(metadata.modified).format();
  const realPath = await fs.realpath(path.join(config.content_dir, filePath));
  const stats = await fs.lstat(realPath);
  return moment(stats.mtime).format();
}

function cleanString(value, useSnakeCase = false) {
  const cleanedValue = value.replaceAll('/', ' ').trim();
  return useSnakeCase ? snakeCase(cleanedValue) : trim(kebabCase(cleanedValue), '-');
}

function cleanObjectStrings(object) {
  const cleanedObject = {};
  for (const key of Object.keys(object)) {
    cleanedObject[cleanString(key, true)] = object[key]
      ? object[key].toString().trim()
      : '';
  }
  return cleanedObject;
}

function slugToTitle(slug) {
  const basename = path.basename(slug.replaceAll('.md', '').trim());
  return startCase(basename.replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (BLOCK_META_PATTERN.test(content)) return content.replace(BLOCK_META_PATTERN, '').trim();
  if (YAML_META_PATTERN.test(content)) return content.replace(YAML_META_PATTERN, '').trim();
  return content;
}

function processMeta(content) {
  if (BLOCK_META_PATTERN.test(content)) {
    const metadata = {};
    const lines = content.match(BLOCK_META_PATTERN)[1].trim().split('\n');
    for (const line of lines) {
      const separatorIndex = line.indexOf(': ');
      if (separatorIndex !== -1) {
        const key = cleanString(line.substring(0, separatorIndex), true);
        metadata[key] = line.substring(separatorIndex + 2);
      }
    }
    return metadata;
  }
  if (YAML_META_PATTERN.test(content)) {
    const yamlSource = content.match(YAML_META_PATTERN)[1].trim();
    return cleanObjectStrings(yaml.load(yamlSource));
  }
  return {};
}

function processVars(content, config) {
  let processedContent = content;
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      processedContent = processedContent.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.content,
      );
    });
  }
  processedContent = processedContent.replaceAll('%base_url%', config.base_url || '');
  processedContent = processedContent.replaceAll('%image_url%', config.image_url || '');
  return processedContent;
}

async function extractDocument(_documentId, filePath) {
  try {
    const body = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(body);
    return { id: filePath, title: metadata.title, body };
  } catch (error) {
    console.error(error);
    return null;
  }
}

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function handler(filePath, config) {
  const contentDirectory = normalizeDir(config.content_dir);
  const slug = getSlug(filePath, contentDirectory);
  const sourcePath = path.join(contentDirectory, filePath);
  const document = await extractDocument(slug, sourcePath, config);
  const metadata = processMeta(document.body);
  const markdown = processVars(stripMeta(document.body), config);
  const body = sanitizeHtmlOutput(marked(markdown));
  const excerpt = unescape(sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }));
  return { slug, title: metadata.title || slugToTitle(slug), body, excerpt };
}

export { handler as default };
