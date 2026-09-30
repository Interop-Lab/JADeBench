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

// ../work/ryanlelek__Raneto/app/routes/categoryCreate.route.js
import fs2 from "fs-extra";
function routeCategoryCreate(config) {
  return async function(req, res) {
    const filepath = getFilepath_default({
      content: config.content_dir,
      category: req.body.category
    });
    if (!filepath) {
      return res.json({
        status: 1,
        message: config.lang.api.invalidCategory || "Invalid category path"
      });
    }
    try {
      await fs2.mkdir(filepath);
      res.json({
        status: 0,
        message: config.lang.api.categoryCreated
      });
    } catch (error) {
      console.error("Category create error:", error.message);
      res.json({
        status: 1,
        message: config.lang.api.categoryNotCreated || "An error occurred"
      });
    }
  };
}
var categoryCreate_route_default = routeCategoryCreate;
export {
  categoryCreate_route_default as default
};
