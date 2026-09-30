import i18nModule from "es2015-i18n-tag";
import {
  map,
  list as ferrumList,
  flat,
  filter,
  size,
  foldl
} from "ferrum";
import {
  root,
  paragraph,
  text,
  heading,
  code,
  table,
  tableRow,
  tableCell,
  link,
  inlineCode,
  list,
  listItem,
  strong,
  blockquote
} from "mdast-builder";
import i18nModule2 from "es2015-i18n-tag";
import GithubSlugger from "github-slugger";
import yaml from "js-yaml";

const filename = Symbol("filename");
const fullpath = Symbol("fullpath");

const symbols = {
  pointer: Symbol("pointer"),
  filename,
  fullpath,
  id: Symbol("id"),
  titles: Symbol("titles"),
  resolve: Symbol("resolve"),
  slug: Symbol("slug"),
  meta: Symbol("meta"),
  parent: Symbol("parent")
};

const symbols_default = symbols;
const i18n = i18nModule && i18nModule.default
  ? i18nModule.default
  : i18nModule;
const i18n2 = i18nModule2 && i18nModule2.default
  ? i18nModule2.default
  : i18nModule2;

const used = new Set();

function keyword(name) {
  used.add(name);
  return inlineCode(String(name));
}

function asText(value) {
  return text(value == null ? "" : String(value));
}

function asParagraph(value) {
  return paragraph([asText(value)]);
}

function schemaType(schema) {
  if (!schema || typeof schema !== "object") return undefined;
  if (schema.type !== undefined) {
    return Array.isArray(schema.type)
      ? schema.type.join(" | ")
      : String(schema.type);
  }
  if (schema.properties) return "object";
  if (schema.items) return "array";
  if (schema.enum) return "enum";
  if (schema.const !== undefined) return "constant";
  if (schema.allOf) return "allOf";
  if (schema.anyOf) return "anyOf";
  if (schema.oneOf) return "oneOf";
  return undefined;
}

