import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = `&'"/><`;

function sanitize(value) {
  value = validator.blacklist(value, invalidChars);
  value = validator.trim(value);
  return validator.escape(value);
}

function getFilepath({ contentdir, category, filename }) {
  let filepath = contentdir;

  if (category) {
    for (const part of category.split('/')) {
      const safePart = sanitizeFilename(sanitize(part));
      if (!safePart || safePart === '.' || safePart === '..') {
        return null;
      }
      filepath += `/${safePart}`;
    }
  }

  if (filename) {
    filepath += `/${sanitizeFilename(sanitize(filename))}`;
  }

  filepath = path.normalize(filepath);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContentdir = path.resolve(contentdir);

  if (!resolvedFilepath.startsWith(resolvedContentdir + path.sep)) {
    return null;
  }

  return filepath;
}

function routeCategoryCreate(config) {
  return async function categoryCreate(request, response) {
    const filepath = getFilepath({
      contentdir: config.contentdir,
      category: request.body.category,
    });

    if (!filepath) {
      return response.json({
        status: 1,
        message: config.lang.api.categoryNotCreated || 'Invalid category path',
      });
    }

    try {
      await fs.mkdir(filepath);
      response.json({
        status: 0,
        message: config.lang.api.categoryCreated,
      });
    } catch (error) {
      console.error('Category create error:', error.message);
      response.json({
        status: 1,
        message: config.lang.api.categoryNotCreated || 'An error occurred',
      });
    }
  };
}

export default routeCategoryCreate;
