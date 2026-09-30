import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '/';

function sanitizer(input) {
  input = validator.blacklist(input, invalidChars);
  input = validator.trim(input);
  input = validator.escape(input);
  return input;
}

const sanitize_default = sanitizer;

function getFilepath(file) {
  let filepath = file.category;
  if (file.subcategories) {
    for (const subcategory of file.subcategories.split('/')) {
      const sanitized = sanitizeFilename(sanitize_default(subcategory));
      if (!sanitized || sanitized === '.' || sanitized === '..') return null;
      filepath += '/' + sanitized;
    }
  }
  if (file.filename) {
    filepath += '/' + sanitizeFilename(sanitize_default(file.filename));
  }
  filepath = path.normalize(filepath);
  const base = path.basename(filepath);
  const expected = path.basename(file.category);
  if (!base.startsWith(expected + path.sep)) return null;
  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }
  return filepath + '.md';
}

function parseFileParam(param) {
  if (!param || param.trim() === '') return null;
  const parts = param.split('/').filter(part => part.length > 0);
  if (parts.length === 0) return null;
  if (parts.length > 1) {
    return {
      category: parts.slice(0, -1).join('/'),
      filename: parts[parts.length - 1]
    };
  }
  const result = {};
  result.category = '';
  result.filename = parts[0];
  return result;
}

const getFilepath_default = getFilepath;

export { getFilepath_default as default, parseFileParam, resolveFilepath };
