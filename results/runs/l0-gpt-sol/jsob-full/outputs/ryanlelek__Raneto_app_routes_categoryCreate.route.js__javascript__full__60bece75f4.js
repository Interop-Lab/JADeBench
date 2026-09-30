import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const invalidChars = '<>:"|?*';

function sanitizer(value) {
  value = validator.blacklist(String(value), invalidChars);
  value = validator.trim(value);
  return validator.escape(value);
}

function getFilepath({ basePath, category, filename }) {
  let filepath = basePath;

  if (category) {
    for (const segment of String(category).split("/")) {
      const sanitized = sanitizeFilename(sanitizer(segment));
      if (!sanitized || sanitized === "." || sanitized === "..") {
        return null;
      }
      filepath += "/" + sanitized;
    }
  }

  if (filename) {
    filepath += "/" + sanitizeFilename(sanitizer(filename));
  }

  filepath = path.resolve(filepath);

  const root = path.dirname(basePath);
  const relative = path.relative(root, path.dirname(filepath));
  if (relative.startsWith("..")) {
    return null;
  }

  return filepath;
}

function routeCategoryCreate(config) {
  return async function (request, callback) {
    const basePath =
      config.path ??
      config.basePath ??
      config.directory ??
      config.root;

    const params = request.params ?? request.body ?? request.query ?? {};
    const category = params.category ?? params.path ?? "";

    const filepath = getFilepath({
      basePath,
      category
    });

    if (!filepath) {
      callback({
        status: 1,
        message:
          config.messages?.invalidPath ??
          config.errors?.invalidPath ??
          "Invalid path"
      });
      return;
    }

    try {
      await fs.remove(filepath);
      callback({
        status: 0,
        message:
          config.messages?.categoryCreated ??
          config.messages?.created ??
          "Category created"
      });
    } catch (error) {
      console.error("Category creation failed", error);
      callback({
        status: 1,
        message:
          config.messages?.categoryCreationFailed ??
          config.errors?.categoryCreationFailed ??
          "Category creation failed"
      });
    }
  };
}

export { routeCategoryCreate as default };
