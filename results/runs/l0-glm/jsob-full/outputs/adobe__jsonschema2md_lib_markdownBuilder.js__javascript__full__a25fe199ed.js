import i18n from 'es2015-i18n-tag';
import { map, list, flat, filter, size, foldl } from 'ferrum';
import { root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list as mdList, listItem, strong, blockquote } from 'mdast-builder';
import i18n2 from 'es2015-i18n-tag';
import Slugger from 'github-slugger';
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
  parent: Symbol('parent')
};
const symbols_default = symbols;

function gentitle(types, typeHint) {
  if (!Array.isArray(types)) {
    return i18n`Untitled schema`;
  }
  const [first] = types;
  const unique = [...types].reverse();
  if (types.length === 1 && first !== undefined) {
    return first;
  }
  if (unique) {
    return unique;
  }
  if (typeof typeHint === 'string') {
    return i18n`Untitled ${typeHint} in ${String(first)}`;
  }
  if (first === undefined) {
    return i18n`Untitled schema`;
  }
  return i18n`Untitled undefined type in ${first}`;
}

function gendescription(schema) {
  return schema && schema[symbols_default.meta] ? schema[symbols_default.meta].description : '';
}

const used = new Set();

function keyword(kw) {
  used.add(kw[0]);
  return kw.join('');
}

function report() {
  return used;
}

