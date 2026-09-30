import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import yaml from 'js-yaml';
import sanitizeHtml from 'sanitize-html';
import unescape from 'lodash/unescape.js';
import { marked } from 'marked';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filename, contentDirectory) {
  return normalizeDir(filename)
    .replaceAll(normalizeDir(contentDirectory), '')
    .trim();
}

function isInsideDirectory(filename, directory) {
  return filename === directory || filename.startsWith(`${directory}${path.sep}`);
}

async function getLastModified(config, page, filename) {
  const allowedDirectories = [config.content_dir, config.theme_dir]
    .filter(Boolean)
    .map(directory => path.resolve(directory));
  const realFilename = await fs.realpath(filename);

  if (!allowedDirectories.some(directory => isInsideDirectory(realFilename, directory))) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const stats = await fs.lstat(realFilename);
  return moment(page.modified || stats.mtime).format(config.datetime_format);
}

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  return useSnakeCase ? snakeCase(cleaned) : kebabCase(cleaned);
}

function cleanObjectStrings(object) {
  const cleaned = {};

  for (const key in Object(object)) {
    if (Object.hasOwn(object, key)) {
      cleaned[cleanString(key, true)] = String(object[key]).trim();
    }
  }

  return cleaned;
}

function slugToTitle(slug) {
  const basename = path.basename(slug.replaceAll('.md', '').trim());
  return startCase(basename.replace(/[-_]/g, ' '));
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
    const header = content.match(META_REGEX)?.[1]?.trim() ?? '';

    for (const line of header.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator === -1) {
        continue;
      }
      const key = cleanString(line.substring(0, separator).trim(), true);
      const value = line.substring(separator + 2).trim();
      metadata[key] = value;
    }

    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const header = content.match(META_REGEX_YAML)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(header) || {});
  }

  return {};
}

function processVars(content, config) {
  let processed = content;

  if (Array.isArray(config.variables)) {
    config.variables.forEach(variable => {
      processed = processed.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.content,
      );
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

async function extractDocument(_unused, filename) {
  try {
    const source = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(source);

    return {
      id: filename,
      title: metadata.title || slugToTitle(filename),
      body: source,
    };
  } catch (error) {
    console.log(error);
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
  const normalizedContentDirectory = normalizeDir(config.content_dir);
  const normalizedFilename = path.normalize(filename);
  const source = await fs.readFile(normalizedFilename, 'utf8');
  let slug = getSlug(normalizedFilename, normalizedContentDirectory);

  if (slug.includes('index.md')) {
    slug = slug.replaceAll('index.md', '').trim();
  } else {
    slug = slug.replaceAll('.md', '').trim();
  }

  const metadata = processMeta(source);
  const markdown = processVars(stripMeta(source), config);
  const html = sanitizeHtmlOutput(marked(markdown));
  const title = metadata.title || slugToTitle(slug);
  const excerptLength = config.excerpt_length || 400;
  let excerpt = unescape(sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }));

  if (excerpt.length >= excerptLength) {
    excerpt = `${excerpt
      .slice(0, excerptLength)
      .trimEnd()
      .replace(/\s\S+$/, '')}...`;
  }

  const page = {
    slug,
    title,
    body: html,
    excerpt,
  };

  if (config.debug) {
    console.log(page);
  }

  return page;
}

export default handler;
