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

const normalizeDir = directory => directory.replaceAll('\\', '/');

const getSlug = (filePath, baseDirectory) =>
  normalizeDir(filePath).replaceAll(normalizeDir(baseDirectory), '').trim();

async function getLastModified(config, page, filePath) {
  if (page.modified !== undefined) {
    return moment(page.modified).format(config.datetime_format);
  }

  const contentDirectory = path.resolve(config.content_dir);
  const allowedDirectories = [contentDirectory];
  if (config.theme_dir) {
    allowedDirectories.push(path.resolve(config.theme_dir));
  }

  const isAllowedPath = resolvedPath =>
    allowedDirectories.some(
      directory => resolvedPath.startsWith(directory + path.sep) || resolvedPath === directory,
    );

  const resolvedPath = path.resolve(filePath);
  if (!isAllowedPath(resolvedPath)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const realPath = await fs.realpath(resolvedPath);
  if (!isAllowedPath(realPath)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const { mtime } = await fs.lstat(realPath);
  return moment(mtime).format(config.datetime_format);
}

const utils = { normalizeDir, getLastModified, getSlug };

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  if (useSnakeCase) {
    return snakeCase(cleaned);
  }
  return trim(kebabCase(cleaned), '-');
}

function cleanObjectStrings(object) {
  const cleaned = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleaned[cleanString(key, true)] = ('' + object[key]).trim();
    }
  }
  return cleaned;
}

function slugToTitle(slug) {
  const withoutExtension = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(withoutExtension).replaceAll(/[-_]/g, ' '));
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
    const metadata = {};
    const match = content.match(META_REGEX);
    const metadataText = match?.[1]?.trim() ?? '';

    if (metadataText) {
      for (const line of metadataText.split('\n')) {
        const separatorIndex = line.indexOf(': ');
        if (separatorIndex <= 0) {
          continue;
        }

        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 2).trim();
        if (key && value) {
          metadata[cleanString(key, true)] = value;
        }
      }
    }

    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const metadataText = match?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadataText));
  }

  return {};
}

function processVars(content, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach(variable => {
      content = content.replaceAll(new RegExp(`%${variable.name}%`, 'g'), variable.content);
    });
  }

  if (config.base_url !== undefined) {
    content = content.replaceAll('%base_url%', config.base_url);
  }

  if (config.image_url !== undefined) {
    content = content.replaceAll('%image_url%', config.image_url);
  }

  return content;
}

async function extractDocument(contentDirectory, filePath, debug) {
  try {
    const body = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(body);
    const id = filePath.replaceAll(contentDirectory, '').trim();
    const title = metadata.title ? metadata.title : slugToTitle(id);
    return { id, title, body };
  } catch (error) {
    if (debug) {
      console.log(error);
    }
    return null;
  }
}

const contentProcessors = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

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

function sanitizeHtmlOutput(content) {
  return sanitizeHtml(content, { allowedTags, allowedAttributes });
}

async function handler(filePath, config) {
  const contentDirectory = utils.normalizeDir(path.normalize(config.content_dir));

  try {
    const source = await fs.readFile(filePath, 'utf8');
    let slug = utils.getSlug(filePath, contentDirectory);
    if (slug.includes('index.md')) {
      slug = slug.replaceAll('index.md', '');
    }
    slug = slug.replaceAll('.md', '').trim();

    const metadata = contentProcessors.processMeta(source);
    const processedSource = contentProcessors.processVars(
      contentProcessors.stripMeta(source),
      config,
    );
    const body = sanitizeHtmlOutput(marked(processedSource));
    const title = metadata.title ? metadata.title : contentProcessors.slugToTitle(slug);
    const plainText = unescape(sanitizeHtml(body, { allowedTags: [], allowedAttributes: {} }));
    const excerptLength = config.excerpt_length || 400;
    const excerpt =
      plainText.length > excerptLength
        ? plainText.slice(0, excerptLength).trimEnd().replace(/\s\S+$/, '') + '...'
        : plainText;

    return { slug, title, body, excerpt };
  } catch (error) {
    if (config.debug) {
      console.log(error);
    }
    return null;
  }
}

export { handler as default };
