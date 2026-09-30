import i18nModule from 'es2015-i18n-tag';
import {
  map as mapIterable,
  list as toArray,
  flat as flattenIterable,
  filter as filterIterable,
  size as iterableSize,
  foldl as foldLeft,
} from 'ferrum';
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
} from 'mdast-builder';
import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';

const { default: i18n } = i18nModule;

const symbols = {
  pointer: Symbol('pointer'),
  id: Symbol('id'),
  titles: Symbol('titles'),
  slug: Symbol('slug'),
  meta: Symbol('meta'),
  parent: Symbol('parent'),
};

function getSchemaTitle(titles, type) {
  if (!Array.isArray(titles)) {
    return i18n`Untitled schema`;
  }

  const [firstTitle] = titles;
  const lastTitle = [...titles].pop();
  if (titles.length === 1 && firstTitle !== undefined) {
    return firstTitle;
  }
  if (lastTitle) {
    return lastTitle;
  }
  if (typeof type === 'string') {
    return i18n`Untitled ${type} in ${String(firstTitle)}`;
  }
  if (firstTitle === undefined) {
    return i18n`Untitled schema`;
  }
  return i18n`Untitled undefined type in ${firstTitle}`;
}

function build({
  header: includeHeader,
  links = {},
  includeProperties = [],
  rewritelinks: rewriteLinks = (url) => url,
  exampleFormat = 'json',
  skipProperties: skippedSections = [],
  singleFile = false,
} = {}) {
  const effectiveSkippedSections = singleFile
    ? [...new Set([...skippedSections, 'definedinfact'])]
    : skippedSections;

  function renderLink(url, title, children) {
    return singleFile ? children : link(url, title, children);
  }
  const knownFormats = {
    'date-time': {
      label: i18n`date time`,
      text: i18n`the string must be a date time string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    date: {
      label: i18n`date`,
      text: i18n`the string must be a date string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    time: {
      label: i18n`time`,
      text: i18n`the string must be a time string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    duration: {
      label: i18n`duration`,
      text: i18n`the string must be a duration string, according to `,
      specname: 'RFC 3339, section 5.6',
      speclink: 'https://tools.ietf.org/html/rfc3339'
    },
    email: {
      label: i18n`email`,
      text: i18n`the string must be an email address, according to `,
      specname: 'RFC 5322, section 3.4.1',
      speclink: 'https://tools.ietf.org/html/rfc5322'
    },
    'idn-email': {
      label: i18n`(international) email`,
      text: i18n`the string must be an (international) email address, according to `,
      specname: 'RFC 6531',
      speclink: 'https://tools.ietf.org/html/rfc6531'
    },
    hostname: {
      label: i18n`hostname`,
      text: i18n`the string must be a hostname, according to `,
      specname: 'RFC 1123, section 2.1',
      speclink: 'https://tools.ietf.org/html/rfc1123'
    },
    'idn-hostname': {
      label: i18n`(international) hostname`,
      text: i18n`the string must be an (IDN) hostname, according to `,
      specname: 'RFC 5890, section 2.3.2.3',
      speclink: 'https://tools.ietf.org/html/rfc5890'
    },
    ipv4: {
      label: i18n`IPv4`,
      text: i18n`the string must be an IPv4 address (dotted quad), according to `,
      specname: 'RFC 2673, section 3.2',
      speclink: 'https://tools.ietf.org/html/rfc2673'
    },
    ipv6: {
      label: i18n`IPv6`,
      text: i18n`the string must be an IPv6 address, according to `,
      specname: 'RFC 4291, section 2.2',
      speclink: 'https://tools.ietf.org/html/rfc4291'
    },
    uri: {
      label: i18n`URI`,
      text: i18n`the string must be a URI, according to `,
      specname: 'RFC 3986',
      speclink: 'https://tools.ietf.org/html/rfc3986'
    },
    iri: {
      label: i18n`IRI`,
      text: i18n`the string must be a IRI, according to `,
      specname: 'RFC 3987',
      speclink: 'https://tools.ietf.org/html/rfc3987'
    },
    'uri-reference': {
      label: i18n`URI reference`,
      text: i18n`the string must be a URI reference, according to `,
      specname: 'RFC 3986',
      speclink: 'https://tools.ietf.org/html/rfc3986'
    },
    'iri-reference': {
      label: i18n`IRI reference`,
      text: i18n`the string must be a IRI reference, according to `,
      specname: 'RFC 3987',
      speclink: 'https://tools.ietf.org/html/rfc3987'
    },
    uuid: {
      label: i18n`UUID`,
      text: i18n`the string must be a UUID, according to `,
      specname: 'RFC 4122',
      speclink: 'https://tools.ietf.org/html/rfc4122'
    },
    'json-pointer': {
      label: i18n`JSON Pointer`,
      text: i18n`the string must be a JSON Pointer, according to `,
      specname: 'RFC 6901, section 5',
      speclink: 'https://tools.ietf.org/html/rfc6901'
    },
    'relative-json-pointer': {
      label: i18n`Relative JSON Pointer`,
      text: i18n`the string must be a relative JSON Pointer, according to `,
      specname: 'draft-handrews-relative-json-pointer-01',
      speclink: 'https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01'
    },
    regex: {
      label: i18n`RegEx`,
      text: i18n`the string must be a regular expression, according to `,
      specname: 'ECMA-262',
      speclink: 'http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf'
    },
    'uri-template': {
      label: i18n`URI Template`,
      text: i18n`the string must be a URI template, according to `,
      specname: 'RFC 6570',
      speclink: 'https://tools.ietf.org/html/rfc6570'
    }
  };
  const metadataFields = [
    {
      name: 'abstract',
      title: i18n`Abstract`,
      truelabel: i18n`Cannot be instantiated`,
      falselabel: i18n`Can be instantiated`,
      undefinedlabel: i18n`Unknown abstraction`,
    },
    {
      name: 'extensible',
      title: i18n`Extensible`,
      undefinedlable: i18n`Unknown extensibility`,
      truelabel: i18n`Yes`,
      falselabel: i18n`No`,
    },
    {
      name: 'status',
      title: i18n`Status`,
      undefinedlabel: 'Unknown status',
      deprecatedlabel: i18n`Deprecated`,
      stablelabel: i18n`Stable`,
      stabilizinglabel: i18n`Stabilizing`,
      experimentallabel: i18n`Experimental`,
    },
    {
      name: 'identifiable',
      title: i18n`Identifiable`,
      truelabel: i18n`Yes`,
      falselabel: i18n`No`,
      undefinedlabel: i18n`Unknown identifiability`,
    },
    {
      name: 'custom',
      title: i18n`Custom Properties`,
      truelabel: i18n`Allowed`,
      falselabel: i18n`Forbidden`,
      undefinedlabel: i18n`Unknown custom properties`,
    },
    {
      name: 'additional',
      title: i18n`Additional Properties`,
      truelabel: i18n`Allowed`,
      falselabel: i18n`Forbidden`,
      undefinedlabel: i18n`Unknown additional properties`,
    },
    {
      name: 'restrictions',
      title: i18n`Access Restrictions`,
      readOnlylabel: i18n`Read only`,
      writeOnlylabel: i18n`Write only`,
      secretlabel: i18n`cannot be read or written`,
      undefinedlabel: i18n`none`,
    },
    {
      name: 'definedin',
      title: i18n`Defined In`,
      undefinedlabel: i18n`Unknown definition`,
    },
  ];

  function renderComment(schema) {
    return schema.$comment ? [blockquote(schema[symbols.meta].longcomment)] : [];
  }

  function renderSchemaHeader(schema) {
    if (!includeHeader) {
      return [];
    }

    const metadata = schema[symbols.meta];
    const headerCells = toArray(mapIterable(metadataFields, ({ name, title }) => {
      const label = links[name]
        ? link(links[name], i18n`What does ${title} mean?`, text(title))
        : text(title);
      return tableCell(label);
    }), Array);
    const valueCells = toArray(mapIterable(metadataFields, (field) => {
      const value = metadata && metadata[field.name];
      if (typeof value === 'object' && value.link && value.text) {
        return tableCell(link(
          rewriteLinks(value.link),
          i18n`open original schema`,
          [text(value.text)],
        ));
      }
      return tableCell(text(field[`${String(value)}label`] || i18n`Unknown`));
    }), Array);

    const schemaLocation = schema[symbols.id]
      + (schema[symbols.pointer] ? `#${schema[symbols.pointer]}` : '');
    return [
      heading(1, text(i18n`${getSchemaTitle(schema[symbols.titles], schema.type)} Schema`)),
      paragraph(code('txt', schemaLocation)),
      metadata.longdescription,
      ...renderComment(schema),
      table('left', [tableRow(headerCells), tableRow(valueCells)]),
    ];
  }

  function renderTypeLabel(schema) {
    if (!Array.isArray(schema.type) && typeof schema.type === 'object') {
      return text(i18n`Unknown Type`);
    }

    const declaredTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const nonNullTypes = toArray(filterIterable(
      declaredTypes,
      (type) => type !== 'null' && type !== undefined,
    ));
    if (schema.allOf || schema.anyOf || schema.oneOf || schema.not) {
      return text(i18n`Merged`);
    }
    if (iterableSize(nonNullTypes) === 0) {
      return text(i18n`Not specified`);
    }
    if (iterableSize(nonNullTypes) === 1) {
      return inlineCode(nonNullTypes[0]);
    }
    return text(i18n`Multiple`);
  }

  function renderNullableLabel(schema) {
    const declaredTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const allowsNull = declaredTypes.some((type) => type === 'null');
    return text(allowsNull ? i18n`can be null` : i18n`cannot be null`);
  }

  function makePropertyRow(requiredProperties = [], isPatternProperty = false, slugger) {
    return ([propertyName, propertySchema]) => {
      const propertyLabel = isPatternProperty
        ? inlineCode(propertyName)
        : link(`#${slugger.slug(propertyName)}`, '', text(propertyName));
      const cells = [
        tableCell(propertyLabel),
        tableCell(renderTypeLabel(propertySchema)),
        tableCell(text(requiredProperties.includes(propertyName) ? i18n`Required` : i18n`Optional`)),
        tableCell(renderNullableLabel(propertySchema)),
      ];
      if (!singleFile) {
        const propertyTitle = propertySchema[symbols.titles]?.[0] || i18n`Untitled schema`;
        cells.push(tableCell(renderLink(
          `${propertySchema[symbols.slug]}.md`,
          `${propertySchema[symbols.id]}#${propertySchema[symbols.pointer]}`,
          text(propertyTitle),
        )));
      }
      return tableRow(cells);
    };
  }

  function renderPropertyTable(
    properties = {},
    patternProperties = {},
    additionalProperties,
    requiredProperties,
    slugger,
  ) {
    if (effectiveSkippedSections.includes('proptable')) {
      return paragraph();
    }

    const propertyRows = Object.entries(properties)
      .map(makePropertyRow(requiredProperties, false, slugger));
    const patternPropertyRows = Object.entries(patternProperties)
      .map(makePropertyRow(requiredProperties, true, slugger));
    const additionalPropertyRows = [];
    if (additionalProperties) {
      const allowsAnyAdditionalProperty = additionalProperties === true;
      const cells = [
        tableCell(text(i18n`Additional Properties`)),
        tableCell(allowsAnyAdditionalProperty ? text('Any') : renderTypeLabel(additionalProperties)),
        tableCell(text(i18n`Optional`)),
        tableCell(allowsAnyAdditionalProperty
          ? text('can be null')
          : renderNullableLabel(additionalProperties)),
      ];
      if (!singleFile) {
        const definedBy = allowsAnyAdditionalProperty ? text('') : renderLink(
          `${additionalProperties[symbols.slug]}.md`,
          `${additionalProperties[symbols.id]}#${additionalProperties[symbols.pointer]}`,
          text(additionalProperties[symbols.titles][0] || i18n`Untitled schema`),
        );
        cells.push(tableCell(definedBy));
      }
      additionalPropertyRows.push(tableRow(cells));
    }

    const headerCells = [
      tableCell(text(i18n`Property`)),
      tableCell(text(i18n`Type`)),
      tableCell(text(i18n`Required`)),
      tableCell(text(i18n`Nullable`)),
    ];
    if (!singleFile) {
      headerCells.push(tableCell(text(i18n`Defined by`)));
    }
    return table('left', [
      tableRow(headerCells),
      ...propertyRows,
      ...patternPropertyRows,
      ...additionalPropertyRows,
    ]);
  }

  function renderTupleTypeFact(itemSchemas, additionalItems) {
    if (effectiveSkippedSections.includes('arrayfact')) {
      return '';
    }

    const itemFacts = itemSchemas.map((itemSchema) => listItem(paragraph(renderLink(
      `${itemSchema[symbols.slug]}.md`,
      i18n`check type definition`,
      text(getSchemaTitle(itemSchema[symbols.titles], itemSchema.type)),
    ))));
    if (additionalItems === true) {
      itemFacts.push(listItem(paragraph(text(
        i18n`and all following items may follow any schema`,
      ))));
    } else if (typeof additionalItems === 'object') {
      itemFacts.push(listItem(paragraph([
        text(i18n`and all following items must follow the schema: `),
        renderLink(
          `${additionalItems[symbols.slug]}.md`,
          i18n`check type definition`,
          text(getSchemaTitle(additionalItems[symbols.titles], additionalItems.type)),
        ),
      ])));
    }
    return listItem([
      paragraph([
        text(i18n`Type: `),
        text(i18n`an array where each item follows the corresponding schema in the following list:`),
      ]),
      list('ordered', itemFacts),
    ]);
  }

  function renderTypeFact(schema, suffix = '') {
    const declaredTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const nonNullTypes = declaredTypes.filter((type) => type !== 'null');
    const allowsNull = declaredTypes.some((type) => type === 'null');
    const hasSingleType = nonNullTypes.length <= 1;
    const [singleType] = nonNullTypes;
    const isComposed = Boolean(schema.allOf || schema.anyOf || schema.oneOf || schema.not);

    if (singleType === 'array' && Array.isArray(schema.items)) {
      return renderTupleTypeFact(schema.items, schema.additionalItems);
    }
    if (singleType === 'array' && schema.items) {
      return renderTypeFact(schema.items, `${suffix}[]`);
    }

    let typeDescription;
    if (allowsNull && nonNullTypes.length === 0) {
      typeDescription = [inlineCode(`null${suffix}`), text(i18n`, the value must be null`)];
    } else if (hasSingleType && singleType && typeof singleType === 'string') {
      typeDescription = [inlineCode(`${singleType}${suffix}`)];
    } else if (hasSingleType) {
      typeDescription = isComposed
        ? [text(suffix ? 'an array of merged types' : i18n`merged type`)]
        : [text(i18n`unknown` + suffix)];
    } else {
      const choices = toArray(flattenIterable(nonNullTypes.map((type, index) => [
        inlineCode(type || i18n`not defined`),
        text(index === nonNullTypes.length - 1 ? '' : i18n` or `),
      ])));
      typeDescription = [
        text(suffix ? i18n`an array of the following:` : i18n`any of the following: `),
        ...choices,
      ];
    }

    let detailsLink = [];
    if (schema.title && typeof schema.title === 'string') {
      detailsLink = [
        text(' ('),
        renderLink(`${schema[symbols.slug]}.md`, '', text(schema.title)),
        text(')'),
      ];
    } else if ((!hasSingleType || singleType === 'object' || isComposed) && !singleFile) {
      detailsLink = [
        text(' ('),
        link(`${schema[symbols.slug]}.md`, '', text(i18n`Details`)),
        text(')'),
      ];
    }
    return listItem(paragraph([text(i18n`Type: `), ...typeDescription, ...detailsLink]));
  }

  function renderNullableFact(schema) {
    const declaredTypes = Array.isArray(schema.type) ? schema.type : [schema.type];
    const allowsNull = declaredTypes.some((type) => type === 'null');
    return listItem(paragraph(text(allowsNull ? i18n`can be null` : i18n`cannot be null`)));
  }

  function renderDefinedInFact(schema) {
    const title = schema[symbols.titles]?.[0] || i18n`Untitled schema`;
    return listItem(paragraph([
      text(i18n`defined in: `),
      renderLink(
        `${schema[symbols.slug]}.md`,
        `${schema[symbols.id]}#${schema[symbols.pointer]}`,
        text(title),
      ),
    ]));
  }

  function renderPropertyFacts(propertyName, schema, requiredProperties = []) {
    const facts = [listItem(text(
      requiredProperties.includes(propertyName) ? i18n`is required` : i18n`is optional`,
    ))];
    if (!effectiveSkippedSections.includes('typefact')) {
      facts.push(renderTypeFact(schema));
    }
    if (!effectiveSkippedSections.includes('nullablefact')) {
      facts.push(renderNullableFact(schema));
    }
    if (!effectiveSkippedSections.includes('definedinfact')) {
      facts.push(renderDefinedInFact(schema));
    }
    const customFacts = includeProperties
      .map((property) => schema[property]
        ? listItem(text(`${property}: ${String(schema[property])}`))
        : undefined)
      .filter((fact) => fact !== undefined);
    facts.push(...customFacts);
    return list('unordered', facts);
  }

  function getSchemaLabel(schema) {
    return schema[symbols.parent]
      ? schema[symbols.pointer].split('/').pop()
      : getSchemaTitle(schema[symbols.titles], schema.type);
  }

  function renderComposition(schema, depth = 0, maxDepth = 3) {
    if (schema.oneOf && depth <= maxDepth) {
      return [
        paragraph(text(i18n`one (and only one) of`)),
        list('unordered', schema.oneOf.map(
          (variant) => listItem(renderComposition(variant, depth + 1)),
        )),
      ];
    }
    if (schema.anyOf && depth <= maxDepth) {
      return [
        paragraph(text(i18n`any of`)),
        list('unordered', schema.anyOf.map(
          (variant) => listItem(renderComposition(variant, depth + 1)),
        )),
      ];
    }
    if (schema.allOf && depth <= maxDepth) {
      return [
        paragraph(text(i18n`all of`)),
        list('unordered', schema.allOf.map(
          (variant) => listItem(renderComposition(variant, depth + 1)),
        )),
      ];
    }
    if (schema.not && depth <= maxDepth) {
      return [
        paragraph(text(i18n`not`)),
        list('unordered', [listItem(renderComposition(schema.not, depth + 1))]),
      ];
    }
    if (depth === 0) {
      return [];
    }
    return [renderLink(
      `${schema[symbols.slug]}.md`,
      i18n`check type definition`,
      text(getSchemaTitle(schema[symbols.titles], schema.type)),
    )];
  }

  function renderTypeSection(schema, headingDepth = 1) {
    if (effectiveSkippedSections.includes('typesection')) {
      return '';
    }

    const [typeParagraph, ...additionalTypeDetails] = renderTypeFact(schema).children;
    const [, ...typeDescription] = typeParagraph.children;
    return [
      heading(headingDepth + 1, text(i18n`${getSchemaLabel(schema)} Type`)),
      paragraph(typeDescription),
      ...additionalTypeDetails,
      ...renderComposition(schema),
    ];
  }

  function renderConstraints(schema, headingDepth = 1) {
    const constraints = [];
    const addValueConstraint = (label, description, value) => {
      constraints.push(paragraph([
        strong(text(label)),
        text(': '),
        text(description),
        inlineCode(String(value)),
      ]));
    };

    if (schema.const !== undefined) {
      constraints.push(paragraph([
        strong(text(i18n`constant`)),
        text(': '),
        text(i18n`the value of this property must be equal to:`),
      ]));
      constraints.push(code('json', JSON.stringify(schema.const, undefined, 2)));
    }
    if (schema.enum) {
      const enumDescriptions = schema['meta:enum'] || {};
      const rows = Array.isArray(schema.enum) ? schema.enum.map((value) => {
        const key = Array.isArray(value) ? JSON.stringify(value) : value;
        return tableRow([
          tableCell(inlineCode(JSON.stringify(value))),
          tableCell(text(enumDescriptions[key] || '')),
        ]);
      }) : [];
      constraints.push(paragraph([
        strong(text(i18n`enum`)),
        text(': '),
        text(i18n`the value of this property must be equal to one of the following values:`),
      ]));
      constraints.push(table('left', [
        tableRow([tableCell(text(i18n`Value`)), tableCell(text(i18n`Explanation`))]),
        ...rows,
      ]));
    }

    const numericConstraints = [
      ['multipleOf', i18n`multiple of`, i18n`the value of this number must be a multiple of: `],
      ['maximum', i18n`maximum`, i18n`the value of this number must smaller than or equal to: `],
      ['exclusiveMaximum', i18n`maximum (exclusive)`, i18n`the value of this number must be smaller than: `],
      ['minimum', i18n`minimum`, i18n`the value of this number must greater than or equal to: `],
      ['exclusiveMinimum', i18n`minimum (exclusive)`, i18n`the value of this number must be greater than: `],
      ['maxLength', i18n`maximum length`, i18n`the maximum number of characters for this string is: `],
      ['minLength', i18n`minimum length`, i18n`the minimum number of characters for this string is: `],
    ];
    for (const [keyword, label, description] of numericConstraints) {
      if (typeof schema[keyword] === 'number') {
        addValueConstraint(label, description, schema[keyword]);
      }
    }

    if (schema.pattern) {
      constraints.push(paragraph([
        strong(text(i18n`pattern`)),
        text(': '),
        text(i18n`the string must match the following regular expression: `),
      ]));
      constraints.push(code('regexp', schema.pattern));
      constraints.push(paragraph([link(
        `https://regexr.com/?expression=${encodeURIComponent(schema.pattern)}`,
        i18n`try regular expression with regexr.com`,
        text(i18n`try pattern`),
      )]));
    }
    if (schema.format && typeof schema.format === 'string') {
      const format = knownFormats[schema.format];
      constraints.push(format ? paragraph([
        strong(text(format.label)),
        text(': '),
        text(format.text),
        link(format.speclink, i18n`check the specification`, text(format.specname)),
      ]) : paragraph([
        strong(text(i18n`unknown format`)),
        text(': '),
        text(i18n`the value of this string must follow the format: `),
        inlineCode(String(schema.format)),
      ]));
    }
    if (schema.contentEncoding) {
      constraints.push(paragraph([
        strong(text(i18n`encoding`)),
        text(': '),
        text(i18n`the string content must be using the ${schema.contentEncoding} content encoding.`),
      ]));
    }
    if (schema.contentMediaType) {
      addValueConstraint(
        i18n`media type`,
        i18n`the media type of the contents of this string is: `,
        schema.contentMediaType,
      );
    }
    if (schema.contentSchema) {
      constraints.push(paragraph([
        strong(text(i18n`schema`)),
        text(': '),
        text(i18n`the contents of this string should follow this schema: `),
        renderLink(
          `${schema.contentSchema[symbols.slug]}.md`,
          i18n`check type definition`,
          text(getSchemaTitle(schema.contentSchema[symbols.titles], schema.contentSchema.type)),
        ),
      ]));
    }

    const collectionConstraints = [
      ['maxItems', i18n`maximum number of items`, i18n`the maximum number of items for this array is: `],
      ['minItems', i18n`minimum number of items`, i18n`the minimum number of items for this array is: `],
      ['maxProperties', i18n`maximum number of properties`, i18n`the maximum number of properties for this object is: `],
      ['minProperties', i18n`minimum number of properties`, i18n`the minimum number of properties for this object is: `],
    ];
    for (const [keyword, label, description] of collectionConstraints) {
      if (schema[keyword] !== undefined) {
        addValueConstraint(label, description, schema[keyword]);
      }
    }
    if (schema.uniqueItems) {
      constraints.push(paragraph([
        strong(text(i18n`unique items`)),
        text(': '),
        text(i18n`all items in this array must be unique. Duplicates are not allowed.`),
      ]));
    }

    if (schema.minContains !== undefined && schema.contains) {
      constraints.push(paragraph([
        strong(text(i18n`minimum number of contained items`)),
        text(': '),
        text(i18n`this array may not contain fewer than ${String(schema.minContains)} items that validate against the schema:` + ' '),
        renderLink(
          `${schema.contains[symbols.slug]}.md`,
          i18n`check type definition`,
          text(getSchemaTitle(schema.contains[symbols.titles], schema.contains.type)),
        ),
      ]));
    }
    if (schema.maxContains !== undefined && schema.contains) {
      constraints.push(paragraph([
        strong(text(i18n`maximum number of contained items`)),
        text(': '),
        text(i18n`this array may not contain more than ${String(schema.maxContains)} items that validate against the schema:` + ' '),
        renderLink(
          `${schema.contains[symbols.slug]}.md`,
          i18n`check type definition`,
          text(getSchemaTitle(schema.contains[symbols.titles], schema.contains.type)),
        ),
      ]));
    }

    return constraints.length > 0 ? [
      heading(headingDepth + 1, text(i18n`${getSchemaLabel(schema)} Constraints`)),
      ...constraints,
    ] : [];
  }

  function renderExamples(schema, headingDepth = 1) {
    if (!schema.examples || schema.examples.length === 0) {
      return [];
    }
    let examples;
    if (exampleFormat === 'yaml') {
      examples = schema.examples.map(
        (example) => paragraph(code('yaml', yaml.dump(example, undefined, 2))),
      );
    } else if (exampleFormat === 'json') {
      examples = schema.examples.map(
        (example) => paragraph(code('json', JSON.stringify(example, undefined, 2))),
      );
    } else {
      return [];
    }
    return [
      heading(headingDepth + 1, text(i18n`${getSchemaLabel(schema)} Examples`)),
      ...examples,
    ];
  }

  function renderDefaultValue(schema, headingDepth = 1) {
    if (schema.default === undefined) {
      return [];
    }
    return [
      heading(headingDepth + 1, text(i18n`${getSchemaLabel(schema)} Default Value`)),
      paragraph(text(i18n`The default value is:`)),
      paragraph(code('json', JSON.stringify(schema.default, undefined, 2))),
    ];
  }

  function renderAccessRestrictions(schema, headingDepth = 1) {
    let description;
    if (schema.readOnly && schema.writeOnly) {
      description = i18n`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`;
    } else if (schema.readOnly) {
      description = i18n`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`;
    } else if (schema.writeOnly) {
      description = i18n`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`;
    } else {
      return [];
    }
    return [
      heading(headingDepth + 1, text(i18n`${getSchemaLabel(schema)} Access Restrictions`)),
      paragraph(text(description)),
    ];
  }

  function renderPropertyDetails(
    properties = {},
    patternProperties = {},
    additionalProperties,
    requiredProperties,
    headingDepth = 2,
  ) {
    const renderProperty = (name, schema, title) => {
      const description = schema[symbols.meta]?.longdescription
        || paragraph(text(i18n`no description`));
      return [
        heading(headingDepth + 1, title),
        description,
        ...renderComment(schema),
        paragraph(inlineCode(name)),
        renderPropertyFacts(name, schema, requiredProperties),
        ...renderTypeSection(schema, headingDepth + 1),
        ...renderConstraints(schema, headingDepth + 1),
        ...renderDefaultValue(schema, headingDepth + 1),
        ...renderExamples(schema, headingDepth + 1),
        ...renderAccessRestrictions(schema, headingDepth + 1),
      ];
    };

    const propertySections = Object.entries(properties || {}).map(
      ([name, schema]) => renderProperty(name, schema, text(name)),
    );
    const patternSections = Object.entries(patternProperties || {}).map(
      ([pattern, schema]) => renderProperty(
        pattern,
        schema,
        [text(i18n`Pattern: `), inlineCode(pattern)],
      ),
    );
    const additionalSections = [];
    if (typeof additionalProperties === 'object') {
      const schema = additionalProperties;
      const description = schema[symbols.meta].longdescription
        || paragraph(text(i18n`no description`));
      additionalSections.push(
        heading(headingDepth + 1, text(i18n`Additional Properties`)),
        paragraph(text(i18n`Additional properties are allowed, as long as they follow this schema:`)),
        description,
        ...renderComment(schema),
        renderPropertyFacts(i18n`Additional properties`, schema, requiredProperties),
        ...renderTypeSection(schema, headingDepth + 1),
        ...renderConstraints(schema, headingDepth + 1),
        ...renderDefaultValue(schema, headingDepth + 1),
        ...renderExamples(schema, headingDepth + 1),
        ...renderAccessRestrictions(schema, headingDepth + 1),
      );
    } else if (additionalProperties === true) {
      additionalSections.push(
        heading(headingDepth + 1, text(i18n`Additional Properties`)),
        paragraph(text(i18n`Additional properties are allowed and do not have to follow a specific schema`)),
      );
    }
    return [
      ...toArray(flattenIterable(propertySections)),
      ...toArray(flattenIterable(patternSections)),
      ...additionalSections,
    ];
  }

  function renderDefinitions(schema, slugger) {
    if (!schema.definitions && !schema.$defs) {
      return [];
    }
    const definitions = [
      ...Object.entries(schema.$defs || {}),
      ...Object.entries(schema.definitions || {}),
    ];
    const definitionSections = definitions.map(([definitionName, definitionSchema]) => {
      const propertyTable = renderPropertyTable(
        definitionSchema.properties,
        definitionSchema.patternProperties,
        definitionSchema.additionalProperties,
        definitionSchema.required,
        slugger,
      );
      const referenceExample = {
        $ref: `${definitionSchema[symbols.id]}#${definitionSchema[symbols.pointer]}`,
      };
      return [
        heading(2, text(i18n`Definitions group ${definitionName}`)),
        paragraph(text(i18n`Reference this group by using`)),
        code('json', JSON.stringify(referenceExample)),
        propertyTable,
        ...renderPropertyDetails(
          definitionSchema.properties,
          definitionSchema.patternProperties,
          definitionSchema.additionalProperties,
          definitionSchema.required,
          2,
        ),
      ];
    });
    return [
      heading(1, text(i18n`${getSchemaTitle(schema[symbols.titles], schema.type)} Definitions`)),
      ...toArray(flattenIterable(definitionSections)),
    ];
  }

  function renderPropertiesSection(schema, slugger) {
    if (!schema.properties && !schema.patternProperties && !schema.additionalProperties) {
      return [];
    }
    return [
      heading(1, text(i18n`${getSchemaLabel(schema)} Properties`)),
      renderPropertyTable(
        schema.properties,
        schema.patternProperties,
        schema.additionalProperties,
        schema.required,
        slugger,
      ),
      ...renderPropertyDetails(
        schema.properties,
        schema.patternProperties,
        schema.additionalProperties,
        schema.required,
        1,
      ),
    ];
  }

  console.log('generating markdown');
  return (schemas) => foldLeft(schemas, {}, (documents, schema) => {
    const slugger = new GithubSlugger();
    documents[schema[symbols.slug]] = root([
      ...renderSchemaHeader(schema),
      ...renderTypeSection(schema, 1),
      ...renderConstraints(schema, 1),
      ...renderDefaultValue(schema, 1),
      ...renderExamples(schema, 1),
      ...renderPropertiesSection(schema, slugger),
      ...renderDefinitions(schema, slugger),
    ]);
    return documents;
  });

}

export { build as default };
