import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value) {
  return kebabCase(snakeCase(trim(value.replaceAll('/', ' ')))).replaceAll('_', '-');
}

function cleanObjectStrings(object) {
  const cleaned = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) {
      cleaned[snakeCase(key)] = trim(String(object[key]));
    }
  }
  return cleaned;
}

function slugToTitle(slug) {
  return startCase(trim(path.basename(slug.replaceAll('.md', ''))).replaceAll(/[-_]/g, ' '));
}

function stripMeta(content) {
  if (META_REGEX.test(content)) return trim(content.replace(META_REGEX, ''));
  if (META_REGEX_YAML.test(content)) return trim(content.replace(META_REGEX_YAML, ''));
  return content;
}

function processMeta(content) {
  if (META_REGEX.test(content)) {
    const metadata = {};
    const lines = trim(content.match(META_REGEX)[1]).split('\n');
    for (const line of lines) {
      const separator = line.indexOf(': ');
      if (separator !== -1) {
        metadata[line.substring(0, separator)] = line.substring(separator + 2);
      }
    }
    return cleanObjectStrings(metadata);
  }

  if (META_REGEX_YAML.test(content)) {
    try {
      return cleanObjectStrings(yaml.load(trim(content.match(META_REGEX_YAML)[1])));
    } catch (error) {
      console.log(error);
    }
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

function extractDocument(_source, filePath, options) {
  return fs.readFile(filePath, 'utf8')
    .then((body) => {
      const metadata = processMeta(body);
      return {
        id: filePath,
        title: metadata.title || slugToTitle(filePath),
        body,
      };
    })
    .catch((error) => {
      console.log(error);
      return null;
    });
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
