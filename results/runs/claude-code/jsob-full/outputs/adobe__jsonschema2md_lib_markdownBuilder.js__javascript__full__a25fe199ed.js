const filename = Symbol('filename'), fullpath = Symbol('fullpath'), symbols_default = {
  pointer: Symbol('pointer'),
  filename: filename,
  fullpath: fullpath,
  id: Symbol('id'),
  titles: Symbol('titles'),
  resolve: Symbol('resolve'),
  slug: Symbol('slug'),
  meta: Symbol('meta'),
  parent: Symbol('parent')
}, {pointer: symbols_default_pointer, id: symbols_default_id, titles: symbols_default_titles, slug: symbols_default_slug, meta: symbols_default_meta, parent: symbols_default_parent} = symbols_default;

import i18nModule from 'es2015-i18n-tag';

const {default: i18n} = i18nModule;

function gentitle(titles, schemaType) {
  if (!Array.isArray(titles)) return i18n`Untitled schema`;
  const [firstTitle] = titles;
  if (titles.length === 1 && firstTitle !== undefined) return firstTitle;
  const lastTitle = titles[titles.length - 1];
  if (lastTitle) return lastTitle;
  if (typeof schemaType === 'string') return i18n`Untitled ${schemaType} in ${String(firstTitle)}`;
  return firstTitle === undefined ? i18n`Untitled schema` : i18n`Untitled undefined type in ${firstTitle}`;
}

const used = new Set();

function keyword(parts) {
  used.add(parts[0]);
  return parts.join('');
}

import { map, list as toArray, flat, filter, size, foldl } from 'ferrum';

import { root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list, listItem, strong, blockquote } from 'mdast-builder';

import i18nModule2 from 'es2015-i18n-tag';

import GithubSlugger from 'github-slugger';

import yaml from 'js-yaml';

const {default: i18n2} = i18nModule2;

