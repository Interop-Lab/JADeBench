import i18n from 'es2015-i18n-tag';
import { map, list, flat, filter, size, foldl } from 'ferrum';
import { root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list as mdList, listItem, strong, blockquote } from 'mdast-builder';
import i18n2 from 'es2015-i18n-tag';
import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';

const filename = Symbol('filename');
const fullpath = Symbol('fullpath');
const symbols = {
  pointer: Symbol('pointer'),
  filename: filename,
  fullpath: fullpath,
  id: Symbol('id'),
  titles: Symbol('titles'),
  resolve: Symbol('resolve'),
  slug: Symbol('slug'),
  meta: Symbol('meta'),
  parent: Symbol('parent')
};
const symbols_default = symbols;

function gentitle(schemas, type) {
  if (!Array.isArray(schemas)) {
    return i18n`Untitled schema`;
  }
  const [first] = schemas;
  const reversed = [...schemas].reverse();
  if (schemas.length === 1 && first !== undefined) {
    return first;
  }
  if (reversed) {
    return reversed;
  }
  if (typeof type === 'undefined') {
    return i18n`Untitled schema`;
  }
  if (first === undefined) {
    return i18n`Untitled schema`;
  }
  return i18n`Untitled ${type} in ${String(first)}`;
}

function gendescription(schema) {
  return schema && schema[symbols_default.meta] ? schema[symbols_default.meta][symbols_default.titles + symbols_default.resolve] : '';
}

const used = new Set();

function keyword(str) {
  used.add(str[0]);
  return str.join('');
}

function report() {
  return used;
}

