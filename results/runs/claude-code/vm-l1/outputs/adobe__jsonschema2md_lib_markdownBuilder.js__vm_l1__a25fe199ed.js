import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';
import {
  blockquote, code, heading, inlineCode, link, list, listItem, paragraph,
  root, strong, table, tableCell, tableRow, text,
} from 'mdast-builder';

const filename = Symbol('filename');
const fullpath = Symbol('fullpath');
const symbols = {
  pointer: Symbol('pointer'), filename, fullpath, id: Symbol('id'),
  titles: Symbol('titles'), resolve: Symbol('resolve'), slug: Symbol('slug'),
  meta: Symbol('meta'), parent: Symbol('parent'),
};
const used = new Set();

const formats = {
  'date-time': ['date time', 'the string must be a date time string, according to ', 'RFC 3339, section 5.6', 'https://tools.ietf.org/html/rfc3339'],
  date: ['date', 'the string must be a date string, according to ', 'RFC 3339, section 5.6', 'https://tools.ietf.org/html/rfc3339'],
  time: ['time', 'the string must be a time string, according to ', 'RFC 3339, section 5.6', 'https://tools.ietf.org/html/rfc3339'],
  duration: ['duration', 'the string must be a duration string, according to ', 'RFC 3339, section 5.6', 'https://tools.ietf.org/html/rfc3339'],
  email: ['email', 'the string must be an email address, according to ', 'RFC 5322, section 3.4.1', 'https://tools.ietf.org/html/rfc5322'],
  'idn-email': ['(international) email', 'the string must be an (international) email address, according to ', 'RFC 6531', 'https://tools.ietf.org/html/rfc6531'],
  hostname: ['hostname', 'the string must be a hostname, according to ', 'RFC 1123, section 2.1', 'https://tools.ietf.org/html/rfc1123'],
  'idn-hostname': ['(international) hostname', 'the string must be an (IDN) hostname, according to ', 'RFC 5890, section 2.3.2.3', 'https://tools.ietf.org/html/rfc5890'],
  ipv4: ['IPv4', 'the string must be an IPv4 address (dotted quad), according to ', 'RFC 2673, section 3.2', 'https://tools.ietf.org/html/rfc2673'],
  ipv6: ['IPv6', 'the string must be an IPv6 address, according to ', 'RFC 4291, section 2.2', 'https://tools.ietf.org/html/rfc4291'],
  uri: ['URI', 'the string must be a URI, according to ', 'RFC 3986', 'https://tools.ietf.org/html/rfc3986'],
  iri: ['IRI', 'the string must be a IRI, according to ', 'RFC 3987', 'https://tools.ietf.org/html/rfc3987'],
  'uri-reference': ['URI reference', 'the string must be a URI reference, according to ', 'RFC 3986', 'https://tools.ietf.org/html/rfc3986'],
  'iri-reference': ['IRI reference', 'the string must be a IRI reference, according to ', 'RFC 3987', 'https://tools.ietf.org/html/rfc3987'],
  uuid: ['UUID', 'the string must be a UUID, according to ', 'RFC 4122', 'https://tools.ietf.org/html/rfc4122'],
  'json-pointer': ['JSON Pointer', 'the string must be a JSON Pointer, according to ', 'RFC 6901, section 5', 'https://tools.ietf.org/html/rfc6901'],
  'relative-json-pointer': ['Relative JSON Pointer', 'the string must be a relative JSON Pointer, according to ', 'draft-handrews-relative-json-pointer-01', 'https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01'],
  regex: ['RegEx', 'the string must be a regular expression, according to ', 'ECMA-262', 'http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf'],
  'uri-template': ['URI Template', 'the string must be a URI template, according to ', 'RFC 6570', 'https://tools.ietf.org/html/rfc6570'],
};

function keyword(schema, name) {
  used.add(name);
  return schema?.[name];
}

function metadata(schema) {
  return schema?.[symbols.meta] || {};
}

