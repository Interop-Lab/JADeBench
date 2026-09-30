import path from 'node:path';
import fs from 'fs-extra';
import { glob } from 'glob';
import lodash from 'lodash';
import kebabCase from 'lodash/kebabCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

const COMMENT_META_PATTERN = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META_PATTERN = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDirectory(directory) {
  return directory.replaceAll('\\', '/');
}

function cleanString(value, snakeCase = false) {
  const cleaned = value.replaceAll('/', ' ').trim();
  return snakeCase
    ? lodash.snakeCase(cleaned)
    : trim(kebabCase(cleaned), '-');
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
  const name = slug.replaceAll('.md', '').trim();
  return lodash.startCase(path.basename(name).replaceAll(/[-_]/g, ' '));
}

function processMeta(content) {
  if (COMMENT_META_PATTERN.test(content)) {
    const metadata = {};
    const block = content.match(COMMENT_META_PATTERN)?.[1]?.trim() ?? '';

    for (const line of block.split('\n')) {
      const separator = line.indexOf(': ');
      if (separator <= -1) continue;

      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      if (key && value) metadata[cleanString(key, true)] = value;
    }

    return metadata;
  }

  if (YAML_META_PATTERN.test(content)) {
    const block = content.match(YAML_META_PATTERN)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function metadataBoolean(value, fallback) {
  return value ? value === 'true' : fallback;
}

async function processMarkdownFile(options, requestPath, filePath, relativePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let slug = relativePath;
    let sort = 0;

    if (slug.includes('index.md')) slug = slug.replaceAll('index.md', '');
    slug = slug.replaceAll('.md', '').trim();

    const metadata = processMeta(content);
    const sortField = options.page_sort_meta || '';
    if (sortField && metadata[sortField]) {
      sort = Number.parseInt(metadata[sortField], 10);
    }

    return {
      slug,
      title: metadata.title || slugToTitle(slug),
      show_on_home: metadataBoolean(
        metadata.show_on_home,
        options.show_on_home_default,
      ),
      is_directory: false,
      show_on_menu: metadataBoolean(
        metadata.show_on_menu,
        options.show_on_menu_default,
      ),
      active: requestPath.trim() === `/${slug}`,
      sort,
    };
  } catch (error) {
    if (options.debug) console.log(error);
    return null;
  }
}

async function processDirectory(
  options,
  requestPath,
  contentRoot,
  relativePath,
  slug,
) {
  const directoryPath = path.join(contentRoot, relativePath);

  try {
    const ignoreFile = await fs.lstat(path.join(directoryPath, 'ignore'));
    if (ignoreFile.isFile()) {
      if (options.debug) console.log('Directory ignored', directoryPath);
      return null;
    }
  } catch {
    // A missing ignore file means the directory should be included.
  }

  let metadata = {};
  try {
    const source = await fs.readFile(path.join(directoryPath, 'meta'), 'utf8');
    metadata = cleanObjectStrings(yaml.load(source));
  } catch (error) {
    if (options.debug) {
      console.log('No meta file for', directoryPath, error.message);
    }
  }

  let sort = 0;
  if ((options.category_sort || false) && !metadata.sort) {
    try {
      const source = await fs.readFile(path.join(directoryPath, 'sort'), 'utf8');
      sort = Number.parseInt(source, 10);
    } catch (error) {
      if (options.debug) {
        console.log('No sort file for', directoryPath, error.message);
      }
    }
  }

  return {
    slug,
    title:
      metadata.title ||
      lodash.startCase(path.basename(relativePath).replaceAll(/[-_]/g, ' ')),
    show_on_home: metadataBoolean(
      metadata.show_on_home,
      options.show_on_home_default,
    ),
    is_index: false,
    is_directory: true,
    show_on_menu: metadataBoolean(
      metadata.show_on_menu,
      options.show_on_menu_default,
    ),
    active: requestPath.startsWith(`/${slug}`),
    class: `category-${cleanString(slug)}`,
    sort: metadata.sort || sort,
    description: metadata.description || '',
    files: [],
  };
}

async function processFile(options, requestPath, contentRoot, filePath) {
  const relativePath = path.relative(contentRoot, filePath);
  const slug = relativePath.split('\\').join('/');
  const stats = await fs.stat(filePath);

  if (stats.isDirectory()) {
    return processDirectory(options, requestPath, contentRoot, relativePath, slug);
  }

  if (stats.isFile() && path.extname(relativePath) === '.md') {
    return processMarkdownFile(options, requestPath, filePath, slug);
  }

  return null;
}

async function handler(requestPath, options) {
  requestPath ||= '';

  const parentPath = requestPath.split(/[\\/]/).slice(0, -1).join('/');
  const contentRoot = normalizeDirectory(path.normalize(options.content_dir));
  const paths = await glob(path.join(contentRoot, '**', '*'));
  const categories = [
    {
      slug: '.',
      title: '',
      show_on_home: true,
      show_on_menu: true,
      is_index: true,
      active: parentPath === '',
      class: 'category-index',
      sort: 0,
      files: [],
    },
  ];

  const entries = await Promise.all(
    paths.map((filePath) => processFile(options, requestPath, contentRoot, filePath)),
  );

  for (const entry of entries) {
    if (entry?.is_directory) {
      categories.push(entry);
    } else if (entry?.is_directory === false) {
      const categorySlug = path.dirname(entry.slug);
      const category = categories.find(({ slug }) => slug === categorySlug);

      if (category) {
        category.files.push(entry);
      } else if (options.debug) {
        console.log('Content ignored', entry.slug);
      }
    }
  }

  const sortedCategories = categories.toSorted((a, b) => a.sort - b.sort);
  for (const category of sortedCategories) {
    category.files = category.files.toSorted((a, b) => a.sort - b.sort);
  }

  return sortedCategories;
}

export { handler as default };
