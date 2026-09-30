import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '/\?<>\:*|"';

function sanitizer(input) {
  input = validator.blacklist(input, invalidChars);
  input = validator.trim(input);
  input = validator.escape(input);
  return input;
}

const sanitize_default = sanitizer;

function getFilepath(params) {
  let filepath = params.filepath;

  if (params.category) {
    for (const part of params.category.split('/')) {
      const sanitized = sanitizeFilename(sanitize_default(part));
      if (!sanitized || sanitized === '.' || sanitized === '..') {
        return null;
      }
      filepath += '/' + sanitized;
    }
  }

  if (params.filename) {
    filepath += '/' + sanitizeFilename(sanitize_default(params.filename));
  }

  filepath = path.normalize(filepath);

  const resolved = path.resolve(filepath);
  const base = path.resolve(params.filepath);

  if (!resolved.startsWith(path.join(base, path.sep))) {
    return null;
  }

  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }
  return filepath + '/';
}

function parseFileParam(param) {
  if (!param || param.trim() === '') {
    return null;
  }

  const parts = param.split('/').filter(part => part.length > 0);

  if (parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
    return {
      category: '',
      filename: parts[0]
    };
  }

  return {
    category: parts.slice(0, -1).join('/'),
    filename: parts[parts.length - 1]
  };
}

const getFilepath_default = getFilepath;

export { getFilepath_default as default, parseFileParam, resolveFilepath };
