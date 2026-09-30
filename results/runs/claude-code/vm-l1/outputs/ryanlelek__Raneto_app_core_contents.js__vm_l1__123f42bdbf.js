import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import snakeCase from 'lodash/snakeCase.js';
import startCase from 'lodash/startCase.js';
import yaml from 'js-yaml';
import lodash from 'lodash';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(directory) {
  return directory.replaceAll('\\', '/');
}

function getSlug(filePath, contentDirectory) {
  return normalizeDir(filePath.replaceAll(contentDirectory, '').trim());
}

async function getLastModified(filePath, config, modifiedDates = []) {
  const allowedDirectories = [config.content_dir, config.theme_dir]
    .filter(Boolean)
    .map((directory) => path.resolve(directory));
  const resolvedPath = path.resolve(filePath);

  if (!allowedDirectories.some((directory) =>
    resolvedPath === directory || resolvedPath.startsWith(`${directory}${path.sep}`))) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const realPath = await fs.realpath(resolvedPath);
  const stats = await fs.lstat(realPath);
  modifiedDates.push(stats.mtime);

  if (config.datetime_format) {
    return moment.max(modifiedDates.map((date) => moment(date))).format(config.datetime_format);
  }
  return new Date(Math.max(...modifiedDates.map((date) => new Date(date).getTime())));
}

function cleanString(value) {
  if (typeof value !== 'string') return value;
  return value.replaceAll('\r', '').trim();
}

function cleanObjectStrings(value) {
  if (Array.isArray(value)) return value.map(cleanObjectStrings);
  if (!value || typeof value !== 'object') return cleanString(value);
  for (const key of Object.keys(value)) value[key] = cleanObjectStrings(value[key]);
  return value;
}

function slugToTitle(slug) {
  return startCase(path.basename(slug.replaceAll('.md', '').trim()).replace(/[-_]/g, ' '));
}

function stripMeta(contents) {
  if (META_REGEX.test(contents)) return contents.replace(META_REGEX, '').trim();
  if (META_REGEX_YAML.test(contents)) return contents.replace(META_REGEX_YAML, '').trim();
  return contents.trim();
}

function processMeta(contents) {
  if (META_REGEX.test(contents)) {
    const block = contents.match(META_REGEX)?.[1]?.trim() ?? '';
    const meta = {};
    for (const line of block.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator === -1) continue;
      meta[line.substring(0, separator).trim()] = cleanString(line.substring(separator + 2));
    }
    return meta;
  }
  if (META_REGEX_YAML.test(contents)) {
    const block = contents.match(META_REGEX_YAML)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block) ?? {});
  }
  return {};
}

function processVars(value, config) {
  if (Array.isArray(value)) return value.map((item) => processVars(item, config));
  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = processVars(value[key], config);
    return value;
  }
  if (typeof value !== 'string') return value;
  return value
    .replaceAll('%base_url%', config.base_url ?? '')
    .replaceAll('%image_url%', config.image_url ?? '');
}

async function extractDocument(filePath, slug, config) {
  try {
    const contents = await fs.readFile(filePath, 'utf8');
    const meta = processMeta(contents);
    const normalizedSlug = slug.replaceAll('.md', '').trim();
    return {
      ...meta,
      title: meta.title || slugToTitle(normalizedSlug),
      id: meta.id || normalizedSlug,
      body: stripMeta(contents),
    };
  } catch (error) {
    if (config.debug) console.log(error);
    throw error;
  }
}

function metaBool(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'string') return value.toLowerCase() === 'true';
  return Boolean(value);
}

function sortByConfiguredOrder(items, sortOrder = []) {
  const positions = new Map(sortOrder.map((slug, index) => [slug, index]));
  return items.toSorted((left, right) => {
    const leftPosition = positions.get(left.slug) ?? left.sort ?? Number.MAX_SAFE_INTEGER;
    const rightPosition = positions.get(right.slug) ?? right.sort ?? Number.MAX_SAFE_INTEGER;
    return leftPosition - rightPosition || left.title.localeCompare(right.title);
  });
}

