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
  const cleanedValue = trim(value.replaceAll('/', ' '));
  return useSnakeCase ? snakeCase(cleanedValue) : kebabCase(cleanedValue);
}

function cleanObjectStrings(object) {
  const cleanedObject = {};

  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      const cleanedKey = cleanString(key, true);
      cleanedObject[cleanedKey] = object[key].toString().trim();
    }
  }

  return cleanedObject;
}

function slugToTitle(slug) {
  const basename = path.basename(trim(slug.replaceAll('.md', '')));
  return startCase(basename.replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) {
    content = content.replace(META_REGEX, '');
  }

  if (META_REGEX_YAML.test(content)) {
    content = content.replace(META_REGEX_YAML, '');
  }

  return trim(content);
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const metadata = {};
    const lines = content.match(META_REGEX)[1].trim().split('\n');

    lines.forEach((line) => {
      const separatorIndex = line.indexOf(': ');
      if (separatorIndex !== -1) {
        const key = cleanString(line.substring(0, separatorIndex), true);
        metadata[key] = line.substring(separatorIndex + 2);
      }
    });

    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const yamlContent = content.match(META_REGEX_YAML)[1].trim();
    return cleanObjectStrings(yaml.load(yamlContent));
  }

  return {};
}

function processVars(content, options) {
  if (Array.isArray(options.variables)) {
    options.variables.forEach((variable) => {
      content = content.replaceAll(`%${variable.name}%`, variable.content);
    });
  }

  content = content.replaceAll('%base_url%', options.base_url);
  content = content.replaceAll('%image_url%', options.image_url);
  return content;
}

async function extractDocument(_context, filePath, _options) {
  if (typeof filePath !== 'string') {
    return null;
  }

  try {
    const body = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(body);

    return {
      id: filePath,
      title: metadata.title || slugToTitle(filePath),
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

globalThis.META_REGEX = META_REGEX;
globalThis.META_REGEX_YAML = META_REGEX_YAML;
globalThis.contentProcessors_default = contentProcessors;

export default contentProcessors;
