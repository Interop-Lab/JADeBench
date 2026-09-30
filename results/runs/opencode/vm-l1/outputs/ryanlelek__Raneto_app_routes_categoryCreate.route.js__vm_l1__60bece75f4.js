import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const INVALID_HTML_FILENAME_CHARACTERS = "&'\"/><";

/**
 * Removes characters that are unsafe in HTML or in a platform filename.
 * `validator.escape` is applied first, so the corresponding HTML entities are
 * removed as complete units rather than leaving fragments such as `amp;`.
 */
function sanitize(value) {
  const withoutHtmlCharacters = validator.blacklist(
    validator.trim(value),
    INVALID_HTML_FILENAME_CHARACTERS,
  );
  return sanitizeFilename(validator.escape(withoutHtmlCharacters));
}

function parseFileParam(value) {
  if (value === null || value === undefined) return "";
  return sanitize(value);
}

function resolveFilepath(contentDirectory, categoryParts, filename) {
  const segments = categoryParts.map(parseFileParam);
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    return null;
  }

  const resolved = path.join(contentDirectory, ...segments, parseFileParam(filename));
  const relative = path.relative(contentDirectory, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  return resolved;
}

function getFilepath({ content, category, filename }) {
  const categoryParts = category == null ? [] : category.split("/");
  return resolveFilepath(content, categoryParts, filename);
}

function routeCategoryCreate({ content_dir: contentDirectory, lang }) {
  return async function createCategory(request, response) {
    const category = request.body.category;
    const categoryPath = getFilepath({
      content: contentDirectory,
      category,
      filename: null,
    });

    if (!categoryPath) {
      return response.json({ status: 1, message: "Invalid category path" });
    }

    try {
      if (await fs.pathExists(categoryPath)) {
        response.json({ status: 1, message: lang.api.categoryNotCreated });
        return;
      }

      await fs.mkdir(categoryPath);
      response.json({ status: 0, message: lang.api.categoryCreated });
    } catch (error) {
      console.log(`Category create error: ${error.message}`);
      response.json({ status: 1, message: lang.api.categoryNotCreated });
    }
  };
}

export default routeCategoryCreate;
