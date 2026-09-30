import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidCharacters = `&'"/><`;

function sanitizePathPart(value) {
  return validator.escape(
    validator.trim(validator.blacklist(value, invalidCharacters)),
  );
}

function getFilepath(file) {
  let filepath = file.content;

  if (file.category) {
    for (const categoryPart of file.category.split('/')) {
      const safeCategoryPart = sanitizeFilename(sanitizePathPart(categoryPart));
      if (!safeCategoryPart || safeCategoryPart === '.' || safeCategoryPart === '..') {
        return null;
      }
      filepath += `/${safeCategoryPart}`;
    }
  }

  if (file.filename) {
    const safeFilename = sanitizeFilename(sanitizePathPart(file.filename));
    filepath += `/${safeFilename}`;
  }

  filepath = path.normalize(filepath);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContentPath = path.resolve(file.content);

  if (!resolvedFilepath.startsWith(resolvedContentPath + path.sep)) {
    return null;
  }

  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }
  return `${filepath}.md`;
}

function parseFileParam(fileParam) {
  if (!fileParam || fileParam.trim() === '') {
    return null;
  }

  const pathParts = fileParam.split('/').filter((part) => part.length > 0);
  if (pathParts.length === 0) {
    return null;
  }

  if (pathParts.length > 1) {
    return {
      category: pathParts.slice(0, -1).join('/'),
      filename: pathParts[pathParts.length - 1],
    };
  }

  return {
    category: '',
    filename: pathParts[0],
  };
}

export { getFilepath as default, parseFileParam, resolveFilepath };
