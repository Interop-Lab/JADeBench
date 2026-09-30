import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '&\'" /><';

function sanitizer(input) {
  if (typeof input !== 'string') {
    throw new TypeError('Expected a string');
  }
  return sanitizeFilename(input, { replacement: '_' });
}

function getFilepath(filename) {
  const sanitized = sanitizer(filename);
  if (!sanitized) {
    throw new Error('Invalid filename');
  }
  return path.join(process.cwd(), 'uploads', sanitized);
}

function resolveFilepath(filepath) {
  return path.resolve(filepath);
}

function parseFileParam(param) {
  if (typeof param !== 'string') {
    return null;
  }
  const trimmed = param.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

async function routeCategoryCreate(req) {
  const { filename, content } = req.body || {};
  
  const parsedFilename = parseFileParam(filename);
  if (!parsedFilename) {
    throw new Error('Filename is required');
  }
  
  if (!validator.isAlphanumeric(parsedFilename.replace(/[_-]/g, ''))) {
    throw new Error('Filename contains invalid characters');
  }
  
  const filepath = getFilepath(parsedFilename);
  const resolvedPath = resolveFilepath(filepath);
  
  const uploadDir = path.join(process.cwd(), 'uploads');
  if (!resolvedPath.startsWith(uploadDir)) {
    throw new Error('Invalid file path');
  }
  
  await fs.ensureDir(uploadDir);
  await fs.writeFile(resolvedPath, content || '', 'utf8');
  
  return { success: true, path: resolvedPath };
}

export default routeCategoryCreate;
