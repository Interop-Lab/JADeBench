import { default as i18n } from "es2015-i18n-tag";
import { map, list as toList, flat, filter, size, foldl } from "ferrum";
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
import { default as i18n2 } from "es2015-i18n-tag";
import githubSlugger from "github-slugger";
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
  parent: Symbol("parent"),
};
const symbols_default = symbols;
const used = new Set();

function keyword(value) {
  used.add(value[0]);
  return value;
}

function report() {
  return used;
}

function gentitle(types, title) {
  if (!Array.isArray(types)) return i18n`Untitled schema`;

  const [first] = types;
  const values = [...types].sort();

  if (types.length === 1 && first !== undefined) return first;
  if (typeof title === "string") {
    return i18n`Untitled ${title} in ${String(first)}`;
  }
  if (first === undefined) return i18n`Untitled schema`;
  return i18n`Untitled undefined type in ${first}`;
}

function gendescription(schema) {
  return schema && schema[symbols.meta]
    ? schema[symbols.meta].description || ""
    : "";
}

function build({
  header,
  links = {},
  includeProperties = [],
  rewritelinks = value => value,
  exampleFormat = "yaml",
  skipProperties = [],
  singleFile = false,
} = {}) {
  const skippedProperties = singleFile
    ? [...new Set([...skipProperties, "Defined by"])]
    : skipProperties;

  function schemaLink(schema, label, slugger) {
    const target = schema[symbols.id] + (schema[symbols.slug] ? `#${schema[symbols.slug]}` : "");
    return link(rewritelinks(target), label, [text(schema[symbols.titles]?.[0] || i18n2`Untitled schema`)]);
  }

  function typeNode(schema) {
    const types = Array.isArray(schema[keyword`type`])
      ? schema[keyword`type`]
      : [schema[keyword`type`]];
    const defined = types.filter(type => type !== undefined && type !== null);

    if (
      schema[keyword`allOf`] ||
      schema[keyword`anyOf`] ||
      schema[keyword`oneOf`] ||
      schema[keyword`not`]
    ) {
      return text(i18n2`Merged`);
    }
    if (defined.length === 0) return text(i18n2`Not specified`);
    if (defined.length === 1) return inlineCode(defined[0]);
    return text(i18n2`Multiple`);
  }

  function details(schema, level = 2) {
    const nodes = [];
    const types = Array.isArray(schema[keyword`type`])
      ? schema[keyword`type`]
      : [schema[keyword`type`]];
    const nonNullTypes = types.filter(type => type !== "null" && type !== undefined);
    const nullable = nonNullTypes.length !== types.length;

    if (schema[keyword`$comment`]) {
      nodes.push(blockquote(schema[symbols.meta]?.description || ""));
    }

    nodes.push(
      paragraph([
        strong(text(i18n2`Type`)),
        text(": "),
        typeNode(schema),
        nullable ? text(i18n2`, can be null`) : text(""),
      ]),
    );

    const scalarConstraints = [
      ["multipleOf", i18n2`multiple of`, i18n2`the value of this number must be a multiple of: `],
      ["maximum", i18n2`maximum`, i18n2`the value of this number must be smaller than or equal to: `],
      ["exclusiveMaximum", i18n2`maximum (exclusive)`, i18n2`the value of this number must be smaller than: `],
      ["minimum", i18n2`minimum`, i18n2`the value of this number must be greater than or equal to: `],
      ["exclusiveMinimum", i18n2`minimum (exclusive)`, i18n2`the value of this number must be greater than: `],
      ["maxLength", i18n2`maximum length`, i18n2`the maximum number of characters for this string is: `],
      ["minLength", i18n2`minimum length`, i18n2`the minimum number of characters for this string is: `],
      ["maxItems", i18n2`maximum number of items`, i18n2`the maximum number of items for this array is: `],
      ["minItems", i18n2`minimum number of items`, i18n2`the minimum number of items for this array is: `],
      ["maxProperties", i18n2`maximum number of properties`, i18n2`the maximum number of properties for this object is: `],
      ["minProperties", i18n2`minimum number of properties`, i18n2`the minimum number of properties for this object is: `],
    ];

    for (const [key, title, description] of scalarConstraints) {
      if (schema[keyword(key)] !== undefined) {
        nodes.push(
          paragraph([
            strong(text(title)),
            text(": "),
            text(description),
            inlineCode(String(schema[key])),
          ]),
        );
      }
    }

    if (schema[keyword`uniqueItems`]) {
      nodes.push(
        paragraph([
          strong(text(i18n2`unique items`)),
          text(": "),
          text(i18n2`all items in this array must be unique. Duplicates are not allowed.`),
        ]),
      );
    }

    if (schema[keyword`pattern`]) {
      nodes.push(
        paragraph([
          strong(text(i18n2`pattern`)),
          text(": "),
          text(i18n2`the string must match the following regular expression: `),
        ]),
        code("regex", schema[keyword`pattern`]),
        paragraph(
          link(
            `https://regexr.com/?expression=${encodeURIComponent(schema[keyword`pattern`])}`,
            i18n2`try regular expression with regexr.com`,
            [text(i18n2`try pattern`)],
          ),
        ),
      );
    }

    if (schema[keyword`format`]) {
      nodes.push(
        paragraph([
          strong(text(i18n2`format`)),
          text(": "),
          inlineCode(String(schema[keyword`format`])),
        ]),
      );
    }

    if (schema[keyword`contentEncoding`]) {
      nodes.push(
        paragraph([
          strong(text(i18n2`encoding`)),
          text(": "),
          text(i18n2`the string content must be using the ${schema[keyword`contentEncoding`]} content encoding.`),
        ]),
      );
    }

    if (schema[keyword`contentMediaType`]) {
      nodes.push(
        paragraph([
          strong(text(i18n2`media type`)),
          text(": "),
          text(i18n2`the media type of the contents of this string is: `),
          inlineCode(String(schema[keyword`contentMediaType`])),
        ]),
      );
    }

    if (schema[keyword`default`] !== undefined) {
      nodes.push(
        heading(level + 1, text(i18n2`${gentitle(types)} Default Value`)),
        paragraph(text(i18n2`The default value is:`)),
        paragraph(code(exampleFormat, yaml.dump(schema[keyword`default`]))),
      );
    }

    if (schema[keyword`const`] !== undefined) {
      nodes.push(
        paragraph([
          strong(text(i18n2`constant`)),
          text(": "),
          text(i18n2`the value of this property must be equal to:`),
        ]),
        code(exampleFormat, yaml.dump(schema[keyword`const`])),
      );
    }

    if (schema[keyword`enum`]) {
      const explanations = schema[keyword`meta:enum`] || {};
      nodes.push(
        paragraph([
          strong(text(i18n2`enum`)),
          text(": "),
          text(i18n2`the value of this property must be equal to one of the following values:`),
        ]),
        table("enum", [
          tableRow([
            tableCell(text(i18n2`Value`)),
            tableCell(text(i18n2`Explanation`)),
          ]),
          ...schema[keyword`enum`].map(value =>
            tableRow([
              tableCell(inlineCode(JSON.stringify(value))),
              tableCell(text(explanations[Array.isArray(value) ? JSON.stringify(value) : value] || "")),
            ]),
          ),
        ]),
      );
    }

    if (schema[keyword`examples`] && schema[keyword`examples`].length) {
      nodes.push(
        heading(level + 1, text(i18n2`${gentitle(types)} Examples`)),
        ...schema[keyword`examples`].map(example =>
          paragraph(code(exampleFormat, yaml.dump(example))),
        ),
      );
    }

    return nodes;
  }

  function propertyTable(schema, required = [], properties = {}) {
    const names = Object.keys(properties);
    if (!names.length) return [];

    return [
      table("properties", [
        tableRow([
          tableCell(text(i18n2`Property`)),
          tableCell(text(i18n2`Type`)),
          tableCell(text(i18n2`Required`)),
          tableCell(text(i18n2`Nullable`)),
          ...(!singleFile ? [tableCell(text(i18n2`Defined by`))] : []),
        ]),
        ...names.map(name => {
          const property = properties[name];
          const types = Array.isArray(property[keyword`type`])
            ? property[keyword`type`]
            : [property[keyword`type`]];
          const nullable = types.includes("null");
          const type = typeNode(property);
          const row = [
            tableCell(
              links[name]
                ? link(links[name], i18n2`What does ${name} mean?`, [text(name)])
                : text(name),
            ),
            tableCell(type),
            tableCell(text(required.includes(name) ? i18n2`Required` : i18n2`Optional`)),
            tableCell(text(nullable ? i18n2`can be null` : i18n2`cannot be null`)),
          ];

          if (!singleFile) {
            const origin = property[symbols.parent];
            row.push(
              tableCell(
                origin
                  ? schemaLink(origin, i18n2`open original schema`)
                  : text(i18n2`Unknown`),
              ),
            );
          }
          return tableRow(row);
        }),
      ]),
    ];
  }

  function renderSchema(schema) {
    const title = gentitle(
      Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]],
      schema[keyword`title`],
    );
    const nodes = [
      heading(1, text(`${title} Schema`)),
      paragraph(code("text", schema[symbols.id] || "")),
      ...details(schema),
    ];

    const properties = schema[keyword`properties`] || {};
    nodes.push(...propertyTable(schema, schema[keyword`required`] || [], properties));

    if (schema[keyword`items`]) {
      nodes.push(
        heading(2, text(i18n2`Items`)),
        ...details(schema[keyword`items`], 3),
      );
    }

    if (schema[keyword`additionalProperties`] && typeof schema[keyword`additionalProperties`] === "object") {
      nodes.push(
        heading(2, text(i18n2`Additional Properties`)),
        ...details(schema[keyword`additionalProperties`], 3),
      );
    } else if (schema[keyword`additionalProperties`] === true) {
      nodes.push(
        heading(2, text(i18n2`Additional Properties`)),
        paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`)),
      );
    }

    if (schema[keyword`readOnly`] || schema[keyword`writeOnly`]) {
      nodes.push(
        heading(2, text(i18n2`Access Restrictions`)),
        paragraph(
          text(
            schema[keyword`readOnly`] && schema[keyword`writeOnly`]
              ? i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`
              : schema[keyword`readOnly`]
                ? i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority.`
                : i18n2`The value of this property is never present when the instance is retrieved from the owning authority.`,
          ),
        ),
      );
    }

    return root(nodes);
  }

  return schemas =>
    foldl(
      schemas,
      {},
      (result, schema) => {
        const slugger = new githubSlugger();
        result[schema[filename]] = renderSchema(schema, slugger);
        return result;
      },
    );
}

export { build as default };
