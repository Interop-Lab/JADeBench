import fs from 'fs-extra';
import path from 'node:path';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value) {
  return trim(kebabCase(value.replaceAll('/', ' ')), '-');
}

function cleanObjectStrings(object) {
  const cleaned = {};

  for (let index = 0; index < (object?.length || 0); index += 1) {
    if (Object.hasOwn(object, index)) cleaned[index] = trim(String(object[index]));
  }

  Object.keys(object || {}).forEach((key) => {
    cleaned[snakeCase(key)] = trim(String(object[key]));
  });

  return cleaned;
}

function slugToTitle(slug) {
  return startCase(path.basename(trim(slug.replaceAll('.md', ''))).replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) return trim(content.replace(META_REGEX, ''));
  if (META_REGEX_YAML.test(content)) return trim(content.replace(META_REGEX_YAML, ''));
  return trim(content);
}

function processMeta(content) {
  let metadata = {};

  if (META_REGEX.test(content)) {
    const match = content.match(META_REGEX);
    const lines = trim(match?.[1] || '').split('\n');

    lines.forEach((line) => {
      const separator = line.indexOf(': ');
      if (separator === -1) return;

      const key = cleanString(line.substring(0, separator));
      const value = trim(line.substring(separator + 2));
      metadata[key] = value;
    });
  } else if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    metadata = yaml.load(trim(match?.[1] || '')) || {};
  }

  return cleanObjectStrings(metadata);
}

function processVars(content, config) {
  if (Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      content = content.replaceAll(`%${variable.name}%`, variable.content);
    });
  }

  content = content.replaceAll('%base_url%', config.base_url || '');
  content = content.replaceAll('%image_url%', config.image_url || '');
  return content;
}

async function extractDocument(config, filename) {
  try {
    const body = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(body);
    const title = metadata.title || slugToTitle(filename);

    return {
      id: filename,
      title,
      body,
    };
  } catch (error) {
    console.log(error);
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

export default contentProcessors;
