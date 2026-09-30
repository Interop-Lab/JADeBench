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
  blockquote,
} from "mdast-builder";

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
  parent: Symbol("parent"),
};

const used = new Set();

const label = value => text(String(value));
const phrase = value => text(value);
const boldLabel = value => strong(label(value));
const json = value => JSON.stringify(value, null, 2);
const jsonCode = value => code("json", json(value));
const jsonParagraph = value => paragraph(code("json", json(value)));

function titleParts(schema) {
  const titles = schema?.[symbols.titles];
  return Array.isArray(titles) ? titles.filter(Boolean) : [];
}

function gentitle(pointer, suffix) {
  const parts = Array.isArray(pointer) ? pointer : [];
  let title;

  if (parts.length) {
    const name = parts.at(-1);
    title = typeof name === "number" ? undefined : String(name);
  }

  if (!title) title = "Untitled schema";
  return suffix && title !== "Untitled schema" ? `${title} ${suffix}` : title;
}

async function gendescription(schema) {
  return (await schema?.[symbols.meta]?.shortdescription) || "";
}

function keyword(entry) {
  return entry.join("");
}

function report() {
  return used;
}

function schemaTitle(schema, suffix) {
  const parts = titleParts(schema);
  const base = parts.at(-1) || schema?.title || "Untitled schema";
  return suffix ? `${base} ${suffix}` : base;
}