function build({ header, links = {}, includeProperties = [], rewritelinks = (x) => x, exampleFormat = 'json', skipProperties = [], singleFile = false } = {}) {
  const skipProps = singleFile ? [...new Set([...skipProperties, 'id'])] : skipProperties;

  const formatMap = {
    'date-time': {
      title: i18n2`date time`,
      description: i18n2`the string must be a date time string, according to `,
      spec: 'RFC 3339',
      url: 'https://tools.ietf.org/html/rfc3339'
    },
    date: {
      title: i18n2`date`,
      description: i18n2`the string must be a date string, according to `,
      spec: 'RFC 3339',
      url: 'https://tools.ietf.org/html/rfc3339'
    },
    time: {
      title: i18n2`time`,
      description: i18n2`the string must be a time string, according to `,
      spec: 'RFC 3339',
      url: 'https://tools.ietf.org/html/rfc3339'
    },
    duration: {
      title: i18n2`duration`,
      description: i18n2`the string must be a duration string, according to `,
      spec: 'ISO 8601',
      url: 'https://en.wikipedia.org/wiki/ISO_8601#Durations'
    },
    email: {
      title: i18n2`email`,
      description: i18n2`the string must be an email address, according to `,
      spec: 'RFC 5322',
      url: 'https://tools.ietf.org/html/rfc5322'
    },
    'idn-email': {
      title: i18n2`(international) email`,
      description: i18n2`the string must be an (international) email address, according to `,
      spec: 'RFC 5322',
      url: 'https://tools.ietf.org/html/rfc5322'
    },
    hostname: {
      title: i18n2`hostname`,
      description: i18n2`the string must be a hostname, according to `,
      spec: 'RFC 1123',
      url: 'https://tools.ietf.org/html/rfc1123'
    },
    'idn-hostname': {
      title: i18n2`(international) hostname`,
      description: i18n2`the string must be an (IDN) hostname, according to `,
      spec: 'RFC 1123',
      url: 'https://tools.ietf.org/html/rfc1123'
    },
    ipv4: {
      title: i18n2`IPv4`,
      description: i18n2`the string must be an IPv4 address (dotted quad), according to `,
      spec: 'RFC 2673',
      url: 'https://tools.ietf.org/html/rfc2673'
    },
    ipv6: {
      title: i18n2`IPv6`,
      description: i18n2`the string must be an IPv6 address, according to `,
      spec: 'RFC 2373',
      url: 'https://tools.ietf.org/html/rfc2373'
    },
    uri: {
      title: i18n2`URI`,
      description: i18n2`the string must be a URI, according to `,
      spec: 'RFC 3986',
      url: 'https://tools.ietf.org/html/rfc3986'
    },
    'uri-reference': {
      title: i18n2`URI reference`,
      description: i18n2`the string must be a URI reference, according to `,
      spec: 'RFC 3986',
      url: 'https://tools.ietf.org/html/rfc3986'
    },
    iri: {
      title: i18n2`IRI`,
      description: i18n2`the string must be a IRI, according to `,
      spec: 'RFC 3987',
      url: 'https://tools.ietf.org/html/rfc3987'
    },
    'iri-reference': {
      title: i18n2`IRI reference`,
      description: i18n2`the string must be a IRI reference, according to `,
      spec: 'RFC 3987',
      url: 'https://tools.ietf.org/html/rfc3987'
    },
    uuid: {
      title: i18n2`UUID`,
      description: i18n2`the string must be a UUID, according to `,
      spec: 'RFC 4122',
      url: 'https://tools.ietf.org/html/rfc4122'
    },
    'json-pointer': {
      title: i18n2`JSON Pointer`,
      description: i18n2`the string must be a JSON Pointer, according to `,
      spec: 'RFC 6901',
      url: 'https://tools.ietf.org/html/rfc6901'
    },
    'relative-json-pointer': {
      title: i18n2`Relative JSON Pointer`,
      description: i18n2`the string must be a relative JSON Pointer, according to `,
      spec: 'draft-handrews-relative-json-pointer',
      url: 'https://tools.ietf.org/html/draft-handrews-relative-json-pointer'
    },
    regex: {
      title: i18n2`RegEx`,
      description: i18n2`the string must be a regular expression, according to `,
      spec: 'ECMA-262',
      url: 'https://www.ecma-international.org/ecma-262/5.1/#sec-7.8.5'
    },
    'uri-template': {
      title: i18n2`URI Template`,
      description: i18n2`the string must be a URI template, according to `,
      spec: 'RFC 6570',
      url: 'https://tools.ietf.org/html/rfc6570'
    }
  };

  const metaRows = [
    { name: 'abstract', title: i18n2`Abstract`, yes: i18n2`Cannot be instantiated`, no: i18n2`Can be instantiated`, unknown: i18n2`Unknown abstraction` },
    { name: 'extensible', title: i18n2`Extensible`, yes: i18n2`Yes`, no: i18n2`No`, unknown: i18n2`Unknown extensibility` },
    { name: 'status', title: i18n2`Status`, deprecated: i18n2`Deprecated`, stable: i18n2`Stable`, stabilizing: i18n2`Stabilizing`, experimental: i18n2`Experimental` },
    { name: 'identifiable', title: i18n2`Identifiable`, yes: i18n2`Yes`, no: i18n2`No`, unknown: i18n2`Unknown identifiability` },
    { name: 'customProperties', title: i18n2`Custom Properties`, yes: i18n2`Allowed`, no: i18n2`Forbidden`, unknown: i18n2`Unknown custom properties` },
    { name: 'additionalProperties', title: i18n2`Additional Properties`, yes: i18n2`Allowed`, no: i18n2`Forbidden`, unknown: i18n2`Unknown additional properties` },
    { name: 'access', title: i18n2`Access Restrictions`, readOnly: i18n2`Read only`, writeOnly: i18n2`Write only`, none: i18n2`cannot be read or written`, unknown: i18n2`none` },
    { name: 'definedIn', title: i18n2`Defined In`, unknown: i18n2`Unknown definition` }
  ];

  function makeLink(href, title, children) {
    if (singleFile) {
      return children;
    }
    return link(href, title, children);
  }

  function renderComment(schema) {
    if (schema[keyword`$comment`]) {
      return [blockquote(schema[symbols_default.meta][symbols_default.titles + symbols_default.resolve])];
    }
    return [];
  }

  function renderHeader(schema) {
    if (!header) {
      if (singleFile) {
        return [
          heading(2, text(i18n2`Additional Properties`)),
          paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`))
        ];
      }
      return [
        heading(1, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Schema`)),
        paragraph(code('json', schema[symbols_default.id] + (schema[symbols_default.slug] ? '#' + schema[symbols_default.slug] : ''))),
        schema[symbols_default.meta][symbols_default.titles + symbols_default.resolve],
        ...renderComment(schema),
        table(
          'meta',
          [
            tableRow(map(metaRows, ({ name, title }) => {
              if (links[name]) {
                return tableCell(link(links[name], i18n2`What does ${title} mean?`, text(title)));
              }
              return tableCell(text(title));
            }), Array),
            tableRow(map(metaRows, (row) => {
              if (schema[symbols_default.meta] && typeof schema[symbols_default.meta][row.name] !== 'undefined' && schema[symbols_default.meta][row.name][symbols_default.resolve] && schema[symbols_default.meta][row.name][symbols_default.titles]) {
                return tableCell(link(rewritelinks(schema[symbols_default.meta][row.name][symbols_default.resolve]), i18n2`open original schema`, [text(schema[symbols_default.meta][row.name][symbols_default.titles])]));
              }
              const val = schema[symbols_default.meta] ? schema[symbols_default.meta][row.name] : undefined;
              return tableCell(text(row[String(val)] || i18n2`Unknown`));
            }), Array)
          ]
        )
      ];
    }
    return [];
  }

  function renderType(schema) {
    if (!Array.isArray(schema[keyword`type`]) && typeof schema[keyword`type`] !== 'string') {
      return text(i18n2`Unknown Type`);
    }
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const nonNullTypes = list(flat(filter(types, t => t !== keyword`null`)));
    if (schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]) {
      return text(i18n2`Merged`);
    }
    if (size(nonNullTypes) === 1) {
      return inlineCode(nonNullTypes[0]);
    }
    return text(i18n2`Multiple`);
  }

  function renderNullable(schema) {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const hasNull = types.filter(t => t === keyword`null`).length > 0;
    if (hasNull) {
      return listItem(paragraph(text(i18n2`can be null`)));
    }
    return listItem(paragraph(text(i18n2`cannot be null`)));
  }

  function makePropertyRow(required, slugger) {
    return ([name, prop]) => {
      const cells = [
        tableCell(singleFile ? inlineCode(name) : link('#' + slugger.slug(name), '', text(name))),
        tableCell(renderType(prop)),
        tableCell(text(required.includes(name) ? i18n2`Required` : i18n2`Optional`)),
        tableCell(renderNullable(prop))
      ];
      if (!singleFile) {
        cells.push(tableCell(makeLink(prop[symbols_default.fullpath] + '#' + prop[symbols_default.slug], prop[symbols_default.titles] && prop[symbols_default.titles][0] ? prop[symbols_default.titles][0] : i18n2`Untitled schema`)));
      }
      return tableRow(cells);
    };
  }

  function renderProperties(properties = {}, patternProperties = {}, additionalProperties, required, slugger) {
    if (skipProps.includes('properties')) {
      return paragraph();
    }
    const propRows = Object.entries(properties).map(makePropertyRow(required, slugger));
    const patternRows = Object.entries(patternProperties).map(makePropertyRow(required, slugger));
    const additionalRow = (() => {
      if (!additionalProperties) return [];
      const isBool = additionalProperties === true;
      const cells = [
        tableCell(text(i18n2`Additional Properties`)),
        tableCell(isBool ? text(i18n2`Allowed`) : renderType(additionalProperties)),
        tableCell(text(i18n2`Optional`)),
        tableCell(isBool ? text(i18n2`Allowed`) : renderNullable(additionalProperties))
      ];
      if (!singleFile) {
        cells.push(tableCell(isBool ? text('') : makeLink(additionalProperties[symbols_default.fullpath] + '#' + additionalProperties[symbols_default.slug], additionalProperties[symbols_default.titles] && additionalProperties[symbols_default.titles][0] ? additionalProperties[symbols_default.titles][0] : i18n2`Untitled schema`)));
      }
      return [tableRow(cells)];
    })();
    const headers = [tableCell(text(i18n2`Property`)), tableCell(text(i18n2`Type`)), tableCell(text(i18n2`Required`)), tableCell(text(i18n2`Nullable`))];
    if (!singleFile) {
      headers.push(tableCell(text(i18n2`Defined by`)));
    }
    return table('properties', [tableRow(headers), ...propRows, ...patternRows, ...additionalRow]);
  }

  function renderItems(items, additionalItems) {
    if (skipProps.includes('items')) return '';
    if (Array.isArray(items)) {
      return [
        listItem(paragraph([text(i18n2`Type: `), text(i18n2`an array where each item follows the corresponding schema in the following list:`)])),
        list('ordered', [
          ...items.map(item => listItem(paragraph(makeLink(item[symbols_default.fullpath] + '#', i18n2`check type definition`, text(gentitle(item[symbols_default.titles], item[keyword`type`])))))),
          ...(additionalItems === true ? [listItem(paragraph(text(i18n2`and all following items may follow any schema`)))] :
            additionalItems ? [listItem(paragraph([text(i18n2`and all following items must follow the schema: `), makeLink(additionalItems[symbols_default.fullpath] + '#', i18n2`check type definition`, text(gentitle(additionalItems[symbols_default.titles], additionalItems[keyword`type`])))]))] : [])
        ])
      ];
    }
    return [listItem(paragraph([text(i18n2`Type: `), makeLink(items[symbols_default.fullpath] + '#', i18n2`check type definition`, text(gentitle(items[symbols_default.titles], items[keyword`type`])))]))];
  }

  function renderTypeDetails(schema, prefix = '') {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const nonNullTypes = types.filter(t => t !== keyword`null`);
    const hasNull = types.filter(t => t === keyword`null`).length > 0;
    const isSingleType = nonNullTypes.length === 1;
    const [firstType] = nonNullTypes;
    const isArray = firstType === keyword`array`;
    const isMerged = !!(schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]);

    if (isArray && Array.isArray(schema[keyword`items`])) {
      return renderItems(schema[keyword`items`], schema[keyword`additionalItems`]);
    } else if (isArray && schema[keyword`items`]) {
      return renderItems(schema[keyword`items`], prefix + '[]');
    }

    const typeDisplay = (() => {
      if (hasNull) {
        return [inlineCode(prefix + firstType), text(i18n2`, the value must be null`)];
      } else {
        if (!isSingleType && typeof firstType === 'string') {
          return [inlineCode(firstType + prefix)];
        } else if (!isSingleType) {
          return [text(prefix ? i18n2`an array of the following:` : i18n2`any of the following: `), ...list(flat(nonNullTypes.map((t, i) => [inlineCode(t || i18n2`not defined`), text(i === nonNullTypes.length - 1 ? '' : i18n2` or `)])))];
        } else if (isMerged) {
          return [text(prefix ? i18n2`merged type` : i18n2`merged type`)];
        }
      }
      return [text(i18n2`unknown`)];
    })();

    const titleDisplay = (() => {
      if (schema[keyword`title`] && typeof schema[keyword`title`] === 'string') {
        return [text(' ('), makeLink(schema[symbols_default.fullpath] + '#', '', text(schema[keyword`title`])), text(')')];
      } else {
        if (!isSingleType || firstType === keyword`object` || isMerged) {
          if (singleFile) return [];
          return [text(' ('), link(schema[symbols_default.fullpath] + '#', '', text(i18n2`Details`)), text(')')];
        }
      }
      return [];
    })();

    return listItem(paragraph([text(i18n2`Type: `), ...typeDisplay, ...titleDisplay]));
  }

  function renderNullability(schema) {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const hasNull = types.filter(t => t === keyword`null`).length > 0;
    if (hasNull) {
      return listItem(paragraph(text(i18n2`can be null`)));
    }
    return listItem(paragraph(text(i18n2`cannot be null`)));
  }

  function renderDefinedIn(schema) {
    return listItem(paragraph([text(i18n2`defined in: `), makeLink(schema[symbols_default.fullpath] + '#', schema[symbols_default.id] + '#' + schema[symbols_default.slug], text(schema[symbols_default.titles] && schema[symbols_default.titles][0] ? schema[symbols_default.titles][0] : i18n2`Untitled schema`))]));
  }

  function renderPropertyDetails(name, schema, required = []) {
    const items = [];
    if (required.includes(name)) {
      items.push(listItem(text(i18n2`is required`)));
    } else {
      items.push(listItem(text(i18n2`is optional`)));
    }
    if (!skipProps.includes('type')) {
      items.push(renderTypeDetails(schema));
    }
    if (!skipProps.includes('definedIn')) {
      items.push(renderDefinedIn(schema));
    }
    const extraProps = includeProperties.filter(prop => {
      if (schema[prop]) {
        return listItem(text(prop + ': ' + String(schema[prop])));
      }
      return undefined;
    }).filter(x => x !== undefined);
    return list('unordered', [...items, ...extraProps]);
  }

  function getTitle(schema) {
    return schema[symbols_default.titles] ? schema[symbols_default.titles].join('/') : gentitle(schema[symbols_default.titles], schema[keyword`type`]);
  }

  function renderMerged(schema, depth = 0, maxDepth = 10) {
    if (schema[keyword`oneOf`] && depth < maxDepth) {
      return [
        paragraph(text(i18n2`one (and only one) of`)),
        list('unordered', [...schema[keyword`oneOf`].map(s => listItem(renderMerged(s, depth + 1)))])
      ];
    } else if (schema[keyword`anyOf`] && depth < maxDepth) {
      return [
        paragraph(text(i18n2`any of`)),
        list('unordered', [...schema[keyword`anyOf`].map(s => listItem(renderMerged(s, depth + 1)))])
      ];
    } else if (schema[keyword`allOf`] && depth < maxDepth) {
      return [
        paragraph(text(i18n2`all of`)),
        list('unordered', [...schema[keyword`allOf`].map(s => listItem(renderMerged(s, depth + 1)))])
      ];
    } else if (schema[keyword`not`] && depth < maxDepth) {
      const notSchema = schema[keyword`not`];
      return [
        paragraph(text(i18n2`not`)),
        list('unordered', [listItem(renderMerged(notSchema, depth + 1))])
      ];
    }
    return depth > maxDepth ? [text(i18n2`...`)] : [makeLink(schema[symbols_default.fullpath] + '#', i18n2`check type definition`, text(gentitle(schema[symbols_default.titles], schema[keyword`type`])))];
  }

  function renderTypeSection(schema, depth = 1) {
    if (skipProps.includes('type')) return '';
    const { children } = renderTypeDetails(schema);
    return children[0].children.join(''), [
      heading(depth, text(i18n2`${getTitle(schema)} Type`)),
      ...children,
      ...renderMerged(schema)
    ];
  }

  function renderConstraints(schema, depth = 1) {
    const items = [];
    if (schema[keyword`const`] !== undefined) {
      items.push(paragraph([strong(text(i18n2`constant`)), text(': '), text(i18n2`the value of this property must be equal to:`)]));
      items.push(code('json', JSON.stringify(schema[keyword`const`], undefined, 2)));
    }
    if (schema[keyword`enum`]) {
      const enumMeta = schema[keyword`meta:enum`] || {};
      items.push(paragraph([strong(text(i18n2`enum`)), text(': '), text(i18n2`the value of this property must be equal to one of the following values:`)]));
      items.push(table('enum', [
        tableRow([tableCell(text(i18n2`Value`)), tableCell(text(i18n2`Explanation`))]),
        ...Array.isArray(schema[keyword`enum`]) ? schema[keyword`enum`].map(val => tableRow([tableCell(inlineCode(JSON.stringify(val))), tableCell(text(enumMeta[Array.isArray(val) ? JSON.stringify(val) : val] || ''))])) : []
      ]));
    }
    if (schema[keyword`multipleOf`] !== undefined && typeof schema[keyword`multipleOf`] === 'number') {
      items.push(paragraph([strong(text(i18n2`multiple of`)), text(': '), text(i18n2`the value of this number must be a multiple of: `), inlineCode(String(schema[keyword`multipleOf`]))]));
    }
    if (schema[keyword`maximum`] !== undefined && typeof schema[keyword`maximum`] === 'number') {
      items.push(paragraph([strong(text(i18n2`maximum`)), text(': '), text(i18n2`the value of this number must smaller than or equal to: `), inlineCode(String(schema[keyword`maximum`]))]));
    }
    if (schema[keyword`exclusiveMaximum`] !== undefined && typeof schema[keyword`exclusiveMaximum`] === 'number') {
      items.push(paragraph([strong(text(i18n2`maximum (exclusive)`)), text(': '), text(i18n2`the value of this number must be smaller than: `), inlineCode(String(schema[keyword`exclusiveMaximum`]))]));
    }
    if (schema[keyword`minimum`] !== undefined && typeof schema[keyword`minimum`] === 'number') {
      items.push(paragraph([strong(text(i18n2`minimum`)), text(': '), text(i18n2`the value of this number must greater than or equal to: `), inlineCode(String(schema[keyword`minimum`]))]));
    }
    if (schema[keyword`exclusiveMinimum`] !== undefined && typeof schema[keyword`exclusiveMinimum`] === 'number') {
      items.push(paragraph([strong(text(i18n2`minimum (exclusive)`)), text(': '), text(i18n2`the value of this number must be greater than: `), inlineCode(String(schema[keyword`exclusiveMinimum`]))]));
    }
    if (schema[keyword`maxLength`] !== undefined && typeof schema[keyword`maxLength`] === 'number') {
      items.push(paragraph([strong(text(i18n2`maximum length`)), text(': '), text(i18n2`the maximum number of characters for this string is: `), inlineCode(String(schema[keyword`maxLength`]))]));
    }
    if (schema[keyword`minLength`] !== undefined && typeof schema[keyword`minLength`] === 'number') {
      items.push(paragraph([strong(text(i18n2`minimum length`)), text(': '), text(i18n2`the minimum number of characters for this string is: `), inlineCode(String(schema[keyword`minLength`]))]));
    }
    if (schema[keyword`pattern`]) {
      items.push(paragraph([strong(text(i18n2`pattern`)), text(': '), text(i18n2`the string must match the following regular expression: `)]));
      items.push(code('javascript', schema[keyword`pattern`]));
      items.push(paragraph([link('https://regexr.com/?expression=' + encodeURIComponent(schema[keyword`pattern`]), i18n2`try regular expression with regexr.com`, text(i18n2`try pattern`))]));
    }
    if (schema[keyword`format`] && typeof schema[keyword`format`] === 'string' && formatMap[schema[keyword`format`]]) {
      const fmt = formatMap[schema[keyword`format`]];
      items.push(paragraph([strong(text(fmt.title)), text(': '), text(fmt.description), link(fmt.url, i18n2`check the specification`, text(fmt.spec))]));
    } else if (schema[keyword`format`]) {
      items.push(paragraph([strong(text(i18n2`unknown format`)), text(': '), text(i18n2`the value of this string must follow the format: `), inlineCode(String(schema[keyword`format`]))]));
    }
    if (schema[keyword`contentEncoding`]) {
      items.push(paragraph([strong(text(i18n2`encoding`)), text(': '), text(i18n2`the string content must be using the ${schema[keyword`contentEncoding`]} content encoding.`)]));
    }
    if (schema[keyword`contentMediaType`]) {
      items.push(paragraph([strong(text(i18n2`media type`)), text(': '), text(i18n2`the media type of the contents of this string is: `), inlineCode(String(schema[keyword`contentMediaType`]))]));
    }
    if (schema[keyword`contentSchema`]) {
      items.push(paragraph([strong(text(i18n2`schema`)), text(': '), text(i18n2`the contents of this string should follow this schema: `), makeLink(schema[keyword`contentSchema`][symbols_default.fullpath] + '#', i18n2`check type definition`, text(gentitle(schema[keyword`contentSchema`][symbols_default.titles], schema[keyword`contentSchema`][keyword`type`])))]));
    }
    if (schema[keyword`maxItems`] !== undefined) {
      items.push(paragraph([strong(text(i18n2`maximum number of items`)), text(': '), text(i18n2`the maximum number of items for this array is: `), inlineCode(String(schema[keyword`maxItems`]))]));
    }
    if (schema[keyword`minItems`] !== undefined) {
      items.push(paragraph([strong(text(i18n2`minimum number of items`)), text(': '), text(i18n2`the minimum number of items for this array is: `), inlineCode(String(schema[keyword`minItems`]))]));
    }
    if (schema[keyword`uniqueItems`]) {
      items.push(paragraph([strong(text(i18n2`unique items`)), text(': '), text(i18n2`all items in this array must be unique. Duplicates are not allowed.`)]));
    }
    if (schema[keyword`minContains`] !== undefined && schema[keyword`contains`]) {
      items.push(paragraph([strong(text(i18n2`minimum number of contained items`)), text(': '), text(i18n2`this array may not contain fewer than ${String(schema[keyword`minContains`])} items that validate against the schema: `), makeLink(schema[keyword`contains`][symbols_default.fullpath] + '#', i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`])))]));
    }
    if (schema[keyword`maxContains`] !== undefined && schema[keyword`contains`]) {
      items.push(paragraph([strong(text(i18n2`maximum number of contained items`)), text(': '), text(i18n2`this array may not contain more than ${String(schema[keyword`maxContains`])} items that validate against the schema: `), makeLink(schema[keyword`contains`][symbols_default.fullpath] + '#', i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`])))]));
    }
    if (schema[keyword`maxProperties`] !== undefined) {
      items.push(paragraph([strong(text(i18n2`maximum number of properties`)), text(': '), text(i18n2`the maximum number of properties for this object is: `), inlineCode(String(schema[keyword`maxProperties`]))]));
    }
    if (schema[keyword`minProperties`] !== undefined) {
      items.push(paragraph([strong(text(i18n2`minimum number of properties`)), text(': '), text(i18n2`the minimum number of properties for this object is: `), inlineCode(String(schema[keyword`minProperties`]))]));
    }
    if (items.length > 0) {
      return [heading(depth, text(i18n2`${getTitle(schema)} Constraints`)), ...items];
    }
    return [];
  }

  function renderExamples(schema, depth = 1) {
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === 'yaml') {
      return [
        heading(depth, text(i18n2`${getTitle(schema)} Examples`)),
        ...schema[keyword`examples`].map(ex => paragraph(code('yaml', yaml.dump(ex, undefined, 2))))
      ];
    }
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === 'json') {
      return [
        heading(depth, text(i18n2`${getTitle(schema)} Examples`)),
        ...schema[keyword`examples`].map(ex => paragraph(code('json', JSON.stringify(ex, undefined, 2))))
      ];
    }
    return [];
  }

  function renderDefault(schema, depth = 1) {
    if (schema[keyword`default`] !== undefined) {
      return [
        heading(depth, text(i18n2`${getTitle(schema)} Default Value`)),
        paragraph(text(i18n2`The default value is:`)),
        paragraph(code('json', JSON.stringify(schema[keyword`default`], undefined, 2)))
      ];
    }
    return [];
  }

  function renderAccessRestrictions(schema, depth = 1) {
    if (schema[keyword`readOnly`] && schema[keyword`writeOnly`]) {
      return [
        heading(depth, text(i18n2`${getTitle(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`))
      ];
    }
    if (schema[keyword`readOnly`]) {
      return [
        heading(depth, text(i18n2`${getTitle(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`))
      ];
    }
    if (schema[keyword`writeOnly`]) {
      return [
        heading(depth, text(i18n2`${getTitle(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`))
      ];
    }
    return [];
  }

  function renderDefinitions(properties, patternProperties, additionalProperties, required, slugger, depth = 1) {
    return [
      ...flat(Object.entries(properties).map(([name, prop]) => {
        const desc = prop[symbols_default.meta] && prop[symbols_default.meta][symbols_default.titles + symbols_default.resolve] ? prop[symbols_default.meta][symbols_default.titles + symbols_default.resolve] : paragraph(text(i18n2`no description`));
        return [
          heading(depth, text(name)),
          desc,
          ...renderComment(prop),
          paragraph(inlineCode(name)),
          renderPropertyDetails(name, prop, required),
          ...renderTypeSection(prop, depth + 1),
          ...renderConstraints(prop, depth + 1),
          ...renderDefault(prop, depth + 1),
          ...renderExamples(prop, depth + 1),
          ...renderAccessRestrictions(prop, depth + 1)
        ];
      })),
      ...flat(Object.entries(patternProperties).map(([pattern, prop]) => {
        const desc = prop[symbols_default.meta] && prop[symbols_default.meta][symbols_default.titles + symbols_default.resolve] ? prop[symbols_default.meta][symbols_default.titles + symbols_default.resolve] : paragraph(text(i18n2`no description`));
        return [
          heading(depth, [text(i18n2`Pattern: `), inlineCode(pattern)]),
          desc,
          ...renderComment(prop),
          paragraph(inlineCode(pattern)),
          renderPropertyDetails(pattern, prop, required),
          ...renderTypeSection(prop, depth + 1),
          ...renderConstraints(prop, depth + 1),
          ...renderDefault(prop, depth + 1),
          ...renderExamples(prop, depth + 1),
          ...renderAccessRestrictions(prop, depth + 1)
        ];
      })),
      ...((additionalProperties) => {
        if (typeof additionalProperties === 'object') {
          const desc = additionalProperties[symbols_default.meta] && additionalProperties[symbols_default.meta][symbols_default.titles + symbols_default.resolve] ? additionalProperties[symbols_default.meta][symbols_default.titles + symbols_default.resolve] : paragraph(text(i18n2`no description`));
          return [
            heading(depth, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)),
            desc,
            ...renderComment(additionalProperties),
            paragraph(inlineCode(i18n2`Additional properties`)),
            renderPropertyDetails(i18n2`Additional properties`, additionalProperties, required),
            ...renderTypeSection(additionalProperties, depth + 1),
            ...renderConstraints(additionalProperties, depth + 1),
            ...renderDefault(additionalProperties, depth + 1),
            ...renderExamples(additionalProperties, depth + 1),
            ...renderAccessRestrictions(additionalProperties, depth + 1)
          ];
        } else if (additionalProperties === true) {
          return [
            heading(depth, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`))
          ];
        }
        return [];
      })(additionalProperties)
    ];
  }

  function renderDefs(schema, slugger) {
    if (schema[keyword`definitions`] || schema[keyword`$defs`]) {
      const defs = [
        ...Object.entries(schema[keyword`$defs`] || {}),
        ...Object.entries(schema[keyword`definitions`] || {})
      ].map(([name, def]) => {
        const props = renderDefinitions(def[keyword`properties`], def[keyword`patternProperties`], def[keyword`additionalProperties`], def[keyword`required`], slugger);
        const ref = {};
        ref[symbols_default.fullpath] = def[symbols_default.id] + '#' + def[symbols_default.slug];
        return [
          heading(2, text(i18n2`Definitions group ${name}`)),
          paragraph(text(i18n2`Reference this group by using`)),
          code('json', JSON.stringify(ref)),
          ...props
        ];
      });
      return [
        heading(1, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Definitions`)),
        ...flat(defs)
      ];
    }
    return [];
  }

  function renderPropertiesSection(schema, slugger) {
    if (schema[keyword`properties`] || schema[keyword`patternProperties`] || schema[keyword`additionalProperties`]) {
      return [
        heading(2, text(i18n2`${getTitle(schema)} Properties`)),
        renderProperties(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], slugger),
        ...renderDefinitions(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], slugger, 3)
      ];
    }
    return [];
  }

  console.log('skipProperties:', skipProps);

  return (schemas) => foldl(schemas, {}, (acc, schema) => {
    const slugger = new GithubSlugger();
    acc[schema[symbols_default.id]] = root([
      ...renderHeader(schema),
      ...renderTypeSection(schema),
      ...renderConstraints(schema),
      ...renderDefault(schema),
      ...renderExamples(schema),
      ...renderAccessRestrictions(schema),
      ...renderPropertiesSection(schema, slugger),
      ...renderDefs(schema, slugger)
    ]);
    return acc;
  });
}

export { build as default };
