import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import lodash from 'lodash';
import yaml from 'js-yaml';
import { glob } from 'glob';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const normalizeDir = directory => directory.replaceAll('\\', '/');

const getSlug = (filePath, contentDirectory) =>
  normalizeDir(filePath).replaceAll(normalizeDir(contentDirectory), '').trim();

async function getLastModified(config, metadata, filePath) {
  if (metadata.modified) {
    return moment(metadata.modified).format(config.datetime_format);
  }

  const allowedDirectories = [path.resolve(config.content_dir)];
  if (config.theme_dir) {
    allowedDirectories.push(path.resolve(config.theme_dir));
  }

  const resolvedPath = path.resolve(filePath);
  if (!allowedDirectories.some(directory => resolvedPath.startsWith(directory))) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const realPath = await fs.realpath(resolvedPath);
  const fileStats = await fs.lstat(realPath);
  return moment(fileStats.mtime).format(config.datetime_format);
}

const utils = {
  normalizeDir,
  getLastModified,
  getSlug,
};

function cleanString(value, useSnakeCase = false) {
  const normalized = value.replaceAll('/', ' ').trim();
  return useSnakeCase ? snakeCase(normalized) : kebabCase(normalized).replaceAll('_', '-');
}

function cleanObjectStrings(object) {
  const cleaned = {};
  if (!object) return cleaned;

  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleaned[key] = trim(String(object[key]));
    }
  }
  return cleaned;
}

function slugToTitle(slug) {
  const basename = path.basename(slug.replaceAll('.md', '').trim());
  return startCase(basename.replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) {
    return content.replace(META_REGEX, '').trim();
  }
  if (META_REGEX_YAML.test(content)) {
    return content.replace(META_REGEX_YAML, '').trim();
  }
  return content;
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const metadata = {};
    const block = content.match(META_REGEX)[1].trim();
    if (!block) return metadata;

    for (const line of block.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator === -1) continue;

      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      if (key && value) metadata[key] = trim(value);
    }
    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const block = content.match(META_REGEX_YAML)[1].trim();
    if (!block) return {};
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(content, config) {
  let processed = content;

  if (Array.isArray(config.variables)) {
    config.variables.forEach(variable => {
      processed.replaceAll(variable.name, variable.content);
    });
  }
  if (config.base_url) {
    processed = processed.replaceAll('%base_url%', config.base_url);
  }
  if (config.image_url) {
    processed = processed.replaceAll('%image_url%', config.image_url);
  }

  return processed;
}

async function extractDocument(metadataBlock, filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(content);
    return {
      id: filePath,
      title: metadata.title || slugToTitle(filePath),
      body: content,
    };
  } catch (error) {
    console.log(error);
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

const metaBool = (value, defaultValue) => (value ? value === 'true' : defaultValue);

async function processMarkdownFile(config, currentPath, contentDirectory, filePath, relativePath) {
  let slug = relativePath.includes('index.md')
    ? relativePath.replaceAll('index.md', '').trim()
    : relativePath.replaceAll('.md', '').trim();

  try {
    const content = await fs.readFile(filePath, 'utf8');
    const metadata = contentProcessors.processMeta(content);
    const sort = Number.parseInt(metadata[config.page_sort_meta], 10) || 0;

    return {
      slug,
      title: metadata.title || slugToTitle(slug),
      show_on_home: metaBool(metadata.show_on_home, config.show_on_home_default),
      is_directory: false,
      show_on_menu: metaBool(metadata.show_on_menu, config.show_on_menu_default),
      active: currentPath === `/${slug}`,
      sort,
    };
  } catch (error) {
    if (config.debug) console.log(error);
    return null;
  }
}

async function processDirectory(config, currentPath, contentDirectory, relativePath, slug) {
  const directoryPath = path.join(contentDirectory, relativePath);
  const ignorePath = path.join(directoryPath, 'ignore');

  try {
    const ignoreStats = await fs.lstat(ignorePath);
    if (ignoreStats.isFile()) {
      if (config.debug) console.log('Directory ignored', directoryPath);
      return null;
    }
  } catch {}

  let metadata = {};
  let parsedSort = 0;
  try {
    const metadataContent = await fs.readFile(path.join(directoryPath, 'meta'), 'utf8');
    metadata = contentProcessors.cleanObjectStrings(yaml.load(metadataContent));
    if (config.category_sort) {
      parsedSort = Number.parseInt(metadata.sort, 10);
    }
  } catch (error) {
    if (config.debug) console.log('No meta file for', directoryPath, error.message);
  }

  if (Number.isNaN(parsedSort)) {
    if (config.debug) console.log('No sort file for', directoryPath);
  }

  return {
    slug,
    title: metadata.title || lodash.startCase(path.basename(relativePath).replaceAll(/[-_]/g, ' ')),
    show_on_home: metaBool(metadata.show_on_home, config.show_on_home_default),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(metadata.show_on_menu, config.show_on_menu_default),
    active: currentPath.startsWith(`/${slug}`),
    class: `category-${cleanString(slug)}`,
    sort: metadata.sort || parsedSort,
    description: metadata.description || '',
    files: [],
  };
}

async function processFile(config, currentPath, contentDirectory, filePath) {
  const relativePath = normalizeDir(path.relative(contentDirectory, filePath));
  const slug = getSlug(filePath, contentDirectory).replace(/^\//, '');
  const stats = await fs.stat(filePath);

  if (stats.isDirectory()) {
    return processDirectory(config, currentPath, contentDirectory, relativePath, slug);
  }
  if (stats.isFile() && path.extname(filePath) === '.md') {
    return processMarkdownFile(config, currentPath, contentDirectory, filePath, slug);
  }
  return null;
}

async function handler(currentPath, config) {
  const currentCategory = currentPath.split(/[\\/]/).slice(0, 2).join('/');
  const contentDirectory = utils.normalizeDir(path.normalize(config.content_dir));
  const paths = await glob(`${contentDirectory}/**/*`);
  const processed = await Promise.all(
    paths.map(filePath => processFile(config, currentPath, contentDirectory, filePath)),
  );

  const rootCategory = {
    slug: '.',
    title: '',
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: true,
    class: 'category-index',
    sort: 0,
    files: [],
  };
  const categories = [rootCategory];

  processed.forEach(item => {
    if (item?.is_directory) categories.push(item);
  });

  processed.forEach(item => {
    if (!item || item.is_directory) return;

    const directory = path.dirname(item.slug);
    const category = categories.find(candidate => candidate.slug === directory);
    if (category) {
      category.files.push(item);
    } else if (config.debug) {
      console.log('Content ignored', item.slug);
    }
  });

  rootCategory.active = !categories.some(
    category => category !== rootCategory && `/${category.slug}` === currentCategory,
  );

  return categories
    .toSorted((left, right) => left.sort - right.sort)
    .map(category => ({
      ...category,
      files: category.files.toSorted((left, right) => left.sort - right.sort),
    }));
}

export default handler;
