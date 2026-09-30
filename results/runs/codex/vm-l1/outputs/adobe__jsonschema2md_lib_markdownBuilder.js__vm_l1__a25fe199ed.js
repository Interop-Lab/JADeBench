import i18nModule from 'es2015-i18n-tag';
import { foldl } from 'ferrum';
import {
  blockquote,
  code,
  heading,
  inlineCode,
  link,
  list,
  listItem,
  paragraph,
  root,
  strong,
  table,
  tableCell,
  tableRow,
  text,
} from 'mdast-builder';
import GithubSlugger from 'github-slugger';
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
const { default: i18n } = i18nModule;

const usedKeywords = new Set();

function titleFor(titles, type) {
  if (Array.isArray(titles)) {
    const remainingTitles = [...titles];
    while (remainingTitles.length > 0) {
      const title = remainingTitles.pop();
      if (typeof title === 'string' && title) return title;
    }
    if (type !== undefined) return i18n`Untitled ${String(type)} in ${titles[symbols.pointer]}`;
  }
  return i18n`Untitled schema`;
}

function descriptionFor(schema) {
  return schema?.[symbols.meta]?.shortdescription || '';
}

function keyword(parts) {
  usedKeywords.add(parts[0]);
  return parts.join('');
}

function report() {
  console.log([...usedKeywords].join('\n'));
}