function schemaTitle(schema, fallback = 'Untitled schema') {
  const titles = schema?.[symbols.titles];
  return (Array.isArray(titles) && titles.at(-1)) || schema?.title || metadata(schema).name || fallback;
}

function schemaDescription(schema) {
  const meta = metadata(schema);
  return meta.longdescription || meta.shortdescription || schema?.description || '';
}

function compact(values) {
  return values.flat(Infinity).filter(value => value !== null && value !== undefined && value !== false);
}

function schemaTypes(schema) {
  const declared = keyword(schema, 'type');
  const result = Array.isArray(declared) ? [...declared] : declared == null ? [] : [declared];
  if (keyword(schema, 'allOf')) result.push('Merged');
  if (keyword(schema, 'anyOf') || keyword(schema, 'oneOf')) result.push('Multiple');
  if (keyword(schema, 'not')) result.push('not');
  return [...new Set(result)];
}

function isNullable(schema) {
  const type = keyword(schema, 'type');
  return schema === null || type === 'null' || (Array.isArray(type) && type.includes('null'));
}

function typeNodes(schema) {
  const types = schemaTypes(schema);
  if (!types.length) return [text('Not specified')];
  return compact(types.map((type, index) => [index ? text(', ') : null, inlineCode(String(type))]));
}

function targetFor(schema, options) {
  const slug = schema?.[symbols.slug];
  if (!slug) return null;
  const target = options.singleFile ? `#${slug}` : `${slug}.md`;
  return options.rewritelinks ? options.rewritelinks(target, schema) : target;
}

function schemaReference(schema, options, label = schemaTitle(schema)) {
  const target = targetFor(schema, options);
  return target ? link(target, null, [text(label)]) : text(label);
}

function schemaFacts(schema, options, propertyName) {
  const facts = [];
  if (propertyName) {
    const required = keyword(schema?.[symbols.parent], 'required') || [];
    facts.push(listItem(paragraph([text(`${propertyName} is ${required.includes(propertyName) ? 'required' : 'optional'}`)])));
  }
  facts.push(listItem(paragraph([text('Type: '), ...typeNodes(schema)])));
  facts.push(listItem(paragraph([text(isNullable(schema) ? 'can be null' : 'cannot be null')])));
  const parent = schema?.[symbols.parent];
  if (parent) facts.push(listItem(paragraph([text('defined in: '), schemaReference(parent, options)])));
  if (options.includeProperties) {
    for (const [name, value] of Object.entries(metadata(schema))) {
      if (!['name', 'shortdescription', 'longdescription'].includes(name)) {
        facts.push(listItem(paragraph([text(`${name}: ${String(value)}`)])));
      }
    }
  }
  return list('unordered', facts);
}

function compositionSections(schema, options) {
  const output = [];
  for (const [name, label] of [['oneOf', 'one (and only one) of'], ['anyOf', 'any of'], ['allOf', 'all of']]) {
    const alternatives = keyword(schema, name);
    if (Array.isArray(alternatives) && alternatives.length) {
      output.push(paragraph([text(`${label}:`)]));
      output.push(list('unordered', alternatives.map(item => listItem(paragraph([schemaReference(item, options)])))));
    }
  }
  const excluded = keyword(schema, 'not');
  if (excluded) output.push(paragraph([text('not: '), schemaReference(excluded, options)]));
  return output;
}

function arraySection(schema, options) {
  const items = keyword(schema, 'items');
  if (!items) return [];
  if (!Array.isArray(items)) {
    return [paragraph([text('an array of the following: '), schemaReference(items, options)])];
  }
  const entries = items.map(item => listItem(paragraph([schemaReference(item, options)])));
  const additional = keyword(schema, 'additionalItems');
  if (additional === true) entries.push(listItem(paragraph([text('and all following items may follow any schema')])));
  else if (additional && typeof additional === 'object') {
    entries.push(listItem(paragraph([text('and all following items must follow the schema: '), schemaReference(additional, options)])));
  }
  return [
    paragraph([text('an array where each item follows the corresponding schema in the following list:')]),
    list('ordered', entries),
  ];
}