function build({ header, links = {}, includeProperties = [], rewritelinks = (x) => x, exampleFormat = 'yaml', skipProperties = [], singleFile = false } = {}) {
  const skipProps = singleFile ? [...new Set([...skipProperties, 'examples'])] : skipProperties;

  function makeLink(url, title, children) {
    if (singleFile) {
      return children;
    }
    return link(url, title, children);
  }

  const formatDescriptions = {
    'date-time': { title: i18n2`date time`, description: i18n2`the string must be a date time string, according to `, spec: 'RFC 3339 section 5.6', link: 'https://tools.ietf.org/html/rfc3339#section-5.6' },
    date: { title: i18n2`date`, description: i18n2`the string must be a date string, according to `, spec: 'RFC 3339 section 5.6', link: 'https://tools.ietf.org/html/rfc3339#section-5.6' },
    time: { title: i18n2`time`, description: i18n2`the string must be a time string, according to `, spec: 'RFC 3339 section 5.6', link: 'https://tools.ietf.org/html/rfc3339#section-5.6' },
    duration: { title: i18n2`duration`, description: i18n2`the string must be a duration string, according to `, spec: 'RFC 3339 section 5.6', link: 'https://tools.ietf.org/html/rfc3339#section-5.6' },
    email: { title: i18n2`email`, description: i18n2`the string must be an email address, according to `, spec: 'RFC 5322 section 3.4.1', link: 'https://tools.ietf.org/html/rfc5322#section-3.4.1' },
    idnEmail: { title: i18n2`(international) email`, description: i18n2`the string must be an (international) email address, according to `, spec: 'RFC 6531', link: 'https://tools.ietf.org/html/rfc6531' },
    hostname: { title: i18n2`hostname`, description: i18n2`the string must be a hostname, according to `, spec: 'RFC 1034 section 3.1', link: 'https://tools.ietf.org/html/rfc1034#section-3.1' },
    idnHostname: { title: i18n2`(international) hostname`, description: i18n2`the string must be an (IDN) hostname, according to `, spec: 'RFC5890 section 2.3.2.3', link: 'https://tools.ietf.org/html/rfc5890#section-2.3.2.3' },
    ipv4: { title: i18n2`IPv4`, description: i18n2`the string must be an IPv4 address (dotted quad), according to `, spec: 'RFC 2673 section 3.2', link: 'https://tools.ietf.org/html/rfc2673#section-3.2' },
    ipv6: { title: i18n2`IPv6`, description: i18n2`the string must be an IPv6 address, according to `, spec: 'RFC 4291 section 2.2', link: 'https://tools.ietf.org/html/rfc4291#section-2.2' },
    uri: { title: i18n2`URI`, description: i18n2`the string must be a URI, according to `, spec: 'RFC 3986', link: 'https://tools.ietf.org/html/rfc3986' },
    iri: { title: i18n2`IRI`, description: i18n2`the string must be a IRI, according to `, spec: 'RFC 3987', link: 'https://tools.ietf.org/html/rfc3987' },
    uriReference: { title: i18n2`URI reference`, description: i18n2`the string must be a URI reference, according to `, spec: 'RFC 3986 section 4.1', link: 'https://tools.ietf.org/html/rfc3986#section-4.1' },
    iriReference: { title: i18n2`IRI reference`, description: i18n2`the string must be a IRI reference, according to `, spec: 'RFC 3987 section 6.5', link: 'https://tools.ietf.org/html/rfc3987#section-6.5' },
    uuid: { title: i18n2`UUID`, description: i18n2`the string must be a UUID, according to `, spec: 'RFC 4122', link: 'https://tools.ietf.org/html/rfc4122' },
    jsonPointer: { title: i18n2`JSON Pointer`, description: i18n2`the string must be a JSON Pointer, according to `, spec: 'RFC 6901 section 5', link: 'https://tools.ietf.org/html/rfc6901#section-5' },
    relativeJsonPointer: { title: i18n2`Relative JSON Pointer`, description: i18n2`the string must be a relative JSON Pointer, according to `, spec: 'draft-handrews-relative-json-pointer-01', link: 'https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01' },
    regex: { title: i18n2`RegEx`, description: i18n2`the string must be a regular expression, according to `, spec: 'ECMA-262 section 21.2.1', link: 'https://www.ecma-international.org/ecma-262/11.0/index.html#sec-patterns' },
    uriTemplate: { title: i18n2`URI Template`, description: i18n2`the string must be a URI template, according to `, spec: 'RFC 6570', link: 'https://tools.ietf.org/html/rfc6570' }
  };

  const abstractionTable = [
    { name: 'abstract', title: i18n2`Abstract`, description: i18n2`Cannot be instantiated`, true: i18n2`Can be instantiated`, false: i18n2`Unknown abstraction` },
    { name: 'extensible', title: i18n2`Extensible`, description: i18n2`Unknown extensibility`, true: i18n2`Yes`, false: i18n2`No` },
    { name: 'status', title: i18n2`Status`, description: i18n2`Deprecated`, true: i18n2`Stable`, false: i18n2`Stabilizing`, experimental: i18n2`Experimental` },
    { name: 'identifiable', title: i18n2`Identifiable`, description: i18n2`Yes`, true: i18n2`No`, false: i18n2`Unknown identifiability` },
    { name: 'customProperties', title: i18n2`Custom Properties`, description: i18n2`Allowed`, true: i18n2`Forbidden`, false: i18n2`Unknown custom properties` },
    { name: 'additionalProperties', title: i18n2`Additional Properties`, description: i18n2`Allowed`, true: i18n2`Forbidden`, false: i18n2`Unknown additional properties` },
    { name: 'definedIn', title: i18n2`Defined In`, description: i18n2`Unknown definition` }
  ];

  function renderComment(schema) {
    if (schema[keyword`$comment`]) {
      return [blockquote(schema[symbols_default.meta].$comment)];
    }
    return [];
  }

  function renderSchemaHeader(schema) {
    if (header) {
      return [
        heading(1, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Schema`)),
        paragraph(code('yaml', schema[symbols_default.id] + (schema[symbols_default.slug] ? '#' + schema[symbols_default.slug] : ''))),
        schema[symbols_default.meta].description,
        ...renderComment(schema),
        table(null, [
          tableRow(list(map(abstractionTable, ({ name, title }) => {
            if (links[name]) return tableCell(link(links[name], i18n2`What does ${title} mean?`, text(title)));
            return tableCell(text(title));
          }), Array)),
          tableRow(list(map(abstractionTable, row => {
            if (schema[symbols_default.meta] && typeof schema[symbols_default.meta][row.name] === 'string' && schema[symbols_default.meta][row.name].link) {
              return tableCell(link(rewritelinks(schema[symbols_default.meta][row.name].link), i18n2`open original schema`, [text(schema[symbols_default.meta][row.name].value)]));
            }
            const value = schema[symbols_default.meta] ? schema[symbols_default.meta][row.name] : undefined;
            return tableCell(text(row[String(value)] || i18n2`Unknown`));
          }), Array))
        ])
      ];
    }
    return [];
  }

  function renderType(schema) {
    if (!Array.isArray(schema[keyword`type`]) && typeof schema[keyword`type`] === 'undefined') return text(i18n2`Unknown Type`);
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const filtered = list(filter(types, t => t !== 'null' && t !== undefined));
    if (schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]) {
      return text(i18n2`Merged`);
    } else {
      if (size(filtered) === 0) return text(i18n2`Not specified`);
    }
    return size(filtered) === 1 ? inlineCode(filtered[0]) : text(i18n2`Multiple`);
  }

  function renderNullable(schema) {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const nulls = filter(types, t => t === keyword`null`);
    if (size(nulls)) {
      return text(i18n2`can be null`);
    }
    return text(i18n2`cannot be null`);
  }

  function renderPropertyRow(required, isInline) {
    return ([name, sub]) => {
      const cells = [
        tableCell(isInline ? inlineCode(name) : link('#' + Slugger.slug(name), '', text(name))),
        tableCell(renderType(sub)),
        tableCell(text(required.includes(name) ? -1 ? i18n2`Required` : i18n2`Optional` : i18n2`Optional`)),
        tableCell(renderNullable(sub))
      ];
      if (!singleFile) {
        cells.push(tableCell(makeLink(sub[symbols_default.pointer] + '', sub[symbols_default.id] + '#' + sub[symbols_default.slug], text(sub[symbols_default.titles] && sub[symbols_default.titles][0] ? sub[symbols_default.titles][0] : i18n2`Untitled schema`))));
      }
      return tableRow(cells);
    };
  }

  function renderPropertiesTable(properties = {}, patternProperties = {}, additionalProperties, required, slugger) {
    if (skipProps.includes(keyword`properties`)) return paragraph();
    const propRows = Object.entries(properties).map(renderPropertyRow(required, false, slugger));
    const patternRows = Object.entries(patternProperties).map(renderPropertyRow(required, true, slugger));
    const additionalRows = (() => {
      if (additionalProperties) {
        if (typeof additionalProperties === 'object') {
          const desc = additionalProperties[symbols_default.meta] && additionalProperties[symbols_default.meta].description ? additionalProperties[symbols_default.meta].description : paragraph(text(i18n2`no description`));
          return [
            heading(2, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)),
            desc,
            ...renderComment(additionalProperties),
            paragraph(inlineCode('*')),
            renderPropertyRow(i18n2`Additional properties`, additionalProperties, slugger),
            ...renderTypeDetails(additionalProperties, 3),
            ...renderConstraints(additionalProperties, 3),
            ...renderDefaultValue(additionalProperties, 3),
            ...renderExamples(additionalProperties, 3),
            ...renderAccessRestrictions(additionalProperties, 3)
          ];
        } else if (additionalProperties === true) {
          return [
            heading(2, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`))
          ];
        }
      }
      return [];
    })();
    const headerRow = [
      tableCell(text(i18n2`Property`)),
      tableCell(text(i18n2`Type`)),
      tableCell(text(i18n2`Required`)),
      tableCell(text(i18n2`Nullable`))
    ];
    if (!singleFile) {
      headerRow.push(tableCell(text(i18n2`Defined by`)));
    }
    return table(null, [tableRow(headerRow), ...propRows, ...patternRows, ...additionalRows]);
  }

  function renderArrayItems(items, additionalItems) {
    if (!skipProps.includes(keyword`items`)) {
      return listItem(paragraph([
        text(i18n2`Type: `),
        text(i18n2`an array where each item follows the corresponding schema in the following list:`)
      ]), mdList('ordered', [
        ...items.map(item => listItem(paragraph(makeLink(item[symbols_default.pointer] + '', i18n2`check type definition`, text(gentitle(item[symbols_default.titles], item[keyword`type`])))))),
        ...((() => {
          if (additionalItems === true) {
            return [listItem(paragraph(text(i18n2`and all following items may follow any schema`)))];
          } else if (typeof additionalItems === 'object') {
            return [listItem(paragraph([
              text(i18n2`and all following items must follow the schema: `),
              makeLink(additionalItems[symbols_default.pointer] + '', i18n2`check type definition`, text(gentitle(additionalItems[symbols_default.titles], additionalItems[keyword`type`])))
            ]))];
          }
          return [];
        })())
      ]));
    }
    return '';
  }

  function renderTypeDetails(schema, pathPrefix = '') {
    if (skipProps.includes(keyword`type`)) return '';
    const { children } = renderTypeListItem(schema, pathPrefix);
    return children[0].children.flat(), [
      heading(2, text(i18n2`${getTitle(schema)} Type`)),
      ...children,
      ...renderCombinators(schema, pathPrefix)
    ];
  }

  function renderTypeListItem(schema, pathPrefix = '') {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const nonNull = types.filter(t => t !== keyword`null`);
    const hasNull = types.filter(t => t === keyword`null`).length > 0;
    const singleType = nonNull.length === 1;
    const [firstType] = nonNull;
    const isNullable = hasNull && nonNull.length > 0;
    const isArray = firstType === keyword`array`;
    const isMerged = !!(schema[keyword`allOf`] || schema[keyword`anyOf`] || schema[keyword`oneOf`] || schema[keyword`not`]);

    if (isArray && Array.isArray(schema[keyword`items`])) {
      return renderArrayItems(schema[keyword`items`], schema[keyword`additionalItems`]);
    } else if (isArray && schema[keyword`items`]) {
      return renderTypeListItem(schema[keyword`items`], pathPrefix + '[]');
    }

    const typeContent = (() => {
      if (isNullable) {
        return [inlineCode(firstType + pathPrefix), text(i18n2`, the value must be null`)];
      } else if (singleType && typeof firstType === 'string') {
        return [inlineCode(firstType + pathPrefix)];
      } else if (!singleType) {
        return [text(pathPrefix ? i18n2`an array of the following:` : i18n2`any of the following: `), ...list(flat(nonNull.map((t, i) => [inlineCode(t || i18n2`not defined`), text(i === nonNull.length - 1 ? '' : i18n2` or `)])))];
      } else {
        if (isMerged) {
          return [text(pathPrefix ? i18n2`merged type` : i18n2`merged type`)];
        }
      }
      return [text(i18n2`unknown` + pathPrefix)];
    })();

    const titleContent = (() => {
      if (schema[keyword`title`] && typeof schema[keyword`title`] === 'string') {
        return [text(' ('), makeLink(schema[symbols_default.pointer] + '', '', text(schema[keyword`title`])), text(')')];
      } else {
        if (!singleType || firstType === keyword`object` || isMerged) {
          if (singleFile) return [];
          return [text(' ('), link(schema[symbols_default.pointer] + '', '', text(i18n2`Details`)), text(')')];
        }
      }
      return [];
    })();

    return listItem(paragraph([text(i18n2`Type: `), ...typeContent, ...titleContent]));
  }

  function renderNullableListItem(schema) {
    const types = Array.isArray(schema[keyword`type`]) ? schema[keyword`type`] : [schema[keyword`type`]];
    const nulls = types.filter(t => t === keyword`null`).length;
    if (nulls) {
      return listItem(paragraph(text(i18n2`can be null`)));
    } else {
      return listItem(paragraph(text(i18n2`cannot be null`)));
    }
  }

  function renderDefinedInListItem(schema) {
    return listItem(paragraph([
      text(i18n2`defined in: `),
      makeLink(schema[symbols_default.pointer] + '', schema[symbols_default.id] + '#' + schema[symbols_default.slug], text(schema[symbols_default.titles] && schema[symbols_default.titles][0] ? schema[symbols_default.titles][0] : i18n2`Untitled schema`))
    ]));
  }

  function renderPropertyDetails(name, schema, required = []) {
    const details = [];
    required.includes(name) ? details.push(listItem(text(i18n2`is required`))) : details.push(listItem(text(i18n2`is optional`)));
    if (!skipProps.includes(keyword`type`)) details.push(renderTypeListItem(schema));
    if (!skipProps.includes(keyword`nullable`)) details.push(renderNullableListItem(schema));
    if (!skipProps.includes(keyword`definedIn`)) details.push(renderDefinedInListItem(schema));
    const included = includeProperties.map(prop => {
      if (schema[prop]) {
        return listItem(text(prop + ': ' + String(schema[prop])));
      }
      return undefined;
    }).filter(x => x !== undefined);
    return details.push(...included), mdList('bullet', details);
  }

  function getTitle(schema) {
    return schema[symbols_default.slug] ? schema[symbols_default.slug].split('/').pop() : gentitle(schema[symbols_default.titles], schema[keyword`type`]);
  }

  function renderCombinators(schema, depth = 0, maxDepth = 10) {
    if (schema[keyword`oneOf`] && depth < maxDepth) {
      return [paragraph(text(i18n2`one (and only one) of`)), mdList('ordered', [...schema[keyword`oneOf`].map(s => listItem(renderCombinators(s, depth + 1)))])];
    } else if (schema[keyword`anyOf`] && depth < maxDepth) {
      return [paragraph(text(i18n2`any of`)), mdList('ordered', [...schema[keyword`anyOf`].map(s => listItem(renderCombinators(s, depth + 1)))])];
    } else if (schema[keyword`allOf`] && depth < maxDepth) {
      return [paragraph(text(i18n2`all of`)), mdList('ordered', [...schema[keyword`allOf`].map(s => listItem(renderCombinators(s, depth + 1)))])];
    } else if (schema[keyword`not`] && depth < maxDepth) {
      const notSchema = schema[keyword`not`];
      return [paragraph(text(i18n2`not`)), mdList('ordered', [listItem(renderCombinators(notSchema, depth + 1))])];
    } else {
      return depth > 0 ? [makeLink(schema[symbols_default.pointer] + '', i18n2`check type definition`, text(gentitle(schema[symbols_default.titles], schema[keyword`type`])))] : [];
    }
  }

  function renderTypeSection(schema, depth = 2) {
    if (skipProps.includes(keyword`type`)) return '';
    const { children } = renderTypeListItem(schema);
    return children[0].children.flat(), [
      heading(depth, text(i18n2`${getTitle(schema)} Type`)),
      ...children,
      ...renderCombinators(schema)
    ];
  }

  function renderConstraints(schema, depth = 2) {
    const constraints = [];

    if (schema[keyword`const`] !== undefined) {
      constraints.push(paragraph([strong(text(i18n2`constant`)), text(': '), text(i18n2`the value of this property must be equal to:`)]));
      constraints.push(code('json', JSON.stringify(schema[keyword`const`], undefined, 2)));
    }

    if (schema[keyword`enum`]) {
      const metaEnum = schema[keyword`meta:enum`] || {};
      constraints.push(paragraph([strong(text(i18n2`enum`)), text(': '), text(i18n2`the value of this property must be equal to one of the following values:`)]));
      constraints.push(table(null, [
        tableRow([tableCell(text(i18n2`Value`)), tableCell(text(i18n2`Explanation`))]),
        ...Array.isArray(schema[keyword`enum`]) ? schema[keyword`enum`].map(v => tableRow([tableCell(inlineCode(JSON.stringify(v))), tableCell(text(metaEnum[Array.isArray(v) ? JSON.stringify(v) : v] || ''))])) : []
      ]));
    }

    if (schema[keyword`multipleOf`] !== undefined && typeof schema[keyword`multipleOf`] === 'number') {
      constraints.push(paragraph([strong(text(i18n2`multiple of`)), text(': '), text(i18n2`the value of this number must be a multiple of: `), inlineCode(String(schema[keyword`multipleOf`]))]));
    }

    if (schema[keyword`maximum`] !== undefined && typeof schema[keyword`maximum`] === 'number') {
      constraints.push(paragraph([strong(text(i18n2`maximum`)), text(': '), text(i18n2`the value of this number must smaller than or equal to: `), inlineCode(String(schema[keyword`maximum`]))]));
    }

    if (schema[keyword`exclusiveMaximum`] !== undefined && typeof schema[keyword`exclusiveMaximum`] === 'number') {
      constraints.push(paragraph([strong(text(i18n2`maximum (exclusive)`)), text(': '), text(i18n2`the value of this number must be smaller than: `), inlineCode(String(schema[keyword`exclusiveMaximum`]))]));
    }

    if (schema[keyword`minimum`] !== undefined && typeof schema[keyword`minimum`] === 'number') {
      constraints.push(paragraph([strong(text(i18n2`minimum`)), text(': '), text(i18n2`the value of this number must greater than or equal to: `), inlineCode(String(schema[keyword`minimum`]))]));
    }

    if (schema[keyword`exclusiveMinimum`] !== undefined && typeof schema[keyword`exclusiveMinimum`] === 'number') {
      constraints.push(paragraph([strong(text(i18n2`minimum (exclusive)`)), text(': '), text(i18n2`the value of this number must be greater than: `), inlineCode(String(schema[keyword`exclusiveMinimum`]))]));
    }

    if (schema[keyword`maxLength`] !== undefined && typeof schema[keyword`maxLength`] === 'number') {
      constraints.push(paragraph([strong(text(i18n2`maximum length`)), text(': '), text(i18n2`the maximum number of characters for this string is: `), inlineCode(String(schema[keyword`maxLength`]))]));
    }

    if (schema[keyword`minLength`] !== undefined && typeof schema[keyword`minLength`] === 'number') {
      constraints.push(paragraph([strong(text(i18n2`minimum length`)), text(': '), text(i18n2`the minimum number of characters for this string is: `), inlineCode(String(schema[keyword`minLength`]))]));
    }

    if (schema[keyword`pattern`]) {
      constraints.push(paragraph([strong(text(i18n2`pattern`)), text(': '), text(i18n2`the string must match the following regular expression: `)]));
      constraints.push(code('regex', schema[keyword`pattern`]));
      constraints.push(paragraph([link('https://regexr.com/?expression=' + encodeURIComponent(schema[keyword`pattern`]), i18n2`try regular expression with regexr.com`, text(i18n2`try pattern`))]));
    }

    if (schema[keyword`format`] && typeof schema[keyword`format`] === 'string' && formatDescriptions[schema[keyword`format`]]) {
      const fmt = formatDescriptions[schema[keyword`format`]];
      constraints.push(paragraph([strong(text(fmt.title)), text(': '), text(fmt.description), link(fmt.link, i18n2`check the specification`, text(fmt.spec))]));
    } else if (schema[keyword`format`] && typeof schema[keyword`format`] === 'string') {
      constraints.push(paragraph([strong(text(i18n2`unknown format`)), text(': '), text(i18n2`the value of this string must follow the format: `), inlineCode(String(schema[keyword`format`]))]));
    }

    if (schema[keyword`contentEncoding`]) {
      constraints.push(paragraph([strong(text(i18n2`encoding`)), text(': '), text(i18n2`the string content must be using the ${schema[keyword`contentEncoding`]} content encoding.`)]));
    }

    if (schema[keyword`contentMediaType`]) {
      constraints.push(paragraph([strong(text(i18n2`media type`)), text(': '), text(i18n2`the media type of the contents of this string is: `), inlineCode(String(schema[keyword`contentMediaType`]))]));
    }

    if (schema[keyword`contentSchema`]) {
      constraints.push(paragraph([strong(text(i18n2`schema`)), text(': '), text(i18n2`the contents of this string should follow this schema: `), makeLink(schema[keyword`contentSchema`][symbols_default.pointer] + '', i18n2`check type definition`, text(gentitle(schema[keyword`contentSchema`][symbols_default.titles], schema[keyword`contentSchema`][keyword`type`])))]));
    }

    if (schema[keyword`maxItems`] !== undefined) {
      constraints.push(paragraph([strong(text(i18n2`maximum number of items`)), text(': '), text(i18n2`the maximum number of items for this array is: `), inlineCode(String(schema[keyword`maxItems`]))]));
    }

    if (schema[keyword`minItems`] !== undefined) {
      constraints.push(paragraph([strong(text(i18n2`minimum number of items`)), text(': '), text(i18n2`the minimum number of items for this array is: `), inlineCode(String(schema[keyword`minItems`]))]));
    }

    if (schema[keyword`uniqueItems`]) {
      constraints.push(paragraph([strong(text(i18n2`unique items`)), text(': '), text(i18n2`all items in this array must be unique. Duplicates are not allowed.`)]));
    }

    if (schema[keyword`minContains`] !== undefined && schema[keyword`contains`]) {
      constraints.push(paragraph([strong(text(i18n2`minimum number of contained items`)), text(': '), text(i18n2`this array may not contain fewer than ${String(schema[keyword`minContains`])} items that validate against the schema:` + ' '), makeLink(schema[keyword`contains`][symbols_default.pointer] + '', i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`])))]));
    }

    if (schema[keyword`maxContains`] !== undefined && schema[keyword`contains`]) {
      constraints.push(paragraph([strong(text(i18n2`maximum number of contained items`)), text(': '), text(i18n2`this array may not contain more than ${String(schema[keyword`maxContains`])} items that validate against the schema:` + ' '), makeLink(schema[keyword`contains`][symbols_default.pointer] + '', i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`])))]));
    }

    if (schema[keyword`maxProperties`] !== undefined) {
      constraints.push(paragraph([strong(text(i18n2`maximum number of properties`)), text(': '), text(i18n2`the maximum number of properties for this object is: `), inlineCode(String(schema[keyword`maxProperties`]))]));
    }

    if (schema[keyword`minProperties`] !== undefined) {
      constraints.push(paragraph([strong(text(i18n2`minimum number of properties`)), text(': '), text(i18n2`the minimum number of properties for this object is: `), inlineCode(String(schema[keyword`minProperties`]))]));
    }

    if (constraints.length > 0) {
      return [heading(2, text(i18n2`${getTitle(schema)} Constraints`)), ...constraints];
    }
    return [];
  }

  function renderExamples(schema, depth = 2) {
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === 'yaml') {
      return [heading(depth, text(i18n2`${getTitle(schema)} Examples`)), ...schema[keyword`examples`].map(example => paragraph(code('yaml', yaml.dump(example, undefined, 2))))];
    }
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === 'json') {
      return [heading(depth, text(i18n2`${getTitle(schema)} Examples`)), ...schema[keyword`examples`].map(example => paragraph(code('json', JSON.stringify(example, undefined, 2))))];
    }
    return [];
  }

  function renderDefaultValue(schema, depth = 2) {
    if (schema[keyword`default`] !== undefined) {
      return [heading(depth, text(i18n2`${getTitle(schema)} Default Value`)), paragraph(text(i18n2`The default value is:`)), paragraph(code('json', JSON.stringify(schema[keyword`default`], undefined, 2)))];
    }
    return [];
  }

  function renderAccessRestrictions(schema, depth = 2) {
    if (schema[keyword`readOnly`] && schema[keyword`writeOnly`]) {
      return [heading(depth, text(i18n2`${getTitle(schema)} Access Restrictions`)), paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`))];
    }
    if (schema[keyword`readOnly`]) {
      return [heading(depth, text(i18n2`${getTitle(schema)} Access Restrictions`)), paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`))];
    }
    if (schema[keyword`writeOnly`]) {
      return [heading(depth, text(i18n2`${getTitle(schema)} Access Restrictions`)), paragraph(text(i18n2`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`))];
    }
    return [];
  }

  function renderDefinitions(schema, slugger) {
    if (schema[keyword`$defs`] || schema[keyword`$defs`]) {
      const defs = [...Object.entries(schema[keyword`$defs`] || {}), ...Object.entries(schema[keyword`definitions`] || {})].map(([name, def]) => {
        const propsTable = renderPropertiesTable(def[keyword`properties`], def[keyword`patternProperties`], def[keyword`additionalProperties`], def[keyword`required`], slugger);
        const ref = {};
        ref.$ref = def[symbols_default.id] + '#' + def[symbols_default.slug];
        return [
          heading(2, text(i18n2`Definitions group ${name}`)),
          paragraph(text(i18n2`Reference this group by using`)),
          code('json', JSON.stringify(ref)),
          propsTable,
          ...renderPropertiesDetails(def[keyword`properties`], def[keyword`patternProperties`], def[keyword`additionalProperties`], def[keyword`required`], 3)
        ];
      });
      return [heading(2, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Definitions`)), ...list(flat(defs))];
    }
    return [];
  }

  function renderPropertiesSection(schema, slugger) {
    if (schema[keyword`properties`] || schema[keyword`patternProperties`] || schema[keyword`additionalProperties`]) {
      return [
        heading(2, text(i18n2`${getTitle(schema)} Properties`)),
        renderPropertiesTable(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], slugger),
        ...renderPropertiesDetails(schema[keyword`properties`], schema[keyword`patternProperties`], schema[keyword`additionalProperties`], schema[keyword`required`], 3)
      ];
    }
    return [];
  }

  function renderPropertiesDetails(properties = {}, patternProperties = {}, additionalProperties, required, depth = 3) {
    return [
      ...list(flat(Object.entries(map(properties, {})).map(([name, sub]) => {
        const desc = sub[symbols_default.meta] && sub[symbols_default.meta].description ? sub[symbols_default.meta].description : paragraph(text(i18n2`no description`));
        return [
          heading(depth, text(name)),
          desc,
          ...renderComment(sub),
          paragraph(inlineCode(name)),
          renderPropertyDetails(name, sub, required),
          ...renderTypeDetails(sub, depth + 1),
          ...renderConstraints(sub, depth + 1),
          ...renderDefaultValue(sub, depth + 1),
          ...renderExamples(sub, depth + 1),
          ...renderAccessRestrictions(sub, depth + 1)
        ];
      }))),
      ...list(flat(Object.entries(map(patternProperties, {})).map(([name, sub]) => {
        const desc = sub[symbols_default.meta] && sub[symbols_default.meta].description ? sub[symbols_default.meta].description : paragraph(text(i18n2`no description`));
        return [
          heading(depth, [text(i18n2`Pattern: `), inlineCode(name)]),
          desc,
          ...renderComment(sub),
          paragraph(inlineCode(name)),
          renderPropertyDetails(name, sub, required),
          ...renderTypeDetails(sub, depth + 1),
          ...renderConstraints(sub, depth + 1),
          ...renderDefaultValue(sub, depth + 1),
          ...renderExamples(sub, depth + 1),
          ...renderAccessRestrictions(sub, depth + 1)
        ];
      }))),
      ...(ap => {
        if (typeof ap === 'object') {
          const desc = ap[symbols_default.meta] && ap[symbols_default.meta].description ? ap[symbols_default.meta].description : paragraph(text(i18n2`no description`));
          return [
            heading(depth, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)),
            desc,
            ...renderComment(ap),
            renderPropertyDetails(i18n2`Additional properties`, ap, required),
            ...renderTypeDetails(ap, depth + 1),
            ...renderConstraints(ap, depth + 1),
            ...renderDefaultValue(ap, depth + 1),
            ...renderExamples(ap, depth + 1),
            ...renderAccessRestrictions(ap, depth + 1)
          ];
        } else if (ap === true) {
          return [
            heading(depth, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`))
          ];
        }
        return [];
      })(additionalProperties)
    ];
  }

  console.log('Building documentation...');
  return (schemas) => foldl(schemas, {}, (acc, schema) => {
    const slugger = new Slugger();
    acc[schema[symbols_default.id]] = root([
      ...renderSchemaHeader(schema),
      ...renderTypeSection(schema, 2),
      ...renderConstraints(schema, 2),
      ...renderDefaultValue(schema, 2),
      ...renderExamples(schema, 2),
      ...renderPropertiesSection(schema, slugger),
      ...renderDefinitions(schema, slugger)
    ]);
    return acc;
  });
}

export { build as default };
