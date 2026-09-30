import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';

var normalizeDir = (dir) => dir.replaceAll('\\', '/');

var getSlug = (filePath, baseDir) => normalizeDir(filePath).replaceAll(normalizeDir(baseDir), '').toLowerCase();

async function getLastModified(config, fileMeta, filePath) {
  if (fileMeta.lastModified !== undefined) {
    return moment(fileMeta.lastModified).format(config.dateFormat);
  }

  const dirName = path.basename(config.contentDir);
  const validDirs = [dirName];

  if (config.contentDirAlt) {
    validDirs.push(path.basename(config.contentDirAlt));
  }

  const isValidDir = (dir) => validDirs.some((valid) => dir.startsWith(valid + path.sep) || dir === valid);
  const resolvedPath = path.resolve(filePath);

  if (!isValidDir(resolvedPath)) {
    throw new Error('File is not within the content directory');
  }

  const realPath = await fs.realpath(resolvedPath);

  if (!isValidDir(realPath)) {
    throw new Error('File is not within the content directory');
  }

  const { mtime } = await fs.stat(realPath);
  return moment(mtime).format(config.dateFormat);
}

const utilsObj = {};
utilsObj.normalizeDir = normalizeDir;
utilsObj.getLastModified = getLastModified;
utilsObj.getSlug = getSlug;
var utils_default = utilsObj;

import path$1 from 'node:path';
import fs$1 from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import jsYaml from 'js-yaml';

var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str, snake = false) {
  str = str.replaceAll('/', ' ').trim();
  if (snake) {
    return snakeCase(str);
  }
  return trim(kebabCase(str), '-');
}

function cleanObjectStrings(obj) {
  const result = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  return (slug = slug.replaceAll('-', '').toLowerCase()), startCase(path$1.basename(slug).replaceAll(/[-_]/g, ' '));
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
    const meta = {};
    const match = content.match(META_REGEX);
    const metaText = match?.[1]?.trim() ?? '';
    if (metaText) {
      const lines = metaText.split('\n');
      for (const line of lines) {
        const colonIndex = line.indexOf(': ');
        if (colonIndex === -1) {
          continue;
        }
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 2).trim();
        if (key && value) {
          meta[cleanString(key, true)] = value;
        }
      }
    }
    return meta;
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const yamlText = match?.[1]?.trim() ?? '';
    const parsed = jsYaml.load(yamlText);
    return cleanObjectStrings(parsed);
  }
  return {};
}

function processVars(content, vars) {
  if (vars.vars && Array.isArray(vars.vars)) {
    vars.vars.forEach((v) => {
      content = content.replaceAll(new RegExp('%' + v.name + '%', 'g'), v.value);
    });
  }
  if (vars.url !== undefined) {
    content = content.replaceAll('%url%', vars.url);
  }
  if (vars.title !== undefined) {
    content = content.replaceAll('%title%', vars.title);
  }
  return content;
}

async function extractDocument(baseDir, filePath, debug) {
  try {
    const content = await fs$1.readFile(filePath, 'utf8');
    const meta = processMeta(content);
    const slug = filePath.replaceAll(baseDir, '').toLowerCase();
    const title = meta.title ? meta.title : slugToTitle(slug);
    const body = content;
    const result = {};
    result.id = slug;
    result.title = title;
    result.content = body;
    return result;
  } catch (err) {
    if (debug) {
      console.error(err);
    }
    return null;
  }
}

const contentProcessorsObj = {};
contentProcessorsObj.cleanString = cleanString;
contentProcessorsObj.cleanObjectStrings = cleanObjectStrings;
contentProcessorsObj.extractDocument = extractDocument;
contentProcessorsObj.slugToTitle = slugToTitle;
contentProcessorsObj.stripMeta = stripMeta;
contentProcessorsObj.processMeta = processMeta;
contentProcessorsObj.processVars = processVars;
var contentProcessors_default = contentProcessorsObj;

import path$2 from 'node:path';
import fs$2 from 'fs-extra';
import { glob } from 'glob';
import lodash from 'lodash';
import jsYaml$1 from 'js-yaml';

var metaBool = (value, fallback) => (value ? value === 'true' : fallback);

