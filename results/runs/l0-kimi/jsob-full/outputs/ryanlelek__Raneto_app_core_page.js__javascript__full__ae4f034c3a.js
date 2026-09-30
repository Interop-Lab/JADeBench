import path from 'node:path';
import fsExtra from 'fs-extra';
import moment from 'moment';

var normalizeDir = (dir) => dir.replaceAll('\\', '/');

var getSlug = (filePath, baseDir) => normalizeDir(filePath).replace(normalizeDir(baseDir), '').replace(/^\/+/, '');

async function getLastModified(filePath, fileData, config) {
  if (fileData.lastModified !== undefined) {
    return moment(fileData.lastModified).format(config.dateFormat);
  }

  const basePath = path.join(filePath, config.contentDir);
  const paths = [basePath];
  
  if (fileData.dir) {
    paths.push(path.join(filePath, fileData.dir));
  }

  const isInPaths = (targetPath) => paths.some(p => targetPath.startsWith(p + path.sep) || targetPath === p);
  const targetPath = path.resolve(config.outputDir);

  if (!isInPaths(targetPath)) {
    throw new Error('Target path is not within the allowed paths');
  }

  const stat = await fsExtra.stat(targetPath);

  if (!isInPaths(stat)) {
    throw new Error('Stat path is not within the allowed paths');
  }

  const { mtime } = await fsExtra.stat(stat);
  return moment(mtime).format(config.dateFormat);
}

var utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

import nodePath from 'node:path';
import fsExtra2 from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

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
    if (Object.hasOwnProperty.call(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  
  return result;
}

function slugToTitle(slug) {
  slug = slug.replace(/\.md$/i, '').trim();
  return startCase(nodePath.basename(slug).replace(/[-_]/g, ' '));
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
    const metaContent = match?.[1]?.trim() ?? '';
    
    if (metaContent) {
      const lines = metaContent.split('\n');
      
      for (const line of lines) {
        const colonIndex = line.indexOf(': ');
        
        if (colonIndex <= 0) continue;
        
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        if (key && value) {
          result[cleanString(key, true)] = value;
        }
      }
    }
    
    return result;
  }
  
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const yamlContent = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(yamlContent);
    return cleanObjectStrings(parsed);
  }
  
  return {};
}

function processVars(content, data) {
  if (data.vars && Array.isArray(data.vars)) {
    data.vars.forEach(v => {
      content = content.replaceAll(new RegExp('%' + v.name + '%', 'g'), v.value);
    });
  }
  
  if (data.title !== undefined) {
    content = content.replaceAll('%title%', data.title);
  }
  
  if (data.slug !== undefined) {
    content = content.replaceAll('%slug%', data.slug);
  }
  
  return content;
}

async function extractDocument(contentDir, filePath, verbose) {
  try {
    const content = await fsExtra2.readFile(filePath, 'utf-8');
    const meta = processMeta(content);
    const slug = filePath.replace(contentDir, '').replace(/^\//, '');
    const title = meta.title ? meta.title : slugToTitle(slug);
    const body = content;
    
    return {
      id: slug,
      title,
      body
    };
  } catch (error) {
    if (verbose) {
      console.log(error);
    }
    return null;
  }
}

var contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

import sanitizeHtml from 'sanitize-html';

var allowedTags = sanitizeHtml.defaults.allowedTags.concat(['img', 'video', 'source']);

const allowedAttributes = {
  ...sanitizeHtml.defaults.allowedAttributes,
  a: ['href', 'name', 'target', 'rel', 'title', 'class'],
  img: ['src', 'alt', 'title', 'class'],
  h1: ['id'],
  h2: ['id'],
  h3: ['id'],
  h4: ['id'],
  h5: ['id'],
  h6: ['id'],
  video: ['src', 'class'],
  source: ['src', 'type'],
  div: ['class']
};

function sanitizeHtmlOutput(html) {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes
  });
}

var sanitizeHtmlOutput_default = sanitizeHtmlOutput;

import nodePath2 from 'node:path';
import fsExtra3 from 'fs-extra';
import unescape from 'lodash/unescape.js';
import sanitizeHtml2 from 'sanitize-html';
import { marked } from 'marked';

async function handler(filePath, config) {
  const slug = utils_default.getSlug(nodePath2.resolve(filePath), config.contentDir);
  
  try {
    const content = await fsExtra3.readFile(filePath, 'utf-8');
    let id = utils_default.getSlug(filePath, slug);
    
    id = id.replace(/\.md$/i, '');
    id = id.replace(/^\/+/, '').trim();
    
    const meta = contentProcessors_default.processMeta(content);
    const body = contentProcessors_default.processVars(contentProcessors_default.stripMeta(content), config);
    const html = sanitizeHtmlOutput_default(marked(body));
    const title = meta.title ? meta.title : contentProcessors_default.slugToTitle(id);
    
    const sanitizeOptions = {
      allowedTags: [],
      allowedAttributes: {}
    };
    
    const plainText = unescape(sanitizeHtml2(html, sanitizeOptions));
    const excerptLength = config.excerptLength || 200;
    const excerpt = plainText.length > excerptLength 
      ? plainText.substring(0, excerptLength).trim().replace(/\s\S+$/, '') + '...'
      : plainText;
    
    return {
      id,
      title,
      html,
      excerpt
    };
  } catch (error) {
    if (config.verbose) {
      console.log(error);
    }
    return null;
  }
}

var page_default = handler;

export { page_default as default };
