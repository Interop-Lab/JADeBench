import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const invalidChars = `&'"/><`;

function sanitizer(value) {
  value = validator.blacklist(value, invalidChars);
  value = validator.trim(value);
  value = validator.escape(value);
  return value;
}

function getFilepath(options) {
  let filepath = options.content;

  if (options.category) {
    for (const part of options.category.split("/")) {
      const safePart = sanitizeFilename(sanitizer(part));
      if (!safePart || safePart === "." || safePart === "..") {
        return null;
      }
      filepath += "/" + safePart;
    }
  }

  if (options.filename) {
    filepath += "/" + sanitizeFilename(sanitizer(options.filename));
  }

  filepath = path.normalize(filepath);
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContent = path.resolve(options.content);

  if (!resolvedFilepath.startsWith(resolvedContent + path.sep)) {
    return null;
  }

  return filepath;
}

async function resolveFilepath(filepath) {
  if (await fs.pathExists(filepath)) {
    return filepath;
  }
  return filepath + ".md";
}

function parseFileParam(file) {
  if (!file || file.trim() === "") {
    return null;
  }

  const parts = file.split("/").filter((part) => part.length > 0);
  if (parts.length === 0) {
    return null;
  }

  if (parts.length > 1) {
    return {
      category: parts.slice(0, -1).join("/"),
      filename: parts[parts.length - 1],
    };
  }

  return { category: "", filename: parts[0] };
}

function routeCategoryCreate(app) {
  return async function categoryCreateRoute(req, res) {
    const filepath = getFilepath({
      content: app.content_dir,
      category: req.body.category,
    });

    if (!filepath) {
      return res.json({
        status: 1,
        message: app.lang.api.invalidCategory || "Invalid category",
      });
    }

    try {
      await fs.mkdir(filepath);
      res.json({
        status: 0,
        message: app.lang.api.categoryCreated,
      });
    } catch (error) {
      console.error("Category create error:", error.message);
      res.json({
        status: 1,
        message: app.lang.api.categoryCreateFailed || "An error occurred",
      });
    }
  };
}

export default routeCategoryCreate;
