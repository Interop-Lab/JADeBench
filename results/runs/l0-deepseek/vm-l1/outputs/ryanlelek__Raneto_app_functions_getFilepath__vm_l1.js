import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '&\'"/><';

function sanitizer(input) {
  return sanitizeFilename(input);
}

function getFilepath(filepath) {
  return path.resolve(filepath);
}

function resolveFilepath(filepath) {
  return path.resolve(filepath);
}

function parseFileParam(fileParam) {
  if (typeof fileParam !== 'string') {
    throw new TypeError('File parameter must be a string');
  }
  const sanitized = sanitizer(fileParam);
  return resolveFilepath(sanitized);
}

export { getFilepath as default, parseFileParam, resolveFilepath };
