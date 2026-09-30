import path from 'node:path';
import fsExtra from 'fs-extra';
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
    if (Object.hasOwn(obj, key)) {
      result[cleanString(key, true)] = ('' + obj[key]).trim();
    }
  }
  return result;
}

function slugToTitle(slug) {
  slug = slug.replaceAll('.md', '').trim();
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
    const yamlBlock = match?.[1]?.trim() ?? '';
    const parsed = yaml.load(yamlBlock);
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
  if (vars.title !== void 0) {
    content = content.replaceAll('%title%', vars.title);
  }
  if (vars.slug !== void 0) {
    content = content.replaceAll('%slug%', vars.slug);
  }
  return content;
}

async function extractDocument(rootPath, filePath, verbose) {
  try {
    const rawContent = await fsExtra.readFile(filePath, 'utf8');
    const meta = processMeta(rawContent);
    const slug = filePath.replaceAll(rootPath, '').trim();
    const title = meta.title ? meta.title : slugToTitle(slug);
    const content = rawContent;
    return {
      id: slug,
      title: title,
      content: content
    };
  } catch (err) {
    if (verbose) {
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
