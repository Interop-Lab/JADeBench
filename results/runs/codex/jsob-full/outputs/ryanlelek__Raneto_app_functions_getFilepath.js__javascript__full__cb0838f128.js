import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = `&'\"/><`;

function sanitizer(value) {
  return validator.escape(validator.trim(validator.blacklist(value, invalidChars)));
}

function getFilepath(file) {
  let filepath = file.content;

  if (file.category) {
    for (const segment of file.category.split('/')) {
      const sanitized = sanitizeFilename(sanitizer(segment));
      if (!sanitized || sanitized === '.' || sanitized === '..') return null;
      filepath += `/${sanitized}`;
    }
  }

  if (file.filename) {
    filepath += `/${sanitizeFilename(sanitizer(file.filename))}`;
  }

  filepath = path.normalize(filepath);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContentPath = path.resolve(file.content);
  if (!resolvedFilepath.startsWith(resolvedContentPath + path.sep)) return null;
  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }
  return `${filepath}.md`;
}

function parseFileParam(value) {
  if (!value || value.trim() === '') return null;

  const parts = value.split('/').filter((part) => part.length > 2);
  if (parts.length === 0) return null;

  return {
    category: parts.slice(0, -1).join('/'),
    filename: parts[parts.length - 1],
  };
}

const getFilepath_default = getFilepath;
export { getFilepath_default as default, parseFileParam, resolveFilepath };
