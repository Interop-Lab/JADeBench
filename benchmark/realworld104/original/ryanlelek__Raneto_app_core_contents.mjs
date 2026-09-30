// ../work/ryanlelek__Raneto/app/core/utils.js
import path from "node:path";
import fs from "fs-extra";
import moment from "moment";
var normalizeDir = (dir) => dir.replaceAll("\\", "/");
var getSlug = (filePath, contentDir) => normalizeDir(filePath).replaceAll(normalizeDir(contentDir), "").trim();
async function getLastModified(config, meta, filePath) {
  if (meta.modified !== void 0) {
    return moment(meta.modified).format(config.datetime_format);
  }
  const contentRoot = path.resolve(config.content_dir);
  const allowedRoots = [contentRoot];
  if (config.theme_dir) {
    allowedRoots.push(path.resolve(config.theme_dir));
  }
  const isWithinAllowed = (p) => allowedRoots.some((root) => p.startsWith(root + path.sep) || p === root);
  const resolved = path.resolve(filePath);
  if (!isWithinAllowed(resolved)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const realPath = await fs.realpath(resolved);
  if (!isWithinAllowed(realPath)) {
    throw new Error("Access denied: file path is outside allowed directories");
  }
  const { mtime } = await fs.lstat(realPath);
  return moment(mtime).format(config.datetime_format);
}
var utils_default = {
  normalizeDir,
  getLastModified,
  getSlug
};

// ../work/ryanlelek__Raneto/app/functions/contentProcessors.js
import path2 from "node:path";
import fs2 from "fs-extra";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
var META_REGEX = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
var META_REGEX_YAML = /^\uFEFF?---([\s\S]*?)---/i;
function cleanString(str, useUnderscore = false) {
  str = str.replaceAll("/", " ").trim();
  if (useUnderscore) {
    return snakeCase(str);
  }
  return trim(kebabCase(str), "-");
}
function cleanObjectStrings(obj) {
  const cleanObj = {};
  for (const field in obj) {
    if (Object.hasOwn(obj, field)) {
      cleanObj[cleanString(field, true)] = `${obj[field]}`.trim();
    }
  }
  return cleanObj;
}
function slugToTitle(slug) {
  slug = slug.replaceAll(".md", "").trim();
  return startCase(path2.basename(slug).replaceAll(/[-_]/g, " "));
}
function stripMeta(markdownContent) {
  if (META_REGEX.test(markdownContent)) {
    return markdownContent.replace(META_REGEX, "").trim();
  }
  if (META_REGEX_YAML.test(markdownContent)) {
    return markdownContent.replace(META_REGEX_YAML, "").trim();
  }
  return markdownContent.trim();
}
function processMeta(markdownContent) {
  if (META_REGEX.test(markdownContent)) {
    const meta = {};
    const metaArr = markdownContent.match(META_REGEX);
    const metaString = metaArr?.[1]?.trim() ?? "";
    if (metaString) {
      const lines = metaString.split("\n");
      for (const line of lines) {
        const colonIndex = line.indexOf(": ");
        if (colonIndex <= 0) {
          continue;
        }
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 2).trim();
        if (key && value) {
          meta[cleanString(key, true)] = value;
        }
      }
    }
    return meta;
  }
  if (META_REGEX_YAML.test(markdownContent)) {
    const metaArr = markdownContent.match(META_REGEX_YAML);
    const metaString = metaArr?.[1]?.trim() ?? "";
    const yamlObject = yaml.load(metaString);
    return cleanObjectStrings(yamlObject);
  }
  return {};
}
function processVars(markdownContent, config) {
  if (config.variables && Array.isArray(config.variables)) {
    config.variables.forEach((v) => {
      markdownContent = markdownContent.replaceAll(
        new RegExp(`%${v.name}%`, "g"),
        v.content
      );
    });
  }
  if (config.base_url !== void 0) {
    markdownContent = markdownContent.replaceAll("%base_url%", config.base_url);
  }
  if (config.image_url !== void 0) {
    markdownContent = markdownContent.replaceAll(
      "%image_url%",
      config.image_url
    );
  }
  return markdownContent;
}
async function extractDocument(contentDir, filePath, debug) {
  try {
    const file = await fs2.readFile(filePath, "utf8");
    const meta = processMeta(file);
    const id = filePath.replaceAll(contentDir, "").trim();
    const title = meta.title ? meta.title : slugToTitle(id);
    const body = file;
    return { id, title, body };
  } catch (e) {
    if (debug) {
      console.log(e);
    }
    return null;
  }
}
var contentProcessors_default = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars
};

