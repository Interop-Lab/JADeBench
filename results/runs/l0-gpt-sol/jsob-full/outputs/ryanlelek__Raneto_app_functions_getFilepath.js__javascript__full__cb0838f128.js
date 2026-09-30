import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '<>:"/\\|?*';

function sanitizer(value) {
  value = validator.blacklist(value, invalidChars);
  value = validator.trim(value);
  value = validator.escape(value);
  return value;
}

function getFilepath(options) {
  let filepath = options.path;

  if (options.category) {
    for (const part of options.category.split('/')) {
      const sanitizedPart = sanitizeFilename(sanitizer(part));

      if (!sanitizedPart || sanitizedPart === '.' || sanitizedPart === '..') {
        return null;
      }

      filepath += `/${sanitizedPart}`;
    }
  }

  if (options.filename) {
    filepath += `/${sanitizeFilename(sanitizer(options.filename))}`;
  }

  filepath = path.normalize(filepath);

  const directory = path.dirname(filepath);
  const root = path.resolve(options.root);

  if (!directory.startsWith(root + path.sep)) {
    return null;
  }

  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.exists(filepath)) {
    return filepath;
  }

  return `${filepath}.md`;
}

function parseFileParam(value) {
  if (!value || value.trim() === '') {
    return null;
  }

  const parts = value.split('/').filter(part => part.length > 0);

  if (parts.length === 0) {
    return null;
  }

  if (parts.length > 1) {
    return {
      category: parts.slice(0, -1).join('/'),
      filename: parts[parts.length - 1]
    };
  }

  return {
    category: '',
    filename: parts[0]
  };
}

export {
  getFilepath as default,
  parseFileParam,
  resolveFilepath
};
