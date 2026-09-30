import validator from 'validator';
import path from 'node:path';
import fsExtra from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = "&'\"/><";

function sanitizer(value) {
  value = validator.blacklist(value, invalidChars);
  value = validator.trim(value);
  value = validator.escape(value);
  return value;
}

function getFilepath(options) {
  let filepath = options.content;

  if (options.category) {
    for (const categoryPart of options.category.split('/')) {
      const safePart = sanitizeFilename(sanitizer(categoryPart));
      if (!safePart || safePart === '.' || safePart === '..') {
        return null;
      }
      filepath += `/${safePart}`;
    }
  }

  if (options.filename) {
    filepath += `/${sanitizeFilename(sanitizer(options.filename))}`;
  }

  filepath = path.normalize(filepath);
  const resolvedPath = path.resolve(filepath);
  const resolvedContentPath = path.resolve(options.content);
  if (!resolvedPath.startsWith(resolvedContentPath + path.sep)) {
    return null;
  }

  return filepath;
}

function routeCategoryCreate(config) {
  return async function categoryCreate(request, response) {
    const filepath = getFilepath({
      content: config.content_dir,
      category: request.body.category,
    });

    if (!filepath) {
      return response.json({
        status: 1,
        message: config.lang.api.invalidCategory || 'Invalid category path',
      });
    }

    try {
      await fsExtra.mkdir(filepath);
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

export { routeCategoryCreate as default };
