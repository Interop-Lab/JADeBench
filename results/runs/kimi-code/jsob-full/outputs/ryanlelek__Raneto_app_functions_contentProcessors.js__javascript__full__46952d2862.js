import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, useSnakeCase = false) {
  const normalized = value.replaceAll('/', ' ').trim();
  if (useSnakeCase) {
    return snakeCase(normalized);
  }
  return trim(kebabCase(normalized), '-');
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
    const block = content.match(META_REGEX)?.[1]?.trim() ?? '';
    if (block) {
      for (const line of block.split('\n')) {
        const separator = line.indexOf(': ');
        if (separator <= 0) continue;
        const key = line.substring(0, separator).trim();
        const value = line.substring(separator + 2).trim();
        if (key && value) {
          metadata[cleanString(key, true)] = value;
        }
      }
    }
    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const block = content.match(META_REGEX_YAML)?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(block));
  }

  return {};
}

function processVars(content, options) {
  if (options.vars && Array.isArray(options.vars)) {
    options.vars.forEach((variable) => {
      content = content.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.value,
      );
    });
  }

  if (options.site_title !== undefined) {
    content = content.replaceAll('%site_title%', options.site_title);
  }

  if (options.base_url !== undefined) {
    content = content.replaceAll('%base_url%', options.base_url);
  }

  return content;
}

async function extractDocument(contentDirectory, filename, logErrors) {
  try {
    const content = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(content);
    const id = filename.replaceAll(contentDirectory, '').trim();
    const title = metadata.title ? metadata.title : slugToTitle(id);

    return {
      id,
      title,
      content,
    };
  } catch (error) {
    if (logErrors) console.error(error);
    return null;
  }
}

export default {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};
