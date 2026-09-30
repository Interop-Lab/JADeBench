import path from 'node:path';
import fs from 'fs-extra';
import snakeCase from 'lodash/snakeCase.js';
import kebabCase from 'lodash/kebabCase.js';
import startCase from 'lodash/startCase.js';
import trim from 'lodash/trim.js';
import yaml from 'js-yaml';

const META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;

function cleanString(value, snake = false) {
  value = value.replaceAll('/', ' ').trim();

  if (snake) {
    return snakeCase(value);
  }

  return trim(kebabCase(value), '-');
}

function cleanObjectStrings(object) {
  const result = {};

  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      result[cleanString(key, true)] = String(object[key]).trim();
    }
  }

  return result;
}

function slugToTitle(slug) {
  slug = slug.replaceAll('.md', '').trim();

  return startCase(
    path.basename(slug).replace(/[-_]/g, ' ')
  );
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
    const body = match?.[1]?.trim() ?? '';

    for (const line of body.split('\n')) {
      const separator = line.indexOf(': ');

      if (separator <= 1) {
        continue;
      }

      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();

      if (key && value) {
        metadata[cleanString(key, true)] = value;
      }
    }

    return metadata;
  }

  if (META_REGEX_YAML.test(content)) {
    const match = content.match(META_REGEX_YAML);
    const body = match?.[1]?.trim() ?? '';
    const metadata = yaml.load(body);

    return cleanObjectStrings(metadata);
  }

  return {};
}

function processVars(content, variables) {
  const replacements =
    variables?.replacements ??
    variables?.variables ??
    variables?.vars;

  if (Array.isArray(replacements)) {
    for (const replacement of replacements) {
      const key = replacement?.key ?? replacement?.name;
      const value = replacement?.value ?? replacement?.replacement ?? '';

      if (key !== undefined) {
        content = content.replaceAll(
          new RegExp(`%${key}%`, 'g'),
          value
        );
      }
    }
  }

  if (variables?.url !== undefined) {
    content = content.replaceAll('%url%', variables.url);
  }

  if (variables?.title !== undefined) {
    content = content.replaceAll('%title%', variables.title);
  }

  return content;
}

async function extractDocument(extension, filename, logErrors) {
  try {
    const content = await fs.readFile(filename, 'utf8');
    const metadata = processMeta(content);
    const id = filename.replaceAll(extension, '').trim();
    const title = metadata.title || slugToTitle(id);

    return {
      id,
      title,
      content
    };
  } catch (error) {
    if (logErrors) {
      console.error(error);
    }

    return null;
  }
}

const contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

export { contentProcessors_default as default };
