import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = `&'"/><`;

function sanitizer(value) {
  const stripped = validator.blacklist(value, invalidChars);
  return validator.trim(validator.escape(stripped));
}

function sanitizePathPart(value) {
  return sanitizeFilename(sanitizer(value));
}

function getFilepath(file) {
  const { content: basePath, category, filename } = file;

  if (!filename) {
    path.normalize(basePath);
    return null;
  }
  if (basePath === '') {
    return null;
  }

  const categoryParts = category ? category.split('/') : [];
  if (categoryParts.some((part) => !part || part === '.' || part === '..')) {
    return null;
  }

  const cleanCategory = categoryParts.map(sanitizePathPart);
  if (cleanCategory.some((part) => !part)) {
    return null;
  }

  const cleanFilename = sanitizePathPart(filename);
  const parentPath = path.join(basePath, ...cleanCategory);
  return cleanFilename ? path.join(parentPath, cleanFilename) : `${parentPath}${path.sep}`;
}

async function resolveFilepath(filepath) {
  return (await fs.pathExists(filepath)) ? filepath : `${filepath}.md`;
}

function parseFileParam(fileParam) {
  if (!fileParam) {
    return null;
  }

  const parts = fileParam.split('/').filter(Boolean);
  if (parts.length === 0) {
    return null;
  }

  const filename = parts.pop();
  return {
    category: parts.join('/'),
    filename,
  };
}

export { getFilepath as default, parseFileParam, resolveFilepath };