function propertySection(schema, options) {
  if (options.skipProperties) return [];
  const properties = keyword(schema, 'properties');
  if (!properties || !Object.keys(properties).length) return [];
  const required = keyword(schema, 'required') || [];
  const rows = [tableRow(['Property', 'Type', 'Required', 'Nullable', 'Defined by'].map(value => tableCell([text(value)])))];
  for (const [name, property] of Object.entries(properties)) {
    const parent = property?.[symbols.parent];
    rows.push(tableRow([
      tableCell([schemaReference(property, options, name)]),
      tableCell(typeNodes(property)),
      tableCell([text(required.includes(name) ? 'Required' : 'Optional')]),
      tableCell([text(isNullable(property) ? 'Yes' : 'No')]),
      tableCell(parent ? [schemaReference(parent, options)] : []),
    ]));
  }
  return [heading(2, [text(`${schemaTitle(schema, '')} Properties`.trim())]), table(['left', 'left', 'left', 'left', 'left'], rows)];
}

function constraintSections(schema) {
  const output = [];
  if (Object.hasOwn(schema, 'const')) {
    keyword(schema, 'const');
    output.push(
      paragraph([strong([text('constant')]), text(': the value of this property must be equal to:')]),
      code('json', JSON.stringify(schema.const, null, 2)),
    );
  }
  const enumeration = keyword(schema, 'enum');
  if (Array.isArray(enumeration)) {
    output.push(paragraph([text('the value of this property must be equal to one of the following values:')]));
    output.push(table(['left', 'left'], [
      tableRow([tableCell([text('Value')]), tableCell([text('Explanation')])]),
      ...enumeration.map(value => tableRow([tableCell([inlineCode(JSON.stringify(value))]), tableCell([])])),
    ]));
  }
  const numericRules = [
    ['multipleOf', 'the value of this number must be a multiple of: '],
    ['maximum', 'the value of this number must smaller than or equal to: '],
    ['exclusiveMaximum', 'the value of this number must be smaller than: '],
    ['minimum', 'the value of this number must be greater than or equal to: '],
    ['exclusiveMinimum', 'the value of this number must be greater than: '],
    ['maxLength', 'the string must contain at most this many characters: '],
    ['minLength', 'the string must contain at least this many characters: '],
    ['maxItems', 'the array must contain at most this many items: '],
    ['minItems', 'the array must contain at least this many items: '],
    ['maxProperties', 'the object must contain at most this many properties: '],
    ['minProperties', 'the object must contain at least this many properties: '],
  ];
  for (const [name, label] of numericRules) {
    const value = keyword(schema, name);
    if (value !== undefined) output.push(paragraph([text(label), inlineCode(String(value))]));
  }
  if (keyword(schema, 'uniqueItems') === true) output.push(paragraph([text('each item in the array must be unique')]));
  const pattern = keyword(schema, 'pattern');
  if (pattern !== undefined) output.push(paragraph([text('Pattern: '), inlineCode(pattern)]));
  const format = keyword(schema, 'format');
  if (formats[format]) {
    const [label, description, specification, url] = formats[format];
    output.push(paragraph([strong([text(label)]), text(`: ${description}`), link(url, specification, [text(specification)])]));
  }
  return output;
}

function exampleSections(schema, options) {
  const examples = keyword(schema, 'examples');
  if (!Array.isArray(examples) || !examples.length) return [];
  const language = options.exampleFormat === 'yaml' ? 'yaml' : 'json';
  return [
    heading(2, [text(`${schemaTitle(schema, '')} Examples`.trim())]),
    ...examples.map(example => code(language, language === 'yaml' ? yaml.dump(example) : JSON.stringify(example, null, 2))),
  ];
}

function defaultSection(schema) {
  const value = keyword(schema, 'default');
  if (value === undefined) return [];
  return [
    heading(2, [text(`${schemaTitle(schema, '')} Default Value`.trim())]),
    paragraph([text('The default value is:')]),
    code('json', JSON.stringify(value, null, 2)),
  ];
}

