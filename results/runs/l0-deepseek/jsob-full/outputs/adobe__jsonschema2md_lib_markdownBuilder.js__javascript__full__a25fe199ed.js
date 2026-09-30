import Symbol_1 from 'es2015-i18n-tag';
import Symbol_2 from 'github-slugger';
import Symbol_3 from 'js-yaml';
import { map, list, flat, filter, size, foldl } from 'ferrum';
import { root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list, listItem, strong, blockquote } from 'mdast-builder';

const { default: i18n } = Symbol_1;
const { default: i18n2 } = Symbol_1;

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
const symbols_default = symbols;

function gentitle(schema, type) {
  if (!Array.isArray(schema)) {
    return i18n`Untitled schema`;
  }
  const [first] = schema;
  const titles = [...schema][symbols.titles]();
  if (schema.length === 1 && first === undefined) {
    return first;
  }
  if (titles) {
    return titles;
  }
  if (typeof type === 'string') {
    return i18n`Untitled ${type} in ${String(first)}`;
  }
  if (first === undefined) {
    return i18n`Untitled schema`;
  }
  return i18n`Untitled undefined type in ${first}`;
}

function gendescription(schema) {
  return schema && schema[symbols_default.meta]
    ? schema[symbols_default.meta].description
    : '';
}

const used = new Set();

function keyword(name) {
  used.add(name[0]);
  return name.join('');
}

function report() {
  return used;
}