// ../work/ryanlelek__Raneto/app/core/contents.js
import path3 from "node:path";
import fs3 from "fs-extra";
import { glob } from "glob";
import _ from "lodash";
import yaml2 from "js-yaml";
var metaBool = (value, fallback) => value ? value === "true" : fallback;
async function handler(activePageSlug, config) {
  activePageSlug = activePageSlug || "";
  const baseSlug = activePageSlug.split(/[\\/]/).slice(0, -1).join("/");
  const contentDir = utils_default.normalizeDir(path3.normalize(config.content_dir));
  const files = await glob(path3.join(contentDir, "**", "*"));
  const filesProcessed = [];
  filesProcessed.push({
    slug: ".",
    title: "",
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: baseSlug === "",
    class: "category-index",
    sort: 0,
    files: []
  });
  const results = await Promise.all(
    files.map(
      (filePath) => processFile(config, activePageSlug, contentDir, filePath)
    )
  );
  for (const result of results) {
    if (result?.is_directory) {
      filesProcessed.push(result);
    } else if (result?.is_directory === false) {
      const dirSlug = path3.dirname(result.slug);
      const parent = filesProcessed.find((item) => item.slug === dirSlug);
      if (parent) {
        parent.files.push(result);
      } else if (config.debug) {
        console.log("Content ignored", result.slug);
      }
    }
  }
  const sortedFiles = filesProcessed.toSorted((a, b) => a.sort - b.sort);
  sortedFiles.forEach((category) => {
    category.files = category.files.toSorted((a, b) => a.sort - b.sort);
  });
  return sortedFiles;
}
async function processFile(config, activePageSlug, contentDir, filePath) {
  const shortPath = path3.relative(contentDir, filePath);
  const fileSlug = shortPath.split("\\").join("/");
  const stat = await fs3.stat(filePath);
  if (stat.isDirectory()) {
    return processDirectory(
      config,
      activePageSlug,
      contentDir,
      shortPath,
      fileSlug
    );
  }
  if (stat.isFile() && path3.extname(shortPath) === ".md") {
    return processMarkdownFile(
      config,
      activePageSlug,
      contentDir,
      filePath,
      fileSlug
    );
  }
  return null;
}
async function processDirectory(config, activePageSlug, contentDir, shortPath, fileSlug) {
  const dirPath = path3.join(contentDir, shortPath);
  let ignoreExists = false;
  try {
    const stat = await fs3.lstat(path3.join(dirPath, "ignore"));
    ignoreExists = stat.isFile();
  } catch {
  }
  if (ignoreExists) {
    if (config.debug) {
      console.log("Directory ignored", dirPath);
    }
    return null;
  }
  let dirMetadata = {};
  try {
    const metaFile = await fs3.readFile(path3.join(dirPath, "meta"), "utf8");
    dirMetadata = contentProcessors_default.cleanObjectStrings(yaml2.load(metaFile));
  } catch (e) {
    if (config.debug) {
      console.log("No meta file for", dirPath, e.message);
    }
  }
  let sort = 0;
  if ((config.category_sort || false) && !dirMetadata.sort) {
    try {
      const sortFile = await fs3.readFile(path3.join(dirPath, "sort"), "utf8");
      sort = Number.parseInt(sortFile, 10);
    } catch (e) {
      if (config.debug) {
        console.log("No sort file for", dirPath, e.message);
      }
    }
  }
  return {
    slug: fileSlug,
    title: dirMetadata.title || _.startCase(path3.basename(shortPath).replaceAll(/[-_]/g, " ")),
    show_on_home: metaBool(
      dirMetadata.show_on_home,
      config.show_on_home_default
    ),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(
      dirMetadata.show_on_menu,
      config.show_on_menu_default
    ),
    active: activePageSlug.startsWith(`/${fileSlug}`),
    class: `category-${contentProcessors_default.cleanString(fileSlug)}`,
    sort: dirMetadata.sort || sort,
    description: dirMetadata.description || "",
    files: []
  };
}
async function processMarkdownFile(config, activePageSlug, contentDir, filePath, fileSlug) {
  const pageSortMeta = config.page_sort_meta || "";
  try {
    const file = await fs3.readFile(filePath, "utf8");
    let slug = fileSlug;
    let pageSort = 0;
    if (fileSlug.includes("index.md")) {
      slug = slug.replaceAll("index.md", "");
    }
    slug = slug.replaceAll(".md", "").trim();
    const meta = contentProcessors_default.processMeta(file);
    if (pageSortMeta && meta[pageSortMeta]) {
      pageSort = Number.parseInt(meta[pageSortMeta], 10);
    }
    return {
      slug,
      title: meta.title ? meta.title : contentProcessors_default.slugToTitle(slug),
      show_on_home: metaBool(meta.show_on_home, config.show_on_home_default),
      is_directory: false,
      show_on_menu: metaBool(meta.show_on_menu, config.show_on_menu_default),
      active: activePageSlug.trim() === `/${slug}`,
      sort: pageSort
    };
  } catch (e) {
    if (config.debug) {
      console.log(e);
    }
    return null;
  }
}
var contents_default = handler;
export {
  contents_default as default
};
