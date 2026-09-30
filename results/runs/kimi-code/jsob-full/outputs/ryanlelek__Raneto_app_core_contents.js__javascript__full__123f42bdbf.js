import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import { glob } from 'glob';
import lodash from 'lodash';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

const COMMENT_META = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META = /^\uFEFF?---([\s\S]*?)---/i;

const normalizeDir = directory => directory.replaceAll('\\', '/');

const getSlug = (filename, contentDirectory) =>
  normalizeDir(filename).replaceAll(normalizeDir(contentDirectory), '').trim();

async function getLastModified(config, metadata, filename) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(config.datetime_format);
  }

  const allowedDirectories = [path.resolve(config.content_dir)];
  if (config.theme_dir) allowedDirectories.push(path.resolve(config.theme_dir));

  const isAllowed = candidate =>
    allowedDirectories.some(directory =>
      candidate.startsWith(directory + path.sep) || candidate === directory,
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

function cleanString(value, asObjectKey = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  return asObjectKey ? snakeCase(cleaned) : trim(kebabCase(cleaned), '-');
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
  if (COMMENT_META.test(content)) return content.replace(COMMENT_META, '').trim();
  if (YAML_META.test(content)) return content.replace(YAML_META, '').trim();
  return content.trim();
}

function processMeta(content) {
  if (COMMENT_META.test(content)) {
    const metadata = {};
    const block = content.match(COMMENT_META)?.[1]?.trim() ?? '';
    for (const line of block.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator < 0) continue;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 2).trim();
      if (key && value) metadata[cleanString(key, true)] = value;
    }
    return metadata;
  }

  if (YAML_META.test(content)) {
    const block = content.match(YAML_META)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block) || {});
  }

  return {};
}

function processVars(content, config) {
  if (Array.isArray(config.variables)) {
    for (const variable of config.variables) {
      content = content.replaceAll(new RegExp(`%${variable.name}%`, 'g'), variable.value);
    }
  }
  if (config.base_url !== undefined) content = content.replaceAll('%base_url%', config.base_url);
  if (config.locale !== undefined) content = content.replaceAll('%locale%', config.locale);
  return content;
}

async function extractDocument(contentDirectory, filename, debug = false) {
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
    if (debug) console.log(error);
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

const metaBool = (value, defaultValue) => value ? value === 'true' : defaultValue;

async function processMarkdownFile(config, requestPath, filename, relativePath) {
  const sortMetadataKey = config.sort_meta || '';
  try {
    const content = await fs.readFile(filename, 'utf8');
    let slug = relativePath;
    let sort = 0;

    if (relativePath.endsWith('.md')) slug = slug.replaceAll('.md', '');
    slug = slug.replaceAll('index', '').trim();

    const metadata = processMeta(content);
    if (sortMetadataKey && metadata[sortMetadataKey]) {
      sort = Number.parseInt(metadata[sortMetadataKey], 10);
    }

    return {
      slug,
      title: metadata.title || slugToTitle(slug),
      show_on_home: metaBool(metadata.show_on_home, config.show_on_home_default),
      is_directory: false,
      show_on_menu: metaBool(metadata.show_on_menu, config.show_on_menu_default),
      active: requestPath.trim() === `/${slug}`,
      sort,
    };
  } catch (error) {
    if (config.debug) console.log(error);
    return null;
  }
}

async function processDirectory(config, requestPath, contentDirectory, directory, slug) {
  const absoluteDirectory = path.join(contentDirectory, directory);
  let hasIndex = false;
  try {
    hasIndex = (await fs.lstat(path.join(absoluteDirectory, 'index.md'))).isFile();
  } catch {}

  if (hasIndex && config.ignore_index) {
    if (config.debug) console.log('Ignoring directory with index file', absoluteDirectory);
    return null;
  }

  let metadata = {};
  try {
    const metadataContent = await fs.readFile(path.join(absoluteDirectory, 'meta'), 'utf8');
    metadata = cleanObjectStrings(yaml.load(metadataContent) || {});
  } catch (error) {
    if (config.debug) console.log('No meta file for', absoluteDirectory, error.message);
  }

  let sort = 0;
  if ((config.sort_by_number || false) && !metadata.sort) {
    try {
      sort = Number.parseInt(await fs.readFile(path.join(absoluteDirectory, 'sort'), 'utf8'), 10);
    } catch (error) {
      if (config.debug) console.log('No sort file for', absoluteDirectory, error.message);
    }
  }

  return {
    slug,
    title: metadata.title || lodash.startCase(path.basename(directory).replaceAll(/[-_]/g, ' ')),
    show_on_home: metaBool(metadata.show_on_home, config.show_on_home_default),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(metadata.show_on_menu, config.show_on_menu_default),
    active: requestPath.startsWith(`/${slug}`),
    class: `category-${cleanString(slug)}`,
    sort: metadata.sort || sort,
    description: metadata.description || '',
    files: [],
  };
}

async function processFile(config, requestPath, contentDirectory, filename) {
  const relative = path.relative(contentDirectory, filename);
  const normalizedRelative = relative.split('\\').join('/');
  const stats = await fs.lstat(filename);

  if (stats.isDirectory()) {
    return processDirectory(config, requestPath, contentDirectory, relative, normalizedRelative);
  }
  if (stats.isFile() && path.extname(relative) === '.md') {
    return processMarkdownFile(config, requestPath, filename, normalizedRelative);
  }
  return null;
}

async function handler(requestPath, config) {
  requestPath ||= '';
  const normalizedRequestPath = requestPath.split(/[\\/]/).slice(1, -1).join('/');
  const contentDirectory = path.resolve(config.content_dir);
  const filenames = await glob(path.join(contentDirectory, '**', '*'), { absolute: true });
  const entries = [{
    slug: '.',
    title: '',
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: normalizedRequestPath === '',
    class: 'category-index',
    sort: 0,
    files: [],
  }];

  const processed = await Promise.all(
    filenames.map(filename => processFile(config, requestPath, contentDirectory, filename)),
  );

  for (const entry of processed) {
    if (!entry) continue;
    if (entry.is_directory) {
      entries.push(entry);
    } else {
      const directorySlug = path.dirname(entry.slug);
      const directory = entries.find(candidate => candidate.slug === directorySlug);
      if (directory) directory.files.push(entry);
      else if (config.debug) console.log('No directory for file', entry.slug);
    }
  }

  const sorted = entries.sort((left, right) => left.sort - right.sort);
  sorted.forEach(entry => {
    entry.files = entry.files.sort((left, right) => left.sort - right.sort);
  });
  return sorted;
}

export default handler;
