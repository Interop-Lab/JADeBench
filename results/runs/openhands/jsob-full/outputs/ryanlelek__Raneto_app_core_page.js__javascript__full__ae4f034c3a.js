import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import unescape from 'lodash/unescape.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import { marked } from 'marked';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
const ACCESS_DENIED_MESSAGE = 'Access denied: file path is outside allowed directories';

const normalizeDir = (directory) => directory.replaceAll('\\', '/');

const getSlug = (filePath, contentDir) =>
  normalizeDir(filePath).replaceAll(normalizeDir(contentDir), '').trim();

async function getLastModified(config, metadata, filePath) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(config.datetime_format);
  }

  const contentDir = path.resolve(config.content_dir);
  const allowedDirectories = [contentDir];
  if (config.theme_dir) {
    allowedDirectories.push(path.resolve(config.theme_dir));
  }

  const isAllowedPath = (candidate) =>
    allowedDirectories.some(
      (directory) => candidate.startsWith(directory + path.sep) || candidate === directory,
    );

  const resolvedFilePath = path.resolve(filePath);
  if (!isAllowedPath(resolvedFilePath)) {
    throw new Error(ACCESS_DENIED_MESSAGE);
  }

  const realFilePath = await fs.realpath(resolvedFilePath);
  if (!isAllowedPath(realFilePath)) {
    throw new Error(ACCESS_DENIED_MESSAGE);
  }

  const { mtime } = await fs.lstat(realFilePath);
  return moment(mtime).format(config.datetime_format);
}

function cleanString(value, useSnakeCase = false) {
  const cleanedValue = value.replaceAll('/', ' ').trim();
  if (useSnakeCase) {
    return snakeCase(cleanedValue);
  }
  return trim(kebabCase(cleanedValue), '-');
}

function cleanObjectStrings(input) {
  const result = {};
  for (const key in input) {
    if (Object.hasOwn(input, key)) {
      result[cleanString(key, true)] = ('' + input[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  const cleanedSlug = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(cleanedSlug).replaceAll(/[-_]/g, ' '));
}

function stripMeta(document) {
  if (META_REGEX.test(document)) {
    return document.replace(META_REGEX, '').trim();
  }
  if (META_REGEX_YAML.test(document)) {
    return document.replace(META_REGEX_YAML, '').trim();
  }
  return document.trim();
}

function processMeta(document) {
  if (META_REGEX.test(document)) {
    const metadata = {};
    const match = document.match(META_REGEX);
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

  if (META_REGEX_YAML.test(document)) {
    const match = document.match(META_REGEX_YAML);
    const metadataText = match?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadataText));
  }

  return {};
}

function processVars(content, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      content = content.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.content,
      );
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

async function extractDocument(rootDir, filePath, debug) {
  try {
    const document = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(document);
    const id = filePath.replaceAll(rootDir, '').trim();
    const title = metadata.title ? metadata.title : slugToTitle(id);
    return { id, title, body: document };
  } catch (error) {
    if (debug) {
      console.log(error);
    }
    return null;
  }
}

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

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function handler(filePath, config) {
  const contentDir = normalizeDir(path.normalize(config.content_dir));

  try {
    const rawMarkdown = await fs.readFile(filePath, 'utf8');

    let slug = getSlug(filePath, contentDir);
    if (slug.includes('index.md')) {
      slug = slug.replaceAll('index.md', '');
    }
    slug = slug.replaceAll('.md', '').trim();

    const metadata = processMeta(rawMarkdown);
    const markdown = processVars(stripMeta(rawMarkdown), config);
    const body = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title ? metadata.title : slugToTitle(slug);
    const plainText = unescape(
      sanitizeHtml(body, {
        allowedTags: [],
        allowedAttributes: {},
      }),
    );
    const excerptLength = config.excerpt_length || 400;
    const excerpt =
      plainText.length > excerptLength
        ? plainText
            .slice(0, excerptLength)
            .trimEnd()
            .replace(/\s\S+$/, '') + '...'
        : plainText;

    return { slug, title, body, excerpt };
  } catch (error) {
    if (config.debug) {
      console.log(error);
    }
    return null;
  }
}

export default handler;