const formatDescriptions = {
  'date-time': ['date time', 'the string must be a date time string, according to ', 'RFC 3339, section 5.6', 'https://tools.ietf.org/html/rfc3339'],
  date: ['date', 'the string must be a date string, according to ', 'RFC 3339, section 5.6', 'https://tools.ietf.org/html/rfc3339'],
  time: ['time', 'the string must be a time string, according to ', 'RFC 3339, section 5.6', 'https://tools.ietf.org/html/rfc3339'],
  duration: ['duration', 'the string must be a duration string, according to ', 'RFC 3339', 'https://tools.ietf.org/html/rfc3339'],
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

const constraintDefinitions = [
  ['multipleOf', 'multiple of', 'the value of this number must be a multiple of: '],
  ['maximum', 'maximum', 'the value of this number must smaller than or equal to: '],
  ['exclusiveMaximum', 'maximum (exclusive)', 'the value of this number must be smaller than: '],
  ['minimum', 'minimum', 'the value of this number must greater than or equal to: '],
  ['exclusiveMinimum', 'minimum (exclusive)', 'the value of this number must be greater than: '],
  ['maxLength', 'maximum length', 'the maximum number of characters for this string is: '],
  ['minLength', 'minimum length', 'the minimum number of characters for this string is: '],
  ['maxItems', 'maximum number of items', 'the maximum number of items for this array is: '],
  ['minItems', 'minimum number of items', 'the minimum number of items for this array is: '],
  ['maxProperties', 'maximum number of properties', 'the maximum number of properties for this object is: '],
  ['minProperties', 'minimum number of properties', 'the minimum number of properties for this object is: '],
];

function schemaLink(schema, label, options) {
  const slug = schema?.[symbols.slug] || schema?.[symbols.id] || '';
  const file = options.singleFile ? '' : `${slug}.md`;
  const pointer = schema?.[symbols.pointer] || '';
  return link(`${file}#${pointer.replace(/^#/, '')}`, null, [text(label)]);
}

function renderHeader(schema, options) {
  if (!options.header) return [];
  const schemaTitle = titleFor(schema?.[symbols.titles], normalizeType(schema?.type));
  const children = [heading(1, [text(`${schemaTitle} Schema`)])];
  const description = descriptionFor(schema);
  if (description) children.push(paragraph([text(description)]));
  if (schema?.$comment) children.push(blockquote([paragraph([text(schema.$comment)])]));
  return children;
}

function normalizeTypes(type) {
  if (Array.isArray(type)) return type;
  if (type === undefined) return [];
  return [type];
}

function normalizeType(type) {
  const types = normalizeTypes(type).filter((entry) => entry !== 'null');
  if (types.length === 0) return type === undefined ? undefined : 'null';
  return types.join(' or ');
}

function typeSummary(schema) {
  const types = normalizeTypes(schema?.type);
  const concreteTypes = types.filter((type) => type !== 'null');
  if (concreteTypes.length === 0) {
    if (schema?.allOf) return 'merged type';
    if (schema?.oneOf || schema?.anyOf) return 'any of the following';
    return 'unknown';
  }
  const summary = concreteTypes.map(String).join(' or ');
  return types.includes('null') ? `${summary}, or null` : summary;
}

function renderTypeSection(schema) {
  const type = typeSummary(schema);
  return [heading(2, [text(`${titleFor(schema?.[symbols.titles], type)} Type`)]), paragraph([inlineCode(type)])];
}

function renderCompositions(schema, options) {
  const sections = [];
  const definitions = [
    ['oneOf', 'one (and only one) of'],
    ['anyOf', 'any of'],
    ['allOf', 'all of'],
  ];
  for (const [property, label] of definitions) {
    if (!Array.isArray(schema?.[property]) || schema[property].length === 0) continue;
    usedKeywords.add(property);
    sections.push(paragraph([text(label)]));
    sections.push(list(false, schema[property].map((candidate) => listItem([
      paragraph([schemaLink(candidate, titleFor(candidate?.[symbols.titles], normalizeType(candidate?.type)), options)]),
    ]))));
  }
  if (schema?.not) {
    usedKeywords.add('not');
    sections.push(list(false, [listItem([
      paragraph([text('must not match '), schemaLink(schema.not, titleFor(schema.not?.[symbols.titles], normalizeType(schema.not?.type)), options)]),
    ])]));
  }
  return sections;
}

function renderConstraints(schema, options) {
  const rows = [];
  const addConstraint = (name, explanation) => {
    usedKeywords.add(name);
    rows.push(tableRow([tableCell([inlineCode(name)]), tableCell(explanation)]));
  };

  if (Object.prototype.hasOwnProperty.call(schema, 'const')) {
    addConstraint('constant', [text('the value of this property must be equal to:'), code('json', JSON.stringify(schema.const, null, 2))]);
  }
  if (Array.isArray(schema?.enum)) {
    usedKeywords.add('enum');
    const enumRows = [tableRow([tableCell([text('Value')]), tableCell([text('Explanation')])])];
    for (const value of schema.enum) enumRows.push(tableRow([tableCell([inlineCode(JSON.stringify(value))]), tableCell([])]));
    rows.push(tableRow([tableCell([inlineCode('enum')]), tableCell([text('the value of this property must be equal to one of the following values:'), table(['left', 'left'], enumRows)])]));
  }
  for (const [name, label, explanation] of constraintDefinitions) {
    if (schema?.[name] === undefined) continue;
    addConstraint(label, [text(explanation), inlineCode(String(schema[name]))]);
  }
  if (schema?.pattern !== undefined) {
    usedKeywords.add('pattern');
    addConstraint('regexp', [text('the string must match the following regular expression: '), inlineCode(schema.pattern), text(' '), link(`https://regexr.com/?expression=${encodeURIComponent(schema.pattern)}`, null, [text('try regular expression with regexr.com')])]);
  }
  if (schema?.format !== undefined) {
    usedKeywords.add('format');
    const details = formatDescriptions[schema.format];
    addConstraint(details?.[0] || 'string', details ? [text(details[1]), link(details[3], null, [text(details[2])])] : [text('the value of this string must follow the format: '), inlineCode(schema.format)]);
  }
  if (schema?.contentEncoding !== undefined) addConstraint('encoding', [text('the string content must be using the '), inlineCode(schema.contentEncoding), text(' content encoding.')]);
  if (schema?.contentMediaType !== undefined) addConstraint('media type', [text('the media type of the contents of this string is: '), inlineCode(schema.contentMediaType)]);
  if (schema?.contentSchema !== undefined) addConstraint('schema', [text('the contents of this string should follow this schema: '), schemaLink(schema.contentSchema, titleFor(schema.contentSchema?.[symbols.titles], normalizeType(schema.contentSchema?.type)), options)]);
  if (schema?.uniqueItems) addConstraint('unique items', [text('all items in this array must be unique. Duplicates are not allowed.')]);
  if (schema?.minContains !== undefined && schema?.contains) addConstraint('minimum number of contained items', [text('this array may not contain fewer than '), inlineCode(String(schema.minContains)), text(' items that validate against the schema: '), schemaLink(schema.contains, titleFor(schema.contains?.[symbols.titles], normalizeType(schema.contains?.type)), options)]);
  if (schema?.maxContains !== undefined && schema?.contains) addConstraint('maximum number of contained items', [text('this array may not contain more than '), inlineCode(String(schema.maxContains)), text(' items that validate against the schema: '), schemaLink(schema.contains, titleFor(schema.contains?.[symbols.titles], normalizeType(schema.contains?.type)), options)]);

  return rows.length === 0 ? [] : [heading(2, [text(`${titleFor(schema?.[symbols.titles], normalizeType(schema?.type))} Constraints`)]), table(['left', 'left'], rows)];
}

function propertyType(schema, options) {
  const label = typeSummary(schema);
  return schema?.[symbols.slug] ? schemaLink(schema, label, options) : inlineCode(label);
}

function renderProperties(schema, options) {
  const properties = schema?.properties || {};
  const patternProperties = schema?.patternProperties || {};
  const entries = [
    ...Object.entries(properties).map(([name, value]) => [name, value, false]),
    ...Object.entries(patternProperties).map(([name, value]) => [name, value, true]),
  ];
  if (entries.length === 0 && schema?.additionalProperties === undefined) return [];

  usedKeywords.add('properties');
  const rows = [tableRow([
    tableCell([text('Property')]),
    tableCell([text('Type')]),
    tableCell([text('Required')]),
    tableCell([text('Nullable')]),
    tableCell([text('Defined by')]),
  ])];
  for (const [name, propertySchema, pattern] of entries) {
    const required = !pattern && schema.required?.includes(name);
    const nullable = normalizeTypes(propertySchema?.type).includes('null');
    rows.push(tableRow([
      tableCell([pattern ? inlineCode(name) : text(name)]),
      tableCell([propertyType(propertySchema, options)]),
      tableCell([text(required ? 'Required' : 'Optional')]),
      tableCell([text(nullable ? 'can be null' : 'cannot be null')]),
      tableCell([propertySchema?.[symbols.slug] ? schemaLink(propertySchema, titleFor(propertySchema?.[symbols.titles], normalizeType(propertySchema?.type)), options) : text('Not specified')]),
    ]));
  }
  if (schema?.additionalProperties !== undefined) {
    const additional = schema.additionalProperties;
    rows.push(tableRow([
      tableCell([text('Additional Properties')]),
      tableCell([additional && typeof additional === 'object' ? propertyType(additional, options) : text(additional === false ? 'Forbidden' : 'Any')]),
      tableCell([text('Optional')]),
      tableCell([text('can be null')]),
      tableCell([text('Not specified')]),
    ]));
  }
  return [heading(2, [text(`${titleFor(schema?.[symbols.titles], normalizeType(schema?.type))} Properties`)]), table(['left', 'left', 'left', 'left', 'left'], rows)];
}

function renderDefinitions(schema, options) {
  const definitions = schema?.definitions || schema?.$defs;
  if (!definitions || Object.keys(definitions).length === 0) return [];
  usedKeywords.add(schema.definitions ? 'definitions' : '$defs');
  const children = [heading(2, [text(`${titleFor(schema?.[symbols.titles], normalizeType(schema?.type))} Definitions`)])];
  for (const [name, definition] of Object.entries(definitions)) {
    children.push(heading(3, [text(`Definitions group ${name}`)]));
    children.push(paragraph([text('Reference this group by using')]));
    children.push(code('json', JSON.stringify({ $ref: `${schema?.[symbols.id] || ''}#${definition?.[symbols.pointer] || ''}` }, null, 2)));
    children.push(...renderSchemaSections(definition, options));
  }
  return children;
}

function renderExamples(schema, options) {
  if (!Array.isArray(schema?.examples) || schema.examples.length === 0) return [];
  usedKeywords.add('examples');
  const title = titleFor(schema?.[symbols.titles], normalizeType(schema?.type));
  const examples = schema.examples.map((example) => options.exampleFormat === 'yaml'
    ? paragraph([code('yaml', yaml.dump(example))])
    : paragraph([code('json', JSON.stringify(example, null, 2))]));
  return [heading(2, [text(`${title} Examples`)]), ...examples];
}

function renderDefault(schema) {
  if (!Object.prototype.hasOwnProperty.call(schema, 'default')) return [];
  usedKeywords.add('default');
  return [
    heading(2, [text(`${titleFor(schema?.[symbols.titles], normalizeType(schema?.type))} Default Value`)]),
    paragraph([text('The default value is:')]),
    code('json', JSON.stringify(schema.default, null, 2)),
  ];
}

function renderAccessRestrictions(schema) {
  if (!schema?.readOnly && !schema?.writeOnly) return [];
  usedKeywords.add(schema.readOnly ? 'readOnly' : 'writeOnly');
  let message;
  if (schema.readOnly && schema.writeOnly) message = 'The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.';
  else if (schema.readOnly) message = 'The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority';
  else message = 'The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.';
  return [heading(2, [text(`${titleFor(schema?.[symbols.titles], normalizeType(schema?.type))} Access Restrictions`)]), paragraph([text(message)])];
}

function renderSchemaSections(schema, options) {
  return [
    ...renderTypeSection(schema),
    ...renderCompositions(schema, options),
    ...renderConstraints(schema, options),
    ...renderDefault(schema),
    ...renderExamples(schema, options),
    ...renderAccessRestrictions(schema),
    ...renderProperties(schema, options),
    ...renderDefinitions(schema, options),
  ];
}

function renderDocument(schema, options) {
  const slugger = new GithubSlugger();
  schema[symbols.slug] ||= slugger.slug(titleFor(schema?.[symbols.titles], normalizeType(schema?.type)));
  return root([...renderHeader(schema, options), ...renderSchemaSections(schema, options)]);
}

function build({
  header,
  links,
  includeProperties,
  rewritelinks = 0,
  exampleFormat = 'json',
  skipProperties,
  singleFile = false,
} = {}) {
  const options = { header, links, includeProperties, rewritelinks, exampleFormat, skipProperties, singleFile };
  console.log(i18n`generating markdown`);
  return (schemas) => foldl(schemas, {}, (documents, schema) => {
    const documentName = schema?.[filename];
    documents[documentName] = renderDocument(schema, options);
    return documents;
  });
}

export { build as default };
