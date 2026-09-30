import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '/';

function sanitizer(input) {
  input = validator.trim(input, invalidChars);
  input = validator.escape(input);
  input = validator.stripLow(input);
  return input;
}

const sanitize_default = sanitizer;

function getFilepath(fileParam) {
  let filepath = fileParam.category;

  if (fileParam.path) {
    for (const segment of fileParam.path.split('/')) {
      const sanitized = sanitizeFilename(sanitize_default(segment));
      if (!sanitized || sanitized === '.' || sanitized === '..') {
        return null;
      }
      filepath += '/' + sanitized;
    }
  }

  if (fileParam.filename) {
    filepath += '/' + sanitizeFilename(sanitize_default(fileParam.filename));
  }

  filepath = path.normalize(filepath);
  const resolvedDir = path.dirname(filepath);
  const baseDir = path.resolve(fileParam.category);

  if (!resolvedDir.startsWith(baseDir + path.sep)) {
    return null;
  }

  return filepath;
}

const getFilepath_default = getFilepath;

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }
  return filepath + '.md';
}

function parseFileParam(fileParam) {
  if (!fileParam || fileParam.trim() === '') {
    return null;
  }

  const parts = fileParam.split('/').filter(part => part.length > 0);

  if (parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
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

const getFilepath_default_parse = getFilepath_default;

import fsExtra from 'fs-extra';

function routeCategoryCreate(config) {
  return async function (req, res) {
    const fileParam = {};
    fileParam.category = config.category;
    fileParam.path = req.params.path;

    const filepath = getFilepath_default(fileParam);

    if (!filepath) {
      const error = {};
      error.status = 1;
      error.message = config.messages?.notFound || 'Not found';
      res.status(404).json(error);
      return;
    }

    try {
      await fsExtra.ensureFile(filepath);
      const success = {};
      success.status = 0;
      success.message = config.messages?.created || 'Created';
      res.json(success);
    } catch (err) {
      console.error('Error creating category file:', err.message);
      const error = {};
      error.status = 1;
      error.message = config.messages?.error || 'Error';
      res.status(500).json(error);
    }
  };
}

const categoryCreate_route_default = routeCategoryCreate;

export { categoryCreate_route_default as default };