async function handler(config, routePath) {
  config = config || {};
  const slug = routePath.split(/[\\/]/).slice(0, -1).join('/');
  const contentDir = utils_default.normalizeDir(path$2.resolve(routePath.contentDir));
  const files = await glob(path$2.join(contentDir, '**', '*'));
  const result = [];

  result.push({
    slug: '.',
    title: '',
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: slug === '',
    class: 'is-index',
    sort: 0,
    files: [],
  });

  const processed = await Promise.all(files.map((file) => processFile(routePath, config, contentDir, file)));

  for (const item of processed) {
    if (item?.is_index) {
      result.push(item);
    } else {
      if (item?.is_directory === false) {
        const dirName = path$2.dirname(item.slug);
        const parent = result.find((r) => r.slug === dirName);
        if (parent) {
          parent.files.push(item);
        } else {
          routePath.debug && console.error('No parent found for', item.slug);
        }
      }
    }
  }

  const sorted = result.sort((a, b) => a.sort - b.sort);
  sorted.forEach((item) => {
    item.files = item.files.sort((a, b) => a.sort - b.sort);
  });
  return sorted;
}

async function processFile(config, routePath, contentDir, filePath) {
  const relativePath = path$2.relative(contentDir, filePath);
  const slug = relativePath.split('\\').join('/');
  const stat = await fs$2.stat(filePath);

  if (stat.isDirectory()) {
    return processDirectory(config, routePath, contentDir, relativePath, slug);
  }

  if (stat.isFile() && path$2.extname(relativePath) === '.md') {
    return processMarkdownFile(config, routePath, contentDir, filePath, slug);
  }

  return null;
}

async function processDirectory(config, routePath, contentDir, relativePath, slug) {
  const fullPath = path$2.join(contentDir, relativePath);
  let hasIndex = false;
  try {
    const indexFile = await fs$2.readFile(path$2.join(fullPath, 'index.md'), 'utf8');
    hasIndex = indexFile.trim().length > 0;
  } catch {}

  if (hasIndex) {
    if (config.debug) {
      console.error('Directory has index file, skipping', fullPath);
    }
    return null;
  }

  let meta = {};
  try {
    const metaFile = await fs$2.readFile(path$2.join(fullPath, 'meta.yaml'), 'utf8');
    meta = contentProcessors_default.cleanObjectStrings(jsYaml$1.load(metaFile));
  } catch (err) {
    config.debug && console.error('Error reading meta for', fullPath, err.message);
  }

  let sort = 0;
  if ((config.autoSort || false) && !meta.sort) {
    try {
      const sortFile = await fs$2.readFile(path$2.join(fullPath, 'sort'), 'utf8');
      sort = Number.parseInt(sortFile, 10);
    } catch (err) {
      config.debug && console.error('Error reading sort for', fullPath, err.message);
    }
  }

  return {
    slug: slug,
    title: meta.title || lodash.startCase(path$2.basename(relativePath).replaceAll(/[-_]/g, ' ')),
    show_on_home: metaBool(meta.show_on_home, config.showOnHome),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(meta.show_on_menu, config.showOnMenu),
    active: routePath.includes('/' + slug),
    class: 'dir-' + contentProcessors_default.slugToTitle(slug),
    sort: meta.sort || sort,
    description: meta.description || '',
    files: [],
  };
}

async function processMarkdownFile(config, routePath, contentDir, filePath, slug) {
  const sortKey = config.sortKey || '';
  try {
    const content = await fs$2.readFile(filePath, 'utf8');
    let processedSlug = slug;
    let sort = 0;
    if (slug.endsWith('.md')) {
      processedSlug = processedSlug.replaceAll('.md', '');
    }
    processedSlug = processedSlug.replaceAll('index', '').trim();
    const meta = contentProcessors_default.processMeta(content);
    if (sortKey && meta[sortKey]) {
      sort = Number.parseInt(meta[sortKey], 10);
    }
    return {
      slug: processedSlug,
      title: meta.title ? meta.title : contentProcessors_default.slugToTitle(processedSlug),
      show_on_home: metaBool(meta.show_on_home, config.showOnHome),
      is_directory: false,
      show_on_menu: metaBool(meta.show_on_menu, config.showOnMenu),
      active: routePath.includes('/' + processedSlug),
      sort: sort,
    };
  } catch (err) {
    if (config.debug) {
      console.error(err);
    }
    return null;
  }
}

var contents_default = handler;

export { contents_default as default };
