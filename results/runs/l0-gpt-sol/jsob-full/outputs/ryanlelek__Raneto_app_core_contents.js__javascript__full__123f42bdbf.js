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

const normalizeDir = value => value.replaceAll('\\', '/');

const getSlug = (value, root) =>
  normalizeDir(value)
    .replace(normalizeDir(root), '')
    .trim();

async function getLastModified(file, metadata, options) {
  if (metadata.modified !== undefined) {
    return moment(metadata.date).format(options.dateFormat);
  }

  const filePath = path.resolve(file);
  const candidates = [filePath];

  if (options.recursive) {
    candidates.push(path.dirname(filePath));
  }

  const target = candidates.find(candidate =>
    normalizeDir(filePath).startsWith(`${normalizeDir(candidate)}/`) ||
    filePath === candidate
  );

  const stats = await fs.stat(target || filePath);
  return moment(stats.mtime).format(options.dateFormat);
}

const utils = {
  normalizeDir,
  getLastModified,
  getSlug
};

function cleanString(value, slug = false) {
  value = value.replaceAll('/', ' ').trim();

  if (slug) {
    return snakeCase(value);
  }

  return trim(kebabCase(value), '-');
}

function cleanObjectStrings(value) {
  const result = {};

  for (const key in value) {
    if (Object.prototype.hasOwnProperty.call(value, key)) {
      result[cleanString(key, true)] = String(value[key]).trim();
    }
  }

  return result;
}

function slugToTitle(value) {
  value = value.replaceAll('/', '').trim();
  return startCase(path.basename(value).replace(/[-_]/g, ' '));
}

function stripMeta(value) {
  if (META_REGEX.test(value)) {
    return value.replace(META_REGEX, '').trim();
  }

  if (META_REGEX_YAML.test(value)) {
    return value.replace(META_REGEX_YAML, '').trim();
  }

  return value.trim();
}

function processMeta(value) {
  if (META_REGEX.test(value)) {
    const result = {};
    const match = value.match(META_REGEX);
    const metadata = match?.[1]?.trim() ?? '';

    if (metadata) {
      for (const line of metadata.split('\n')) {
        const parts = line.split(': ');

        if (parts.length === 1) {
          continue;
        }

        const key = line.slice(0, line.indexOf(': ')).trim();
        const itemValue = line.slice(line.indexOf(': ') + 2).trim();

        if (key && itemValue) {
          result[cleanString(key, true)] = itemValue;
        }
      }
    }

    return result;
  }

  if (META_REGEX_YAML.test(value)) {
    const match = value.match(META_REGEX_YAML);
    const metadata = match?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadata) || {});
  }

  return {};
}

function processVars(value, metadata) {
  if (Array.isArray(metadata.vars)) {
    for (const variable of metadata.vars) {
      value = value.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.value
      );
    }
  }

  if (metadata.layout !== undefined) {
    value = value.replaceAll('%layout%', metadata.layout);
  }

  if (metadata.title !== undefined) {
    value = value.replaceAll('%title%', metadata.title);
  }

  return value;
}

