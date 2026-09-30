import path from 'node:path';
import fs from 'fs-extra';
import moment from 'moment';
import { glob } from 'glob';
import _ from 'lodash';
import yaml from 'js-yaml';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';

const normalizeDir = (dir) => dir.replaceAll('\\', '/');

const getSlug = (basePath, filePath) => normalizeDir(filePath).replaceAll(normalizeDir(basePath), '').replace(/^\//, '');

async function getLastModified(config, fileMeta, rootPath) {
  const indexPath = path.join(config.contentDir, fileMeta.slug);
  const possiblePaths = [indexPath];
  
  if (fileMeta.parent) {
    possiblePaths.push(path.join(rootPath, fileMeta.parent));
  }
  
  const checkPath = (targetPath) => possiblePaths.some(p => targetPath.startsWith(p + path.sep) || targetPath === p);
  const absoluteRoot = path.resolve(rootPath);
  
  if (!checkPath(absoluteRoot)) {
    throw new Error('Invalid path');
  }
  
  const stats = await fs.stat(absoluteRoot);
  
  if (!checkPath(stats)) {
    throw new Error('Invalid path');
  }
  
  const { mtime } = await fs.stat(stats);
  return moment(mtime).format(config.dateFormat);
}

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(str, useSnakeCase = false) {
  str = str.replaceAll('/', ' ').trim();
  
  if (useSnakeCase) {
    return snakeCase(str);
  }
  
  return trim(kebabCase(str), '-');
}

function cleanObjectStrings(obj) {
  const result = {};
  
  for (const key in obj) {
    if (Object.hasOwn(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  
  return result;
}

function slugToTitle(slug) {
  slug = slug.replace(/^\//, '').replace(/\/$/, '');
  return startCase(path.basename(slug).replace(/[-_]/g, ' '));
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
    const result = {};
    const match = content.match(META_REGEX);
    const metaBlock = match?.[1]?.trim() ?? '';
    
    if (metaBlock) {
      const lines = metaBlock.split('\n');
      
      for (const line of lines) {
        const colonIndex = line.indexOf(': ');
        
        if (colonIndex <= 0) continue;
        
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 2).trim();
        
        if (key && value) {
          result[cleanString(key, true)] = value;
        }
      }
    }
    
    return result;
  }
  
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const yamlBlock = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(yamlBlock);
    return cleanObjectStrings(parsed);
  }
  
  return {};
}

function processVars(template, vars) {
  if (vars.vars && Array.isArray(vars.vars)) {
    vars.vars.forEach(v => {
      template = template.replaceAll(new RegExp('%' + v.name + '%', 'g'), v.value);
    });
  }
  
  if (vars.baseUrl !== undefined) {
    template = template.replaceAll('%baseUrl%', vars.baseUrl);
  }
  
  if (vars.baseUrl !== undefined) {
    template = template.replaceAll('%baseUrl%', vars.baseUrl);
  }
  
  return template;
}

async function extractDocument(contentDir, filePath, verbose) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const meta = processMeta(content);
    const slug = filePath.replace(contentDir, '').replace(/^\//, '');
    const title = meta.title ? meta.title : slugToTitle(slug);
    const body = content;
    
    return {
      id: slug,
      title: title,
      body: body
    };
  } catch (err) {
    if (verbose) console.error(err);
    return null;
  }
}

const utils = {
  normalizeDir: normalizeDir,
  getLastModified: getLastModified,
  getSlug: getSlug
};

const contentProcessors = {
  cleanString: cleanString,
  cleanObjectStrings: cleanObjectStrings,
  extractDocument: extractDocument,
  slugToTitle: slugToTitle,
  stripMeta: stripMeta,
  processMeta: processMeta,
  processVars: processVars
};

const metaBool = (val, defaultVal) => val ? val === 'true' : defaultVal;

async function handler(route, config) {
  route = route || '';
  
  const pathParts = route.split(/[\\/]/).slice(0, -1).join('/');
  const contentPath = utils.normalizeDir(path.resolve(config.contentDir));
  const files = await glob(path.join(contentPath, '**', '*'));
  const result = [];
  
  result.push({
    slug: '.',
    title: '',
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: route === '',
    class: '',
    sort: 0,
    files: []
  });
  
  const processedFiles = await Promise.all(files.map(f => processFile(config, route, contentPath, f)));
  
  for (const file of processedFiles) {
    if (file?.is_directory) {
      result.push(file);
    } else {
      if (file?.show_on_menu !== false) {
        const parentSlug = path.dirname(file.slug);
        const parent = result.find(r => r.slug === parentSlug);
        
        if (parent) {
          parent.files.push(file);
        } else if (config.verbose) {
          console.warn('No parent found for', file.slug);
        }
      }
    }
  }
  
  const sorted = result.sort((a, b) => a.sort - b.sort);
  
  return sorted.map(item => {
    item.files = item.files.sort((a, b) => a.sort - b.sort);
    return item;
  });
}

async function processFile(config, route, contentPath, filePath) {
  const fullPath = path.join(contentPath, filePath);
  const normalizedPath = fullPath.replace('\\', '/');
  const stat = await fs.stat(filePath);
  
  if (stat.isDirectory()) {
    return processDirectory(config, route, contentPath, fullPath, normalizedPath);
  }
  
  if (stat.isFile() && path.extname(fullPath) === '.md') {
    return processMarkdownFile(config, route, contentPath, filePath, normalizedPath);
  }
  
  return null;
}

async function processDirectory(config, route, contentPath, dirPath, normalizedPath) {
  const metaPath = path.join(contentPath, dirPath);
  let isIndex = false;
  
  try {
    const indexStat = await fs.stat(path.join(metaPath, 'index.md'));
    isIndex = indexStat.isFile();
  } catch {}
  
  if (isIndex) {
    if (config.verbose) {
      console.warn('Skipping index directory', metaPath);
    }
    return null;
  }
  
  let meta = {};
  
  try {
    const metaContent = await fs.readFile(path.join(metaPath, 'meta.yml'), 'utf8');
    meta = contentProcessors.cleanObjectStrings(yaml.load(metaContent));
  } catch (err) {
    if (config.verbose) {
      console.warn('Error reading meta', metaPath, err.message);
    }
  }
  
  let sort = 0;
  
  if ((config.sortDirs || false) && !meta.sort) {
    try {
      const sortContent = await fs.readFile(path.join(metaPath, '.sort'), 'utf8');
      sort = Number.parseInt(sortContent, 10);
    } catch (err) {
      if (config.verbose) {
        console.warn('Error reading sort', metaPath, err.message);
      }
    }
  }
  
  return {
    slug: normalizedPath,
    title: meta.title || _.startCase(path.basename(dirPath).replace(/[-_]/g, ' ')),
    show_on_home: metaBool(meta.show_on_home, config.showDirsOnHome),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(meta.show_on_menu, config.showDirsOnMenu),
    active: route.startsWith('/' + normalizedPath),
    class: 'dir-' + contentProcessors.cleanString(normalizedPath),
    sort: meta.sort || sort,
    description: meta.description || '',
    files: []
  };
}

async function processMarkdownFile(config, route, contentPath, filePath, normalizedPath) {
  const indexSlug = config.indexSlug || '';
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    let slug = normalizedPath;
    let sort = 0;
    
    if (normalizedPath.endsWith(indexSlug)) {
      slug = slug.replace(indexSlug, '');
    }
    
    slug = slug.replace(/\.md$/, '').replace(/^\//, '');
    
    const meta = contentProcessors.processMeta(content);
    
    if (indexSlug && meta[indexSlug]) {
      sort = Number.parseInt(meta[indexSlug], 10);
    }
    
    return {
      slug: slug,
      title: meta.title ? meta.title : contentProcessors.slugToTitle(slug),
      show_on_home: metaBool(meta.show_on_home, config.showFilesOnHome),
      is_directory: false,
      show_on_menu: metaBool(meta.show_on_menu, config.showFilesOnMenu),
      active: route === '/' + slug,
      sort: sort
    };
  } catch (err) {
    if (config.verbose) console.error(err);
    return null;
  }
}

export default handler;
