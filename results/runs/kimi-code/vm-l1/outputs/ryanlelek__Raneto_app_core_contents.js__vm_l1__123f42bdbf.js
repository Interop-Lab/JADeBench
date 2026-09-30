import path from 'node:path';
import fs from 'fs-extra';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import { glob } from 'glob';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const normalizeDir = directory => directory.replaceAll('\\', '/');

const getSlug = (filename, baseDirectory) =>
  normalizeDir(filename).replaceAll(normalizeDir(baseDirectory), '').trim();

function cleanString(value) {
  if (value === false) return false;
  return trim(String(value).replaceAll('/', ' '));
}

function cleanObjectStrings(value) {
  if (!value || typeof value !== 'object') return cleanString(value);
  for (const key of Object.keys(value)) {
    if (Object.hasOwn(value, key)) value[key] = cleanObjectStrings(value[key]);
  }
  return value;
}

function slugToTitle(slug) {
  return startCase(trim(path.basename(slug).replaceAll('.md', '')).replaceAll(/[-_]/g, ' '));
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const lines = trim(content.match(META_REGEX)[1]).split('\n');
    const metadata = {};
    for (const line of lines) {
      const separator = line.indexOf(': ');
      if (separator !== -1) metadata[line.substring(0, separator)] = cleanString(line.substring(separator + 2));
    }
    return metadata;
  }
  if (META_REGEX_YAML.test(content)) {
    return cleanObjectStrings(yaml.load(trim(content.match(META_REGEX_YAML)[1])) || {});
  }
  return {};
}

function processVars(content, variables) {
  if (!variables || !Array.isArray(variables)) return content;
  variables.forEach(variable => {
    content = content.replaceAll(new RegExp(`%${variable.name}%`, 'g'), variable.content);
  });
  const baseUrl = variables.find(variable => variable.name === 'base_url');
  if (baseUrl) content = content.replaceAll('%base_url%', baseUrl.content);
  const imageUrl = variables.find(variable => variable.name === 'image_url');
  if (imageUrl) content = content.replaceAll('%image_url%', imageUrl.content);
  return content;
}

async function extractDocument(filename, slug, variables) {
  let content = await fs.readFile(filename, 'utf8');
  const meta = processMeta(content);
  content = trim(content.replace(META_REGEX, '').replace(META_REGEX_YAML, ''));
  content = processVars(content, variables);
  return { ...meta, title: meta.title || slugToTitle(slug), id: slug, body: content };
}

const metaBool = (value, defaultValue) => value === undefined ? defaultValue : value === true || value === 'true';

async function processMarkdownFile(filename, contentDirectory, config, variables, activeSlug) {
  const pageSortMeta = config.page_sort_meta || '';
  const content = await fs.readFile(filename, 'utf8');
  const isIndex = filename.includes('index.md');
  const slug = trim(getSlug(filename, contentDirectory).replaceAll('.md', ''), '/');
  const meta = processMeta(content);
  const sort = Number.parseInt(meta[pageSortMeta], 10) || 0;
  return {
    ...await extractDocument(filename, slug, variables),
    slug,
    title: meta.title || slugToTitle(slug),
    show_on_home: metaBool(meta.show_on_home, config.show_on_home_default),
    is_index: isIndex,
    is_directory: false,
    show_on_menu: metaBool(meta.show_on_menu, config.show_on_menu_default),
    active: activeSlug === `/${slug}`,
    sort,
  };
}

async function processFile(filename, contentDirectory, config, variables) {
  const stats = await fs.stat(filename);
  if (stats.isDirectory()) {
    return processDirectory(filename, contentDirectory, config, variables, config.active);
  }
  if (stats.isFile() && path.extname(filename) === '.md') {
    return processMarkdownFile(filename, contentDirectory, config, variables, config.active);
  }
  return undefined;
}

async function processDirectory(directory, contentDirectory, config, variables, activeSlug) {
  const metaFilename = path.join(directory, 'meta');
  let meta = {};
  try {
    const metaStats = await fs.lstat(metaFilename);
    if (metaStats.isFile()) meta = cleanObjectStrings(yaml.load(await fs.readFile(metaFilename, 'utf8')) || {});
  } catch (error) {
    if (config.debug) console.log('No meta file for', directory, error.message);
  }

  if (meta.ignore) {
    if (config.debug) console.log('Directory ignored', directory);
    return undefined;
  }

  const categorySort = config.category_sort || 'sort';
  const slug = trim(getSlug(directory, contentDirectory), '/');
  const title = meta.title || startCase(path.basename(directory).replaceAll(/[-_]/g, ' '));

  return {
    slug,
    title,
    sort: Number.parseInt(meta[categorySort], 10) || 0,
    show_on_home: metaBool(meta.show_on_home, config.show_on_home_default),
    is_index: true,
    is_directory: true,
    show_on_menu: metaBool(meta.show_on_menu, config.show_on_menu_default),
    active: activeSlug?.startsWith(`/${slug}`) || false,
    class: cleanString(meta.class || `category-${slug}`),
    description: meta.description || '',
    files: [],
  };
}

const bySortOrder = (left, right) => left.sort - right.sort;

async function handler(config, variables) {
  const contentDirectory = normalizeDir(path.normalize(config.content_dir));
  const entries = await glob(path.join(contentDirectory, '**', '*'));
  const root = {
    slug: '',
    title: '',
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: config.active === '',
    class: 'category-index',
    sort: 0,
    files: (await Promise.all(entries.map(entry => processFile(entry, contentDirectory, config, variables))))
      .filter(Boolean),
    is_directory: false,
  };

  for (const entry of root.files) {
    const parentSlug = path.dirname(entry.slug);
    if (parentSlug === '.') continue;
    const parent = root.files.find(candidate => candidate.slug === parentSlug);
    if (parent) parent.files.push(entry);
    else if (config.debug) console.log('Content ignored', entry.slug);
  }

  root.files = root.files
    .filter(entry => path.dirname(entry.slug) === '.')
    .toSorted(bySortOrder);
  root.files.forEach(function sortDirectory(directory) {
    if (!directory.is_directory) return;
    directory.files = directory.files.toSorted(bySortOrder);
    directory.files.forEach(sortDirectory);
  });
  return root;
}

export default handler;
