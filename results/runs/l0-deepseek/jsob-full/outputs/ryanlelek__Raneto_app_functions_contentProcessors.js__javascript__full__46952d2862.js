import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

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
    if (Object.hasOwn(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
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
    const block = match?.[1]?.trim() ?? '';
    if (block) {
      const lines = block.split('\n');
      for (const line of lines) {
        const idx = line.indexOf(': ');
        if (idx === -1) continue;
        const key = line.substring(0, idx).trim();
        const value = line.substring(idx + 2).trim();
        if (key && value) {
          meta[cleanString(key, true)] = value;
        }
      }
    }
    return meta;
  }
  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const block = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(block);
    return cleanObjectStrings(parsed);
  }
  return {};
}

function processVars(content, vars) {
  if (vars.vars && Array.isArray(vars.vars)) {
    vars.vars.forEach(v => {
      content = content.replaceAll(new RegExp('%' + v.name + '%', 'g'), v.value);
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

async function extractDocument(root, filePath, debug = false) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const meta = processMeta(raw);
    const id = filePath.replaceAll(root, '').trim();
    const title = meta.title ? meta.title : slugToTitle(id);
    const content = raw;
    const doc = {};
    doc.id = id;
    doc.title = title;
    doc.content = content;
    return doc;
  } catch (err) {
    if (debug) {
      console.error(err);
    }
    return null;
  }
}

const contentProcessors = {};
contentProcessors.cleanString = cleanString;
contentProcessors.cleanObjectStrings = cleanObjectStrings;
contentProcessors.extractDocument = extractDocument;
contentProcessors.slugToTitle = slugToTitle;
contentProcessors.stripMeta = stripMeta;
contentProcessors.processMeta = processMeta;
contentProcessors.processVars = processVars;

var contentProcessors_default = contentProcessors;

export { contentProcessors_default as default };
