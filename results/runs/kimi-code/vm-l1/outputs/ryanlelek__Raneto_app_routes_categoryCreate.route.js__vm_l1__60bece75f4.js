import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = "&'\"/><";

function sanitizePathPart(value) {
  const cleaned = validator.blacklist(value, invalidChars);
  return sanitizeFilename(validator.escape(validator.trim(cleaned)));
}

function getFilepath({ content, category, filename }) {
  const categoryParts = category ? category.split('/').map(sanitizePathPart) : [];
  const safeFilename = sanitizePathPart(filename);

  if (categoryParts.some((part) => !part || part === '.' || part === '..')) {
    return null;
  }

  const filepath = path.normalize(path.join(content, ...categoryParts, safeFilename));
  return filepath.startsWith(path.resolve(content)) ? filepath : null;
}

export default function routeCategoryCreate(config) {
  return async function categoryCreate(req, res) {
    const category = req.body.category;
    const categoryPath = getFilepath({
      content: config.content_dir,
      category,
      filename: '',
    });

    if (!category || !categoryPath) {
      return res.json({
        status: 1,
        message: config.lang.api.invalidCategory,
      });
    }

    try {
      await fs.mkdir(categoryPath);
      res.json({ status: 0 });
    } catch (error) {
      console.error('Category create error:', error.message);
      res.json({
        status: 1,
        message: 'An error occurred',
      });
    }
  };
}
