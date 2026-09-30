// ../work/ryanlelek__Raneto/app/functions/sanitize.js
import validator from "validator";
var invalidChars = `&'"/><`;
function sanitizer(str) {
  str = validator.blacklist(str, invalidChars);
  str = validator.trim(str);
  str = validator.escape(str);
  return str;
}
var sanitize_default = sanitizer;

// ../work/ryanlelek__Raneto/app/functions/getFilepath.js
import path from "node:path";
import fs from "fs-extra";
import sanitizeFilename from "sanitize-filename";
function getFilepath(p) {
  let filepath = p.content;
  if (p.category) {
    for (const part of p.category.split("/")) {
      const clean = sanitizeFilename(sanitize_default(part));
      if (!clean || clean === "." || clean === "..") {
        return null;
      }
      filepath += `/${clean}`;
    }
  }
  if (p.filename) {
    filepath += `/${sanitizeFilename(sanitize_default(p.filename))}`;
  }
  filepath = path.normalize(filepath);
  const resolved = path.resolve(filepath);
  const contentRoot = path.resolve(p.content);
  if (!resolved.startsWith(contentRoot + path.sep)) {
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
  const parts = fileParam.split("/").filter((p) => p.length > 0);
  if (parts.length === 0) {
    return null;
  }
  if (parts.length > 1) {
    return {
      category: parts.slice(0, -1).join("/"),
      filename: parts[parts.length - 1]
    };
  }
  return { category: "", filename: parts[0] };
}
var getFilepath_default = getFilepath;
export {
  getFilepath_default as default,
  parseFileParam,
  resolveFilepath
};