function schemaSlug(schema) {
  return schema?.[symbols.slug] || schema?.slug || String(schemaTitle(schema))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function schemaLink(schema, title = schemaTitle(schema)) {
  return link(`${schemaSlug(schema)}.md`, "", label(title));
}

function normalizedTypes(schema) {
  const declared = Array.isArray(schema?.type) ? schema.type : [schema?.type];
  const types = declared.filter(type => type && type !== "null");
  if (!types.length) {
    if (schema?.properties) return ["object"];
    if (schema?.items) return ["array"];
    return [];
  }
  return types;
}

function typeName(schema) {
  const types = normalizedTypes(schema);
  let value = types.join(" | ") || "any";
  if (types.length === 1 && types[0] === "array") {
    value = `${typeName(schema.items || {})}[]`;
  }
  return value;
}

function isNullable(schema) {
  return schema?.nullable === true || (Array.isArray(schema?.type) && schema.type.includes("null"));
}

function typeSection(schema) {
  const children = [heading(2, label(schemaTitle(schema, "Type")))];
  const typeChildren = [inlineCode(typeName(schema))];

  if (normalizedTypes(schema).includes("object")) {
    typeChildren.push(phrase(" ("), schemaLink(schema, schema.title || schemaTitle(schema)), phrase(")"));
  }
  children.push(paragraph(typeChildren));

  const alternatives = schema.oneOf || schema.anyOf || schema.allOf;
  if (Array.isArray(alternatives) && alternatives.length) {
    const introduction = schema.allOf ? "all of" : schema.anyOf ? "one or more of" : "one (and only one) of";
    children.push(paragraph(phrase(introduction)));
    children.push(list("unordered", alternatives.map(option =>
      listItem(schemaLink(option, option.title || schemaTitle(option))),
    )));
  }
  return children;
}

function constraint(labelText, explanation, value) {
  const children = [boldLabel(labelText), phrase(": "), phrase(explanation)];
  if (value !== undefined) children.push(inlineCode(String(value)));
  return paragraph(children);
}

function enumSection(values) {
  return [
    constraint("enum", "the value of this property must be equal to one of the following values:"),
    table("left", [
      tableRow([tableCell(label("Value")), tableCell(label("Explanation"))]),
      ...values.map(value => tableRow([
        tableCell(inlineCode(JSON.stringify(value))),
        tableCell(label("")),
      ])),
    ]),
  ];
}

function constraintsSection(schema) {
  const rows = [];
  if (Array.isArray(schema.enum)) rows.push(...enumSection(schema.enum));
  if ("const" in schema) rows.push(
    constraint("constant", "the value of this property must be equal to:"),
    jsonCode(schema.const),
  );
  if (schema.multipleOf !== undefined) rows.push(constraint("multiple of", "the value of this number must be a multiple of: ", schema.multipleOf));
  if (schema.maximum !== undefined) rows.push(constraint("maximum", "the value of this number must smaller than or equal to: ", schema.maximum));
  if (schema.minimum !== undefined) rows.push(constraint("minimum", "the value of this number must greater than or equal to: ", schema.minimum));
  if (schema.exclusiveMaximum !== undefined && schema.exclusiveMaximum !== false) {
    const value = typeof schema.exclusiveMaximum === "number" ? schema.exclusiveMaximum : schema.maximum;
    rows.push(constraint("exclusive maximum", "the value of this number must be smaller than: ", value));
  }
  if (schema.exclusiveMinimum !== undefined && schema.exclusiveMinimum !== false) {
    const value = typeof schema.exclusiveMinimum === "number" ? schema.exclusiveMinimum : schema.minimum;
    rows.push(constraint("exclusive minimum", "the value of this number must be greater than: ", value));
  }
  if (schema.maxLength !== undefined) rows.push(constraint("maximum length", "the maximum number of characters for this string is: ", schema.maxLength));
  if (schema.minLength !== undefined) rows.push(constraint("minimum length", "the minimum number of characters for this string is: ", schema.minLength));
  if (schema.maxItems !== undefined) rows.push(constraint("maximum number of items", "the maximum number of items for this array is: ", schema.maxItems));
  if (schema.minItems !== undefined) rows.push(constraint("minimum number of items", "the minimum number of items for this array is: ", schema.minItems));
  if (schema.maxProperties !== undefined) rows.push(constraint("maximum number of properties", "the maximum number of properties for this object is: ", schema.maxProperties));
  if (schema.minProperties !== undefined) rows.push(constraint("minimum number of properties", "the minimum number of properties for this object is: ", schema.minProperties));
  if (schema.uniqueItems) rows.push(constraint("unique items", "all items in this array must be unique. Duplicates are not allowed."));

  if (schema.pattern) {
    rows.push(constraint("pattern", "the string must match the following regular expression: "));
    rows.push(code("regexp", schema.pattern));
    rows.push(paragraph(link(
      `https://regexr.com/?expression=${encodeURIComponent(schema.pattern)}`,
      "try regular expression with regexr.com",
      label("try pattern"),
    )));
  }

  if (schema.format === "email") {
    rows.push(paragraph([
      boldLabel("email"), phrase(": "),
      phrase("the string must be an email address, according to "),
      link("https://tools.ietf.org/html/rfc5322", "check the specification", label("RFC 5322, section 3.4.1")),
    ]));
  } else if (schema.format) {
    rows.push(constraint("format", "the string must use the following format: ", schema.format));
  }

  return rows.length ? [heading(2, label(schemaTitle(schema, "Constraints"))), ...rows] : [];
}

function propertyRow(parent, name, property) {
  const required = Array.isArray(parent.required) && parent.required.includes(name);
  const definedBy = property?.[symbols.parent] || parent;
  return tableRow([
    tableCell(inlineCode(name)),
    tableCell(inlineCode(typeName(property))),
    tableCell(label(required ? "yes" : "no")),
    tableCell(label(isNullable(property) ? "yes" : "no")),
    tableCell(schemaLink(definedBy, definedBy.title || schemaTitle(definedBy))),
  ]);
}

function propertiesSection(schema) {
  if (!schema.properties || typeof schema.properties !== "object") return [];
  return [
    heading(1, label(schemaTitle(schema, "Properties"))),
    table("left", [
      tableRow([
        tableCell(label("Property")),
        tableCell(label("Type")),
        tableCell(label("Required")),
        tableCell(label("Nullable")),
        tableCell(label("Defined by")),
      ]),
      ...Object.entries(schema.properties).map(([name, property]) => propertyRow(schema, name, property)),
    ]),
  ];
}

function examplesSection(schema) {
  const result = [];
  if (schema.default !== undefined) {
    result.push(
      heading(2, label(schemaTitle(schema, "Default Value"))),
      paragraph(label("The default value is:")),
      jsonParagraph(schema.default),
    );
  }
  if (Array.isArray(schema.examples) && schema.examples.length) {
    result.push(heading(2, label(schemaTitle(schema, "Examples"))));
    result.push(...schema.examples.map(jsonParagraph));
  } else if (schema.example !== undefined) {
    result.push(heading(2, label(schemaTitle(schema, "Example"))), jsonParagraph(schema.example));
  }
  return result;
}

async function schemaDocument(schema) {
  const children = [];
  const description = await gendescription(schema) || schema.description || "";
  if (description) children.push(blockquote(paragraph(label(description))));
  children.push(...typeSection(schema));
  children.push(...constraintsSection(schema));
  children.push(...propertiesSection(schema));
  children.push(...examplesSection(schema));
  return root(children);
}

function build() {
  console.log("generating markdown");
  return async schemas => {
    const documents = {};
    for (const schema of schemas) {
      const slug = schemaSlug(schema);
      used.add(slug);
      documents[slug] = await schemaDocument(schema);
    }
    return documents;
  };
}

Object.assign(globalThis, {
  filename,
  fullpath,
  symbols,
  symbols_default: symbols,
  gentitle,
  gendescription,
  keyword,
  report,
  build,
  used,
});

export { build as default };
