import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';
import fs2 from 'fs-extra';

const invalidChars = '&\'"\\/><';

function sanitizer(input) {
  return sanitizeFilename(input, { replacement: '_' });
}

function getFilepath(filepath) {
  if (typeof filepath !== 'string') {
    throw new TypeError('Filepath must be a string');
  }
  return path.resolve(filepath);
}

function resolveFilepath(filepath) {
  if (typeof filepath !== 'string') {
    throw new TypeError('Filepath must be a string');
  }
  return path.resolve(filepath);
}

function parseFileParam(fileParam) {
  if (typeof fileParam !== 'string') {
    throw new TypeError('File parameter must be a string');
  }
  const sanitized = sanitizer(fileParam);
  const resolved = resolveFilepath(sanitized);
  return resolved;
}

function routeCategoryCreate(req, res) {
  const fileParam = req?.body?.file || req?.query?.file;
  if (!fileParam) {
    return res?.status?.(400)?.json?.({ error: 'File parameter is required' });
  }
  try {
    const filepath = parseFileParam(fileParam);
    return res?.status?.(200)?.json?.({ filepath });
  } catch (error) {
    return res?.status?.(400)?.json?.({ error: error.message });
  }
}

export { routeCategoryCreate as default };
