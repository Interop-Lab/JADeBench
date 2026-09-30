import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const INVALID_CHARACTERS = `&'\"/><`;

function sanitizer(value) {
  return validator.escape(validator.trim(validator.blacklist(value, INVALID_CHARACTERS)));
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }

  return `${filepath}.md`;
}

function parseFileParam(fileParam) {
  if (!fileParam || !fileParam.trim()) {
    return null;
  }

  const parts = fileParam.split('/').filter(Boolean);
  if (!parts.length) {
    return null;
  }

  return {
    category: parts.slice(0, -1).join('/'),
    filename: parts.at(-1),
  };
}

async function getFilepath(options) {
  const content = options.content;
  const category = options.category;
  const filename = options.filename;

  if (!content || (!category && !filename)) {
    return null;
  }

  const categoryParts = category ? category.split('/') : [];
  if (categoryParts.some((part) => !part || part === '.' || part === '..')) {
    return null;
  }

  const safeCategories = categoryParts.map((part) => sanitizeFilename(sanitizer(part)));
  if (safeCategories.some((part) => !part)) {
    return null;
  }

  const safeCategory = safeCategories.join('/');
  const safeFilename = filename === undefined ? undefined : sanitizeFilename(sanitizer(filename));
  if (!safeCategory && !safeFilename) {
    return null;
  }

  const relativeFilepath = categoryParts.length
    ? safeFilename
      ? `${safeCategory}/${safeFilename}`
      : safeCategory
    : safeFilename;
  let filepath = path.normalize(`${content}/${relativeFilepath}`);
  if (categoryParts.length && filename && !safeFilename) {
    filepath += path.sep;
  }
  const contentRoot = path.resolve(content);

  if (contentRoot === path.parse(contentRoot).root || !path.resolve(filepath).startsWith(contentRoot)) {
    return null;
  }

  return filepath;
}

export { getFilepath as default, parseFileParam, resolveFilepath };
