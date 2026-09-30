import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';
import { glob } from 'glob';
import lodash from 'lodash';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

const normalizeDir = (directory) => directory.replaceAll('\\', '/');

const getSlug = (filePath, basePath) =>
  normalizeDir(filePath).replaceAll(normalizeDir(basePath), '').trim();

async function getLastModified(config, metadata, filePath) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(config.datetime_format);
  }

  const contentDir = path.resolve(config.content_dir);
  const allowedDirectories = [contentDir];
  if (config.theme_dir) {
    allowedDirectories.push(path.resolve(config.theme_dir));
  }

  const isAllowedPath = (resolvedPath) =>
    allowedDirectories.some(
      (directory) =>
        resolvedPath.startsWith(directory + path.sep) || resolvedPath === directory,
    );

  const resolvedPath = path.resolve(filePath);
  if (!isAllowedPath(resolvedPath)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const realPath = await fs.realpath(resolvedPath);
  if (!isAllowedPath(realPath)) {
    throw new Error('Access denied: file path is outside allowed directories');
  }

  const { mtime } = await fs.lstat(realPath);
  return moment(mtime).format(config.datetime_format);
}

const utils = {
  normalizeDir,
  getLastModified,
  getSlug,
};

function cleanString(value, useSnakeCase = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  if (useSnakeCase) {
    return snakeCase(cleaned);
  }
  return trim(kebabCase(cleaned), '-');
}

function cleanObjectStrings(object) {
  const cleaned = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleaned[cleanString(key, true)] = ('' + object[key]).trim();
    }
  }
  return cleaned;
}

function slugToTitle(slug) {
  const withoutExtension = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(withoutExtension).replaceAll(/[-_]/g, ' '));
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
    const match = content.match(META_REGEX);
    const metadataText = match?.[1]?.trim() ?? '';

    if (metadataText) {
      for (const line of metadataText.split('\n')) {
        const separatorIndex = line.indexOf(': ');
        if (separatorIndex <= 0) {
          continue;
        }

        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 1).trim();
        if (key && value) {
          metadata[cleanString(key, true)] = value;
        }
      }
    }

    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const metadataText = match?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadataText));
  }

  return {};
}

function processVars(content, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      content = content.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.content,
      );
    });
  }

  if (config.base_url !== undefined) {
    content = content.replaceAll('%base_url%', config.base_url);
  }
  if (config.image_url !== undefined) {
    content = content.replaceAll('%image_url%', config.image_url);
  }

  return content;
}

async function extractDocument(basePath, filePath, debug) {
  try {
    const body = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(body);
    const id = filePath.replaceAll(basePath, '').trim();
    const title = metadata.title || slugToTitle(id);
    return { id, title, body };
  } catch (error) {
    if (debug) {
      console.log(error);
    }
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

const metaBool = (value, defaultValue) =>
  value ? value === 'true' : defaultValue;

async function handler(currentPath, config) {
  currentPath = currentPath || '';
  const activePath = currentPath.split(/[\\/]/).slice(0, -1).join('/');
  const contentDir = utils.normalizeDir(path.normalize(config.content_dir));
  const paths = await glob(path.join(contentDir, '**', '*'));
  const categories = [
    {
      slug: '.',
      title: '',
      show_on_home: true,
      show_on_menu: true,
      is_index: true,
      active: activePath === '',
      class: 'category-index',
      sort: 0,
      files: [],
    },
  ];

  const entries = await Promise.all(
    paths.map((entryPath) =>
      processFile(config, currentPath, contentDir, entryPath),
    ),
  );

  for (const entry of entries) {
    if (entry?.is_directory) {
      categories.push(entry);
    } else if (entry?.is_directory === false) {
      const categorySlug = path.dirname(entry.slug);
      const category = categories.find(({ slug }) => slug === categorySlug);
      if (category) {
        category.files.push(entry);
      } else if (config.debug) {
        console.log('Content ignored', entry.slug);
      }
    }
  }

  const sortedCategories = categories.toSorted(
    (left, right) => left.sort - right.sort,
  );
  sortedCategories.forEach((category) => {
    category.files = category.files.toSorted(
      (left, right) => left.sort - right.sort,
    );
  });
  return sortedCategories;
}

async function processFile(config, currentPath, contentDir, entryPath) {
  const relativePath = path.relative(contentDir, entryPath);
  const slug = relativePath.split('\\').join('/');
  const stats = await fs.stat(entryPath);

  if (stats.isDirectory()) {
    return processDirectory(config, currentPath, contentDir, relativePath, slug);
  }
  if (stats.isFile() && path.extname(relativePath) === '.md') {
    return processMarkdownFile(config, currentPath, contentDir, entryPath, slug);
  }
  return null;
}

async function processDirectory(
  config,
  currentPath,
  contentDir,
  relativePath,
  slug,
) {
  const directoryPath = path.join(contentDir, relativePath);
  let ignored = false;

  try {
    const ignoreStats = await fs.lstat(path.join(directoryPath, 'ignore'));
    ignored = ignoreStats.isFile();
  } catch {}

  if (ignored) {
    if (config.debug) {
      console.log('Directory ignored', directoryPath);
    }
    return null;
  }

  let metadata = {};
  try {
    const metadataFile = await fs.readFile(
      path.join(directoryPath, 'meta'),
      'utf8',
    );
    metadata = contentProcessors.cleanObjectStrings(yaml.load(metadataFile));
  } catch (error) {
    if (config.debug) {
      console.log('No meta file for', directoryPath, error.message);
    }
  }

  let sort = 0;
  if ((config.category_sort || false) && !metadata.sort) {
    try {
      const sortFile = await fs.readFile(
        path.join(directoryPath, 'sort'),
        'utf8',
      );
      sort = Number.parseInt(sortFile, 10);
    } catch (error) {
      if (config.debug) {
        console.log('No sort file for', directoryPath, error.message);
      }
    }
  }

  return {
    slug,
    title:
      metadata.title ||
      lodash.startCase(path.basename(relativePath).replaceAll(/[-_]/g, ' ')),
    show_on_home: metaBool(metadata.show_on_home, config.show_on_home_default),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(metadata.show_on_menu, config.show_on_menu_default),
    active: currentPath.startsWith(`/${slug}`),
    class: `category-${contentProcessors.cleanString(slug)}`,
    sort: metadata.sort || sort,
    description: metadata.description || '',
    files: [],
  };
}

async function processMarkdownFile(
  config,
  currentPath,
  contentDir,
  filePath,
  slug,
) {
  const sortMetadataKey = config.page_sort_meta || '';

  try {
    const content = await fs.readFile(filePath, 'utf8');
    let pageSlug = slug;
    let sort = 0;

    if (slug.includes('index.md')) {
      pageSlug = pageSlug.replaceAll('index.md', '');
    }
    pageSlug = pageSlug.replaceAll('.md', '').trim();

    const metadata = contentProcessors.processMeta(content);
    if (sortMetadataKey && metadata[sortMetadataKey]) {
      sort = Number.parseInt(metadata[sortMetadataKey], 10);
    }

    return {
      slug: pageSlug,
      title: metadata.title
        ? metadata.title
        : contentProcessors.slugToTitle(pageSlug),
      show_on_home: metaBool(
        metadata.show_on_home,
        config.show_on_home_default,
      ),
      is_directory: false,
      show_on_menu: metaBool(
        metadata.show_on_menu,
        config.show_on_menu_default,
      ),
      active: currentPath.trim() === `/${pageSlug}`,
      sort,
    };
  } catch (error) {
    if (config.debug) {
      console.log(error);
    }
    return null;
  }
}

export { handler as default };
