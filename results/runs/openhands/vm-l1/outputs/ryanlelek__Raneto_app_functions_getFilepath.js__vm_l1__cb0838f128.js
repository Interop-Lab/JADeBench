import validator from 'validator';
import path from 'node:path';
import fsExtra from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = `&'"/><`;

function sanitizer(value) {
  const stripped = validator.blacklist(value, invalidChars);
  return validator.escape(validator.trim(stripped));
}

function sanitizePathPart(value) {
  return sanitizeFilename(sanitizer(value));
}

function getFilepath(file) {
  let filepath = file.content;

  if (filepath === '') return null;

  if (file.category) {
    for (const segment of file.category.split('/')) {
      const safeSegment = sanitizePathPart(segment);
      if (!safeSegment) return null;
      filepath += `/${safeSegment}`;
    }
  }

  if (file.filename) {
    filepath += `/${sanitizePathPart(file.filename)}`;
  }

  filepath = path.normalize(filepath);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContentRoot = path.resolve(file.content);

  if (!resolvedFilepath.startsWith(`${resolvedContentRoot}/`)) return null;
  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fsExtra.pathExists(filepath)) return filepath;
  return `${filepath}.md`;
}

function parseFileParam(fileParam) {
  if (!fileParam || !fileParam.trim()) return null;

  const parts = fileParam.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  const filename = parts.pop();
  return {
    category: parts.join('/'),
    filename,
  };
}

export { getFilepath as default, parseFileParam, resolveFilepath };
