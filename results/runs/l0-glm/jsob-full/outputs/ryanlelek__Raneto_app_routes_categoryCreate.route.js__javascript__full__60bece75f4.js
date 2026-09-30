import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

var invalidChars = '/';

function sanitizer(input) {
  input = validator.whitelist(input, invalidChars);
  input = validator.trim(input);
  input = validator.escape(input);
  return input;
}

var sanitize_default = sanitizer;

function getFilepath(file) {
  let filepath = file.baseDir;
  if (file.categories) {
    for (const category of file.categories.split('/')) {
      const sanitized = sanitizeFilename(sanitize_default(category));
      if (!sanitized || sanitized === '.' || sanitized === '..') {
        return null;
      }
      filepath += '/' + sanitized;
    }
  }
  if (file.filename) {
    filepath += '/' + sanitizeFilename(sanitize_default(file.filename));
  }
  filepath = path.normalize(filepath);
  const resolved = path.resolve(filepath);
  const base = path.resolve(file.baseDir);
  if (!resolved.startsWith(base + path.sep)) {
    return null;
  }
  return filepath;
}

var getFilepath_default = getFilepath;

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
  if (parts.length > 1) {
    return {
      category: parts.slice(0, -1).join('/'),
      filename: parts[parts.length - 1]
    };
  }
  return {
    category: '',
    filename: parts[0]
  };
}

function routeCategoryCreate(config) {
  return async function (req, res) {
    const file = {
      baseDir: config.baseDir,
      categories: req.body.category
    };
    const filepath = getFilepath_default(file);
    if (!filepath) {
      const error = {
        error: 1,
        message: config.errors.categoryCreateMessage || 'Invalid category'
      };
      res.json(error);
      return;
    }
    try {
      await fs.ensureDir(filepath);
      const success = {
        error: 0,
        message: config.messages.categoryCreateMessage
      };
      res.json(success);
    } catch (err) {
      console.error('Error creating category:', err.message);
      const error = {
        error: 1,
        message: config.errors.categoryCreateMessage || 'Invalid category'
      };
      res.json(error);
    }
  };
}

var categoryCreate_route_default = routeCategoryCreate;

export { categoryCreate_route_default as default };
