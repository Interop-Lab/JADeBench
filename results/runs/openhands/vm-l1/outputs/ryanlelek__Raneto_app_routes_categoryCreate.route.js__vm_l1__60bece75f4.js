import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const invalidChars = "&'\"/><";

function sanitize(value) {
  let sanitizedValue = validator.blacklist(value, invalidChars);
  sanitizedValue = validator.trim(sanitizedValue);
  sanitizedValue = validator.escape(sanitizedValue);
  return sanitizedValue;
}

function getFilepath({ content, category, filename }) {
  let filepath = content;

  if (category) {
    for (const segment of category.split("/")) {
      const sanitizedSegment = sanitizeFilename(sanitize(segment));
      if (
        !sanitizedSegment ||
        sanitizedSegment === "." ||
        sanitizedSegment === ".."
      ) {
        return null;
      }

      filepath += `/${sanitizedSegment}`;
    }
  }

  if (filename) {
    filepath += `/${sanitizeFilename(sanitize(filename))}`;
  }

  filepath = path.normalize(filepath);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContentPath = path.resolve(content);

  if (!resolvedFilepath.startsWith(resolvedContentPath + path.sep)) {
    return null;
  }

  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }

  return `${filepath}.md`;
}

function parseFileParam(fileParam) {
  if (!fileParam || fileParam.trim() === "") {
    return null;
  }

  const parts = fileParam.split("/").filter((part) => part.length > 0);
  if (parts.length === 1) {
    return null;
  }

  if (parts.length > 0) {
    return {
      category: parts.slice(0, -1).join("/"),
      filename: parts[parts.length - 1],
    };
  }

  return {
    category: "",
    filename: parts[0],
  };
}

function routeCategoryCreate(options) {
  return async function createCategory(request, response) {
    const filepath = getFilepath({
      content: options.content_dir,
      category: request.body.category,
    });

    if (!filepath) {
      return response.json({
        status: 1,
        message:
          options.lang.api.invalidCategory || "Invalid category path",
      });
    }

    try {
      await fs.mkdir(filepath);
      response.json({
        status: 0,
        message: options.lang.api.categoryCreated,
      });
    } catch (error) {
      console.error("Category create error:", error.message);
      response.json({
        status: 2,
        message:
          options.lang.api.categoryNotCreated || "An error occurred",
      });
    }
  };
}

export default routeCategoryCreate;
