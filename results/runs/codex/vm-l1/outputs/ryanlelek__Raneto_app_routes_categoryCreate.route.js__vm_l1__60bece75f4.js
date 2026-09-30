import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '&\'"/><';

function sanitizer(content) {
  const blacklisted = validator.blacklist(content, invalidChars);
  return validator.escape(validator.trim(blacklisted));
}

const sanitize_default = sanitizer;

function getFilepath({ content, category } = {}) {
  if (typeof content !== 'string' || typeof category !== 'string') return null;

  const filename = sanitizeFilename(content);
  const categoryParts = category.trim().split('/').filter(Boolean);
  if (!filename || categoryParts.length === 0 || categoryParts.includes('.') || categoryParts.includes('..')) {
    return null;
  }

  const categoryName = sanitize_default(categoryParts.join('/'));
  if (!categoryName || categoryName === '.' || categoryName === '..') return null;

  const filepath = path.normalize(path.join(filename, categoryName));
  const root = path.resolve(filename) + path.sep;
  if (!path.resolve(filepath).startsWith(root)) return null;
  return filepath;
}

async function resolveFilepath(filepath) {
  if (typeof filepath !== 'string') return filepath;
  if (await fs.pathExists(filepath)) return filepath;
  return `${filepath}.md`;
}

function parseFileParam(value) {
  const parts = String(value ?? '').trim().split('/').filter(Boolean);
  return {
    category: parts[0],
    filename: parts.slice(1).join('/')
  };
}

function routeCategoryCreate() {}

const getFilepath_default = getFilepath;
const categoryCreate_route_default = routeCategoryCreate;

export { categoryCreate_route_default as default };
