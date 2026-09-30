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
const YAML_META_REGEX = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filename, contentDirectory) {
  return normalizeDir(filename).replaceAll(normalizeDir(contentDirectory), '').trim();
}

async function getLastModified(config, metadata, filename) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(config.date_format);
  }

  const allowedRoots = [path.resolve(config.content_dir)];
  if (config.theme_dir) allowedRoots.push(path.resolve(config.theme_dir));

  const resolvedFilename = path.resolve(filename);
  const isAllowed = (candidate) => allowedRoots.some(
    (root) => candidate.startsWith(`${root}${path.sep}`) || candidate === root,
  );

  if (!isAllowed(resolvedFilename)) throw new Error('File is outside an allowed directory');

  const realFilename = await fs.realpath(resolvedFilename);
  if (!isAllowed(realFilename)) throw new Error('File is outside an allowed directory');

  const { mtime } = await fs.stat(realFilename);
  return moment(mtime).format(config.date_format);
}

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
  const basename = path.basename(slug.replaceAll('.md', '').trim());
  return startCase(basename.replaceAll(/[-_]/g, ' '));
}

function stripMeta(document) {
  if (META_REGEX.test(document)) return document.replace(META_REGEX, '').trim();
  if (YAML_META_REGEX.test(document)) return document.replace(YAML_META_REGEX, '').trim();
  return document.trim();
}

function processMeta(document) {
  const legacyMatch = document.match(META_REGEX);
  if (legacyMatch) {
    const metadata = {};
    const block = legacyMatch?.[1]?.trim() ?? '';
    if (!block) return metadata;

    for (const line of block.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator === -1) continue;
      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      if (key && value) metadata[cleanString(key, true)] = value;
    }
    return metadata;
  }

  const yamlMatch = document.match(YAML_META_REGEX);
  if (yamlMatch) {
    const block = yamlMatch?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(document, config) {
  if (Array.isArray(config.vars)) {
    config.vars.forEach((variable) => {
      document = document.replaceAll(new RegExp(`%${variable.name}%`, 'g'), variable.value);
    });
  }
  if (config.site_title !== undefined) document = document.replaceAll('%site_title%', config.site_title);
  if (config.analytics !== undefined) document = document.replaceAll('%analytics%', config.analytics);
  return document;
}

async function extractDocument(contentDirectory, filename, debug) {
  try {
    const content = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(content);
    const id = filename.replaceAll(contentDirectory, '').trim();
    return {
      id,
      title: metadata.title || slugToTitle(id),
      content,
    };
  } catch (error) {
    if (debug) console.error(error);
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

async function handler(filename, config) {
  const contentDirectory = normalizeDir(path.dirname(config.content_dir));

  try {
    const document = await fs.readFile(filename, 'utf8');
    let slug = getSlug(filename, contentDirectory);
    if (slug.endsWith('README.md')) slug = slug.replaceAll('README.md', '');
    slug = slug.replaceAll('.md', '').trim();

    const metadata = processMeta(document);
    const markdown = processVars(stripMeta(document), config);
    const content = sanitizeHtmlOutput(marked(markdown));
    const title = metadata.title || slugToTitle(slug);
    const plainText = unescape(sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }));
    const excerptLength = config.excerpt_length || 400;
    const excerpt = plainText.length > excerptLength
      ? `${plainText.substring(0, excerptLength).trim().replace(/\s\S+$/, '')}...`
      : plainText;

    return { slug, title, content, excerpt };
  } catch (error) {
    if (config.debug) console.error(error);
    return null;
  }
}

export default handler;
