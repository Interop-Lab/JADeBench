import validator from "validator";
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";

const invalidChars = "&'\"/><";

function sanitizer(value) {
  return validator.escape(validator.trim(validator.blacklist(value, invalidChars)));
}

function getFilepath(file) {
  const { content, category, filename } = file;
  const categoryParts = category ? category.split("/") : [];
  const sanitizedCategoryParts = categoryParts.map((part) => {
    if (!part || part === "." || part === "..") return false;
    return sanitizeFilename(sanitizer(part));
  });

  if (sanitizedCategoryParts.includes(false)) return null;

  const sanitizedFilename = sanitizeFilename(sanitizer(filename));
  const filepath = path.normalize(
    `${content}/${sanitizedCategoryParts.join("/")}${filename ? `/${sanitizedFilename}` : ""}`,
  );
  const resolvedFilepath = path.resolve(filepath);
  const resolvedContent = path.resolve(content);

  if (!resolvedFilepath.startsWith(`${resolvedContent}${path.sep}`)) return null;
  return filepath;
}

async function resolveFilepath(filepath) {
  return (await fs.pathExists(filepath)) ? filepath : `${filepath}.md`;
}

function parseFileParam(fileParam) {
  if (!fileParam.trim()) return null;

  const parts = fileParam.split("/").filter(Boolean);
  return {
    category: parts.slice(0, -1).join("/"),
    filename: parts.slice(-1)[0],
  };
}

export { getFilepath as default, parseFileParam, resolveFilepath };