function accessSection(schema) {
  const readOnly = keyword(schema, 'readOnly');
  const writeOnly = keyword(schema, 'writeOnly');
  if (!readOnly && !writeOnly) return [];
  let message = 'The value of this property can neither be read nor written.';
  if (readOnly && !writeOnly) message = 'The value of this property is read only.';
  if (writeOnly && !readOnly) message = 'The value of this property is write only.';
  return [heading(2, [text(`${schemaTitle(schema, '')} Access Restrictions`.trim())]), paragraph([text(message)])];
}

function additionalPropertiesSection(schema, options) {
  const additional = keyword(schema, 'additionalProperties');
  if (additional === undefined) return [];
  const output = [heading(2, [text('Additional Properties')])];
  if (additional === false) output.push(paragraph([text('Additional properties are forbidden.')]))
  else if (additional === true) output.push(paragraph([text('Additional properties are allowed and do not have to follow a specific schema')]))
  else output.push(
    paragraph([text('Additional properties are allowed, as long as they follow this schema:')]),
    ...renderSchema(additional, options, false),
  );
  return output;
}

function definitionsSection(schema, options) {
  const definitions = keyword(schema, 'definitions') || keyword(schema, '$defs');
  if (!definitions || !Object.keys(definitions).length) return [];
  const output = [heading(2, [text(`${schemaTitle(schema, '')} Definitions`.trim())])];
  for (const [name, definition] of Object.entries(definitions)) {
    output.push(heading(3, [text(name)]), ...renderSchema(definition, options, false));
  }
  return output;
}

function renderSchema(schema, options, includeHeader = true, propertyName) {
  if (typeof schema === 'boolean') {
    return [paragraph([text(schema ? 'Any value is accepted.' : 'No value is accepted.')])];
  }
  if (!schema || typeof schema !== 'object') return [];
  const title = schemaTitle(schema);
  const description = schemaDescription(schema);
  return compact([
    includeHeader ? options.header : null,
    includeHeader ? heading(1, [text(`${title} Schema`)]) : null,
    description ? paragraph([text(description)]) : paragraph([text('no description')]),
    schemaFacts(schema, options, propertyName),
    compositionSections(schema, options),
    arraySection(schema, options),
    propertySection(schema, options),
    constraintSections(schema),
    exampleSections(schema, options),
    defaultSection(schema),
    accessSection(schema),
    additionalPropertiesSection(schema, options),
    definitionsSection(schema, options),
  ]);
}

function assignSlugs(schema, slugger, seen = new Set()) {
  if (!schema || typeof schema !== 'object' || seen.has(schema)) return;
  seen.add(schema);
  if (!schema[symbols.slug]) schema[symbols.slug] = slugger.slug(schemaTitle(schema));
  for (const name of ['properties', 'patternProperties', 'definitions', '$defs']) {
    for (const child of Object.values(schema[name] || {})) assignSlugs(child, slugger, seen);
  }
  for (const name of ['allOf', 'anyOf', 'oneOf']) {
    for (const child of schema[name] || []) assignSlugs(child, slugger, seen);
  }
  for (const name of ['not', 'items', 'additionalItems', 'additionalProperties']) {
    const child = schema[name];
    if (Array.isArray(child)) child.forEach(value => assignSlugs(value, slugger, seen));
    else assignSlugs(child, slugger, seen);
  }
}

function normalizeOptions(options = {}) {
  return {
    header: options.header || [],
    links: options.links || {},
    includeProperties: options.includeProperties ?? false,
    rewritelinks: options.rewritelinks,
    exampleFormat: options.exampleFormat || 'json',
    skipProperties: options.skipProperties ?? false,
    singleFile: options.singleFile ?? false,
  };
}

export default function build(schema, options = {}) {
  const settings = normalizeOptions(options);
  used.clear();
  assignSlugs(schema, new GithubSlugger());
  return root(renderSchema(schema, settings));
}
