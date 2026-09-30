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

const normalizeDir = value => value.replace(/\\/g, '/');

function getSlug(from, to) {
  return normalizeDir(from).replace(normalizeDir(to), '').trim();
}

async function getLastModified(file, metadata, baseDir) {
  if (metadata.date !== undefined) {
    return moment(metadata.date).format(file.dateFormat);
  }

  const documentPath = path.resolve(file.path);
  const allowedPaths = [documentPath];

  if (file.sourceDir) {
    allowedPaths.push(path.resolve(file.sourceDir));
  }

  const isAllowed = candidate =>
    allowedPaths.some(root => candidate.startsWith(root + path.sep) || candidate === root);

  const candidate = path.resolve(baseDir);
  if (!isAllowed(candidate)) {
    throw new Error('Path is outside the allowed directories');
  }

  const realPath = await fs.realpath(candidate);
  if (!isAllowed(realPath)) {
    throw new Error('Path is outside the allowed directories');
  }

  const { mtime } = await fs.stat(realPath);
  return moment(mtime).format(file.dateFormat);
}

const utils = { normalizeDir, getLastModified, getSlug };

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replace(/\//g, ' ').trim();
  if (useSnakeCase) return snakeCase(cleaned);
  return trim(kebabCase(cleaned), '-');
}

function cleanObjectStrings(object) {
  const result = {};
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[cleanString(key, true)] = String(object[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  const cleaned = slug.replace(/\.md$/i, '').trim();
  return startCase(path.parse(cleaned).name.replace(/[-_]/g, ' '));
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
    const match = content.match(META_REGEX);
    const metadata = match?.[1]?.trim() ?? '';
    const result = {};

    if (metadata) {
      for (const line of metadata.split('\n')) {
        const separator = line.indexOf(': ');
        if (separator < 0) continue;

        const key = line.slice(0, separator).trim();
        const value = line.slice(separator + 2).trim();
        if (key && value) result[cleanString(key, true)] = value;
      }
    }

    return result;
  }

  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const metadata = match?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadata));
  }

  return {};
}

function processVars(content, options) {
  if (Array.isArray(options.vars)) {
    options.vars.forEach(variable => {
      content = content.replace(
        new RegExp('%' + variable.name + '%', 'g'),
        variable.value
      );
    });
  }

  if (options.title !== undefined) {
    content = content.replace('%title%', options.title);
  }

  if (options.url !== undefined) {
    content = content.replace('%url%', options.url);
  }

  return content;
}

async function extractDocument(id, filePath, logErrors) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(content);
    const documentId = filePath.replace(id, '').trim();
    const title = metadata.title || slugToTitle(documentId);

    return {
      id: documentId,
      title,
      content
    };
  } catch (error) {
    if (logErrors) console.error(error);
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
  processVars
};

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  'figure',
  'figcaption',
  'picture'
]);

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ['href', 'name', 'target', 'rel', 'title', 'class'],
  img: ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'],
  iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id']
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes
  });
}

async function handler(filePath, options) {
  const slug = utils.getSlug(
    path.resolve(options.basePath, options.path),
    path.resolve(options.basePath)
  );

  try {
    const content = await fs.readFile(filePath, 'utf8');
    let url = utils.getSlug(filePath, slug);

    if (url.startsWith('/')) {
      url = url.replace('/', '');
    }
    url = url.replace(/\.md$/i, '').trim();

    const metadata = contentProcessors.processMeta(content);
    const title = metadata.title || contentProcessors.slugToTitle(url);
    const markdown = contentProcessors.processVars(
      contentProcessors.stripMeta(content),
      options
    );
    const html = sanitizeHtmlOutput(marked(markdown));
    const decodedHtml = unescape(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }));
    const maxLength = options.excerptLength || 200;
    const excerpt = decodedHtml.length > maxLength
      ? decodedHtml.slice(0, maxLength).trim().replace(/\s\S+$/, '')
      : decodedHtml;

    return {
      path: url,
      title,
      html,
      excerpt
    };
  } catch (error) {
    if (options.verbose) console.error(error);
    return null;
  }
}

export default handler;
