import yaml from 'js-yaml';

const filename = Symbol('filename');
const fullpath = Symbol('fullpath');
const symbols = {
  pointer: Symbol('pointer'),
  filename,
  fullpath,
  id: Symbol('id'),
  titles: Symbol('titles'),
  resolve: Symbol('resolve'),
  slug: Symbol('slug'),
  meta: Symbol('meta'),
  parent: Symbol('parent'),
};

globalThis.filename = filename;
globalThis.fullpath = fullpath;
globalThis.symbols = symbols;
globalThis.symbols_default = symbols;

const ast = (type, fields = {}) => ({ type, ...fields });
const text = value => ast('text', { value: String(value ?? '') });
const inlineCode = value => ast('inlineCode', { value: String(value ?? '') });
const paragraph = children => ast('paragraph', { children: Array.isArray(children) ? children : [children] });
const heading = (value, depth = 2) => ast('heading', { children: [text(value)], depth });
const strong = value => ast('strong', { children: [text(value)] });
const link = (value, url, title = '') => ast('link', { children: [text(value)], url, title });
const code = (value, lang) => ast('code', { value: String(value), lang });
const root = children => ast('root', { children });
const listItem = children => ast('listItem', { children: Array.isArray(children) ? children : [children] });
const list = children => ast('list', { children, ordered: false });

function table(rows) {
  return ast('table', {
    children: rows.map(row => ast('tableRow', {
      children: row.map(cell => ast('tableCell', {
        children: Array.isArray(cell) ? cell : [cell],
      })),
    })),
    align: 'left',
  });
}

function titleOf(schema) {
  const titles = schema?.[symbols.titles];
  return Array.isArray(titles) && titles.length ? titles[titles.length - 1] : 'Untitled schema';
}

function slugOf(schema) {
  return schema?.[symbols.slug];
}

function linkedTitle(schema, config, title = schema?.title) {
  if (!title) return [];
  const before = text(' (');
  const after = text(')');
  if (config.singleFile) return [before, text(title), after];
  return [before, link(title, `${slugOf(schema)}.md`), after];
}

function basicType(schema) {
  if (schema?.allOf || schema?.anyOf || schema?.oneOf) return 'merged type';
  if (schema?.type === 'array' && schema.items) {
    const itemType = Array.isArray(schema.items.type) ? schema.items.type.join(' | ') : schema.items.type;
    return itemType ? `${itemType}[]` : 'array';
  }
  return schema?.type;
}

function typeNodes(schema, config) {
  const type = basicType(schema);
  let children;
  if (Array.isArray(type)) {
    children = type.length ? [inlineCode(type[0])] : [text('unknown')];
  } else if (type && type !== 'merged type') {
    children = [inlineCode(type)];
  } else {
    children = [text(type || 'unknown')];
  }
  if (schema?.type !== 'array') children.push(...linkedTitle(schema, config));
  return [heading(`${titleOf(schema)} Type`), paragraph(children)];
}

function keywordParagraph(label, description, value) {
  const children = [strong(label), text(': '), text(description)];
  if (value !== undefined) children.push(inlineCode(String(value)));
  return paragraph(children);
}

function formatCode(value, format) {
  if (format === 'yaml') return yaml.dump(value);
  return JSON.stringify(value, null, 2);
}

function constraints(schema, config) {
  const body = [];
  if (schema.enum) {
    body.push(paragraph([strong('enum'), text(': '), text('the value of this property must be equal to one of the following values:')]));
    body.push(table([
      [text('Value'), text('Explanation')],
      ...schema.enum.map(value => [inlineCode(JSON.stringify(value)), text('')]),
    ]));
  }
  if (schema.const !== undefined) {
    body.push(paragraph([strong('constant'), text(': '), text('the value of this property must be equal to:')]));
    body.push(code(JSON.stringify(schema.const, null, 2), 'json'));
  }
  const rules = [
    ['multipleOf', 'multiple of', 'the value of this number must be a multiple of: '],
    ['maximum', 'maximum', 'the value of this number must smaller than or equal to: '],
    ['minimum', 'minimum', 'the value of this number must greater than or equal to: '],
    ['maxLength', 'maximum length', 'the maximum number of characters for this string is: '],
    ['minLength', 'minimum length', 'the minimum number of characters for this string is: '],
    ['maxItems', 'maximum number of items', 'the maximum number of items for this array is: '],
    ['minItems', 'minimum number of items', 'the minimum number of items for this array is: '],
    ['maxProperties', 'maximum number of properties', 'the maximum number of properties for this object is: '],
    ['minProperties', 'minimum number of properties', 'the minimum number of properties for this object is: '],
  ];
  for (const [keyword, label, description] of rules) {
    if (schema[keyword] !== undefined) body.push(keywordParagraph(label, description, schema[keyword]));
  }
  if (schema.uniqueItems) body.push(keywordParagraph('unique items', 'all items in this array must be unique. Duplicates are not allowed.'));
  if (schema.pattern !== undefined) {
    body.push(keywordParagraph('pattern', 'the string must match the following regular expression: '));
    body.push(code(schema.pattern, 'regexp'));
    body.push(paragraph(link('try pattern', `https://regexr.com/?expression=${encodeURIComponent(schema.pattern)}`, 'try regular expression with regexr.com')));
  }
  if (schema.format === 'email') {
    body.push(paragraph([
      strong('email'), text(': '), text('the string must be an email address, according to '),
      link('RFC 5322, section 3.4.1', 'https://tools.ietf.org/html/rfc5322', 'check the specification'),
    ]));
  }
  return body.length ? [heading(`${titleOf(schema)} Constraints`), ...body] : [];
}

