import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const invalidChars = "&'\"/><";

function sanitizer(value) {
  return validator.escape(validator.blacklist(value, invalidChars).trim());
}

function getFilepath({ content, category, filename }) {
  const categoryParts = category
    .split("/")
    .map((part) => sanitizeFilename(sanitizer(part)));

  const hasInvalidCategoryPart = categoryParts.some(
    (part) => !part || part === "." || part === "..",
  );
  if (category && hasInvalidCategoryPart) {
    return null;
  }

  const categoryPath = categoryParts.join("/");
  const safeFilename = sanitizeFilename(sanitizer(filename));
  const filepath = path.normalize(`${content}/${categoryPath}/${safeFilename}`);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContentPath = path.resolve(content);

  if (!resolvedFilepath.startsWith(`${resolvedContentPath}${path.sep}`)) {
    return null;
  }

  return filepath;
}

async function resolveFilepath(filepath) {
  return (await fs.pathExists(filepath)) ? filepath : `${filepath}.md`;
}

function parseFileParam(fileParam) {
  if (!fileParam.trim()) {
    return null;
  }

  const parts = fileParam.split("/").filter((part) => part.length > 0);
  if (parts.length === 0) {
    return null;
  }

  return {
    category: parts.slice(0, -1).join("/"),
    filename: parts.at(-1),
  };
}

function routeCategoryCreate(config) {
  return async function categoryCreate(request, response) {
    const filepath = getFilepath({
      content: config.content_dir,
      category: request.body.category,
      filename: "",
    });

    if (!filepath) {
      return response.json({
        status: 1,
        message: config.lang.api.invalidCategory || "Invalid category path",
      });
    }

    try {
      await fs.mkdir(filepath);
      response.json({
        status: 0,
        message: config.lang.api.categoryCreated,
      });
    } catch (error) {
      console.error("Category create error:", error.message);
      response.json({
        status: 1,
        message: config.lang.api.categoryNotCreated || "An error occurred",
      });
    }
  };
}

export default routeCategoryCreate;
