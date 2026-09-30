import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '&\'"/><';

function sanitizer(value) {
  if (typeof value !== 'string') {
    return value;
  }

  return sanitizeFilename(value)
    .split('')
    .filter((character) => !invalidChars.includes(character))
    .join('');
}

function parseFileParam(value) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const sanitized = sanitizer(value);
  if (!sanitized || !validator.isLength(sanitized, { min: 1 })) {
    return undefined;
  }

  return sanitized;
}

function resolveFilepath(value) {
  const fileParam = parseFileParam(value);
  if (fileParam === undefined) {
    return undefined;
  }

  return path.resolve(fileParam);
}

function getFilepath(value) {
  const filepath = resolveFilepath(value);
  if (filepath === undefined || !fs.existsSync(filepath)) {
    return undefined;
  }

  return filepath;
}

export { getFilepath as default, parseFileParam, resolveFilepath };
