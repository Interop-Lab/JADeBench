import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const invalidChars = "&'\"/><";

/** Remove markup-sensitive and filesystem-invalid characters from a name. */
function sanitizer(value) {
  return validator.escape(validator.trim(validator.blacklist(value, invalidChars)));
}

/**
 * Build a safe path below `content` from an optional category and filename.
 * Invalid or escaping paths are rejected with `null`.
 */
function getFilepath({ content, category, filename }) {
  const categoryParts = category
    ? category.split("/").map((part) => sanitizeFilename(sanitizer(part)))
    : [];

  if (categoryParts.some((part) => !part)) return null;

  const safeFilename = filename
    ? sanitizeFilename(sanitizer(filename))
    : "";

  const filepath = path.normalize(
    [content, ...categoryParts, safeFilename].filter(Boolean).join("/"),
  );
  const resolvedPath = path.resolve(filepath);
  const resolvedContent = path.resolve(content);

  if (!resolvedPath.startsWith(`${resolvedContent}${path.sep}`)) return null;
  return filepath;
}

/** Return an existing path, or its Markdown-file form when it does not exist. */
async function resolveFilepath(filepath) {
  return (await fs.pathExists(filepath)) ? filepath : `${filepath}.md`;
}

/** Split a slash-delimited file parameter into category and filename fields. */
function parseFileParam(fileParam) {
  if (!fileParam.trim()) return null;

  const parts = fileParam.split("/").filter(Boolean);
  if (!parts.length) return null;

  return {
    category: parts.slice(0, -1).join("/"),
    filename: parts.at(-1),
  };
}

export { getFilepath as default, parseFileParam, resolveFilepath };
