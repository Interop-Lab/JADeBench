import path from "node:path";
import fs from "fs-extra";
import moment from "moment";
import snakeCase from "lodash/snakeCase.js";
import kebabCase from "lodash/kebabCase.js";
import startCase from "lodash/startCase.js";
import trim from "lodash/trim.js";
import yaml from "js-yaml";
import { glob } from "glob";

const COMMENT_META = /^\uFEFF?\/\*([\s\S]*?)\*\//i;
const YAML_META = /^\uFEFF?---([\s\S]*?)---/i;

function normalizeDir(directory) {
  return directory.replaceAll("\\", "/");
}

function cleanString(value, useSnakeCase = false) {
  value = value.replaceAll("/", " ").trim();
  return useSnakeCase ? snakeCase(value) : trim(kebabCase(value), "-");
}

function cleanObjectStrings(object) {
  const cleaned = {};
  for (const key in object) {
    if (Object.hasOwn(object, key)) cleaned[cleanString(key, true)] = String(object[key]).trim();
  }
  return cleaned;
}

function slugToTitle(slug) {
  slug = slug.replaceAll(".md", "").trim();
  return startCase(path.basename(slug).replaceAll(/[-_]/g, " "));
}

function stripMeta(content) {
  if (COMMENT_META.test(content)) return content.replace(COMMENT_META, "").trim();
  if (YAML_META.test(content)) return content.replace(YAML_META, "").trim();
  return content.trim();
}

function processMeta(content) {
  if (COMMENT_META.test(content)) {
    const metadata = {};
    const block = content.match(COMMENT_META)?.[1]?.trim() ?? "";
    for (const line of block.split("\n")) {
      const separator = line.indexOf(": ");
      if (separator < 0) continue;
      const key = line.substring(0, separator).trim();
      const value = line.substring(separator + 2).trim();
      if (key && value) metadata[cleanString(key, true)] = value;
    }
    return metadata;
  }

  if (YAML_META.test(content)) {
    const block = content.match(YAML_META)?.[1]?.trim() ?? "";
    return cleanObjectStrings(yaml.load(block));
  }
  return {};
}

function processVars(content, config) {
  if (Array.isArray(config.variables)) {
    for (const variable of config.variables) {
      content = content.replaceAll(new RegExp(`%${variable.name}%`, "g"), variable.value);
    }
  }
  if (config.base_url !== undefined) content = content.replaceAll("%base_url%", config.base_url);
  if (config.image_url !== undefined) content = content.replaceAll("%image_url%", config.image_url);
  return content;
}

async function extractDocument(baseDirectory, filename, debug) {
  try {
    const content = await fs.readFile(filename, "utf8");
    const metadata = processMeta(content);
    const id = filename.replaceAll(baseDirectory, "").trim();
    return { id, title: metadata.title || slugToTitle(id), content };
  } catch (error) {
    if (debug) console.log(error);
    return null;
  }
}

const contentProcessors = {
  cleanString,
  cleanObjectStrings,
  extractDocument,
  slugToTitle,
  stripMeta,
  processMeta,
  processVars,
};

function metaBool(value, fallback) {
  return value ? value === "true" : fallback;
}

async function processMarkdownFile(config, currentPath, filename, relativePath) {
  const sortMetadataKey = config.page_sort_meta || "";
  try {
    const content = await fs.readFile(filename, "utf8");
    let slug = relativePath;
    let sort = 0;
    if (relativePath.endsWith("index.md")) slug = slug.replaceAll("index.md", "");
    slug = slug.replaceAll(".md", "").trim();

    const metadata = processMeta(content);
    if (sortMetadataKey && metadata[sortMetadataKey]) {
      sort = Number.parseInt(metadata[sortMetadataKey], 10);
    }

    return {
      slug,
      title: metadata.title || slugToTitle(slug),
      show_on_home: metaBool(metadata.show_on_home, config.show_on_home_default),
      is_directory: false,
      show_on_menu: metaBool(metadata.show_on_menu, config.show_on_menu_default),
      active: currentPath.trim() === `/${slug}`,
      sort,
    };
  } catch (error) {
    if (config.debug) console.log(error);
    return null;
  }
}

async function processDirectory(config, currentPath, contentDir, relativePath, slug) {
  const directory = path.join(contentDir, relativePath);
  let hasIndex = false;
  try {
    hasIndex = (await fs.stat(path.join(directory, ".md"))).isFile();
  } catch {}

  if (hasIndex) {
    if (config.debug) console.log("Directory ignored", directory);
    return null;
  }

  let metadata = {};
  try {
    const metadataText = await fs.readFile(path.join(directory, "meta"), "utf8");
    metadata = cleanObjectStrings(yaml.load(metadataText));
  } catch (error) {
    if (config.debug) console.log("No meta file for", directory, error.message);
  }

  let sort = 0;
  if ((config.directory_sort || false) && !metadata.sort) {
    try {
      sort = Number.parseInt(await fs.readFile(path.join(directory, "sort"), "utf8"), 10);
    } catch (error) {
      if (config.debug) console.log("No sort file for", directory, error.message);
    }
  }

  return {
    slug,
    title: metadata.title || startCase(path.basename(relativePath).replaceAll(/[-_]/g, " ")),
    show_on_home: metaBool(metadata.show_on_home, config.show_on_home_default),
    is_index: false,
    is_directory: true,
    show_on_menu: metaBool(metadata.show_on_menu, config.show_on_menu_default),
    active: currentPath.startsWith(`/${slug}`),
    class: `category-${cleanString(slug)}`,
    sort: metadata.sort || sort,
    description: metadata.description || "",
    files: [],
  };
}

async function processFile(config, currentPath, contentDir, filename) {
  const relativePath = path.relative(contentDir, filename);
  const slug = relativePath.split("\\").join("/");
  const stats = await fs.stat(filename);
  if (stats.isDirectory()) return processDirectory(config, currentPath, contentDir, relativePath, slug);
  if (stats.isFile() && path.extname(relativePath) === ".md") {
    return processMarkdownFile(config, currentPath, filename, slug);
  }
  return null;
}

async function handler(currentPath, config) {
  currentPath ||= "";
  const activeDirectory = currentPath.split(/[\\/]/).slice(0, -1).join("/");
  const contentDir = normalizeDir(path.normalize(config.content_dir));
  const filenames = await glob(path.join(contentDir, "**", "*"));
  const categories = [{
    slug: ".",
    title: "",
    show_on_home: true,
    show_on_menu: true,
    is_index: true,
    active: activeDirectory === "",
    class: "category-index",
    sort: 0,
    files: [],
  }];

  const entries = await Promise.all(
    filenames.map((filename) => processFile(config, currentPath, contentDir, filename)),
  );
  for (const entry of entries) {
    if (entry?.is_directory) {
      categories.push(entry);
    } else if (entry?.is_directory === false) {
      const directorySlug = path.dirname(entry.slug);
      const category = categories.find(({ slug }) => slug === directorySlug);
      if (category) category.files.push(entry);
      else if (config.debug) console.log("Content ignored", entry.slug);
    }
  }

  const sortedCategories = categories.toSorted((a, b) => a.sort - b.sort);
  for (const category of sortedCategories) {
    category.files = category.files.toSorted((a, b) => a.sort - b.sort);
  }
  return sortedCategories;
}

export default handler;
