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
  const normalizedValue = value.replaceAll('/', ' ');
  const cleanedValue = useSnakeCase
    ? snakeCase(normalizedValue)
    : kebabCase(normalizedValue);

  return trim(cleanedValue, '-');
}

function cleanObjectStrings(object) {
  const cleanedObject = {};

  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleanedObject[cleanString(key, true)] = `${object[key]}`.trim();
    }
  }

  return cleanedObject;
}

function slugToTitle(slug) {
  const filename = path.basename(slug.replaceAll('.md', '').trim());
  return startCase(filename.replace(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) {
    return content.replace(META_REGEX, '').trim();
  }

  if (META_REGEX_YAML.test(content)) {
    return content.replace(META_REGEX_YAML, '').trim();
  }

  return content;
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const metadataBlock = content.match(META_REGEX)[1].trim();
    const metadata = {};

    if (!metadataBlock) return metadata;

    metadataBlock.split('\n').forEach((line) => {
      const separatorIndex = line.indexOf(': ');
      if (separatorIndex < 0) return;

      const key = cleanString(line.substring(0, separatorIndex), true);
      metadata[key] = line.substring(separatorIndex + 2).trim();
    });

    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const metadataBlock = content.match(META_REGEX_YAML)[1];
    return cleanObjectStrings(yaml.load(metadataBlock));
  }

  return {};
}

function processVars(content, config) {
  if (Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      const placeholder = new RegExp(`%${variable.name}%`, 'g');
      content = content.replaceAll(placeholder, variable.content);
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

async function extractDocument(basePath, filename, _options) {
  try {
    const content = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(content);
    const id = filename.replaceAll(basePath, '').trim();

    return {
      id,
      title: metadata.title || slugToTitle(id),
      body: content,
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

export { contentProcessors as default };