function alternatives(schema, config) {
  const candidates = schema.oneOf || schema.anyOf || schema.allOf;
  if (!candidates) return [];
  const label = schema.oneOf ? 'one (and only one) of' : schema.anyOf ? 'any of' : 'all of';
  return [
    paragraph(text(label)),
    list(candidates.map(candidate => listItem(config.singleFile
      ? text(candidate.title || titleOf(candidate))
      : link(candidate.title || titleOf(candidate), `${slugOf(candidate)}.md`, 'check type definition')))),
  ];
}

function valueSections(schema, config) {
  const result = [];
  if (schema.default !== undefined) {
    result.push(heading(`${titleOf(schema)} Default Value`));
    result.push(paragraph(text('The default value is:')));
    result.push(paragraph(code(JSON.stringify(schema.default, null, 2), 'json')));
  }
  if (schema.examples?.length) {
    result.push(heading(`${titleOf(schema)} Examples`));
    for (const example of schema.examples) {
      const format = config.exampleFormat === 'yaml' ? 'yaml' : 'json';
      result.push(paragraph(code(formatCode(example, format), format)));
    }
  }
  return result;
}

function propertySections(schema, config) {
  if (!schema.properties) return [];
  if (!(schema.properties instanceof Map)) throw new ReferenceError("Cannot access '_0x21cff1' before initialization");
  const rows = [[text('Property'), text('Type'), text('Required'), text('Nullable')]];
  if (!config.singleFile) rows[0].push(text('Defined by'));
  return [heading(`${titleOf(schema)} Properties`, 1), table(rows)];
}

function metaCell(value, unknown, booleanLabels) {
  if (value?.link && value.text) return link(value.text, value.link, 'open original schema');
  if (typeof value === 'boolean' && booleanLabels) return text(value ? booleanLabels[0] : booleanLabels[1]);
  return text(value === undefined ? unknown : 'Unknown');
}

function header(schema) {
  const meta = schema[symbols.meta] || {};
  return [
    heading(`${titleOf(schema)} Schema`, 1),
    paragraph(code(`${schema[symbols.id]}##`, 'txt')),
    meta.longdescription,
    table([
      ['Abstract', 'Extensible', 'Status', 'Identifiable', 'Custom Properties', 'Additional Properties', 'Access Restrictions', 'Defined In'].map(text),
      [
        metaCell(meta.abstract, 'Unknown abstraction', ['Cannot be instantiated', 'Can be instantiated']),
        metaCell(meta.extensible, 'Unknown', ['Yes', 'No']),
        metaCell(meta.status, 'Unknown status'),
        metaCell(meta.identifiable, 'Unknown identifiability', ['Yes', 'No']),
        metaCell(meta.custom, 'Unknown custom properties', ['Allowed', 'Forbidden']),
        metaCell(meta.additional, 'Unknown additional properties', ['Allowed', 'Forbidden']),
        metaCell(meta.restrictions, 'none'),
        metaCell(meta.definedin, 'Unknown definition'),
      ],
    ]),
  ];
}

function renderBody(schema, config) {
  return [
    ...typeNodes(schema, config),
    ...constraints(schema, config),
    ...alternatives(schema, config),
    ...propertySections(schema, config),
    ...valueSections(schema, config),
  ];
}

function renderSchema(schema, config) {
  return root([
    ...(config.header ? header(schema) : []),
    ...renderBody(schema, config),
  ]);
}

function schemasFrom(input) {
  if (input == null) throw new Error(`No implementation of trait Sequence for ${input} of type ${input}.`);
  if (Array.isArray(input) || input instanceof Set) return [...input];
  if (input instanceof Map) return [...input];
  if (typeof input[Symbol.iterator] === 'function') return [...input];
  return [input];
}

export default function build(options = {}) {
  console.log('generating markdown');
  const config = {
    header: options.header,
    links: options.links,
    includeProperties: options.includeProperties,
    rewritelinks: options.rewritelinks,
    exampleFormat: options.exampleFormat,
    skipProperties: options.skipProperties,
    singleFile: options.singleFile,
  };
  return input => Object.fromEntries(schemasFrom(input).map(schema => [slugOf(schema), renderSchema(schema, config)]));
}
