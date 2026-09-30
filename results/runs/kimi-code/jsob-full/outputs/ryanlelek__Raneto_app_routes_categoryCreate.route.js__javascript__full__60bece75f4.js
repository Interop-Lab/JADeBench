import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = `&'"/><`;

function sanitizePathPart(value) {
  return validator.escape(
    validator.trim(
      validator.blacklist(value, invalidChars),
    ),
  );
}

function getFilepath({ path: basePath, category, filename }) {
  let filepath = basePath;

  if (category) {
    for (const part of category.split('/')) {
      const sanitizedPart = sanitizeFilename(sanitizePathPart(part));
      if (!sanitizedPart || sanitizedPart === '.' || sanitizedPart === '..') {
        return null;
      }
      filepath += `/${sanitizedPart}`;
    }
  }

  if (filename) {
    filepath += `/${sanitizeFilename(sanitizePathPart(filename))}`;
  }

  filepath = path.normalize(filepath);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedBasePath = path.resolve(basePath);

  if (!resolvedFilepath.startsWith(resolvedBasePath + path.sep)) {
    return null;
  }

  return filepath;
}

function routeCategoryCreate(config) {
  return async function categoryCreate(request, response) {
    const filepath = getFilepath({
      path: config.content_dir,
      category: request.body.category,
    });

    if (!filepath) {
      return response.json({
        status: 1,
        message: config.lang.api.invalidCategory || 'Invalid category path',
      });
    }

    try {
      await fs.mkdir(filepath);
      response.json({
        status: 0,
        message: config.lang.api.categoryCreated,
      });
    } catch (error) {
      console.error('Error creating category path:', error.message);
      response.json({
        status: 1,
        message: config.lang.api.categoryNotCreated || 'An error occurred',
      });
    }
  };
}

export default routeCategoryCreate;
