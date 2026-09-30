const parse_exports = {};
__export(parse_exports, {
  default: () => parse_default,
  parse: () => parse
});
module.exports = __toCommonJS(parse_exports);

var globals = Object.assign(Object.create(null), {
  headingDivider: (v) => v,
  style: (v) => v,
  theme: (v, theme) => ({ name: v, theme }),
  lang: (v) => v
});

var locals = Object.assign(Object.create(null), {
  backgroundColor: (v) => v,
  backgroundImage: (v) => v,
  backgroundPosition: (v) => v,
  backgroundRepeat: (v) => v,
  backgroundSize: (v) => v,
  class: (v) => v,
  color: (v) => v,
  footer: (v) => v,
  header: (v) => v,
  paginate: (v) => v
});

var directives_default = [...Object.keys(globals), ...Object.keys(locals)];

var import_js_yaml = require("js-yaml");

var yamlSpecialChars = `"'{|>~&*`;

function parse(text) {
  const yaml = import_js_yaml;
  const lines = text.split("\n");
  const result = { directives: {}, content: [] };
  let inFrontMatter = false;
  let frontMatterLines = [];
  let frontMatterProcessed = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!frontMatterProcessed && line.trim() === "---") {
      if (inFrontMatter) {
        try {
          const parsed = yaml.load(frontMatterLines.join("\n"));
          if (parsed && typeof parsed === "object") {
            for (const key of Object.keys(parsed)) {
              if (directives_default.includes(key)) {
                result.directives[key] = parsed[key];
              }
            }
          }
        } catch (e) {}
        inFrontMatter = false;
        frontMatterProcessed = true;
      } else {
        inFrontMatter = true;
      }
      continue;
    }

    if (inFrontMatter) {
      frontMatterLines.push(line);
      continue;
    }

    result.content.push(line);
  }

  result.text = result.content.join("\n");
  return result;
}

function convertLoose(text, parsed) {
  if (!parsed) parsed = parse(text);
  const lines = parsed.content.slice();
  const directives = parsed.directives;

  for (const key of Object.keys(directives)) {
    const value = directives[key];
    if (value !== undefined && value !== null) {
      lines.unshift(`<!-- ${key}: ${value} -->`);
    }
  }

  return lines.join("\n");
}

var yaml = (text, opts) => {
  try {
    return import_js_yaml.load(text, opts);
  } catch (e) {
    return null;
  }
};

var yaml_default = yaml;

var import_plugin = __toESM(require_plugin());

var commentMatcher = /<!--+\s*([\s\S]*?)\s*--+>/;
var commentMatcherOpening = /^<!--/;
var commentMatcherClosing = /-->/;
var magicCommentMatchers = [
  /^prettier-ignore(-(start|end))?$/,
  /^markdownlint-((disable|enable).*|capture|restore)$/,
  /^lint (disable|enable|ignore).*$/
];

function markAsParsed(token, type) {
  if (token && typeof token === "object") {
    token.meta = token.meta || {};
    token.meta.parsed = type || true;
  }
  return token;
}

function _comment(state) {
  const content = state.content;
  const match = content.match(commentMatcher);
  if (!match) return false;

  const inner = match[1].trim();

  for (const matcher of magicCommentMatchers) {
    if (matcher.test(inner)) return false;
  }

  const colonIndex = inner.indexOf(":");
  if (colonIndex === -1) return false;

  const key = inner.slice(0, colonIndex).trim();
  const value = inner.slice(colonIndex + 1).trim();

  if (!directives_default.includes(key)) return false;

  return { key, value };
}

var comment = (0, import_plugin.default)(_comment);
var comment_default = comment;

var import_markdown_it_front_matter = __toESM(require("markdown-it-front-matter"));
var import_plugin2 = __toESM(require_plugin());

function isDirectiveComment(comment) {
  if (!comment || typeof comment !== "string") return false;
  const match = comment.match(commentMatcher);
  if (!match) return false;
  const inner = match[1].trim();
  const colonIndex = inner.indexOf(":");
  if (colonIndex === -1) return false;
  const key = inner.slice(0, colonIndex).trim();
  return directives_default.includes(key);
}

function _parse(state) {
  const { content } = state;
  const result = {
    directives: {},
    content: content,
    text: content
  };

  const lines = content.split("\n");
  const commentDirectives = {};

  for (const line of lines) {
    const match = line.match(commentMatcher);
    if (match) {
      const inner = match[1].trim();
      const colonIndex = inner.indexOf(":");
      if (colonIndex !== -1) {
        const key = inner.slice(0, colonIndex).trim();
        const value = inner.slice(colonIndex + 1).trim();
        if (directives_default.includes(key)) {
          commentDirectives[key] = value;
        }
      }
    }
  }

  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    try {
      const parsed = yaml.load(fmMatch[1]);
      if (parsed && typeof parsed === "object") {
        for (const key of Object.keys(parsed)) {
          if (directives_default.includes(key)) {
            result.directives[key] = parsed[key];
          }
        }
      }
    } catch (e) {}
  }

  for (const key of Object.keys(commentDirectives)) {
    result.directives[key] = commentDirectives[key];
  }

  return result;
}

var parse2 = (0, import_plugin2.default)(_parse);
var parse_default = parse2;

0 && (module.exports = { parse });