function gentitle(schema, fallback) {
  if (schema && typeof schema === "object") {
    if (schema.title != null && schema.title !== "") {
      return String(schema.title);
    }
    if (schema.$id != null && schema.$id !== "") {
      const id = String(schema.$id).replace(/[?#].*$/, "");
      const part = id.split(/[\\/]/).filter(Boolean).pop();
      if (part) return part.replace(/\.(?:json|ya?ml)$/i, "");
    }
  }
  return fallback == null ? "Schema" : String(fallback);
}

function gendescription(schema) {
  if (!schema || typeof schema !== "object") return [];
  const description = schema.description == null
    ? schema.$comment
    : schema.description;
  if (description == null || description === "") return [];

  const lines = String(description).split(/\n{2,}/);
  return lines.map(value => paragraph([text(value)]));
}

function parseInput(value) {
  if (typeof value !== "string") return value;

  const source = value.trim();
  if (!source) return {};

  try {
    return JSON.parse(source);
  } catch {
    if (yaml && typeof yaml.load === "function") {
      return yaml.load(value);
    }
    if (yaml && typeof yaml.safeLoad === "function") {
      return yaml.safeLoad(value);
    }
    throw new SyntaxError("Unable to parse schema input");
  }
}

function escapePointerPart(value) {
  return String(value).replace(/~/g, "~0").replace(/\//g, "~1");
}

function unescapePointerPart(value) {
  return String(value).replace(/~1/g, "/").replace(/~0/g, "~");
}

function resolvePointer(document, reference) {
  if (typeof reference !== "string" || reference[0] !== "#") {
    return undefined;
  }

  if (reference === "#") return document;

  const fragment = reference.slice(1);
  if (!fragment.startsWith("/")) return undefined;

  let current = document;
  for (const encodedPart of fragment.slice(1).split("/")) {
    const part = unescapePointerPart(decodeURIComponent(encodedPart));
    if (
      current == null ||
      (typeof current !== "object" && typeof current !== "function") ||
      !(part in current)
    ) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function valueNode(value) {
  if (typeof value === "string") return inlineCode(value);
  if (value === undefined) return asText("—");

  let rendered;
  try {
    rendered = JSON.stringify(value);
  } catch {
    rendered = String(value);
  }
  return inlineCode(rendered === undefined ? String(value) : rendered);
}

function typeNode(schema, document, slugger) {
  if (!schema || typeof schema !== "object") return asText("—");

  if (typeof schema.$ref === "string") {
    keyword("$ref");
    const resolved = resolvePointer(document, schema.$ref);
    const label = resolved
      ? gentitle(resolved, schema.$ref.split("/").pop())
      : schema.$ref;

    if (schema.$ref[0] === "#") {
      return link(
        `#${slugger.slug(String(label), true)}`,
        null,
        [inlineCode(String(label))]
      );
    }
    return inlineCode(schema.$ref);
  }

  const type = schemaType(schema);
  return type ? inlineCode(type) : asText("any");
}

function constraints(schema) {
  if (!schema || typeof schema !== "object") return [];

  const result = [];
  const add = (name, value) => {
    if (value === undefined) return;
    keyword(name);
    result.push([name, value]);
  };

  add("const", schema.const);
  add("default", schema.default);
  add("format", schema.format);
  add("pattern", schema.pattern);
  add("minimum", schema.minimum);
  add("exclusiveMinimum", schema.exclusiveMinimum);
  add("maximum", schema.maximum);
  add("exclusiveMaximum", schema.exclusiveMaximum);
  add("multipleOf", schema.multipleOf);
  add("minLength", schema.minLength);
  add("maxLength", schema.maxLength);
  add("minItems", schema.minItems);
  add("maxItems", schema.maxItems);
  add("uniqueItems", schema.uniqueItems);
  add("minProperties", schema.minProperties);
  add("maxProperties", schema.maxProperties);

  if (Array.isArray(schema.enum)) add("enum", schema.enum);
  if (Array.isArray(schema.examples)) add("examples", schema.examples);

  return result;
}

function constraintNodes(schema) {
  const entries = constraints(schema);
  if (!entries.length) return [];

  return [
    heading(3, [text("Constraints")]),
    list(
      false,
      null,
      entries.map(([name, value]) =>
        listItem([
          paragraph([
            strong([text(name)]),
            text(": "),
            valueNode(value)
          ])
        ])
      )
    )
  ];
}

function propertyRows(schema, document, slugger) {
  const properties = schema && schema.properties;
  if (!properties || typeof properties !== "object") return [];

  keyword("properties");
  const required = new Set(
    Array.isArray(schema.required) ? schema.required.map(String) : []
  );
  if (required.size) keyword("required");

  return Object.keys(properties).map(name => {
    const property = properties[name] || {};
    const description = property.description == null
      ? ""
      : String(property.description);

    return tableRow([
      tableCell([
        paragraph([
          inlineCode(name),
          ...(required.has(name)
            ? [text(" "), strong([text("required")])]
            : [])
        ])
      ]),
      tableCell([paragraph([typeNode(property, document, slugger)])]),
      tableCell([paragraph([text(description)])])
    ]);
  });
}

function sectionTitle(name, schema) {
  return gentitle(schema, name);
}

function renderSchemaSection(
  schema,
  document,
  name,
  depth,
  pointer,
  slugger,
  seen
) {
  if (!schema || typeof schema !== "object") return [];

  if (seen.has(schema)) {
    return [
      heading(depth, [text(sectionTitle(name, schema))]),
      blockquote([asParagraph("Recursive schema reference.")])
    ];
  }

  seen.add(schema);

  const title = sectionTitle(name, schema);
  const nodes = [heading(depth, [text(title)])];

  Object.defineProperties(schema, {
    [symbols.pointer]: {
      value: pointer,
      configurable: true
    },
    [symbols.slug]: {
      value: slugger.slug(title, true),
      configurable: true
    }
  });

  nodes.push(...gendescription(schema));

  const type = schemaType(schema);
  if (type) {
    keyword("type");
    nodes.push(
      paragraph([
        strong([text("Type: ")]),
        inlineCode(type)
      ])
    );
  }

  if (schema.$ref) {
    nodes.push(
      paragraph([
        strong([text("Reference: ")]),
        typeNode(schema, document, slugger)
      ])
    );
  }

  const rows = propertyRows(schema, document, slugger);
  if (rows.length) {
    nodes.push(
      heading(Math.min(depth + 1, 6), [text("Properties")]),
      table(
        [null, null, null],
        [
          tableRow([
            tableCell([paragraph([strong([text("Name")])])]),
            tableCell([paragraph([strong([text("Type")])])]),
            tableCell([paragraph([strong([text("Description")])])])
          ]),
          ...rows
        ]
      )
    );
  }

  nodes.push(...constraintNodes(schema));

  const definitions = schema.$defs || schema.definitions;
  if (definitions && typeof definitions === "object") {
    keyword(schema.$defs ? "$defs" : "definitions");
    nodes.push(
      heading(Math.min(depth + 1, 6), [text("Definitions")])
    );

    for (const definitionName of Object.keys(definitions)) {
      const child = definitions[definitionName];
      const key = schema.$defs ? "$defs" : "definitions";
      nodes.push(
        ...renderSchemaSection(
          child,
          document,
          definitionName,
          Math.min(depth + 2, 6),
          `${pointer}/${key}/${escapePointerPart(definitionName)}`,
          slugger,
          seen
        )
      );
    }
  }

  if (schema.items && typeof schema.items === "object") {
    keyword("items");
    nodes.push(
      ...renderSchemaSection(
        schema.items,
        document,
        "Items",
        Math.min(depth + 1, 6),
        `${pointer}/items`,
        slugger,
        seen
      )
    );
  }

  for (const combinator of ["allOf", "anyOf", "oneOf"]) {
    const alternatives = schema[combinator];
    if (!Array.isArray(alternatives) || alternatives.length === 0) continue;

    keyword(combinator);
    nodes.push(
      heading(Math.min(depth + 1, 6), [text(combinator)])
    );

    alternatives.forEach((alternative, index) => {
      nodes.push(
        ...renderSchemaSection(
          alternative,
          document,
          `${combinator} ${index + 1}`,
          Math.min(depth + 2, 6),
          `${pointer}/${combinator}/${index}`,
          slugger,
          seen
        )
      );
    });
  }

  seen.delete(schema);
  return nodes;
}

function report(schema, options = {}) {
  const document = parseInput(schema);
  if (document == null || typeof document !== "object") {
    throw new TypeError("Schema must be an object, JSON string, or YAML string");
  }

  used.clear();

  const slugger = new GithubSlugger();
  const title = options.title || gentitle(document, options.filename);
  const children = renderSchemaSection(
    document,
    document,
    title,
    1,
    "#",
    slugger,
    new Set()
  );

  if (options.showKeywords && used.size) {
    children.push(
      heading(2, [text("Keywords")]),
      paragraph(
        Array.from(used)
          .sort()
          .flatMap((name, index) => [
            ...(index ? [text(", ")] : []),
            inlineCode(name)
          ])
      )
    );
  }

  return root(children);
}

function build(schema, options) {
  if (
    schema &&
    typeof schema === "object" &&
    !Array.isArray(schema) &&
    Object.prototype.hasOwnProperty.call(schema, "schema") &&
    options === undefined
  ) {
    const {
      schema: document,
      ...buildOptions
    } = schema;
    return report(document, buildOptions);
  }

  return report(schema == null ? {} : schema, options || {});
}

export { build as default };
