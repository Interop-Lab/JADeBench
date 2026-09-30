import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";
import fsExtra from "fs-extra";

const invalidChars = "&'\"/><";

function sanitizer(value) {
  return sanitizeFilename(validator.blacklist(String(value), invalidChars));
}

function parseFileParam(value) {
  if (Array.isArray(value)) {
    value = value[0];
  }

  if (value && typeof value === "object") {
    value = value.file ?? value.path ?? value.name;
  }

  if (typeof value !== "string") {
    throw new TypeError("Invalid file parameter");
  }

  return decodeURIComponent(value);
}

function resolveFilepath(value) {
  return path.resolve(parseFileParam(value));
}

function getFilepath(value) {
  const filepath = resolveFilepath(value);
  return fs.existsSync(filepath) ? fs.realpathSync(filepath) : filepath;
}

async function routeCategoryCreate(request) {
  const body = request && request.body ? request.body : request;
  const categoryName = sanitizer(body && (body.name ?? body.category));
  const parentPath = body && (body.path ?? body.filepath ?? body.parent);

  if (!categoryName) {
    throw new TypeError("Invalid category name");
  }

  const categoryPath = path.join(resolveFilepath(parentPath), categoryName);
  await fsExtra.ensureDir(categoryPath);

  return {
    name: categoryName,
    path: categoryPath
  };
}

export { routeCategoryCreate as default };