function build({header, links = {}, includeProperties = [], rewritelinks = linkValue => linkValue, exampleFormat = 'json', skipProperties = [], singleFile = false} = {}) {
  const skippedSections = singleFile ? [ ...new Set([ ...skipProperties, 'definedinfact' ]) ] : skipProperties;
  function schemaLink(url, linkTitle, children) {
    return singleFile ? children : link(url, linkTitle, children);
  }
  const formats = {
    'date-time': {
      label: i18n2`date time`,
      text: i18n2`the string must be a date time string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    date: {
      label: i18n2`date`,
      text: i18n2`the string must be a date string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    time: {
      label: i18n2`time`,
      text: i18n2`the string must be a time string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    duration: {
      label: i18n2`duration`,
      text: i18n2`the string must be a duration string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    email: {
      label: i18n2`email`,
      text: i18n2`the string must be an email address, according to `,
      specname: 'RFC 5322, section 3.4.1',
      speclink: 'https://tools.ietf.org/html/rfc5322'
    },
    'idn-email': {
      label: i18n2`(international) email`,
      text: i18n2`the string must be an (international) email address, according to `,
      specname: 'RFC 6531',
      speclink: 'https://tools.ietf.org/html/rfc6531'
    },
    hostname: {
      label: i18n2`hostname`,
      text: i18n2`the string must be a hostname, according to `,
      specname: 'RFC 1123, section 2.1',
      speclink: 'https://tools.ietf.org/html/rfc1123'
    },
    'idn-hostname': {
      label: i18n2`(international) hostname`,
      text: i18n2`the string must be an (IDN) hostname, according to `,
      specname: 'RFC 5890, section 2.3.2.3',
      speclink: 'https://tools.ietf.org/html/rfc5890'
    },
    ipv4: {
      label: i18n2`IPv4`,
      text: i18n2`the string must be an IPv4 address (dotted quad), according to `,
      specname: 'RFC 2673, section 3.2',
      speclink: 'https://tools.ietf.org/html/rfc2673'
    },
    ipv6: {
      label: i18n2`IPv6`,
      text: i18n2`the string must be an IPv6 address, according to `,
      specname: 'RFC 4291, section 2.2',
      speclink: 'https://tools.ietf.org/html/rfc4291'
    },
    uri: {
      label: i18n2`URI`,
      text: i18n2`the string must be a URI, according to `,
      specname: 'RFC 3986',
      speclink: 'https://tools.ietf.org/html/rfc3986'
    },
    iri: {
      label: i18n2`IRI`,
      text: i18n2`the string must be a IRI, according to `,
      specname: 'RFC 3987',
      speclink: 'https://tools.ietf.org/html/rfc3987'
    },
    'uri-reference': {
      label: i18n2`URI reference`,
      text: i18n2`the string must be a URI reference, according to `,
      specname: 'RFC 3986',
      speclink: 'https://tools.ietf.org/html/rfc3986'
    },
    'iri-reference': {
      label: i18n2`IRI reference`,
      text: i18n2`the string must be a IRI reference, according to `,
      specname: 'RFC 3987',
      speclink: 'https://tools.ietf.org/html/rfc3987'
    },
    uuid: {
      label: i18n2`UUID`,
      text: i18n2`the string must be a UUID, according to `,
      specname: 'RFC 4122',
      speclink: 'https://tools.ietf.org/html/rfc4122'
    },
    'json-pointer': {
      label: i18n2`JSON Pointer`,
      text: i18n2`the string must be a JSON Pointer, according to `,
      specname: 'RFC 6901, section 5',
      speclink: 'https://tools.ietf.org/html/rfc6901'
    },
    'relative-json-pointer': {
      label: i18n2`Relative JSON Pointer`,
      text: i18n2`the string must be a relative JSON Pointer, according to `,
      specname: 'draft-handrews-relative-json-pointer-01',
      speclink: 'https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01'
    },
    regex: {
      label: i18n2`RegEx`,
      text: i18n2`the string must be a regular expression, according to `,
      specname: 'ECMA-262',
      speclink: 'http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf'
    },
    'uri-template': {
      label: i18n2`URI Template`,
      text: i18n2`the string must be a URI template, according to `,
      specname: 'RFC 6570',
      speclink: 'https://tools.ietf.org/html/rfc6570'
    }
  }, metadataColumns = [ {
    name: 'abstract',
    title: i18n2`Abstract`,
    truelabel: i18n2`Cannot be instantiated`,
    falselabel: i18n2`Can be instantiated`,
    undefinedlabel: i18n2`Unknown abstraction`
  }, {
    name: 'extensible',
    title: i18n2`Extensible`,
    truelabel: i18n2`Yes`,
    falselabel: i18n2`No`,
    undefinedlabel: i18n2`Unknown extensibility`
  }, {
    name: 'status',
    title: i18n2`Status`,
    undefinedlabel: 'Unknown status',
    deprecatedlabel: i18n2`Deprecated`,
    stablelabel: i18n2`Stable`,
    stabilizinglabel: i18n2`Stabilizing`,
    experimentallabel: i18n2`Experimental`
  }, {
    name: 'identifiable',
    title: i18n2`Identifiable`,
    truelabel: i18n2`Yes`,
    falselabel: i18n2`No`,
    undefinedlabel: i18n2`Unknown identifiability`
  }, {
    name: 'custom',
    title: i18n2`Custom Properties`,
    truelabel: i18n2`Allowed`,
    falselabel: i18n2`Forbidden`,
    undefinedlabel: i18n2`Unknown custom properties`
  }, {
    name: 'additional',
    title: i18n2`Additional Properties`,
    truelabel: i18n2`Allowed`,
    falselabel: i18n2`Forbidden`,
    undefinedlabel: i18n2`Unknown additional properties`
  }, {
    name: 'restrictions',
    title: i18n2`Access Restrictions`,
    readOnlylabel: i18n2`Read only`,
    writeOnlylabel: i18n2`Write only`,
    secretlabel: i18n2`cannot be read or written`,
    undefinedlabel: i18n2`none`
  }, {
    name: 'definedin',
    title: i18n2`Defined In`,
    undefinedlabel: i18n2`Unknown definition`
  } ];
  function buildComment(schema) {
  return schema[keyword`$comment`] ? [blockquote(schema[symbols_default_meta].longcomment)] : [];
}
  function buildSchemaOverview(schema) {
  if (!header) return [];
  const titleRow = tableRow(toArray(map(metadataColumns, ({name, title}) => tableCell(
    links[name] ? link(links[name], i18n2`What does ${title} mean?`, text(title)) : text(title)
  )), Array));
  const valueRow = tableRow(toArray(map(metadataColumns, column => {
    const value = schema[symbols_default_meta]?.[column.name];
    if (typeof value === 'object' && value.link && value.text) {
      return tableCell(link(rewritelinks(value.link), i18n2`open original schema`, [text(value.text)]));
    }
    return tableCell(text(column[String(value) + 'label'] || i18n2`Unknown`));
  }), Array));
  return [
    heading(1, text(i18n2`${gentitle(schema[symbols_default_titles], schema[keyword`type`])} Schema`)),
    paragraph(code('txt', schema[symbols_default_id] + (schema[symbols_default_pointer] ? '#' + schema[symbols_default_pointer] : ''))),
    schema[symbols_default_meta].longdescription,
    ...buildComment(schema),
    table('left', [titleRow, valueRow]),
  ];
}
  function formatType(schema) {
  if (!Array.isArray(schema[keyword`type`]) && typeof schema[keyword`type`] === 'object') return text(i18n2`Unknown Type`);
  const schemaTypes = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
  const nonNullTypes = toArray(filter(schemaTypes, type => type !== 'null' && type !== undefined));
  if (schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]) return text(i18n2`Merged`);
  if (size(nonNullTypes) === 0) return text(i18n2`Not specified`);
  if (size(nonNullTypes) === 1) return inlineCode(nonNullTypes[0]);
  return text(i18n2`Multiple`);
}
  function formatNullable(schema) {
  const schemaTypes = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
  return text(schemaTypes.includes(keyword`null`) ? i18n2`can be null` : i18n2`cannot be null`);
}
  function buildPropertyTable(requiredProperties = [], isPattern = false, slugger) {
  return ([propertyName, propertySchema]) => {
    const propertyLabel = isPattern
      ? inlineCode(propertyName)
      : link('#' + slugger.slug(propertyName), '', text(propertyName));
    const cells = [
      tableCell(propertyLabel),
      tableCell(formatType(propertySchema)),
      tableCell(text(requiredProperties.includes(propertyName) ? i18n2`Required` : i18n2`Optional`)),
      tableCell(formatNullable(propertySchema)),
    ];
    if (!singleFile) {
      const title = propertySchema[symbols_default_titles]?.[0] || i18n2`Untitled schema`;
      cells.push(tableCell(schemaLink(
        propertySchema[symbols_default_slug] + '.md',
        propertySchema[symbols_default_id] + '#' + propertySchema[symbols_default_pointer],
        text(title),
      )));
    }
    return tableRow(cells);
  };
}
  function buildPropertiesTable(properties = {}, patternProperties = {}, additionalProperties, requiredProperties, slugger) {
  if (skippedSections.includes('proptable')) return paragraph();

  const propertyRows = Object.entries(properties).map(buildPropertyTable(requiredProperties, false, slugger));
  const patternRows = Object.entries(patternProperties).map(buildPropertyTable(requiredProperties, true, slugger));
  const additionalRows = [];
  if (additionalProperties) {
    const allowsAnyAdditional = additionalProperties === true;
    const cells = [
      tableCell(text(i18n2`Additional Properties`)),
      tableCell(allowsAnyAdditional ? text('Any') : formatType(additionalProperties)),
      tableCell(text(i18n2`Optional`)),
      tableCell(allowsAnyAdditional ? text('can be null') : formatNullable(additionalProperties)),
    ];
    if (!singleFile) {
      const definition = allowsAnyAdditional
        ? text('')
        : schemaLink(
          additionalProperties[symbols_default_slug] + '.md',
          additionalProperties[symbols_default_id] + '#' + additionalProperties[symbols_default_pointer],
          text(additionalProperties[symbols_default_titles][0] || i18n2`Untitled schema`),
        );
      cells.push(tableCell(definition));
    }
    additionalRows.push(tableRow(cells));
  }

  const headerCells = [
    tableCell(text(i18n2`Property`)),
    tableCell(text(i18n2`Type`)),
    tableCell(text(i18n2`Required`)),
    tableCell(text(i18n2`Nullable`)),
  ];
  if (!singleFile) headerCells.push(tableCell(text(i18n2`Defined by`)));
  return table('left', [tableRow(headerCells), ...propertyRows, ...patternRows, ...additionalRows]);
}
  function buildSchemaDocument(schema, typeSuffix = '') {
  const schemaTypes = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
  const nonNullTypes = schemaTypes.filter(type => type !== keyword`null`);
  const allowsNull = schemaTypes.some(type => type === keyword`null`);
  const hasSingleType = nonNullTypes.length <= 1;
  const [schemaType] = nonNullTypes;
  const isNullOnly = allowsNull && nonNullTypes.length === 0;
  const isArray = schemaType === keyword`array`;
  const isComposition = Boolean(schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]);

  if (isArray && Array.isArray(schema[keyword`items`])) {
    if (skippedSections.includes('arrayfact')) return '';
    const itemSchemas = schema[keyword`items`];
    const additionalItems = schema[keyword`additionalItems`];
    const itemNodes = itemSchemas.map(itemSchema => listItem(paragraph(schemaLink(
      itemSchema[symbols_default_slug] + '.md',
      i18n2`check type definition`,
      text(gentitle(itemSchema[symbols_default_titles], itemSchema[keyword`type`])),
    ))));
    if (additionalItems === true) {
      itemNodes.push(listItem(paragraph(text(i18n2`and all following items may follow any schema`))));
    } else if (typeof additionalItems === 'object') {
      itemNodes.push(listItem(paragraph([
        text(i18n2`and all following items must follow the schema: `),
        schemaLink(
          additionalItems[symbols_default_slug] + '.md',
          i18n2`check type definition`,
          text(gentitle(additionalItems[symbols_default_titles], additionalItems[keyword`type`])),
        ),
      ])));
    }
    return listItem([
      paragraph([text(i18n2`Type: `), text(i18n2`an array where each item follows the corresponding schema in the following list:`)]),
      list('ordered', itemNodes),
    ]);
  }
  if (isArray && schema[keyword`items`]) return buildSchemaDocument(schema[keyword`items`], typeSuffix + '[]');

  let typeDescription;
  if (isNullOnly) {
    typeDescription = [inlineCode('null' + typeSuffix), text(i18n2`, the value must be null`)];
  } else if (hasSingleType && schemaType && typeof schemaType === 'string') {
    typeDescription = [inlineCode(schemaType + typeSuffix)];
  } else if (hasSingleType) {
    typeDescription = isComposition
      ? [text(typeSuffix ? 'an array of merged types' : i18n2`merged type`)]
      : [text(i18n2`unknown` + typeSuffix)];
  } else {
    typeDescription = [
      text(typeSuffix ? i18n2`an array of the following:` : i18n2`any of the following: `),
      ...toArray(flat(nonNullTypes.map((type, index) => [
        inlineCode(type || i18n2`not defined`),
        text(index === nonNullTypes.length - 1 ? '' : i18n2` or `),
      ]))),
    ];
  }

  let detailsLink = [];
  if (schema[keyword`title`] && typeof schema[keyword`title`] === 'string') {
    detailsLink = [text(' ('), schemaLink(schema[symbols_default_slug] + '.md', '', text(schema[keyword`title`])), text(')')];
  } else if ((!hasSingleType || schemaType === keyword`object` || isComposition) && !singleFile) {
    detailsLink = [text(' ('), link(schema[symbols_default_slug] + '.md', '', text(i18n2`Details`)), text(')')];
  }
  return listItem(paragraph([text(i18n2`Type: `), ...typeDescription, ...detailsLink]));
}
  function buildDefinitionLink(propertyName, propertySchema, requiredProperties = []) {
  const facts = [listItem(text(requiredProperties.includes(propertyName) ? i18n2`is required` : i18n2`is optional`))];
  if (!skippedSections.includes('typefact')) facts.push(buildSchemaDocument(propertySchema));
  if (!skippedSections.includes('nullablefact')) {
    const types = Array.isArray(propertySchema[keyword`type`]) ? propertySchema[keyword`type`] : [propertySchema[keyword`type`]];
    facts.push(listItem(paragraph(text(types.includes(keyword`null`) ? i18n2`can be null` : i18n2`cannot be null`))));
  }
  if (!skippedSections.includes('definedinfact')) {
    const title = propertySchema[symbols_default_titles]?.[0] || i18n2`Untitled schema`;
    facts.push(listItem(paragraph([
      text(i18n2`defined in: `),
      schemaLink(
        propertySchema[symbols_default_slug] + '.md',
        propertySchema[symbols_default_id] + '#' + propertySchema[symbols_default_pointer],
        text(title),
      ),
    ])));
  }
  for (const property of includeProperties) {
    if (propertySchema[property]) facts.push(listItem(text(property + ': ' + String(propertySchema[property]))));
  }
  return list('unordered', facts);
}
  function schemaTitle(schema) {
  return schema[symbols_default_parent]
    ? schema[symbols_default_pointer].split('/').pop()
    : gentitle(schema[symbols_default_titles], schema[keyword`type`]);
}
  function buildComposition(schema, depth = 0, maxDepth = 3) {
  if (schema[keyword`oneOf`] && depth <= maxDepth) {
    return [paragraph(text(i18n2`one (and only one) of`)), list('unordered', schema[keyword`oneOf`].map(subschema => listItem(buildComposition(subschema, depth + 1))))];
  }
  if (schema[keyword`anyOf`] && depth <= maxDepth) {
    return [paragraph(text(i18n2`any of`)), list('unordered', schema[keyword`anyOf`].map(subschema => listItem(buildComposition(subschema, depth + 1))))];
  }
  if (schema[keyword`allOf`] && depth <= maxDepth) {
    return [paragraph(text(i18n2`all of`)), list('unordered', schema[keyword`allOf`].map(subschema => listItem(buildComposition(subschema, depth + 1))))];
  }
  if (schema[keyword`not`] && depth <= maxDepth) {
    return [paragraph(text(i18n2`not`)), list('unordered', [listItem(buildComposition(schema[keyword`not`], depth + 1))])];
  }
  return depth > 0
    ? [schemaLink(schema[symbols_default_slug] + '.md', i18n2`check type definition`, text(gentitle(schema[symbols_default_titles], schema[keyword`type`])))]
    : [];
}
  function buildTypeSection(schema, headingDepth = 1) {
  if (skippedSections.includes('typesection')) return '';
  const {children: typeNodes} = buildSchemaDocument(schema);
  typeNodes[0].children.shift();
  return [heading(headingDepth + 1, text(i18n2`${schemaTitle(schema)} Type`)), ...typeNodes, ...buildComposition(schema)];
}
  function buildConstraintsSection(schema, headingDepth = 1) {
  const constraints = [];
  const addValueConstraint = (key, label, description) => {
    if (schema[keyword([key])] !== undefined) {
      constraints.push(paragraph([
        strong(text(label)), text(': '), text(description), inlineCode(String(schema[keyword([key])])),
      ]));
    }
  };

  if (schema[keyword`const`] !== undefined) {
    constraints.push(paragraph([strong(text(i18n2`constant`)), text(': '), text(i18n2`the value of this property must be equal to:`)]));
    constraints.push(code('json', JSON.stringify(schema[keyword`const`], undefined, 2)));
  }
  if (schema[keyword`enum`]) {
    const enumDescriptions = schema[keyword`meta:enum`] || {};
    constraints.push(paragraph([strong(text(i18n2`enum`)), text(': '), text(i18n2`the value of this property must be equal to one of the following values:`)]));
    const rows = Array.isArray(schema[keyword`enum`]) ? schema[keyword`enum`].map(enumValue => tableRow([
      tableCell(inlineCode(JSON.stringify(enumValue))),
      tableCell(text(enumDescriptions[Array.isArray(enumValue) ? JSON.stringify(enumValue) : enumValue] || '')),
    ])) : [];
    constraints.push(table('left', [tableRow([tableCell(text(i18n2`Value`)), tableCell(text(i18n2`Explanation`))]), ...rows]));
  }
  if (typeof schema[keyword`multipleOf`] === 'number') addValueConstraint('multipleOf', i18n2`multiple of`, i18n2`the value of this number must be a multiple of: `);
  if (typeof schema[keyword`maximum`] === 'number') addValueConstraint('maximum', i18n2`maximum`, i18n2`the value of this number must smaller than or equal to: `);
  if (typeof schema[keyword`exclusiveMaximum`] === 'number') addValueConstraint('exclusiveMaximum', i18n2`maximum (exclusive)`, i18n2`the value of this number must be smaller than: `);
  if (typeof schema[keyword`minimum`] === 'number') addValueConstraint('minimum', i18n2`minimum`, i18n2`the value of this number must greater than or equal to: `);
  if (typeof schema[keyword`exclusiveMinimum`] === 'number') addValueConstraint('exclusiveMinimum', i18n2`minimum (exclusive)`, i18n2`the value of this number must be greater than: `);
  if (typeof schema[keyword`maxLength`] === 'number') addValueConstraint('maxLength', i18n2`maximum length`, i18n2`the maximum number of characters for this string is: `);
  if (typeof schema[keyword`minLength`] === 'number') addValueConstraint('minLength', i18n2`minimum length`, i18n2`the minimum number of characters for this string is: `);

  if (schema[keyword`pattern`]) {
    constraints.push(paragraph([strong(text(i18n2`pattern`)), text(': '), text(i18n2`the string must match the following regular expression: `)]));
    constraints.push(code('regexp', schema[keyword`pattern`]));
    constraints.push(paragraph([link('https://regexr.com/?expression=' + encodeURIComponent(schema[keyword`pattern`]), i18n2`try regular expression with regexr.com`, text(i18n2`try pattern`))]));
  }
  if (schema.format && typeof schema.format === 'string') {
    const format = formats[keyword([schema.format])];
    constraints.push(format
      ? paragraph([strong(text(format.label)), text(': '), text(format.text), link(format.speclink, i18n2`check the specification`, text(format.specname))])
      : paragraph([strong(text(i18n2`unknown format`)), text(': '), text(i18n2`the value of this string must follow the format: `), inlineCode(String(schema.format))]));
  }
  if (schema[keyword`contentEncoding`]) constraints.push(paragraph([strong(text(i18n2`encoding`)), text(': '), text(i18n2`the string content must be using the ${schema[keyword`contentEncoding`]} content encoding.`)]));
  if (schema[keyword`contentMediaType`]) constraints.push(paragraph([strong(text(i18n2`media type`)), text(': '), text(i18n2`the media type of the contents of this string is: `), inlineCode(String(schema[keyword`contentMediaType`]))]));
  if (schema[keyword`contentSchema`]) {
    const contentSchema = schema[keyword`contentSchema`];
    constraints.push(paragraph([strong(text(i18n2`schema`)), text(': '), text(i18n2`the contents of this string should follow this schema: `), schemaLink(contentSchema[symbols_default_slug] + '.md', i18n2`check type definition`, text(gentitle(contentSchema[symbols_default_titles], contentSchema[keyword`type`])))]));
  }
  addValueConstraint('maxItems', i18n2`maximum number of items`, i18n2`the maximum number of items for this array is: `);
  addValueConstraint('minItems', i18n2`minimum number of items`, i18n2`the minimum number of items for this array is: `);
  if (schema[keyword`uniqueItems`]) constraints.push(paragraph([strong(text(i18n2`unique items`)), text(': '), text(i18n2`all items in this array must be unique. Duplicates are not allowed.`)]));
  if (schema[keyword`minContains`] !== undefined && schema[keyword`contains`]) {
    const contains = schema[keyword`contains`];
    constraints.push(paragraph([strong(text(i18n2`minimum number of contained items`)), text(': '), text(i18n2`this array may not contain fewer than ${String(schema[keyword`minContains`])} items that validate against the schema:` + ' '), schemaLink(contains[symbols_default_slug] + '.md', i18n2`check type definition`, text(gentitle(contains[symbols_default_titles], contains[keyword`type`])))]));
  }
  if (schema[keyword`maxContains`] !== undefined && schema[keyword`contains`]) {
    const contains = schema[keyword`contains`];
    constraints.push(paragraph([strong(text(i18n2`maximum number of contained items`)), text(': '), text(i18n2`this array may not contain more than ${String(schema[keyword`maxContains`])} items that validate against the schema:` + ' '), schemaLink(contains[symbols_default_slug] + '.md', i18n2`check type definition`, text(gentitle(contains[symbols_default_titles], contains[keyword`type`])))]));
  }
  addValueConstraint('maxProperties', i18n2`maximum number of properties`, i18n2`the maximum number of properties for this object is: `);
  addValueConstraint('minProperties', i18n2`minimum number of properties`, i18n2`the minimum number of properties for this object is: `);

  return constraints.length ? [heading(headingDepth + 1, text(i18n2`${schemaTitle(schema)} Constraints`)), ...constraints] : [];
}
  function buildExamplesSection(schema, headingDepth = 1) {
  const examples = schema[keyword`examples`];
  if (!examples?.length) return [];
  if (exampleFormat === 'yaml') {
    return [heading(headingDepth + 1, text(i18n2`${schemaTitle(schema)} Examples`)), ...examples.map(example => paragraph(code('yaml', yaml.dump(example, undefined, 2))))];
  }
  if (exampleFormat === 'json') {
    return [heading(headingDepth + 1, text(i18n2`${schemaTitle(schema)} Examples`)), ...examples.map(example => paragraph(code('json', JSON.stringify(example, undefined, 2))))];
  }
  return [];
}
  function buildDefaultSection(schema, headingDepth = 1) {
  if (schema[keyword`default`] === undefined) return [];
  return [
    heading(headingDepth + 1, text(i18n2`${schemaTitle(schema)} Default Value`)),
    paragraph(text(i18n2`The default value is:`)),
    paragraph(code('json', JSON.stringify(schema[keyword`default`], undefined, 2))),
  ];
}
  function buildAccessSection(schema, headingDepth = 1) {
  const title = heading(headingDepth + 1, text(i18n2`${schemaTitle(schema)} Access Restrictions`));
  if (schema[keyword`readOnly`] && schema[keyword`writeOnly`]) {
    return [title, paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`))];
  }
  if (schema[keyword`readOnly`]) {
    return [title, paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`))];
  }
  if (schema[keyword`writeOnly`]) {
    return [title, paragraph(text(i18n2`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`))];
  }
  return [];
}
  function buildPropertySections(properties = {}, patternProperties = {}, additionalProperties, requiredProperties, headingDepth = 2) {
  const buildSection = (name, schema, title) => {
    const description = schema[symbols_default_meta]?.longdescription || paragraph(text(i18n2`no description`));
    return [
      heading(headingDepth + 1, title),
      description,
      ...buildComment(schema),
      paragraph(inlineCode(name)),
      buildDefinitionLink(name, schema, requiredProperties),
      ...buildTypeSection(schema, headingDepth + 1),
      ...buildConstraintsSection(schema, headingDepth + 1),
      ...buildDefaultSection(schema, headingDepth + 1),
      ...buildExamplesSection(schema, headingDepth + 1),
      ...buildAccessSection(schema, headingDepth + 1),
    ];
  };

  const sections = toArray(flat(Object.entries(properties || {}).map(([name, schema]) => buildSection(name, schema, text(name)))));
  sections.push(...toArray(flat(Object.entries(patternProperties || {}).map(([pattern, schema]) => buildSection(pattern, schema, [text(i18n2`Pattern: `), inlineCode(pattern)])))));
  if (typeof additionalProperties === 'object') {
    const description = additionalProperties[symbols_default_meta].longdescription || paragraph(text(i18n2`no description`));
    sections.push(
      heading(headingDepth + 1, text(i18n2`Additional Properties`)),
      paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)),
      description,
      ...buildComment(additionalProperties),
      buildDefinitionLink(i18n2`Additional properties`, additionalProperties, requiredProperties),
      ...buildTypeSection(additionalProperties, headingDepth + 1),
      ...buildConstraintsSection(additionalProperties, headingDepth + 1),
      ...buildDefaultSection(additionalProperties, headingDepth + 1),
      ...buildExamplesSection(additionalProperties, headingDepth + 1),
      ...buildAccessSection(additionalProperties, headingDepth + 1),
    );
  } else if (additionalProperties === true) {
    sections.push(
      heading(headingDepth + 1, text(i18n2`Additional Properties`)),
      paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`)),
    );
  }
  return sections;
}
  function buildDefinitionsSection(schema, slugger) {
  if (!schema.definitions && !schema[keyword`$defs`]) return [];
  const definitions = [...Object.entries(schema[keyword`$defs`] || {}), ...Object.entries(schema.definitions || {})];
  const definitionSections = definitions.map(([definitionName, definitionSchema]) => {
    const propertiesTable = buildPropertiesTable(
      definitionSchema[keyword`properties`],
      definitionSchema[keyword`patternProperties`],
      definitionSchema[keyword`additionalProperties`],
      definitionSchema[keyword`required`],
      slugger,
    );
    const reference = {$ref: definitionSchema[symbols_default_id] + '#' + definitionSchema[symbols_default_pointer]};
    return [
      heading(2, text(i18n2`Definitions group ${definitionName}`)),
      paragraph(text(i18n2`Reference this group by using`)),
      code('json', JSON.stringify(reference)),
      propertiesTable,
      ...buildPropertySections(
        definitionSchema[keyword`properties`],
        definitionSchema[keyword`patternProperties`],
        definitionSchema[keyword`additionalProperties`],
        definitionSchema[keyword`required`],
        2,
      ),
    ];
  });
  return [heading(1, text(i18n2`${gentitle(schema[symbols_default_titles], schema[keyword`type`])} Definitions`)), ...toArray(flat(definitionSections))];
}
  console.log('generating markdown');
  return schemas => foldl(schemas, {}, (documents, schema) => {
    const slugger = new GithubSlugger();
    const propertySections = schema[keyword`properties`] || schema[keyword`patternProperties`] || schema[keyword`additionalProperties`]
      ? [
        heading(1, text(i18n2`${schemaTitle(schema)} Properties`)),
        buildPropertiesTable(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], slugger),
        ...buildPropertySections(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], 1),
      ]
      : [];
    documents[schema[symbols_default_slug]] = root([
      ...buildSchemaOverview(schema),
      ...buildTypeSection(schema, 1),
      ...buildConstraintsSection(schema, 1),
      ...buildDefaultSection(schema, 1),
      ...buildExamplesSection(schema, 1),
      ...propertySections,
      ...buildDefinitionsSection(schema, slugger),
    ]);
    return documents;
  });
}

export { build as default };