function build({
  header,
  links = {},
  includeProperties = [],
  rewritelinks = x => x,
  exampleFormat = 'yaml',
  skipProperties = [],
  singleFile = false,
} = {}) {
  const skip = singleFile ? [...new Set([...skipProperties, 'id'])] : skipProperties;

  function linkTo(url, title, children) {
    if (singleFile) {
      return children;
    }
    return link(url, title, children);
  }

  const dateTimeFormats = {};
  dateTimeFormats.title = i18n2`date time`;
  dateTimeFormats.description = i18n2`the string must be a date time string, according to `;
  dateTimeFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3339#section-5.6';
  dateTimeFormats.linkText = 'RFC 3339, section 5.6';

  const dateFormats = {};
  dateFormats.title = i18n2`date`;
  dateFormats.description = i18n2`the string must be a date string, according to `;
  dateFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3339#section-5.6';
  dateFormats.linkText = 'RFC 3339, section 5.6';

  const timeFormats = {};
  timeFormats.title = i18n2`time`;
  timeFormats.description = i18n2`the string must be a time string, according to `;
  timeFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3339#section-5.6';
  timeFormats.linkText = 'RFC 3339, section 5.6';

  const durationFormats = {};
  durationFormats.title = i18n2`duration`;
  durationFormats.description = i18n2`the string must be a duration string, according to `;
  durationFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3339#appendix-A';
  durationFormats.linkText = 'RFC 3339, appendix A';

  const emailFormats = {};
  emailFormats.title = i18n2`email`;
  emailFormats.description = i18n2`the string must be an email address, according to `;
  emailFormats.link = 'https://datatracker.ietf.org/doc/html/rfc5321#section-4.1.2';
  emailFormats.linkText = 'RFC 5321, section 4.1.2';

  const idnEmailFormats = {};
  idnEmailFormats.title = i18n2`(international) email`;
  idnEmailFormats.description = i18n2`the string must be an (international) email address, according to `;
  idnEmailFormats.link = 'https://datatracker.ietf.org/doc/html/rfc6531#section-3.3';
  idnEmailFormats.linkText = 'RFC 6531, section 3.3';

  const hostnameFormats = {};
  hostnameFormats.title = i18n2`hostname`;
  hostnameFormats.description = i18n2`the string must be a hostname, according to `;
  hostnameFormats.link = 'https://datatracker.ietf.org/doc/html/rfc1123#section-2.1';
  hostnameFormats.linkText = 'RFC 1123, section 2.1';

  const idnHostnameFormats = {};
  idnHostnameFormats.title = i18n2`(international) hostname`;
  idnHostnameFormats.description = i18n2`the string must be an (IDN) hostname, according to `;
  idnHostnameFormats.link = 'https://datatracker.ietf.org/doc/html/rfc5890#section-2.3.2.3';
  idnHostnameFormats.linkText = 'RFC 5890, section 2.3.2.3';

  const ipv4Formats = {};
  ipv4Formats.title = i18n2`IPv4`;
  ipv4Formats.description = i18n2`the string must be an IPv4 address (dotted quad), according to `;
  ipv4Formats.link = 'https://datatracker.ietf.org/doc/html/rfc2673#section-3.2';
  ipv4Formats.linkText = 'RFC 2673, section 3.2';

  const ipv6Formats = {};
  ipv6Formats.title = i18n2`IPv6`;
  ipv6Formats.description = i18n2`the string must be an IPv6 address, according to `;
  ipv6Formats.link = 'https://datatracker.ietf.org/doc/html/rfc4291#section-2.2';
  ipv6Formats.linkText = 'RFC 4291, section 2.2';

  const uriFormats = {};
  uriFormats.title = i18n2`URI`;
  uriFormats.description = i18n2`the string must be a URI, according to `;
  uriFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3986#section-3';
  uriFormats.linkText = 'RFC 3986, section 3';

  const iriFormats = {};
  iriFormats.title = i18n2`IRI`;
  iriFormats.description = i18n2`the string must be a IRI, according to `;
  iriFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3987#section-2.2';
  iriFormats.linkText = 'RFC 3987, section 2.2';

  const uriReferenceFormats = {};
  uriReferenceFormats.title = i18n2`URI reference`;
  uriReferenceFormats.description = i18n2`the string must be a URI reference, according to `;
  uriReferenceFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3986#section-4.1';
  uriReferenceFormats.linkText = 'RFC 3986, section 4.1';

  const iriReferenceFormats = {};
  iriReferenceFormats.title = i18n2`IRI reference`;
  iriReferenceFormats.description = i18n2`the string must be a IRI reference, according to `;
  iriReferenceFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3987#section-2.2';
  iriReferenceFormats.linkText = 'RFC 3987, section 2.2';

  const uuidFormats = {};
  uuidFormats.title = i18n2`UUID`;
  uuidFormats.description = i18n2`the string must be a UUID, according to `;
  uuidFormats.link = 'https://datatracker.ietf.org/doc/html/rfc4122';
  uuidFormats.linkText = 'RFC 4122';

  const jsonPointerFormats = {};
  jsonPointerFormats.title = i18n2`JSON Pointer`;
  jsonPointerFormats.description = i18n2`the string must be a JSON Pointer, according to `;
  jsonPointerFormats.link = 'https://datatracker.ietf.org/doc/html/rfc6901';
  jsonPointerFormats.linkText = 'RFC 6901';

  const relativeJsonPointerFormats = {};
  relativeJsonPointerFormats.title = i18n2`Relative JSON Pointer`;
  relativeJsonPointerFormats.description = i18n2`the string must be a relative JSON Pointer, according to `;
  relativeJsonPointerFormats.link = 'https://datatracker.ietf.org/doc/html/draft-handrews-relative-json-pointer-01';
  relativeJsonPointerFormats.linkText = 'Relative JSON Pointer draft';

  const regexFormats = {};
  regexFormats.title = i18n2`RegEx`;
  regexFormats.description = i18n2`the string must be a regular expression, according to `;
  regexFormats.link = 'https://datatracker.ietf.org/doc/html/rfc3986#section-2.2';
  regexFormats.linkText = 'ECMA 262';

  const uriTemplateFormats = {};
  uriTemplateFormats.title = i18n2`URI Template`;
  uriTemplateFormats.description = i18n2`the string must be a URI template, according to `;
  uriTemplateFormats.link = 'https://datatracker.ietf.org/doc/html/rfc6570';
  uriTemplateFormats.linkText = 'RFC 6570';

  const formats = {};
  formats['date-time'] = dateTimeFormats;
  formats.date = dateFormats;
  formats.time = timeFormats;
  formats.duration = durationFormats;
  formats.email = emailFormats;
  formats['idn-email'] = idnEmailFormats;
  formats.hostname = hostnameFormats;
  formats['idn-hostname'] = idnHostnameFormats;
  formats.ipv4 = ipv4Formats;
  formats.ipv6 = ipv6Formats;
  formats.uri = uriFormats;
  formats.iri = iriFormats;
  formats['uri-reference'] = uriReferenceFormats;
  formats['iri-reference'] = iriReferenceFormats;
  formats.uuid = uuidFormats;
  formats['json-pointer'] = jsonPointerFormats;
  formats['relative-json-pointer'] = relativeJsonPointerFormats;
  formats.regex = regexFormats;
  formats['uri-template'] = uriTemplateFormats;

  const abstraction = {};
  abstraction.title = i18n2`Abstraction`;
  abstraction.abstract = i18n2`Abstract`;
  abstraction['abstract-level'] = i18n2`Cannot be instantiated`;
  abstraction['concrete-level'] = i18n2`Can be instantiated`;
  abstraction['unknown-level'] = i18n2`Unknown abstraction`;

  const extensibility = {};
  extensibility.title = i18n2`Extensibility`;
  extensibility.extensible = i18n2`Extensible`;
  extensibility['unknown-extensibility'] = i18n2`Unknown extensibility`;
  extensibility['extensible-level'] = i18n2`Yes`;
  extensibility['inextensible-level'] = i18n2`No`;

  const status = {};
  status.title = i18n2`Status`;
  status.status = i18n2`Status`;
  status['status-level'] = i18n2`Unknown status`;
  status['deprecated-level'] = i18n2`Deprecated`;
  status['stable-level'] = i18n2`Stable`;
  status['stabilizing-level'] = i18n2`Stabilizing`;
  status['experimental-level'] = i18n2`Experimental`;

  const identifiability = {};
  identifiability.title = i18n2`Identifiability`;
  identifiability.identifiable = i18n2`Identifiable`;
  identifiability['identifiable-level'] = i18n2`Yes`;
  identifiability['unidentifiable-level'] = i18n2`No`;
  identifiability['unknown-identifiability'] = i18n2`Unknown identifiability`;

  const customProperties = {};
  customProperties.title = i18n2`Custom Properties`;
  customProperties.allowed = i18n2`Allowed`;
  customProperties['allowed-level'] = i18n2`Allowed`;
  customProperties['forbidden-level'] = i18n2`Forbidden`;
  customProperties['unknown-custom-properties'] = i18n2`Unknown custom properties`;

  const additionalProperties = {};
  additionalProperties.title = i18n2`Additional Properties`;
  additionalProperties.allowed = i18n2`Allowed`;
  additionalProperties['allowed-level'] = i18n2`Allowed`;
  additionalProperties['forbidden-level'] = i18n2`Forbidden`;
  additionalProperties['unknown-additional-properties'] = i18n2`Unknown additional properties`;

  const accessRestrictions = {};
  accessRestrictions.title = i18n2`Access Restrictions`;
  accessRestrictions['read-only'] = i18n2`Read only`;
  accessRestrictions['write-only'] = i18n2`Write only`;
  accessRestrictions['read-write'] = i18n2`cannot be read or written`;
  accessRestrictions['no-restrictions'] = i18n2`none`;

  const definedIn = {};
  definedIn.title = i18n2`Defined In`;
  definedIn['defined-in'] = i18n2`Unknown definition`;

  const metaTables = [
    abstraction,
    extensibility,
    status,
    identifiability,
    customProperties,
    additionalProperties,
    accessRestrictions,
    definedIn,
  ];

  function comment(schema) {
    if (schema[keyword`$comment`]) {
      return [blockquote(schema[symbols_default.meta].comment)];
    }
    return [];
  }

  function schemaHeader(schema) {
    if (header) {
      return [
        heading(1, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Schema`)),
        paragraph(code('json', schema[symbols_default.id] ? '#' + schema[symbols_default.id] : '')),
        schema[symbols_default.meta].description,
        ...comment(schema),
        table(['Name', 'Value'], [
          tableRow(list(map(metaTables, ({ name, title }) => {
            if (links[name]) {
              return tableCell(link(links[name], i18n2`What does ${title} mean?`, text(title)));
            }
            return tableCell(text(title));
          }), Array)),
          tableRow(list(map(metaTables, entry => {
            if (schema[symbols_default.meta] && typeof schema[symbols_default.meta][entry.name] === 'string' && schema[symbols_default.meta][entry.name].length && schema[symbols_default.meta][entry.name].trim()) {
              return tableCell(link(rewritelinks(schema[symbols_default.meta][entry.name].url), i18n2`open original schema`, [text(schema[symbols_default.meta][entry.name].title)]));
            }
            const value = schema[symbols_default.meta] ? schema[symbols_default.meta][entry.name] : undefined;
            return tableCell(text(entry[String(value) + ''] || i18n2`Unknown`));
          }), Array)),
        ]),
      ];
    }
    return [];
  }

  function typeDescription(schema) {
    if (!Array.isArray(schema[keyword`type`]) && typeof schema[keyword`type`] === 'string') {
      return text(i18n2`Unknown Type`);
    }
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const filtered = list(filter(types, type => type !== 'null' && type !== undefined));
    if (schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]) {
      return text(i18n2`Merged`);
    }
    if (size(filtered) === 0) {
      return text(i18n2`Not specified`);
    }
    return size(filtered) === 1 ? inlineCode(filtered[0]) : text(i18n2`Multiple`);
  }

  function nullable(schema) {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const nullTypes = list(filter(types, type => type === keyword`null`));
    if (size(nullTypes)) {
      return text(i18n2`can be null`);
    }
    return text(i18n2`cannot be null`);
  }

  function propertyRow(required = [], optional = false, slugger) {
    return ([name, schema]) => {
      const cells = [
        tableCell(optional ? inlineCode(name) : link('#' + slugger.slug(name), '', text(name))),
        tableCell(typeDescription(schema)),
        tableCell(text(required.includes(name) ? i18n2`Required` : i18n2`Optional`)),
        tableCell(nullable(schema)),
      ];
      if (!singleFile) {
        cells.push(tableCell(linkTo(schema[symbols_default.filename] + '#' + schema[symbols_default.id], text(schema[symbols_default.titles] && schema[symbols_default.titles][0] ? schema[symbols_default.titles][0] : i18n2`Untitled schema`))));
      }
      return tableRow(cells);
    };
  }

  function propertiesTable(properties = {}, patternProperties = {}, additionalProperties, required, slugger) {
    if (skip.includes('properties')) {
      return paragraph();
    }
    const requiredRows = Object.entries(properties).map(propertyRow(required, false, slugger));
    const optionalRows = Object.entries(patternProperties).map(propertyRow(required, true, slugger));
    const additionalRows = (() => {
      if (additionalProperties) {
        const isBool = typeof additionalProperties === 'boolean';
        const cells = [
          tableCell(text(i18n2`Additional Properties`)),
          tableCell(isBool ? text(isBool ? i18n2`Allowed` : i18n2`Forbidden`) : typeDescription(additionalProperties)),
          tableCell(text(i18n2`Optional`)),
          tableCell(isBool ? text(isBool ? i18n2`Allowed` : i18n2`Forbidden`) : nullable(additionalProperties)),
        ];
        if (!singleFile) {
          cells.push(tableCell(isBool ? text('') : linkTo(additionalProperties[symbols_default.filename] + '#' + additionalProperties[symbols_default.id], text(additionalProperties[symbols_default.titles][0] || i18n2`Untitled schema`))));
        }
        return [tableRow(cells)];
      }
      return [];
    })();
    const headerCells = [
      tableCell(text(i18n2`Property`)),
      tableCell(text(i18n2`Type`)),
      tableCell(text(i18n2`Required`)),
      tableCell(text(i18n2`Nullable`)),
    ];
    if (!singleFile) {
      headerCells.push(tableCell(text(i18n2`Defined by`)));
    }
    return table(['Property', 'Type', 'Required', 'Nullable', ...(singleFile ? [] : ['Defined by'])], [
      tableRow(headerCells),
      ...requiredRows,
      ...optionalRows,
      ...additionalRows,
    ]);
  }

  function arrayItems(schema, additionalItems) {
    if (skip.includes('items')) {
      return '';
    }
    return listItem([
      paragraph([
        text(i18n2`Type: `),
        text(i18n2`an array where each item follows the corresponding schema in the following list:`),
      ]),
      list('ordered', [
        ...schema.map(item => listItem(paragraph(linkTo(item[symbols_default.filename] + '#' + item[symbols_default.id], i18n2`check type definition`, text(gentitle(item[symbols_default.titles], item[keyword`type`])))))),
        ...((() => {
          if (additionalItems === true) {
            return [listItem(paragraph(text(i18n2`and all following items may follow any schema`)))];
          }
          if (typeof additionalItems === 'object') {
            return [listItem(paragraph([
              text(i18n2`and all following items must follow the schema: `),
              linkTo(additionalItems[symbols_default.filename] + '#' + additionalItems[symbols_default.id], i18n2`check type definition`, text(gentitle(additionalItems[symbols_default.titles], additionalItems[keyword`type`]))),
            ]))];
          }
          return [];
        })()),
      ]),
    ]);
  }

  function typeSection(schema, suffix = '') {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const nonNull = types.filter(type => type !== keyword`null`);
    const isNullable = types.filter(type => type === keyword`null`).length > 0;
    const hasSingleType = nonNull.length === 1;
    const [singleType] = nonNull;
    const isArray = singleType === keyword`array`;
    const isMerged = !!(schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]);

    if (isArray && Array.isArray(schema[keyword`items`])) {
      return arrayItems(schema[keyword`items`], schema[keyword`additionalItems`]);
    }
    if (isArray && schema[keyword`items`]) {
      return typeSection(schema[keyword`items`], suffix + '[]');
    }

    const typeParts = (() => {
      if (isNullable) {
        return [inlineCode('null' + suffix), text(i18n2`, the value must be null`)];
      }
      if (hasSingleType && typeof singleType === 'string') {
        return [inlineCode(singleType + suffix)];
      }
      if (!hasSingleType) {
        return [
          text(suffix ? i18n2`an array of the following:` : i18n2`any of the following: `),
          ...list(flat(nonNull.map((type, index) => [inlineCode(type || i18n2`not defined`), text(index === nonNull.length - 1 ? '' : i18n2` or `)]))),
        ];
      }
      if (isMerged) {
        return [text(suffix ? i18n2`merged type` : i18n2`merged type`)];
      }
      return [text(i18n2`unknown` + suffix)];
    })();

    const titleParts = (() => {
      if (schema[keyword`title`] && typeof schema[keyword`title`] === 'string') {
        return [
          text(' ('),
          linkTo(schema[symbols_default.filename] + '#' + schema[symbols_default.id], '', text(schema[keyword`title`])),
          text(')'),
        ];
      }
      if (!hasSingleType || singleType === keyword`object` || isMerged) {
        if (singleFile) {
          return [];
        }
        return [
          text(' ('),
          link(schema[symbols_default.filename] + '#' + schema[symbols_default.id], '', text(i18n2`Details`)),
          text(')'),
        ];
      }
      return [];
    })();

    return listItem(paragraph([
      text(i18n2`Type: `),
      ...typeParts,
      ...titleParts,
    ]));
  }

  function nullSection(schema) {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const isNullable = types.filter(type => type === keyword`null`).length > 0;
    if (isNullable) {
      return listItem(paragraph(text(i18n2`can be null`)));
    }
    return listItem(paragraph(text(i18n2`cannot be null`)));
  }

  function definedInSection(schema) {
    return listItem(paragraph([
      text(i18n2`defined in: `),
      linkTo(schema[symbols_default.filename] + '#' + schema[symbols_default.id], schema[symbols_default.id] + '#' + schema[symbols_default.slug], text(schema[symbols_default.titles] && schema[symbols_default.titles][0] ? schema[symbols_default.titles][0] : i18n2`Untitled schema`)),
    ]));
  }

  function propertyDetails(name, schema, required = []) {
    const details = [];
    required.includes(name) ? details.push(listItem(text(i18n2`is required`))) : details.push(listItem(text(i18n2`is optional`)));
    if (!skip.includes('type')) {
      details.push(typeSection(schema));
    }
    if (!skip.includes('nullable')) {
      details.push(nullSection(schema));
    }
    if (!skip.includes('defined-in')) {
      details.push(definedInSection(schema));
    }
    const included = includeProperties.map(prop => {
      if (schema[prop]) {
        return listItem(text(prop + ': ' + String(schema[prop])));
      }
      return undefined;
    }).filter(item => item !== undefined);
    return list('unordered', [...details, ...included]);
  }

  function schemaName(schema) {
    return schema[symbols_default.titles]
      ? schema[symbols_default.titles].split('/').pop()
      : gentitle(schema[symbols_default.titles], schema[keyword`type`]);
  }

  function combinators(schema, depth = 1, maxDepth = 3) {
    if (schema[keyword`oneOf`] && depth <= maxDepth) {
      return [
        paragraph(text(i18n2`one (and only one) of`)),
        list('unordered', [...schema[keyword`oneOf`].map(item => listItem(combinators(item, depth + 1)))]),
      ];
    }
    if (schema[keyword`anyOf`] && depth <= maxDepth) {
      return [
        paragraph(text(i18n2`any of`)),
        list('unordered', [...schema[keyword`anyOf`].map(item => listItem(combinators(item, depth + 1)))]),
      ];
    }
    if (schema[keyword`allOf`] && depth <= maxDepth) {
      return [
        paragraph(text(i18n2`all of`)),
        list('unordered', [...schema[keyword`allOf`].map(item => listItem(combinators(item, depth + 1)))]),
      ];
    }
    if (schema[keyword`not`] && depth <= maxDepth) {
      const notSchema = schema[keyword`not`];
      return [
        paragraph(text(i18n2`not`)),
        list('unordered', [listItem(combinators(notSchema, depth + 1))]),
      ];
    }
    return depth > maxDepth ? [linkTo(schema[symbols_default.filename] + '#' + schema[symbols_default.id], i18n2`check type definition`, text(gentitle(schema[symbols_default.titles], schema[keyword`type`])))] : [];
  }

  function typeHeading(schema, depth = 2) {
    if (skip.includes('type')) {
      return '';
    }
    const { children } = typeSection(schema);
    children[0].children[0].value;
    return [
      heading(depth, text(i18n2`${schemaName(schema)} Type`)),
      ...children,
      ...combinators(schema),
    ];
  }

  function constraints(schema, depth = 2) {
    const result = [];
    if (schema[keyword`const`] !== undefined) {
      result.push(paragraph([
        strong(text(i18n2`constant`)),
        text(': '),
        text(i18n2`the value of this property must be equal to:`),
      ]));
      result.push(code('json', JSON.stringify(schema[keyword`const`], null, 2)));
    }
    if (schema[keyword`enum`]) {
      const explanations = schema[keyword`meta:enum`] || {};
      result.push(paragraph([
        strong(text(i18n2`enum`)),
        text(': '),
        text(i18n2`the value of this property must be equal to one of the following values:`),
      ]));
      result.push(table(['Value', 'Explanation'], [
        tableRow([
          tableCell(text(i18n2`Value`)),
          tableCell(text(i18n2`Explanation`)),
        ]),
        ...Array.isArray(schema[keyword`enum`])
          ? schema[keyword`enum`].map(value => tableRow([
              tableCell(inlineCode(JSON.stringify(value))),
              tableCell(text(explanations[Array.isArray(value) ? JSON.stringify(value) : value] || '')),
            ]))
          : [],
      ]));
    }
    if (schema[keyword`multipleOf`] !== undefined && typeof schema[keyword`multipleOf`] === 'number') {
      result.push(paragraph([
        strong(text(i18n2`multiple of`)),
        text(': '),
        text(i18n2`the value of this number must be a multiple of: `),
        inlineCode(String(schema[keyword`multipleOf`])),
      ]));
    }
    if (schema[keyword`maximum`] !== undefined && typeof schema[keyword`maximum`] === 'number') {
      result.push(paragraph([
        strong(text(i18n2`maximum`)),
        text(': '),
        text(i18n2`the value of this number must smaller than or equal to: `),
        inlineCode(String(schema[keyword`maximum`])),
      ]));
    }
    if (schema[keyword`exclusiveMaximum`] !== undefined && typeof schema[keyword`exclusiveMaximum`] === 'number') {
      result.push(paragraph([
        strong(text(i18n2`maximum (exclusive)`)),
        text(': '),
        text(i18n2`the value of this number must be smaller than: `),
        inlineCode(String(schema[keyword`exclusiveMaximum`])),
      ]));
    }
    if (schema[keyword`minimum`] !== undefined && typeof schema[keyword`minimum`] === 'number') {
      result.push(paragraph([
        strong(text(i18n2`minimum`)),
        text(': '),
        text(i18n2`the value of this number must greater than or equal to: `),
        inlineCode(String(schema[keyword`minimum`])),
      ]));
    }
    if (schema[keyword`exclusiveMinimum`] !== undefined && typeof schema[keyword`exclusiveMinimum`] === 'number') {
      result.push(paragraph([
        strong(text(i18n2`minimum (exclusive)`)),
        text(': '),
        text(i18n2`the value of this number must be greater than: `),
        inlineCode(String(schema[keyword`exclusiveMinimum`])),
      ]));
    }
    if (schema[keyword`maxLength`] !== undefined && typeof schema[keyword`maxLength`] === 'number') {
      result.push(paragraph([
        strong(text(i18n2`maximum length`)),
        text(': '),
        text(i18n2`the maximum number of characters for this string is: `),
        inlineCode(String(schema[keyword`maxLength`])),
      ]));
    }
    if (schema[keyword`minLength`] !== undefined && typeof schema[keyword`minLength`] === 'number') {
      result.push(paragraph([
        strong(text(i18n2`minimum length`)),
        text(': '),
        text(i18n2`the minimum number of characters for this string is: `),
        inlineCode(String(schema[keyword`minLength`])),
      ]));
    }
    if (schema[keyword`pattern`]) {
      result.push(paragraph([
        strong(text(i18n2`pattern`)),
        text(': '),
        text(i18n2`the string must match the following regular expression: `),
      ]));
      result.push(code('regex', schema[keyword`pattern`]));
      result.push(paragraph([
        link('https://regexr.com/?expression=' + encodeURIComponent(schema[keyword`pattern`]), i18n2`try regular expression with regexr.com`, text(i18n2`try pattern`)),
      ]));
    }
    if (schema[keyword`format`] && typeof schema[keyword`format`] === 'string' && formats[schema[keyword`format`]]) {
      result.push(paragraph([
        strong(text(formats[keyword(schema[keyword`format`])].title)),
        text(': '),
        text(formats[schema[keyword`format`]].description),
        link(formats[schema[keyword`format`]].link, i18n2`check the specification`, text(formats[schema[keyword`format`]].linkText)),
      ]));
    } else if (schema[keyword`format`] && typeof schema[keyword`format`] === 'string') {
      result.push(paragraph([
        strong(text(i18n2`unknown format`)),
        text(': '),
        text(i18n2`the value of this string must follow the format: `),
        inlineCode(String(schema[keyword`format`])),
      ]));
    }
    if (schema[keyword`contentEncoding`]) {
      result.push(paragraph([
        strong(text(i18n2`encoding`)),
        text(': '),
        text(i18n2`the string content must be using the ${schema[keyword`contentEncoding`]} content encoding.`),
      ]));
    }
    if (schema[keyword`contentMediaType`]) {
      result.push(paragraph([
        strong(text(i18n2`media type`)),
        text(': '),
        text(i18n2`the media type of the contents of this string is: `),
        inlineCode(String(schema[keyword`contentMediaType`])),
      ]));
    }
    if (schema[keyword`contentSchema`]) {
      result.push(paragraph([
        strong(text(i18n2`schema`)),
        text(': '),
        text(i18n2`the contents of this string should follow this schema: `),
        linkTo(schema[keyword`contentSchema`][symbols_default.filename] + '#' + schema[keyword`contentSchema`][symbols_default.id], i18n2`check type definition`, text(gentitle(schema[keyword`contentSchema`][symbols_default.titles], schema[keyword`contentSchema`][keyword`type`]))),
      ]));
    }
    if (schema[keyword`maxItems`] !== undefined) {
      result.push(paragraph([
        strong(text(i18n2`maximum number of items`)),
        text(': '),
        text(i18n2`the maximum number of items for this array is: `),
        inlineCode(String(schema[keyword`maxItems`])),
      ]));
    }
    if (schema[keyword`minItems`] !== undefined) {
      result.push(paragraph([
        strong(text(i18n2`minimum number of items`)),
        text(': '),
        text(i18n2`the minimum number of items for this array is: `),
        inlineCode(String(schema[keyword`minItems`])),
      ]));
    }
    if (schema[keyword`uniqueItems`]) {
      result.push(paragraph([
        strong(text(i18n2`unique items`)),
        text(': '),
        text(i18n2`all items in this array must be unique. Duplicates are not allowed.`),
      ]));
    }
    if (schema[keyword`minContains`] !== undefined && schema[keyword`contains`]) {
      result.push(paragraph([
        strong(text(i18n2`minimum number of contained items`)),
        text(': '),
        text(i18n2`this array may not contain fewer than ${String(schema[keyword`minContains`])} items that validate against the schema:` + ' '),
        linkTo(schema[keyword`contains`][symbols_default.filename] + '#' + schema[keyword`contains`][symbols_default.id], i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`]))),
      ]));
    }
    if (schema[keyword`maxContains`] !== undefined && schema[keyword`contains`]) {
      result.push(paragraph([
        strong(text(i18n2`maximum number of contained items`)),
        text(': '),
        text(i18n2`this array may not contain more than ${String(schema[keyword`maxContains`])} items that validate against the schema:` + ' '),
        linkTo(schema[keyword`contains`][symbols_default.filename] + '#' + schema[keyword`contains`][symbols_default.id], i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`]))),
      ]));
    }
    if (schema[keyword`maxProperties`] !== undefined) {
      result.push(paragraph([
        strong(text(i18n2`maximum number of properties`)),
        text(': '),
        text(i18n2`the maximum number of properties for this object is: `),
        inlineCode(String(schema[keyword`maxProperties`])),
      ]));
    }
    if (schema[keyword`minProperties`] !== undefined) {
      result.push(paragraph([
        strong(text(i18n2`minimum number of properties`)),
        text(': '),
        text(i18n2`the minimum number of properties for this object is: `),
        inlineCode(String(schema[keyword`minProperties`])),
      ]));
    }
    if (result.length > 0) {
      return [
        heading(depth, text(i18n2`${schemaName(schema)} Constraints`)),
        ...result,
      ];
    }
    return [];
  }

  function examples(schema, depth = 2) {
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === 'yaml') {
      return [
        heading(depth, text(i18n2`${schemaName(schema)} Examples`)),
        ...schema[keyword`examples`].map(example => paragraph(code('yaml', Symbol_3.dump(example, null, 2)))),
      ];
    }
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === 'json') {
      return [
        heading(depth, text(i18n2`${schemaName(schema)} Examples`)),
        ...schema[keyword`examples`].map(example => paragraph(code('json', JSON.stringify(example, null, 2)))),
      ];
    }
    return [];
  }

  function defaultValue(schema, depth = 2) {
    if (schema[keyword`default`] !== undefined) {
      return [
        heading(depth, text(i18n2`${schemaName(schema)} Default Value`)),
        paragraph(text(i18n2`The default value is:`)),
        paragraph(code('json', JSON.stringify(schema[keyword`default`], null, 2))),
      ];
    }
    return [];
  }

  function accessRestrictionsSection(schema, depth = 2) {
    if (schema[keyword`readOnly`] && schema[keyword`writeOnly`]) {
      return [
        heading(depth, text(i18n2`${schemaName(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`)),
      ];
    }
    if (schema[keyword`readOnly`]) {
      return [
        heading(depth, text(i18n2`${schemaName(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`)),
      ];
    }
    if (schema[keyword`writeOnly`]) {
      return [
        heading(depth, text(i18n2`${schemaName(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`)),
      ];
    }
    return [];
  }

  function propertySections(properties = {}, patternProperties = {}, additionalProperties, required, depth = 2) {
    return [
      ...list(flat(Object.entries(properties).map(([name, schema]) => {
        const description = schema[symbols_default.meta] && schema[symbols_default.meta].description
          ? schema[symbols_default.meta].description
          : paragraph(text(i18n2`no description`));
        return [
          heading(depth, text(name)),
          description,
          ...comment(schema),
          paragraph(inlineCode(name)),
          propertyDetails(name, schema, required),
          ...typeHeading(schema, depth + 1),
          ...constraints(schema, depth + 1),
          ...defaultValue(schema, depth + 1),
          ...examples(schema, depth + 1),
          ...accessRestrictionsSection(schema, depth + 1),
        ];
      }))),
      ...list(flat(Object.entries(patternProperties).map(([pattern, schema]) => {
        const description = schema[symbols_default.meta] && schema[symbols_default.meta].description
          ? schema[symbols_default.meta].description
          : paragraph(text(i18n2`no description`));
        return [
          heading(depth, [text(i18n2`Pattern: `), inlineCode(pattern)]),
          description,
          ...comment(schema),
          paragraph(inlineCode(pattern)),
          propertyDetails(pattern, schema, required),
          ...typeHeading(schema, depth + 1),
          ...constraints(schema, depth + 1),
          ...defaultValue(schema, depth + 1),
          ...examples(schema, depth + 1),
          ...accessRestrictionsSection(schema, depth + 1),
        ];
      }))),
      ...(additionalProperties => {
        if (typeof additionalProperties === 'object') {
          const description = additionalProperties[symbols_default.meta].description || paragraph(text(i18n2`no description`));
          return [
            heading(depth, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)),
            description,
            ...comment(additionalProperties),
            propertyDetails(i18n2`Additional properties`, additionalProperties, required),
            ...typeHeading(additionalProperties, depth + 1),
            ...constraints(additionalProperties, depth + 1),
            ...defaultValue(additionalProperties, depth + 1),
            ...examples(additionalProperties, depth + 1),
            ...accessRestrictionsSection(additionalProperties, depth + 1),
          ];
        }
        if (additionalProperties === true) {
          return [
            heading(depth, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`)),
          ];
        }
        return [];
      })(additionalProperties),
    ];
  }

  function definitions(schema, slugger) {
    if (schema[keyword`$defs`] || schema[keyword`definitions`]) {
      const entries = [
        ...Object.entries(schema[keyword`$defs`] || {}),
        ...Object.entries(schema[keyword`definitions`] || {}),
      ].map(([name, definition]) => {
        const table = propertiesTable(definition[keyword`properties`], definition[keyword`patternProperties`], definition[keyword`additionalProperties`], definition[keyword`required`], slugger);
        const ref = {};
        ref[symbols_default.id] = definition[symbols_default.id] + '#' + definition[symbols_default.slug];
        return [
          heading(2, text(i18n2`Definitions group ${name}`)),
          paragraph(text(i18n2`Reference this group by using`)),
          code('json', JSON.stringify(ref)),
          table,
          ...propertySections(definition[keyword`properties`], definition[keyword`patternProperties`], definition[keyword`additionalProperties`], definition[keyword`required`], 3),
        ];
      });
      return [
        heading(1, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Definitions`)),
        ...list(flat(entries)),
      ];
    }
    return [];
  }

  function propertiesSection(schema, slugger) {
    if (schema[keyword`properties`] || schema[keyword`patternProperties`] || schema[keyword`additionalProperties`]) {
      return [
        heading(2, text(i18n2`${schemaName(schema)} Properties`)),
        propertiesTable(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], slugger),
        ...propertySections(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], 3),
      ];
    }
    return [];
  }

  return console.log('build'), schemas => foldl(schemas, {}, (acc, schema) => {
    const slugger = new Symbol_2();
    acc[schema[symbols_default.id]] = root([
      ...schemaHeader(schema),
      ...typeHeading(schema, 2),
      ...constraints(schema, 2),
      ...defaultValue(schema, 2),
      ...examples(schema, 2),
      ...propertiesSection(schema, slugger),
      ...definitions(schema, slugger),
    ]);
    return acc;
  });
}

export { build as default };
