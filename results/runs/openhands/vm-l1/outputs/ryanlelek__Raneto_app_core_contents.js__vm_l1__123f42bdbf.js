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

const normalizeDir = (directory) => directory.replaceAll('\\', '/');

const getSlug = (filePath, rootPath) =>
  normalizeDir(filePath).replaceAll(normalizeDir(rootPath), '').trim();

async function getLastModified(options, metadata, filePath) {
  if (metadata.modified !== undefined) {
    return moment(metadata.modified).format(options.datetime_format);
  }

  const allowedRoots = [path.resolve(options.content_dir)];
  if (options.theme_dir) {
    allowedRoots.push(path.resolve(options.theme_dir));
  }

  const isAllowedPath = (candidate) =>
    allowedRoots.some(
      (root) => candidate.startsWith(root + path.sep) || candidate === root,
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
  return moment(mtime).format(options.datetime_format);
}

const utils = { normalizeDir, getLastModified, getSlug };

function cleanString(value, useSnakeCase) {
  const cleanedValue = value.replaceAll('/', ' ').trim();
  if (useSnakeCase) {
    return snakeCase(cleanedValue);
  }
  return trim(kebabCase(cleanedValue), '-');
}

function cleanObjectStrings(source) {
  const result = {};
  for (const key in source) {
    if (Object.hasOwn(source, key)) {
      result[cleanString(key, true)] = String(source[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  const cleanedSlug = slug.replaceAll('.md', '').trim();
  return startCase(path.basename(cleanedSlug).replaceAll(/[-_]/g, ' '));
}

function stripMeta(document) {
  if (META_REGEX.test(document)) {
    return document.replace(META_REGEX, '').trim();
  }
  if (META_REGEX_YAML.test(document)) {
    return document.replace(META_REGEX_YAML, '').trim();
  }
  return document.trim();
}

function processMeta(document) {
  if (META_REGEX.test(document)) {
    const metadata = {};
    const frontMatter = document.match(META_REGEX)?.[1]?.trim() ?? '';

    if (frontMatter) {
      for (const line of frontMatter.split('\n')) {
        const separatorIndex = line.indexOf(': ');
        if (separatorIndex <= 0) {
          continue;
        }

        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + 2).trim();
        if (key && value) {
          metadata[cleanString(key, true)] = value;
        }
      }
    }

    return metadata;
  }

  if (META_REGEX_YAML.test(document)) {
    const frontMatter = document.match(META_REGEX_YAML)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(frontMatter));
  }

  return {};
}

function processVars(content, options) {
  let processedContent = content;

  if (options.variables && Array.isArray(options.variables)) {
    options.variables.forEach((variable) => {
      processedContent = processedContent.replaceAll(
        new RegExp('%' + variable.name + '%', 'g'),
        variable.content,
      );
    });
  }

  if (options.base_url !== undefined) {
    processedContent = processedContent.replaceAll(
      '%base_url%',
      options.base_url,
    );
  }

  if (options.image_url !== undefined) {
    processedContent = processedContent.replaceAll(
      '%image_url%',
      options.image_url,
    );
  }

  return processedContent;
}

async function extractDocument(rootPath, filePath, debug) {
  try {
    const body = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(body);
    const id = filePath.replaceAll(rootPath, '').trim();
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

async function handler(requestedPath, options) {
  requestedPath ||= '';
  const parentSlug = requestedPath.split(/[\\/]/).slice(0, -1).join('/');
  const contentRoot = utils.normalizeDir(path.normalize(options.content_dir));
  const paths = await glob(path.join(contentRoot, '**', '*'));

  const contents = [
    {
      slug: '.',
      title: '',
      show_on_home: true,
      show_on_menu: true,
      is_index: true,
      active: parentSlug === '',
      class: 'category-index',
      sort: 0,
      files: [],
    },
  ];

  const processedPaths = await Promise.all(
    paths.map((filePath) =>
      processFile(options, requestedPath, contentRoot, filePath),
    ),
  );

  for (const item of processedPaths) {
    if (item?.is_directory) {
      contents.push(item);
    } else if (item?.is_directory === false) {
      const directorySlug = path.dirname(item.slug);
      const directory = contents.find(
        (candidate) => candidate.slug === directorySlug,
      );

      if (directory) {
        directory.files.push(item);
      } else if (options.debug) {
        console.log('Content ignored', item.slug);
      }
    }
  }

  const sortedContents = contents.toSorted((left, right) => left.sort - right.sort);
  sortedContents.forEach((item) => {
    item.files = item.files.toSorted((left, right) => left.sort - right.sort);
  });
  return sortedContents;
}

async function processFile(
  options,
  requestedPath,
  contentRoot,
  absolutePath,
) {
  const relativePath = path.relative(contentRoot, absolutePath);
  const slug = relativePath.split('\\').join('/');
  const stats = await fs.stat(absolutePath);

  if (stats.isDirectory()) {
    return processDirectory(
      options,
      requestedPath,
      contentRoot,
      relativePath,
      slug,
    );
  }

  if (stats.isFile() && path.extname(relativePath) === '.md') {
    return processMarkdownFile(
      options,
      requestedPath,
      contentRoot,
      absolutePath,
      slug,
    );
  }

  return null;
}

async function processDirectory(
  options,
  requestedPath,
  contentRoot,
  relativePath,
  slug,
) {
  const directoryPath = path.join(contentRoot, relativePath);
  let ignored = false;

  try {
    ignored = (await fs.lstat(path.join(directoryPath, 'ignore'))).isFile();
  } catch {}

  if (ignored) {
    if (options.debug) {
      console.log('Directory ignored', directoryPath);
    }
    return null;
  }

  let metadata = {};
  try {
    const metadataContents = await fs.readFile(
      path.join(directoryPath, 'meta'),
      'utf8',
    );
    metadata = contentProcessors.cleanObjectStrings(yaml.load(metadataContents));
  } catch (error) {
    if (options.debug) {
      console.log('No meta file for', directoryPath, error.message);
    }
  }

  let categorySort = 0;
  if (options.category_sort && !metadata.sort) {
    try {
      const sortContents = await fs.readFile(
        path.join(directoryPath, 'sort'),
        'utf8',
      );
      categorySort = Number.parseInt(sortContents, 10);
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
    show_on_home: metaBool(
      metadata.show_on_home,
      options.show_on_home_default,
    ),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(
      metadata.show_on_menu,
      options.show_on_menu_default,
    ),
    active: requestedPath.startsWith('/' + String(slug)),
    class: 'category-' + String(contentProcessors.cleanString(slug)),
    sort: metadata.sort || categorySort,
    description: metadata.description || '',
    files: [],
  };
}

async function processMarkdownFile(
  options,
  requestedPath,
  contentRoot,
  absolutePath,
  initialSlug,
) {
  const sortMetadataKey = options.page_sort_meta || '';

  try {
    const document = await fs.readFile(absolutePath, 'utf8');
    let slug = initialSlug;
    let sort = 0;

    if (slug.includes('index.md')) {
      slug = slug.replaceAll('index.md', '');
    }
    slug = slug.replaceAll('.md', '').trim();

    const metadata = contentProcessors.processMeta(document);
    if (sortMetadataKey && metadata[sortMetadataKey]) {
      sort = Number.parseInt(metadata[sortMetadataKey], 10);
    }

    return {
      slug,
      title: metadata.title || contentProcessors.slugToTitle(slug),
      show_on_home: metaBool(
        metadata.show_on_home,
        options.show_on_home_default,
      ),
      is_directory: false,
      show_on_menu: metaBool(
        metadata.show_on_menu,
        options.show_on_menu_default,
      ),
      active: requestedPath.trim() === '/' + String(slug),
      sort,
    };
  } catch (error) {
    if (options.debug) {
      console.log(error);
    }
    return null;
  }
}

export { handler as default };
