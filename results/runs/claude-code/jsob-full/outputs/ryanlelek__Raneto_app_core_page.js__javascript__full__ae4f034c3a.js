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

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filename, baseDirectory) {
  return normalizeDir(filename).replaceAll(normalizeDir(baseDirectory), '').trim();
}

async function getLastModified(config, metadata, filename) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(config.datetime_format);
  }

  const allowedDirectories = [path.dirname(config.content_dir)];
  if (config.theme_dir) allowedDirectories.push(path.dirname(config.theme_dir));

  const isAllowed = (candidate) => allowedDirectories.some(
    (directory) => candidate.startsWith(`${directory}${path.sep}`) || candidate === directory,
  );

  const resolvedFilename = path.resolve(filename);
  if (!isAllowed(resolvedFilename)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const realFilename = await fs.realpath(resolvedFilename);
  if (!isAllowed(realFilename)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const { mtime } = await fs.lstat(realFilename);
  return moment(mtime).format(config.datetime_format);
}

const utils = { normalizeDir, getLastModified, getSlug };

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  return useSnakeCase ? snakeCase(cleaned) : trim(kebabCase(cleaned), '-');
}

function cleanObjectStrings(object) {
  const cleaned = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleaned[cleanString(key, true)] = String(object[key]).trim();
    }
  }
  return cleaned;
}

function slugToTitle(slug) {
  const filename = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(filename).replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) return content.replace(META_REGEX, '').trim();
  if (META_REGEX_YAML.test(content)) return content.replace(META_REGEX_YAML, '').trim();
  return content.trim();
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const metadata = {};
    const block = content.match(META_REGEX)?.[1]?.trim() ?? '';
    if (block) {
      for (const line of block.split('\n')) {
        const separator = line.indexOf(': ');
        if (separator <= 0) continue;
        const key = line.substring(0, separator).trim();
        const value = line.substring(separator + 2).trim();
        if (key && value) metadata[cleanString(key, true)] = value;
      }
    }
    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const block = content.match(META_REGEX_YAML)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(content, options) {
  if (options.variables && Array.isArray(options.variables)) {
    options.variables.forEach((variable) => {
      content = content.replaceAll(new RegExp(`%${variable.name}%`, 'g'), variable.value);
    });
  }
  if (options.image_url !== undefined) {
    content = content.replaceAll('%image_url%', options.image_url);
  }
  if (options.base_url !== undefined) {
    content = content.replaceAll('%base_url%', options.base_url);
  }
  return content;
}

async function extractDocument(baseDirectory, filename, logErrors) {
  try {
    const content = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(content);
    const id = filename.replaceAll(baseDirectory, '').trim();
    const title = metadata.title ? metadata.title : slugToTitle(id);
    return { id, title, content };
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
  processVars,
};

const allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'input', 'del']);
const allowedAttributes = { ...sanitizeHtml.defaults.allowedAttributes };
allowedAttributes.img = ['src', 'srcset', 'alt', 'title', 'width', 'height', 'loading'];
allowedAttributes.input = ['type', 'checked', 'disabled'];
allowedAttributes.h1 = ['id'];
allowedAttributes.h2 = ['id'];
allowedAttributes.h3 = ['id'];
allowedAttributes.h4 = ['id'];
allowedAttributes.h5 = ['id'];
allowedAttributes.h6 = ['id'];
allowedAttributes.code = ['class'];
allowedAttributes.pre = ['class'];
allowedAttributes.span = ['class'];

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, { allowedTags, allowedAttributes });
}

async function handler(filename, options) {
  const inputDirectory = utils.normalizeDir(path.dirname(options.content_dir));

  try {
    const source = await fs.readFile(filename, 'utf8');
    let slug = utils.getSlug(filename, inputDirectory);
    if (slug.endsWith('/index.md')) slug = slug.replaceAll('/index.md', '');
    slug = slug.replaceAll('.md', '').trim();

    const metadata = contentProcessors.processMeta(source);
    const markdown = contentProcessors.processVars(contentProcessors.stripMeta(source), options);
    const html = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title ? metadata.title : contentProcessors.slugToTitle(slug);
    const text = unescape(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }));
    const excerptLength = options.excerpt_length || 400;
    const excerpt = text.length > excerptLength
      ? `${text.substring(0, excerptLength).trim().replace(/\s\S+$/, '')}...`
      : text;

    return { slug, title, html, excerpt };
  } catch (error) {
    if (options.debug) console.error(error);
    return null;
  }
}

export { handler as default };