async function processMarkdownFile(filePath, relativePath, config, directoryMeta = {}, sortOrder = []) {
  const contents = await fs.readFile(filePath, 'utf8');
  const slug = normalizeDir(relativePath).replaceAll('.md', '').trim();
  const meta = processMeta(contents);
  const sort = Number.parseInt(meta.sort ?? sortOrder.indexOf(path.basename(filePath)), 10);
  const document = {
    ...meta,
    slug,
    title: meta.title || slugToTitle(slug),
    body: stripMeta(contents),
    show_on_home: metaBool(meta.show_on_home, directoryMeta.show_on_home_default ?? false),
    is_directory: false,
    show_on_menu: metaBool(meta.show_on_menu, directoryMeta.show_on_menu_default ?? false),
    active: `/${slug}`,
  };
  if (!Number.isNaN(sort) && sort >= 0) document.sort = sort;
  processVars(document, config);
  if (config.debug) console.log(`Processed ${filePath}`);
  return document;
}

async function processFile(filePath, contentDirectory, config, directoryMeta = {}) {
  const relativePath = normalizeDir(path.relative(contentDirectory, filePath));
  const stats = await fs.stat(filePath);
  if (stats.isDirectory()) return processDirectory(filePath, relativePath, config, directoryMeta);
  if (stats.isFile() && path.extname(filePath).toLowerCase() === '.md') {
    return processMarkdownFile(filePath, relativePath, config, directoryMeta);
  }
  return null;
}

async function processDirectory(directoryPath, relativePath, config, inheritedMeta = {}, inheritedSort = []) {
  const metaPath = path.join(directoryPath, 'meta');
  let directoryMeta = { ...inheritedMeta };
  try {
    const metaStats = await fs.lstat(metaPath);
    if (metaStats.isFile()) {
      directoryMeta = {
        ...directoryMeta,
        ...cleanObjectStrings(yaml.load(await fs.readFile(metaPath, 'utf8')) ?? {}),
      };
    }
  } catch (error) {
    if (error.code !== 'ENOENT' && config.debug) console.log(error);
    else if (config.debug) console.log(`No meta file for ${directoryPath}`);
  }

  const ignore = directoryMeta.ignore ?? [];
  if (ignore === true) {
    if (config.debug) console.log(`Directory ignored: ${directoryPath}`);
    return null;
  }

  const categorySort = directoryMeta.category_sort ?? inheritedSort;
  const slug = normalizeDir(relativePath).replace(/^\/+|\/+$/g, '');
  const files = [];
  for (const entry of await fs.readdir(directoryPath)) {
    if (entry === 'meta' || (Array.isArray(ignore) && ignore.includes(entry))) continue;
    const item = await processFile(path.join(directoryPath, entry), config.content_dir, config, directoryMeta);
    if (item) files.push(item);
  }

  const category = {
    slug,
    title: directoryMeta.title || lodash.startCase(path.basename(directoryPath).replace(/[-_]/g, ' ')),
    show_on_home: metaBool(directoryMeta.show_on_home, directoryMeta.show_on_home_default ?? false),
    is_index: metaBool(directoryMeta.is_index, false),
    is_directory: true,
    show_on_menu: metaBool(directoryMeta.show_on_menu, directoryMeta.show_on_menu_default ?? false),
    active: slug ? `/${slug}` : '/',
    class: directoryMeta.class || `category-${snakeCase(slug || 'index')}`,
    description: cleanString(directoryMeta.description || ''),
    files: sortByConfiguredOrder(files, categorySort),
  };
  if (directoryMeta.sort !== undefined) category.sort = Number.parseInt(directoryMeta.sort, 10);
  processVars(category, config);
  return category;
}

async function handler(config, options = {}) {
  const contentDirectory = path.normalize(config.content_dir);
  const root = await processDirectory(contentDirectory, '', config, options.meta ?? {});
  if (!root) return [];
  const contents = root.files ?? [];
  if (!options.flat) return contents;
  const flatten = (items) => items.flatMap((item) =>
    item.is_directory ? [item, ...flatten(item.files ?? [])] : [item]);
  return flatten(contents);
}

handler.utils = { normalizeDir, getLastModified, getSlug };
handler.contentProcessors = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

export default handler;