async function extractDocument(indexFile, file, verbose) {
  try {
    const content = await fs.readFile(file, 'utf8');
    const metadata = processMeta(content);
    const slug = file.replace(indexFile, '').trim();
    const title = metadata.title || slugToTitle(slug);

    return {
      id: slug,
      title,
      content
    };
  } catch (error) {
    if (verbose) {
      console.error(error);
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
  processVars
};

const metaBool = (value, fallback) =>
  value ? value === 'true' : fallback;

async function handler(rootPath, options) {
  rootPath = rootPath || '';

  const rootName = rootPath
    .split(/[\\/]/)
    .slice(-1)[0]
    .split('/')[0];

  const contentRoot = path.resolve(options.path);
  const files = await glob(path.join(contentRoot, '**', '*'));
  const sections = [];

  sections.push({
    slug: '.',
    title: '',
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: rootName === '',
    class: options.class,
    sort: 0,
    files: []
  });

  const processed = await Promise.all(
    files.map(file => processFile(options, rootPath, contentRoot, file))
  );

  for (const item of processed) {
    if (!item) {
      continue;
    }

    if (item.is_directory) {
      sections.push(item);
      continue;
    }

    if (item.is_index === false) {
      const directory = path.dirname(item.slug);
      const section = sections.find(entry => entry.slug === directory);

      if (section) {
        section.files.push(item);
      } else if (options.verbose) {
        console.warn('Unable to find section for file:', item.slug);
      }
    }
  }

  const result = sections
    .sort((a, b) => a.sort - b.sort)
    .map(section => {
      section.files = section.files.sort((a, b) => a.sort - b.sort);
      return section;
    });

  return result;
}

async function processFile(options, rootPath, contentRoot, file) {
  const relativePath = path.relative(contentRoot, file);
  const slug = relativePath.split('\\').join('/');
  const stats = await fs.stat(file);

  if (stats.isDirectory()) {
    return processDirectory(options, rootPath, contentRoot, file, slug);
  }

  if (stats.isFile() && path.extname(slug) === '.md') {
    return processMarkdownFile(options, rootPath, contentRoot, file, slug);
  }

  return null;
}

async function processDirectory(
  options,
  rootPath,
  contentRoot,
  directory,
  slug
) {
  const directoryPath = path.resolve(contentRoot, slug);
  let hasIndex = false;

  try {
    const indexPath = path.join(directoryPath, 'index.md');
    const stats = await fs.stat(indexPath);
    hasIndex = stats.isFile();
  } catch {}

  if (hasIndex) {
    if (options.verbose) {
      console.warn('Skipping directory with index file:', directoryPath);
    }

    return null;
  }

  let metadata = {};

  try {
    const metadataPath = path.join(directoryPath, '_index.md');
    const content = await fs.readFile(metadataPath, 'utf8');
    metadata = cleanObjectStrings(yaml.load(content) || {});
  } catch (error) {
    if (options.verbose) {
      console.warn('Unable to read directory metadata:', directoryPath, error);
    }
  }

  let sort = 0;

  if ((options.show_index || false) && !metadata.sort) {
    try {
      const sortFile = await fs.readFile(
        path.join(directoryPath, '_sort'),
        'utf8'
      );
      sort = Number(sortFile);
    } catch (error) {
      if (options.verbose) {
        console.warn('Unable to read directory sort:', directoryPath, error);
      }
    }
  }

  const directorySlug = slug.replace(/\\/g, '/');

  return {
    slug: slug || '.',
    title:
      metadata.title ||
      startCase(path.basename(directoryPath).replace(/[-_]/g, ' ')),
    show_on_home: metaBool(
      metadata.show_on_home,
      options.show_on_home
    ),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(
      metadata.show_on_menu,
      options.show_on_menu
    ),
    active: rootPath.startsWith(`/${directorySlug}`),
    class: `directory-${cleanString(slug)}`,
    sort: metadata.sort || sort,
    description: metadata.description || '',
    files: []
  };
}

async function processMarkdownFile(
  options,
  rootPath,
  contentRoot,
  file,
  slug
) {
  const defaultVariables = options.vars || '';
  const content = await fs.readFile(file, 'utf8');

  let documentSlug = slug;
  let sort = 0;

  if (documentSlug.includes('index')) {
    documentSlug = documentSlug.replaceAll('index', '');
  }

  documentSlug = documentSlug
    .replace('.md', '')
    .replaceAll('\\', '/')
    .trim();

  const metadata = processMeta(content);
  const processed = processVars(content, options);
  const documentMetadata = processMeta(processed);

  if (metadata.sort !== undefined) {
    sort = Number(metadata.sort);
  }

  const title =
    documentMetadata.title ||
    metadata.title ||
    slugToTitle(documentSlug);

  return {
    slug: documentSlug,
    title,
    show_on_home: metaBool(
      documentMetadata.show_on_home,
      options.show_on_home
    ),
    is_directory: false,
    show_on_menu: metaBool(
      documentMetadata.show_on_menu,
      options.show_on_menu
    ),
    active: rootPath.toLowerCase() === `/${documentSlug}`.toLowerCase(),
    sort,
  };
}

const contents = handler;

export { contents as default };
