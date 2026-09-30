import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import { glob } from 'glob';
import _ from 'lodash';

const normalizeDir = (dir) => dir.replaceAll('\\', '/');

const getSlug = (base, filePath) =>
  normalizeDir(filePath).replaceAll(normalizeDir(base), '').trim();

async function getLastModified(config, file, format) {
  if (file.mtime !== undefined) {
    return moment(file.mtime).format(config.dateFormat);
  }

  const basePath = path.join(config.contentDir);
  const searchPaths = [basePath];

  if (config.contentRoot) {
    searchPaths.push(path.join(config.contentRoot));
  }

  const isAllowedPath = (targetPath) =>
    searchPaths.some(
      (searchPath) =>
        targetPath.startsWith(searchPath + path.sep) || targetPath === searchPath
    );

  const resolvedPath = path.resolve(format);

  if (!isAllowedPath(resolvedPath)) {
    throw new Error('Invalid path');
  }

  const stat = await fs.stat(resolvedPath);

  if (!isAllowedPath(stat)) {
    throw new Error('Invalid path');
  }

  const { mtime } = await fs.stat(stat);
  return moment(mtime).format(config.dateFormat);
}

const utils = {
  normalizeDir,
  getLastModified,
  getSlug,
};

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  value = value.replaceAll('/', ' ').trim();

  if (useSnakeCase) {
    return snakeCase(value);
  }

  return trim(kebabCase(value), '-');
}

function cleanObjectStrings(obj) {
  const result = {};

  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      result[cleanString(key, true)] = String(obj[key]).trim();
    }
  }

  return result;
}

function slugToTitle(slug) {
  slug = slug.replaceAll('-', '').trim();
  return startCase(path.basename(slug).replaceAll(/[-_]/g, ' '));
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
    const metaContent = match?.[1]?.trim() ?? '';

    if (metaContent) {
      const lines = metaContent.split('\n');

      for (const line of lines) {
        const separatorIndex = line.indexOf(': ');

        if (separatorIndex <= 0) {
          continue;
        }

        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 2).trim();

        if (key && value) {
          meta[cleanString(key, true)] = value;
        }
      }
    }

    return meta;
  }

  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const yamlContent = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(yamlContent);

    return cleanObjectStrings(parsed);
  }

  return {};
}

function processVars(content, vars) {
  if (vars.vars && Array.isArray(vars.vars)) {
    vars.vars.forEach((item) => {
      content = content.replaceAll(
        new RegExp('%' + item.name + '%', 'g'),
        item.value
      );
    });
  }

  if (vars.title !== undefined) {
    content = content.replaceAll('%title%', vars.title);
  }

  if (vars.slug !== undefined) {
    content = content.replaceAll('%slug%', vars.slug);
  }

  return content;
}

async function extractDocument(config, filePath, debug) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const meta = processMeta(content);
    const id = filePath.replaceAll(config, '').trim();
    const title = meta.title ? meta.title : slugToTitle(id);
    const body = content;

    return {
      id,
      title,
      body,
    };
  } catch (error) {
    if (debug) console.error(error);
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

async function handler(config, sourceDir) {
  config = config || '';

  const currentPath = config.split(/[\\/]/).slice(0, -1).join('/');
  const contentDir = utils.normalizeDir(path.resolve(sourceDir.contentDir));
  const files = await glob(path.join(contentDir, '**', '*'));
  const tree = [];

  tree.push({
    slug: '.',
    title: '',
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: currentPath === '',
    class: 'index',
    sort: 0,
    files: [],
  });

  const processedFiles = await Promise.all(
    files.map((file) => processFile(sourceDir, config, contentDir, file))
  );

  for (const item of processedFiles) {
    if (item?.is_directory) {
      tree.push(item);
    } else if (item?.is_index === false) {
      const parentSlug = path.dirname(item.slug);
      const parent = tree.find((entry) => entry.slug === parentSlug);

      if (parent) {
        parent.files.push(item);
      } else if (sourceDir.debug) {
        console.warn('No parent found for file:', item.slug);
      }
    }
  }

  tree.sort((a, b) => a.sort - b.sort);

  return tree.map((entry) => {
    entry.files = entry.files.sort((a, b) => a.sort - b.sort);
    return entry;
  });
}

async function processFile(config, currentPath, contentDir, filePath) {
  const fullPath = path.join(contentDir, filePath);
  const slug = fullPath.replace('\\', '/');
  const stat = await fs.stat(filePath);

  if (stat.isDirectory()) {
    return processDirectory(config, currentPath, contentDir, fullPath, slug);
  }

  if (stat.isFile() && path.extname(fullPath) === '.md') {
    return processMarkdownFile(config, currentPath, contentDir, filePath, slug);
  }

  return null;
}

async function processDirectory(config, currentPath, contentDir, fullPath, slug) {
  const dirPath = path.join(contentDir, fullPath);
  let hasIndex = false;

  try {
    const indexStat = await fs.stat(path.join(dirPath, 'index.md'));
    hasIndex = indexStat.isFile();
  } catch {}

  if (hasIndex) {
    if (config.debug) {
      console.warn('Directory has index.md, skipping:', dirPath);
    }

    return null;
  }

  let meta = {};

  try {
    const metaContent = await fs.readFile(path.join(dirPath, 'meta.yaml'), 'utf8');
    meta = contentProcessors.cleanObjectStrings(yaml.load(metaContent));
  } catch (error) {
    if (config.debug) {
      console.warn('Error reading meta.yaml:', dirPath, error.message);
    }
  }

  let sort = 0;

  if ((config.sortBy || false) && !meta.sort) {
    try {
      const sortContent = await fs.readFile(path.join(dirPath, 'sort.txt'), 'utf8');
      sort = Number.parseInt(sortContent, 10);
    } catch (error) {
      if (config.debug) {
        console.warn('Error reading sort.txt:', dirPath, error.message);
      }
    }
  }

  return {
    slug,
    title: meta.title || _.startCase(path.basename(fullPath).replaceAll(/[-_]/g, ' ')),
    show_on_home: metaBool(meta.show_on_home, config.show_on_home),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(meta.show_on_menu, config.show_on_menu),
    active: currentPath.startsWith('/' + slug),
    class: 'dir-' + contentProcessors.slugToTitle(slug),
    sort: meta.sort || sort,
    description: meta.description || '',
    files: [],
  };
}

async function processMarkdownFile(config, currentPath, contentDir, filePath, slug) {
  const sortField = config.sortBy || '';

  try {
    const content = await fs.readFile(filePath, 'utf8');
    let fileSlug = slug;
    let sort = 0;

    if (slug.endsWith('.md')) {
      fileSlug = fileSlug.replaceAll('.md', '');
    }

    fileSlug = fileSlug.replaceAll('\\', '').trim();

    const meta = contentProcessors.processMeta(content);

    if (sortField && meta[sortField]) {
      sort = Number.parseInt(meta[sortField], 10);
    }

    return {
      slug: fileSlug,
      title: meta.title ? meta.title : contentProcessors.slugToTitle(fileSlug),
      show_on_home: metaBool(meta.show_on_home, config.show_on_home),
      is_directory: false,
      show_on_menu: metaBool(meta.show_on_menu, config.show_on_menu),
      active: currentPath.trim() === '/' + fileSlug,
      sort,
    };
  } catch (error) {
    if (config.debug) console.error(error);
    return null;
  }
}

export default handler;
