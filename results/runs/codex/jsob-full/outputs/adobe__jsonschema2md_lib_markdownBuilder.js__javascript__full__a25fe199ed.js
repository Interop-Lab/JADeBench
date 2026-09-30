import i18nModule from 'es2015-i18n-tag';
import{
  map, list as toArray, flat, filter, size, foldl
}
from 'ferrum';
import{
  root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list, listItem,
  strong, blockquote
}
from 'mdast-builder';
import GithubSlugger from 'github-slugger';
import yaml from 'js-yaml';
const{
  default: i18n
}
= i18nModule;
const{
  default: i18n2
}
= i18nModule;
const filename = Symbol('filename');
const fullpath = Symbol('fullpath');
const schemaSymbols = {
  pointer: Symbol('pointer'), filename, fullpath, id: Symbol('id'), titles: Symbol('titles'), resolve: Symbol('resolve'),
  slug: Symbol('slug'), meta: Symbol('meta'), parent: Symbol('parent')
};
function generateTitle(titles, type) {
  if (!Array.isArray(titles)) {
    return i18n`Untitled schema`;
  }
  const[firstTitle] = titles;
  const lastTitle = [...titles].pop();
  if (titles.length === 1 && firstTitle !== undefined) {
    return firstTitle;
  }
  if (lastTitle) {
    return lastTitle;
  }
  if (typeof type === 'string') return i18n`Untitled ${type} in ${String(firstTitle)}`;
  if (firstTitle === undefined) {
    return i18n`Untitled schema`;
  }
  return i18n`Untitled undefined type in ${firstTitle}`;
}
function build({
  header: includeHeader, links = {
  }, includeProperties = [], rewritelinks = url => url, exampleFormat = 'json', skipProperties: configuredSkipSections = [],
  singleFile = false
}
= {
}) {
  const skipSections = singleFile ? [...new Set([...configuredSkipSections, "definedinfact"])]: configuredSkipSections;
  function createLink(url, linkTitle, children) {
    if (singleFile) {
      return children;
    }
    return link(url, linkTitle, children);
  }
  const dateTimeFormat = {
    "label": i18n2`date time`, "text": i18n2`the string must be a date time string, according to `, "specname": "RFC 3339, section 5.6",
    "speclink": "https://tools.ietf.org/html/rfc3339"
  };
  const dateFormat = {
    "label": i18n2`date`, "text": i18n2`the string must be a date string, according to `, "specname": "RFC 3339, section 5.6",
    "speclink": "https://tools.ietf.org/html/rfc3339"
  };
  const timeFormat = {
    "label": i18n2`time`, "text": i18n2`the string must be a time string, according to `, "specname": "RFC 3339, section 5.6",
    "speclink": "https://tools.ietf.org/html/rfc3339"
  };
  const durationFormat = {
    "label": i18n2`duration`, "text": i18n2`the string must be a duration string, according to `, "specname": "RFC 3339, section 5.6",
    "speclink": "https://tools.ietf.org/html/rfc3339"
  };
  const emailFormat = {
    "label": i18n2`email`, "text": i18n2`the string must be an email address, according to `, "specname": "RFC 5322, section 3.4.1",
    "speclink": "https://tools.ietf.org/html/rfc5322"
  };
  const idnEmailFormat = {
    "label": i18n2`(international) email`, "text": i18n2`the string must be an (international) email address, according to `,
    "specname": "RFC 6531", "speclink": "https://tools.ietf.org/html/rfc6531"
  };
  const hostnameFormat = {
    "label": i18n2`hostname`, "text": i18n2`the string must be a hostname, according to `, "specname": "RFC 1123, section 2.1",
    "speclink": "https://tools.ietf.org/html/rfc1123"
  };
  const idnHostnameFormat = {
    "label": i18n2`(international) hostname`, "text": i18n2`the string must be an (IDN) hostname, according to `,
    "specname": "RFC 5890, section 2.3.2.3", "speclink": "https://tools.ietf.org/html/rfc5890"
  };
  const ipv4Format = {
    "label": i18n2`IPv4`, "text": i18n2`the string must be an IPv4 address (dotted quad), according to `,
    "specname": "RFC 2673, section 3.2", "speclink": "https://tools.ietf.org/html/rfc2673"
  };
  const ipv6Format = {
    "label": i18n2`IPv6`, "text": i18n2`the string must be an IPv6 address, according to `, "specname": "RFC 4291, section 2.2",
    "speclink": "https://tools.ietf.org/html/rfc4291"
  };
  const uriFormat = {
    "label": i18n2`URI`, "text": i18n2`the string must be a URI, according to `, "specname": "RFC 3986",
    "speclink": "https://tools.ietf.org/html/rfc3986"
  };
  const iriFormat = {
    "label": i18n2`IRI`, "text": i18n2`the string must be a IRI, according to `, "specname": "RFC 3987",
    "speclink": "https://tools.ietf.org/html/rfc3987"
  };
  const uriReferenceFormat = {
    "label": i18n2`URI reference`, "text": i18n2`the string must be a URI reference, according to `, "specname": "RFC 3986",
    "speclink": "https://tools.ietf.org/html/rfc3986"
  };
  const iriReferenceFormat = {
    "label": i18n2`IRI reference`, "text": i18n2`the string must be a IRI reference, according to `, "specname": "RFC 3987",
    "speclink": "https://tools.ietf.org/html/rfc3987"
  };
  const uuidFormat = {
    "label": i18n2`UUID`, "text": i18n2`the string must be a UUID, according to `, "specname": "RFC 4122",
    "speclink": "https://tools.ietf.org/html/rfc4122"
  };
  const jsonPointerFormat = {
    "label": i18n2`JSON Pointer`, "text": i18n2`the string must be a JSON Pointer, according to `, "specname": "RFC 6901, section 5",
    "speclink": "https://tools.ietf.org/html/rfc6901"
  };
  const relativeJsonPointerFormat = {
    "label": i18n2`Relative JSON Pointer`, "text": i18n2`the string must be a relative JSON Pointer, according to `,
    "specname": "draft-handrews-relative-json-pointer-01", "speclink": "https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01"
  };
  const regexFormat = {
    "label": i18n2`RegEx`, "text": i18n2`the string must be a regular expression, according to `, "specname": "ECMA-262",
    "speclink": "http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf"
  };
  const uriTemplateFormat = {
    "label": i18n2`URI Template`, "text": i18n2`the string must be a URI template, according to `, "specname": "RFC 6570",
    "speclink": "https://tools.ietf.org/html/rfc6570"
  };
  const formats = {
    "date-time": dateTimeFormat, "date": dateFormat, "time": timeFormat, "duration": durationFormat, "email": emailFormat,
    "idn-email": idnEmailFormat, "hostname": hostnameFormat, "idn-hostname": idnHostnameFormat, "ipv4": ipv4Format,
    "ipv6": ipv6Format, "uri": uriFormat, "iri": iriFormat, "uri-reference": uriReferenceFormat, "iri-reference": iriReferenceFormat,
    "uuid": uuidFormat, "json-pointer": jsonPointerFormat, "relative-json-pointer": relativeJsonPointerFormat,
    "regex": regexFormat, "uri-template": uriTemplateFormat
  };
  const abstractMetadata = {
    "name": "abstract", "title": i18n2`Abstract`, "truelabel": i18n2`Cannot be instantiated`, "falselabel": i18n2`Can be instantiated`,
    "undefinedlabel": i18n2`Unknown abstraction`
  };
  const extensibleMetadata = {
    name: 'extensible', title: i18n2`Extensible`, undefinedlable: i18n2`Unknown extensibility`, truelabel: i18n2`Yes`,
    falselabel: i18n2`No`
  };
  const statusMetadata = {
    "name": "status", "title": i18n2`Status`, "undefinedlabel": "Unknown status", "deprecatedlabel": i18n2`Deprecated`,
    "stablelabel": i18n2`Stable`, "stabilizinglabel": i18n2`Stabilizing`, "experimentallabel": i18n2`Experimental`
  };
  const identifiableMetadata = {
    "name": "identifiable", "title": i18n2`Identifiable`, "truelabel": i18n2`Yes`, "falselabel": i18n2`No`,
    "undefinedlabel": i18n2`Unknown identifiability`
  };
  const customPropertiesMetadata = {
    "name": "custom", "title": i18n2`Custom Properties`, "truelabel": i18n2`Allowed`, "falselabel": i18n2`Forbidden`,
    "undefinedlabel": i18n2`Unknown custom properties`
  };
  const additionalPropertiesMetadata = {
    "name": "additional", "title": i18n2`Additional Properties`, "truelabel": i18n2`Allowed`, "falselabel": i18n2`Forbidden`,
    "undefinedlabel": i18n2`Unknown additional properties`
  };
  const accessRestrictionsMetadata = {
    "name": "restrictions", "title": i18n2`Access Restrictions`, "readOnlylabel": i18n2`Read only`, "writeOnlylabel": i18n2`Write only`,
    "secretlabel": i18n2`cannot be read or written`, "undefinedlabel": i18n2`none`
  };
  const definedInMetadata = {
    "name": "definedin", "title": i18n2`Defined In`, "undefinedlabel": i18n2`Unknown definition`
  };
  const metadataColumns = [abstractMetadata, extensibleMetadata, statusMetadata, identifiableMetadata,
  customPropertiesMetadata, additionalPropertiesMetadata, accessRestrictionsMetadata, definedInMetadata];
  function renderComment(schema) {
    if (schema.$comment) {
      return[blockquote(schema[schemaSymbols.meta].longcomment)];
    }
    return[];
  }
  function renderHeader(schema) {
    {
      if (includeHeader) return[heading(1, text(i18n2`${generateTitle(schema[schemaSymbols.titles], schema.type)} Schema`)),
      paragraph(code("txt", ((schema[schemaSymbols.id] + (schema[schemaSymbols.pointer] ? '#' + schema[schemaSymbols.pointer]: ''))))),
      schema[schemaSymbols.meta].longdescription, ...renderComment(schema), table("left", [tableRow(toArray(map(metadataColumns,
      (({
        name: metadataName, title: metadataTitle
      }) => {
        if (links[metadataName]) return tableCell(link(links[metadataName], i18n2`What does ${metadataTitle} mean?`,
        text(metadataTitle)));
        return tableCell(text(metadataTitle));
      })), Array)), tableRow(toArray(map(metadataColumns, (metadataColumn => {
        if (schema[schemaSymbols.meta] && (((typeof schema[schemaSymbols.meta][metadataColumn.name])) === "object") && schema[schemaSymbols.meta][metadataColumn.name].link && schema[schemaSymbols.meta][metadataColumn.name].text) return tableCell(link(rewritelinks(schema[schemaSymbols.meta][metadataColumn.name].link),
        i18n2`open original schema`, [text(schema[schemaSymbols.meta][metadataColumn.name].text)]));
        const metadataValue = schema[schemaSymbols.meta] ? schema[schemaSymbols.meta][metadataColumn.name]: undefined;
        return tableCell(text(((metadataColumn[String(metadataValue) + "label"] || i18n2`Unknown`))));
      })), Array))])];
      return[];
    }
  }
  function renderTypeCell(schema) {
    if (!Array.isArray(schema.type) && ((typeof schema.type) === "object")) return text(i18n2`Unknown Type`);
    const types = Array.isArray(schema.type) ? schema.type: [schema.type], definedTypes = toArray(filter(types,
    (typeName => typeName !== "null" && typeName !== undefined)));
    if (schema.allOf || schema.anyOf || schema.oneOf || schema.not) {
      return text(i18n2`Merged`);
    } else {
      if ((size(definedTypes) === 0)) return text(i18n2`Not specified`);
    }
    return(size(definedTypes) === 1) ? inlineCode(definedTypes[0]): text(i18n2`Multiple`);
  }
  function renderNullableCell(schema) {
    const types = Array.isArray(schema.type) ? schema.type: [schema.type], nullTypes = toArray(filter(types,
    (typeName => typeName === "null")));
    if ((size(nullTypes))) {
      return text(i18n2`can be null`);
    }
    return text(i18n2`cannot be null`);
  }
  function createPropertyRow(requiredProperties = [], isPattern = false, slugger) {
    return([propertyName, propertySchema]) => {
      {
        const cells = [tableCell(((isPattern ? inlineCode(propertyName): link((('#' + slugger.slug(propertyName))),
        '', text(propertyName))))), tableCell(renderTypeCell(propertySchema)), tableCell(text((((requiredProperties.indexOf(propertyName)>(( - 1))) ? i18n2`Required`: i18n2`Optional`)))),
        tableCell(renderNullableCell(propertySchema))];
        return!singleFile && cells.push(tableCell(createLink(((propertySchema[schemaSymbols.slug] + ".md")),
        ((propertySchema[schemaSymbols.id] + '#' + propertySchema[schemaSymbols.pointer])), text(((propertySchema[schemaSymbols.titles] && propertySchema[schemaSymbols.titles][0] ? propertySchema[schemaSymbols.titles][0]: i18n2`Untitled schema`)))))),
        tableRow(cells);
      }
    };
  }
  function renderPropertyTable(properties = {
  }, patternProperties = {
  }, additionalProperties, requiredProperties, slugger) {
    {
      if (skipSections.includes("proptable")) return paragraph();
      const propertyRows = Object.entries(properties).map(createPropertyRow(requiredProperties, false,
      slugger)), patternRows = Object.entries(patternProperties).map(createPropertyRow(requiredProperties,
      true, slugger)), additionalRows = (() => {
        if (additionalProperties) {
          {
            const allowsAnyAdditionalProperty = (additionalProperties === true), additionalCells = [tableCell(text(i18n2`Additional Properties`)),
            tableCell((allowsAnyAdditionalProperty ? text("Any"): renderTypeCell(additionalProperties))),
            tableCell(text(i18n2`Optional`)), tableCell((allowsAnyAdditionalProperty ? text("can be null"): renderNullableCell(additionalProperties)))];
            if (!singleFile) {
              additionalCells.push(tableCell((allowsAnyAdditionalProperty ? text(''): createLink((additionalProperties[schemaSymbols.slug] + ".md"),
              (additionalProperties[schemaSymbols.id] + '#' + additionalProperties[schemaSymbols.pointer]),
              text((additionalProperties[schemaSymbols.titles][0] || i18n2`Untitled schema`))))));
            }
            return[tableRow(additionalCells)];
          }
        }
        return[];
      })(), headerCells = [tableCell(text(i18n2`Property`)), tableCell(text(i18n2`Type`)), tableCell(text(i18n2`Required`)),
      tableCell(text(i18n2`Nullable`))];
      if (!singleFile) {
        headerCells.push(tableCell(text(i18n2`Defined by`)));
      }
      return table("left", [tableRow(headerCells), ...propertyRows, ...patternRows, ...additionalRows]);
    }
  }
  function renderTupleItems(itemSchemas, additionalItems) {
    {
      if (skipSections.includes("arrayfact")) return '';
      return listItem([paragraph([text(i18n2`Type: `), text(i18n2`an array where each item follows the corresponding schema in the following list:`)]),
      list("ordered", [...itemSchemas.map(itemSchema => listItem(paragraph(createLink(itemSchema[schemaSymbols.slug] + ".md",
      i18n2`check type definition`, text(generateTitle(itemSchema[schemaSymbols.titles], itemSchema.type)))))),
      ...(() => {
        {
          if ((additionalItems === true)) {
            return[listItem(paragraph(text(i18n2`and all following items may follow any schema`)))];
          } else {
            if (((typeof additionalItems) === "object")) return[listItem(paragraph([text(i18n2`and all following items must follow the schema: `),
            createLink((additionalItems[schemaSymbols.slug] + ".md"), i18n2`check type definition`, text(generateTitle(additionalItems[schemaSymbols.titles],
            additionalItems.type)))]))];
          }
          return[];
        }
      })()])]);
    }
  }
  function renderTypeFact(schema, typeSuffix = '') {
    {
      const types = Array.isArray(schema.type) ? schema.type: [schema.type], nonNullTypes = types.filter(typeName => typeName !== "null"),
      isNullable = (types.filter(typeName => typeName === "null").length>0), hasSingleType = (nonNullTypes.length<=1),
      [primaryType] = nonNullTypes, isNullOnly = isNullable && (nonNullTypes.length === 0), isArray = (primaryType === "array"),
      hasComposition = !!(schema.allOf || schema.anyOf || schema.oneOf || schema.not);
      if (isArray && Array.isArray(schema.items)) return renderTupleItems(schema.items, schema.additionalItems);
      else {
        if (isArray && schema.items) return renderTypeFact(schema.items, (typeSuffix + '[]'));
      }
      const typeDescription = (() => {
        {
          if (isNullOnly) return[inlineCode((("null" + typeSuffix))), text(i18n2`, the value must be null`)];
          else {
            if ((hasSingleType && primaryType) && (((typeof primaryType)) === "string")) {
              return[inlineCode((((primaryType + typeSuffix))))];
            } else {
              if (!hasSingleType) return[text(((typeSuffix ? i18n2`an array of the following:`: i18n2`any of the following: `))),
              ...toArray(flat(nonNullTypes.map((typeName, index) => [inlineCode(typeName || i18n2`not defined`),
              text(index === nonNullTypes.length - 1 ? '': i18n2` or `)])))];
              else {
                if (hasComposition) return[text(((typeSuffix ? "an array of merged types": i18n2`merged type`)))];
              }
            }
          }
          return[text((((i18n2`unknown` + typeSuffix))))];
        }
      })(), detailLink = (() => {
        if (schema.title && (((typeof schema.title)) === "string")) return[text('\x20('), createLink(((schema[schemaSymbols.slug] + ".md")),
        '', text(schema.title)), text(')')];
        else {
          if (!hasSingleType || (primaryType === "object") || hasComposition) {
            if (singleFile) return[];
            return[text('\x20('), link(((schema[schemaSymbols.slug] + ".md")), '', text(i18n2`Details`)),
            text(')')];
          }
        }
        return[];
      })(), typeFact = listItem(paragraph([text(i18n2`Type: `), ...typeDescription, ...detailLink]));
      return typeFact;
    }
  }
  function renderNullableFact(schema) {
    {
      const types = Array.isArray(schema.type) ? schema.type: [schema.type], isNullable = (types.filter(typeName => typeName === "null").length>0);
      if (isNullable) {
        return listItem(paragraph(text(i18n2`can be null`)));
      } else return listItem(paragraph(text(i18n2`cannot be null`)));
    }
  }
  function renderDefinedInFact(schema) {
    return listItem(paragraph([text(i18n2`defined in: `), createLink((schema[schemaSymbols.slug] + ".md"),
    (schema[schemaSymbols.id] + '#' + schema[schemaSymbols.pointer]), text((schema[schemaSymbols.titles] && schema[schemaSymbols.titles][0] ? schema[schemaSymbols.titles][0]: i18n2`Untitled schema`)))]));
  }
  function renderPropertyFacts(propertyName, propertySchema, requiredProperties = []) {
    {
      const facts = [];
      (requiredProperties.indexOf(propertyName)>( - 1)) ? facts.push(listItem(text(i18n2`is required`))): facts.push(listItem(text(i18n2`is optional`)));
      !skipSections.includes("typefact") && facts.push(renderTypeFact(propertySchema));
      if (!skipSections.includes("nullablefact")) {
        facts.push(renderNullableFact(propertySchema));
      }
      !skipSections.includes("definedinfact") && facts.push(renderDefinedInFact(propertySchema));
      const includedFacts = includeProperties.map(propertyKey => {
        {
          if (propertySchema[propertyKey]) {
            return listItem(text((propertyKey + ':\x20' + String(propertySchema[propertyKey]))));
          }
          return undefined;
        }
      }).filter(fact => fact !== undefined);
      return facts.push(...includedFacts), list("unordered", facts);
    }
  }
  function getSectionTitle(schema) {
    return schema[schemaSymbols.parent] ? schema[schemaSymbols.pointer].split('/').pop(): generateTitle(schema[schemaSymbols.titles],
    schema.type);
  }
  function renderComposition(schema, depth = 0, maxDepth = 3) {
    {
      if (schema.oneOf && (depth<=maxDepth)) {
        return[paragraph(text(i18n2`one (and only one) of`)), list("unordered", [...schema.oneOf.map(subschema => listItem(renderComposition(subschema,
        depth + 1)))])];
      } else {
        if (schema.anyOf && (depth<=maxDepth)) return[paragraph(text(i18n2`any of`)), list("unordered",
        [...schema.anyOf.map(subschema => listItem(renderComposition(subschema, depth + 1)))])];
        else {
          if (schema.allOf && (depth<=maxDepth)) {
            return[paragraph(text(i18n2`all of`)), list("unordered", [...schema.allOf.map(subschema => listItem(renderComposition(subschema,
            depth + 1)))])];
          } else {
            if (schema.not && (depth<=maxDepth)) {
              {
                const excludedSchema = schema.not;
                return[paragraph(text(i18n2`not`)), list("unordered", [listItem(renderComposition(excludedSchema,
                ((depth + 1))))])];
              }
            } else return(depth>0) ? [createLink((schema[schemaSymbols.slug] + ".md"), i18n2`check type definition`,
            text(generateTitle(schema[schemaSymbols.titles], schema.type)))]: [];
          }
        }
      }
    }
  }
  function renderTypeSection(schema, headingDepth = 1) {
    {
      if (skipSections.includes("typesection")) return '';
      const{
        children: typeChildren
      }
      = renderTypeFact(schema);
      return typeChildren[0].children.shift(), [heading(((headingDepth + 1)), text(i18n2`${getSectionTitle(schema)} Type`)),
      ...typeChildren, ...renderComposition(schema)];
    }
  }
  function renderConstraints(schema, headingDepth = 1) {
    {
      const constraintNodes = [];
      (schema.const !== undefined) && (constraintNodes.push(paragraph([strong(text(i18n2`constant`)),
      text(':\x20'), text(i18n2`the value of this property must be equal to:`)])), constraintNodes.push(code("json",
      JSON.stringify(schema.const, undefined, 2))));
      if (schema.enum) {
        {
          const enumDescriptions = schema["meta:enum"] || {
          };
          constraintNodes.push(paragraph([strong(text(i18n2`enum`)), text(':\x20'), text(i18n2`the value of this property must be equal to one of the following values:`)])),
          constraintNodes.push(table("left", [tableRow([tableCell(text(i18n2`Value`)), tableCell(text(i18n2`Explanation`))]),
          ...Array.isArray(schema.enum) ? schema.enum.map(enumValue => tableRow([tableCell(inlineCode(JSON.stringify(enumValue))),
          tableCell(text(enumDescriptions[Array.isArray(enumValue) ? JSON.stringify(enumValue): enumValue] || ''))])): []]));
        }
      }
      if ((schema.multipleOf !== undefined) && ((typeof schema.multipleOf) === "number")) {
        constraintNodes.push(paragraph([strong(text(i18n2`multiple of`)), text(':\x20'), text(i18n2`the value of this number must be a multiple of: `),
        inlineCode(String(schema.multipleOf))]));
      }
      if ((schema.maximum !== undefined) && ((typeof schema.maximum) === "number")) {
        constraintNodes.push(paragraph([strong(text(i18n2`maximum`)), text(':\x20'), text(i18n2`the value of this number must smaller than or equal to: `),
        inlineCode(String(schema.maximum))]));
      }
      if ((schema.exclusiveMaximum !== undefined) && ((typeof schema.exclusiveMaximum) === "number")) {
        constraintNodes.push(paragraph([strong(text(i18n2`maximum (exclusive)`)), text(':\x20'), text(i18n2`the value of this number must be smaller than: `),
        inlineCode(String(schema.exclusiveMaximum))]));
      }
      (schema.minimum !== undefined) && ((typeof schema.minimum) === "number") && constraintNodes.push(paragraph([strong(text(i18n2`minimum`)),
      text(':\x20'), text(i18n2`the value of this number must greater than or equal to: `), inlineCode(String(schema.minimum))]));
      if ((schema.exclusiveMinimum !== undefined) && ((typeof schema.exclusiveMinimum) === "number")) {
        constraintNodes.push(paragraph([strong(text(i18n2`minimum (exclusive)`)), text(':\x20'), text(i18n2`the value of this number must be greater than: `),
        inlineCode(String(schema.exclusiveMinimum))]));
      }
      (schema.maxLength !== undefined) && ((typeof schema.maxLength) === "number") && constraintNodes.push(paragraph([strong(text(i18n2`maximum length`)),
      text(':\x20'), text(i18n2`the maximum number of characters for this string is: `), inlineCode(String(schema.maxLength))]));
      (schema.minLength !== undefined) && ((typeof schema.minLength) === "number") && constraintNodes.push(paragraph([strong(text(i18n2`minimum length`)),
      text(':\x20'), text(i18n2`the minimum number of characters for this string is: `), inlineCode(String(schema.minLength))]));
      schema.pattern && (constraintNodes.push(paragraph([strong(text(i18n2`pattern`)), text(':\x20'),
      text(i18n2`the string must match the following regular expression: `)])), constraintNodes.push(code("regexp",
      schema.pattern)), constraintNodes.push(paragraph([link(("https://regexr.com/?expression=" + encodeURIComponent(schema.pattern)),
      i18n2`try regular expression with regexr.com`, text(i18n2`try pattern`))])));
      if (schema.format && ((typeof schema.format) === "string") && formats[schema.format]) {
        constraintNodes.push(paragraph([strong(text(formats[keyword([schema.format])].label)), text(':\x20'),
        text(formats[schema.format].text), link(formats[schema.format].speclink, i18n2`check the specification`,
        text(formats[schema.format].specname))]));
      } else schema.format && ((typeof schema.format) === "string") && constraintNodes.push(paragraph([strong(text(i18n2`unknown format`)),
      text(':\x20'), text(i18n2`the value of this string must follow the format: `), inlineCode(String(schema.format))]));
      if (schema.contentEncoding) {
        constraintNodes.push(paragraph([strong(text(i18n2`encoding`)), text(':\x20'), text(i18n2`the string content must be using the ${schema.contentEncoding} content encoding.`)]));
      }
      if (schema.contentMediaType) {
        constraintNodes.push(paragraph([strong(text(i18n2`media type`)), text(':\x20'), text(i18n2`the media type of the contents of this string is: `),
        inlineCode(String(schema.contentMediaType))]));
      }
      schema.contentSchema && constraintNodes.push(paragraph([strong(text(i18n2`schema`)), text(':\x20'),
      text(i18n2`the contents of this string should follow this schema: `), createLink((schema.contentSchema[schemaSymbols.slug] + ".md"),
      i18n2`check type definition`, text(generateTitle(schema.contentSchema[schemaSymbols.titles], schema.contentSchema.type)))]));
      (schema.maxItems !== undefined) && constraintNodes.push(paragraph([strong(text(i18n2`maximum number of items`)),
      text(':\x20'), text(i18n2`the maximum number of items for this array is: `), inlineCode(String(schema.maxItems))]));
      if ((schema.minItems !== undefined)) {
        constraintNodes.push(paragraph([strong(text(i18n2`minimum number of items`)), text(':\x20'), text(i18n2`the minimum number of items for this array is: `),
        inlineCode(String(schema.minItems))]));
      }
      if (schema.uniqueItems) {
        constraintNodes.push(paragraph([strong(text(i18n2`unique items`)), text(':\x20'), text(i18n2`all items in this array must be unique. Duplicates are not allowed.`)]));
      }
      if ((schema.minContains !== undefined) && schema.contains) {
        constraintNodes.push(paragraph([strong(text(i18n2`minimum number of contained items`)), text(':\x20'),
        text((i18n2`this array may not contain fewer than ${String(schema.minContains)} items that validate against the schema:` + '\x20')),
        createLink((schema.contains[schemaSymbols.slug] + ".md"), i18n2`check type definition`, text(generateTitle(schema.contains[schemaSymbols.titles],
        schema.contains.type)))]));
      }
      (schema.maxContains !== undefined) && schema.contains && constraintNodes.push(paragraph([strong(text(i18n2`maximum number of contained items`)),
      text(':\x20'), text((i18n2`this array may not contain more than ${String(schema.maxContains)} items that validate against the schema:` + '\x20')),
      createLink((schema.contains[schemaSymbols.slug] + ".md"), i18n2`check type definition`, text(generateTitle(schema.contains[schemaSymbols.titles],
      schema.contains.type)))]));
      if ((schema.maxProperties !== undefined)) {
        constraintNodes.push(paragraph([strong(text(i18n2`maximum number of properties`)), text(':\x20'),
        text(i18n2`the maximum number of properties for this object is: `), inlineCode(String(schema.maxProperties))]));
      }
      if ((schema.minProperties !== undefined)) {
        constraintNodes.push(paragraph([strong(text(i18n2`minimum number of properties`)), text(':\x20'),
        text(i18n2`the minimum number of properties for this object is: `), inlineCode(String(schema.minProperties))]));
      }
      if ((constraintNodes.length>0)) return[heading(((headingDepth + 1)), text(i18n2`${getSectionTitle(schema)} Constraints`)),
      ...constraintNodes];
      return[];
    }
  }
  function renderExamples(schema, headingDepth = 1) {
    {
      if (schema.examples && (schema.examples.length>0) && (exampleFormat === "yaml")) return[heading(((headingDepth + 1)),
      text(i18n2`${getSectionTitle(schema)} Examples`)), ...schema.examples.map(example => paragraph(code("yaml",
      yaml.dump(example, undefined, 2))))];
      if (schema.examples && (schema.examples.length>0) && (exampleFormat === "json")) {
        return[heading(((headingDepth + 1)), text(i18n2`${getSectionTitle(schema)} Examples`)), ...schema.examples.map(example => paragraph(code("json",
        JSON.stringify(example, undefined, 2))))];
      }
      return[];
    }
  }
  function renderDefault(schema, headingDepth = 1) {
    {
      if ((schema.default !== undefined)) {
        return[heading(((headingDepth + 1)), text(i18n2`${getSectionTitle(schema)} Default Value`)), paragraph(text(i18n2`The default value is:`)),
        paragraph(code("json", JSON.stringify(schema.default, undefined, 2)))];
      }
      return[];
    }
  }
  function renderAccessRestrictions(schema, headingDepth = 1) {
    {
      if (schema.readOnly && schema.writeOnly) return[heading(((headingDepth + 1)), text(i18n2`${getSectionTitle(schema)} Access Restrictions`)),
      paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`))];
      if (schema.readOnly) return[heading(((headingDepth + 1)), text(i18n2`${getSectionTitle(schema)} Access Restrictions`)),
      paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`))];
      if (schema.writeOnly) return[heading(((headingDepth + 1)), text(i18n2`${getSectionTitle(schema)} Access Restrictions`)),
      paragraph(text(i18n2`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`))];
      return[];
    }
  }
  function renderPropertyDetails(properties = {
  }, patternProperties = {
  }, additionalProperties, requiredProperties, headingDepth = 2) {
    return[...toArray(flat(Object.entries((properties || ({
    }))).map(([propertyName, propertySchema]) => {
      {
        const description = propertySchema[schemaSymbols.meta] && propertySchema[schemaSymbols.meta].longdescription ? propertySchema[schemaSymbols.meta].longdescription: paragraph(text(i18n2`no description`));
        return[heading((((headingDepth + 1))), text(propertyName)), description, ...renderComment(propertySchema),
        paragraph(inlineCode(propertyName)), renderPropertyFacts(propertyName, propertySchema, requiredProperties),
        ...renderTypeSection(propertySchema, (((headingDepth + 1)))), ...renderConstraints(propertySchema,
        (((headingDepth + 1)))), ...renderDefault(propertySchema, (((headingDepth + 1)))), ...renderExamples(propertySchema,
        (((headingDepth + 1)))), ...renderAccessRestrictions(propertySchema, (((headingDepth + 1))))];
      }
    }))), ...toArray(flat(Object.entries((patternProperties || ({
    }))).map(([pattern, patternSchema]) => {
      {
        const description = patternSchema[schemaSymbols.meta] && patternSchema[schemaSymbols.meta].longdescription ? patternSchema[schemaSymbols.meta].longdescription: paragraph(text(i18n2`no description`));
        return[heading(((headingDepth + 1)), [text(i18n2`Pattern: `), inlineCode(pattern)]), description,
        ...renderComment(patternSchema), paragraph(inlineCode(pattern)), renderPropertyFacts(pattern,
        patternSchema, requiredProperties), ...renderTypeSection(patternSchema, ((headingDepth + 1))),
        ...renderConstraints(patternSchema, ((headingDepth + 1))), ...renderDefault(patternSchema, ((headingDepth + 1))),
        ...renderExamples(patternSchema, ((headingDepth + 1))), ...renderAccessRestrictions(patternSchema,
        ((headingDepth + 1)))];
      }
    }))), ...(additionalSchema => {
      {
        if (((typeof additionalProperties) === "object")) {
          {
            const description = additionalSchema[schemaSymbols.meta].longdescription || paragraph(text(i18n2`no description`));
            return[heading(((headingDepth + 1)), text(i18n2`Additional Properties`)), paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)),
            description, ...renderComment(additionalSchema), renderPropertyFacts(i18n2`Additional properties`,
            additionalSchema, requiredProperties), ...renderTypeSection(additionalSchema, ((headingDepth + 1))),
            ...renderConstraints(additionalSchema, ((headingDepth + 1))), ...renderDefault(additionalSchema,
            ((headingDepth + 1))), ...renderExamples(additionalSchema, ((headingDepth + 1))), ...renderAccessRestrictions(additionalSchema,
            ((headingDepth + 1)))];
          }
        } else {
          if ((additionalProperties === true)) {
            return[heading(((headingDepth + 1)), text(i18n2`Additional Properties`)), paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`))];
          }
        }
        return[];
      }
    })(additionalProperties)];
  }
  function renderDefinitions(schema, slugger) {
    {
      if (schema.definitions || schema.$defs) {
        const definitionSections = [...Object.entries(schema.$defs || {
        }), ...Object.entries(schema.definitions || {
        })].map(([groupName, definitionSchema]) => {
          {
            const propertyTable = renderPropertyTable(definitionSchema.properties, definitionSchema.patternProperties,
            definitionSchema.additionalProperties, definitionSchema.required, slugger);
            const referenceExample = {
              $ref: definitionSchema[schemaSymbols.id] + '#' + definitionSchema[schemaSymbols.pointer]
            };
            return[heading(2, text(i18n2`Definitions group ${groupName}`)), paragraph(text(i18n2`Reference this group by using`)),
            code("json", JSON.stringify(referenceExample)), propertyTable, ...renderPropertyDetails(definitionSchema.properties,
            definitionSchema.patternProperties, definitionSchema.additionalProperties, definitionSchema.required,
            2)];
          }
        });
        return[heading(1, text(i18n2`${generateTitle(schema[schemaSymbols.titles], schema.type)} Definitions`)),
        ...toArray(flat(definitionSections))];
      }
      return[];
    }
  }
  function renderPropertiesSection(schema, slugger) {
    {
      if (schema.properties || schema.patternProperties || schema.additionalProperties) return[heading(1,
      text(i18n2`${getSectionTitle(schema)} Properties`)), renderPropertyTable(schema.properties, schema.patternProperties,
      schema.additionalProperties, schema.required, slugger), ...renderPropertyDetails(schema.properties,
      schema.patternProperties, schema.additionalProperties, schema.required, 1)];
      return[];
    }
  }
  console.log("generating markdown");
  return schemas => foldl(schemas, {
  }, (documents, schema) => {
    {
      const slugger = new GithubSlugger();
      documents[schema[schemaSymbols.slug]] = root([...renderHeader(schema), ...renderTypeSection(schema,
      1), ...renderConstraints(schema, 1), ...renderDefault(schema, 1), ...renderExamples(schema, 1),
      ...renderPropertiesSection(schema, slugger), ...renderDefinitions(schema, slugger)]);
      return documents;
    }
  });
}
export{
  build as default
};
