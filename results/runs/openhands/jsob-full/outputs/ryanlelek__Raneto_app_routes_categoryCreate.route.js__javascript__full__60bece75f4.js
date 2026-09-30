import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const invalidChars = "&'\"/><";

function sanitize(value) {
  value = validator.blacklist(value, invalidChars);
  value = validator.trim(value);
  value = validator.escape(value);
  return value;
}

function getFilepath(options) {
  let filepath = options.content;

  if (options.category) {
    for (const categoryPart of options.category.split("/")) {
      const safeCategoryPart = sanitizeFilename(sanitize(categoryPart));

      if (!safeCategoryPart || safeCategoryPart === "." || safeCategoryPart === "..") {
        return null;
      }

      filepath += `/${safeCategoryPart}`;
    }
  }

  if (options.filename) {
    filepath += `/${sanitizeFilename(sanitize(options.filename))}`;
  }

  filepath = path.normalize(filepath);

  const resolvedFilepath = path.resolve(filepath);
  const resolvedContentDirectory = path.resolve(options.content);
  if (!resolvedFilepath.startsWith(resolvedContentDirectory + path.sep)) {
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

function parseFileParam(fileParam) {
  if (!fileParam || fileParam.trim() === "") {
    return null;
  }

  const pathParts = fileParam.split("/").filter((part) => part.length > 0);
  if (pathParts.length === 0) {
    return null;
  }

  if (pathParts.length > 1) {
    return {
      category: pathParts.slice(0, -1).join("/"),
      filename: pathParts[pathParts.length - 1],
    };
  }

  const parsedFile = {};
  parsedFile.category = "";
  parsedFile.filename = pathParts[0];
  return parsedFile;
}

function routeCategoryCreate(config) {
  return async function (request, response) {
    const filepathOptions = {};
    filepathOptions.content = config.content_dir;
    filepathOptions.category = request.body.category;

    const filepath = getFilepath(filepathOptions);
    if (!filepath) {
      const result = {};
      result.status = 1;
      result.message = config.lang.api.invalidCategory || "Invalid category path";
      return response.json(result);
    }

    try {
      await fs.mkdir(filepath);

      const result = {};
      result.status = 0;
      result.message = config.lang.api.categoryCreated;
      response.json(result);
    } catch (error) {
      console.error("Category create error:", error.message);

      const result = {};
      result.status = 1;
      result.message = config.lang.api.categoryNotCreated || "An error occurred";
      response.json(result);
    }
  };
}

var categoryCreateRoute = routeCategoryCreate;

export { categoryCreateRoute as default };
