import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

var invalidChars = '&\'"/><';

function sanitizer(input) {
  return sanitizeFilename(input, { replacement: '-' });
}

var sanitize_default = sanitizer;

function getFilepath(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }
  if (!validator.isLength(input, { min: 1, max: 255 })) {
    throw new Error('input length must be between 1 and 255 characters');
  }
  if (/[<>:"/\\|?*\x00-\x1f]/.test(input)) {
    throw new Error('input contains invalid characters');
  }
  const sanitized = sanitizer(input);
  if (sanitized === '' || sanitized === '.' || sanitized === '..') {
    throw new Error('input resolves to an invalid path');
  }
  return path.resolve(sanitized);
}

function resolveFilepath(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }
  if (!validator.isLength(input, { min: 1, max: 255 })) {
    throw new Error('input length must be between 1 and 255 characters');
  }
  if (/[<>:"/\\|?*\x00-\x1f]/.test(input)) {
    throw new Error('input contains invalid characters');
  }
  const sanitized = sanitizer(input);
  if (sanitized === '' || sanitized === '.' || sanitized === '..') {
    throw new Error('input resolves to an invalid path');
  }
  return path.resolve(sanitized);
}

function parseFileParam(input) {
  if (typeof input !== 'string') {
    throw new TypeError('input must be a string');
  }
  if (!validator.isLength(input, { min: 1, max: 255 })) {
    throw new Error('input length must be between 1 and 255 characters');
  }
  if (/[<>:"/\\|?*\x00-\x1f]/.test(input)) {
    throw new Error('input contains invalid characters');
  }
  const sanitized = sanitizer(input);
  if (sanitized === '' || sanitized === '.' || sanitized === '..') {
    throw new Error('input resolves to an invalid path');
  }
  return {
    original: input,
    sanitized: sanitized,
    filepath: path.resolve(sanitized),
  };
}

var getFilepath_default = getFilepath;

function routeCategoryCreate(req, res) {
  try {
    const { name, description } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Category name is required' });
    }
    if (!validator.isLength(name, { min: 1, max: 100 })) {
      return res.status(400).json({ error: 'Category name must be between 1 and 100 characters' });
    }
    if (description && !validator.isLength(description, { max: 500 })) {
      return res.status(400).json({ error: 'Description must not exceed 500 characters' });
    }
    if (/[<>:"/\\|?*\x00-\x1f]/.test(name)) {
      return res.status(400).json({ error: 'Category name contains invalid characters' });
    }
    const sanitizedName = sanitizer(name);
    const sanitizedDescription = description ? sanitizer(description) : '';
    return res.status(200).json({
      success: true,
      category: {
        name: sanitizedName,
        description: sanitizedDescription,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

var categoryCreate_route_default = routeCategoryCreate;

export { categoryCreate_route_default as default };
