import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = `&'"/><`;

function sanitizer(value) {
  value = validator.blacklist(value, invalidChars);
  value = validator.trim(value);
  value = validator.escape(value);
  return value;
}

function getFilepath(file) {
  let filepath = file.content;

  if (file.category) {
    for (const categoryPart of file.category.split('/')) {
      const safePart = sanitizeFilename(sanitizer(categoryPart));
      if (!safePart || safePart === '.' || safePart === '..') {
        return null;
      }
      filepath += '/' + safePart;
    }
  }

  if (file.filename) {
    filepath += '/' + sanitizeFilename(sanitizer(file.filename));
  }

  filepath = path.normalize(filepath);

  const resolvedFilepath = path.resolve(filepath);
  const resolvedContent = path.resolve(file.content);
  if (!resolvedFilepath.startsWith(resolvedContent + path.sep)) {
    return null;
  }

  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }
  return filepath + '.md';
}

function parseFileParam(fileParam) {
  if (!fileParam || fileParam.trim() === '') {
    return null;
  }

  const parts = fileParam.split('/').filter((part) => part.length > 0);
  if (parts.length === 0) {
    return null;
  }

  if (parts.length > 1) {
    return {
      category: parts.slice(0, -1).join('/'),
      filename: parts[parts.length - 1],
    };
  }

  return {
    category: '',
    filename: parts[0],
  };
}

export { getFilepath as default, parseFileParam, resolveFilepath };
