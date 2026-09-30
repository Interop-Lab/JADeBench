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
  const cleanedValue = value.replaceAll('/', ' ').trim();

  if (useSnakeCase) {
    return snakeCase(cleanedValue);
  }

  return trim(kebabCase(cleanedValue), '-');
}

function cleanObjectStrings(object) {
  const cleanedObject = {};

  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleanedObject[cleanString(key, true)] = ('' + object[key]).trim();
    }
  }

  return cleanedObject;
}

function slugToTitle(slug) {
  const cleanedSlug = slug.replaceAll('.md', '').trim();
  const basename = path.basename(cleanedSlug).replaceAll(/[-_]/g, ' ');
  return startCase(basename);
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
    const match = content.match(META_REGEX);
    const metadataBlock = match?.[1]?.trim() ?? '';

    if (metadataBlock) {
      for (const line of metadataBlock.split('\n')) {
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

  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const metadataBlock = match?.[1]?.trim() ?? '';
    return cleanObjectStrings(yaml.load(metadataBlock));
  }

  return {};
}

function processVars(content, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((variable) => {
      content = content.replaceAll(
        new RegExp(`%${variable.name}%`, 'g'),
        variable.content,
      );
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

async function extractDocument(basePath, filePath, logErrors) {
  try {
    const body = await fs.readFile(filePath, 'utf8');
    const metadata = processMeta(body);
    const id = filePath.replaceAll(basePath, '').trim();
    const title = metadata.title ? metadata.title : slugToTitle(id);

    return { id, title, body };
  } catch (error) {
    if (logErrors) {
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

export default contentProcessors;
