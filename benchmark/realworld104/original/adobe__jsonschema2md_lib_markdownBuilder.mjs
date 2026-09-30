// ../work/adobe__jsonschema2md/lib/symbols.js
var filename = Symbol("filename");
var fullpath = Symbol("fullpath");
var symbols = {
  pointer: Symbol("pointer"),
  filename,
  fullpath,
  id: Symbol("id"),
  titles: Symbol("titles"),
  resolve: Symbol("resolve"),
  slug: Symbol("slug"),
  meta: Symbol("meta"),
  parent: Symbol("parent")
};
var symbols_default = symbols;

// ../work/adobe__jsonschema2md/lib/formattingTools.js
import i from "es2015-i18n-tag";
var { default: i18n } = i;
function gentitle(titles, type) {
  if (!Array.isArray(titles)) {
    return i18n`Untitled schema`;
  }
  const [firsttitle] = titles;
  const lasttitle = [...titles].pop();
  if (titles.length === 1 && firsttitle !== void 0) {
    return firsttitle;
  }
  if (lasttitle) {
    return lasttitle;
  }
  if (typeof type === "string") {
    return i18n`Untitled ${type} in ${String(firsttitle)}`;
  }
  if (firsttitle === void 0) {
    return i18n`Untitled schema`;
  }
  return i18n`Untitled undefined type in ${firsttitle}`;
}
function gendescription(schema) {
  return schema && schema[symbols_default.meta] ? schema[symbols_default.meta].shortdescription : "";
}

// ../work/adobe__jsonschema2md/lib/keywords.js
var used = /* @__PURE__ */ new Set();
function keyword(str) {
  used.add(str[0]);
  return str.join("");
}
function report() {
  return used;
}

// ../work/adobe__jsonschema2md/lib/markdownBuilder.js
import {
  map,
  list as flist,
  flat,
  filter,
  size,
  foldl
} from "ferrum";
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
  blockquote
} from "mdast-builder";
import i2 from "es2015-i18n-tag";
import GhSlugger from "github-slugger";
import yaml from "js-yaml";
var { default: i18n2 } = i2;
function build({
  header,
  links = {},
  includeProperties = [],
  rewritelinks = (x) => x,
  exampleFormat = "json",
  skipProperties: rawSkipProperties = [],
  singleFile = false
} = {}) {
  const skipProperties = singleFile ? [.../* @__PURE__ */ new Set([...rawSkipProperties, "definedinfact"])] : rawSkipProperties;
  function schemaLink(url, title, children) {
    if (singleFile) {
      return children;
    }
    return link(url, title, children);
  }
  const formats = {
    "date-time": {
      label: i18n2`date time`,
      text: i18n2`the string must be a date time string, according to `,
      specname: "RFC 3339, section 5.6",
      speclink: "https://tools.ietf.org/html/rfc3339"
    },
    date: {
      label: i18n2`date`,
      text: i18n2`the string must be a date string, according to `,
      specname: "RFC 3339, section 5.6",
      speclink: "https://tools.ietf.org/html/rfc3339"
    },
    time: {
      label: i18n2`time`,
      text: i18n2`the string must be a time string, according to `,
      specname: "RFC 3339, section 5.6",
      speclink: "https://tools.ietf.org/html/rfc3339"
    },
    duration: {
      label: i18n2`duration`,
      text: i18n2`the string must be a duration string, according to `,
      specname: "RFC 3339, section 5.6",
      speclink: "https://tools.ietf.org/html/rfc3339"
    },
    email: {
      label: i18n2`email`,
      text: i18n2`the string must be an email address, according to `,
      specname: "RFC 5322, section 3.4.1",
      speclink: "https://tools.ietf.org/html/rfc5322"
    },
    "idn-email": {
      label: i18n2`(international) email`,
      text: i18n2`the string must be an (international) email address, according to `,
      specname: "RFC 6531",
      speclink: "https://tools.ietf.org/html/rfc6531"
    },
    hostname: {
      label: i18n2`hostname`,
      text: i18n2`the string must be a hostname, according to `,
      specname: "RFC 1123, section 2.1",
      speclink: "https://tools.ietf.org/html/rfc1123"
    },
    "idn-hostname": {
      label: i18n2`(international) hostname`,
      text: i18n2`the string must be an (IDN) hostname, according to `,
      specname: "RFC 5890, section 2.3.2.3",
      speclink: "https://tools.ietf.org/html/rfc5890"
    },
    ipv4: {
      label: i18n2`IPv4`,
      text: i18n2`the string must be an IPv4 address (dotted quad), according to `,
      specname: "RFC 2673, section 3.2",
      speclink: "https://tools.ietf.org/html/rfc2673"
    },
    ipv6: {
      label: i18n2`IPv6`,
      text: i18n2`the string must be an IPv6 address, according to `,
      specname: "RFC 4291, section 2.2",
      speclink: "https://tools.ietf.org/html/rfc4291"
    },
    uri: {
      label: i18n2`URI`,
      text: i18n2`the string must be a URI, according to `,
      specname: "RFC 3986",
      speclink: "https://tools.ietf.org/html/rfc3986"
    },
    iri: {
      label: i18n2`IRI`,
      text: i18n2`the string must be a IRI, according to `,
      specname: "RFC 3987",
      speclink: "https://tools.ietf.org/html/rfc3987"
    },
    "uri-reference": {
      label: i18n2`URI reference`,
      text: i18n2`the string must be a URI reference, according to `,
      specname: "RFC 3986",
      speclink: "https://tools.ietf.org/html/rfc3986"
    },
    "iri-reference": {
      label: i18n2`IRI reference`,
      text: i18n2`the string must be a IRI reference, according to `,
      specname: "RFC 3987",
      speclink: "https://tools.ietf.org/html/rfc3987"
    },
    uuid: {
      label: i18n2`UUID`,
      text: i18n2`the string must be a UUID, according to `,
      specname: "RFC 4122",
      speclink: "https://tools.ietf.org/html/rfc4122"
    },
    "json-pointer": {
      label: i18n2`JSON Pointer`,
      text: i18n2`the string must be a JSON Pointer, according to `,
      specname: "RFC 6901, section 5",
      speclink: "https://tools.ietf.org/html/rfc6901"
    },
    "relative-json-pointer": {
      label: i18n2`Relative JSON Pointer`,
      text: i18n2`the string must be a relative JSON Pointer, according to `,
      specname: "draft-handrews-relative-json-pointer-01",
      speclink: "https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01"
    },
    regex: {
      label: i18n2`RegEx`,
      text: i18n2`the string must be a regular expression, according to `,
      specname: "ECMA-262",
      speclink: "http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf"
    },
    "uri-template": {
      label: i18n2`URI Template`,
      text: i18n2`the string must be a URI template, according to `,
      specname: "RFC 6570",
      speclink: "https://tools.ietf.org/html/rfc6570"
    }
  };
  const headerprops = [
    /*
    {
      name: 'type',
      title: i18n`Type`,
      objectlabel: i18n`Object`,
      arraylabel: i18n`Array`,
      multiplelabel: i18n`Multiple`,
      mergedlabel: i18n`Merged`,
      undefinedlabel: i18n`Undefined`,
      numberlabel: i18n`Number`,
      booleanlabel: i18n`Boolean`,
      stringlabel: i18n`String`,
      integerlabel: i18n`Integer`,
      nulllabel: i18n`Null`,
    },
    */
    {
      name: "abstract",
      title: i18n2`Abstract`,
      truelabel: i18n2`Cannot be instantiated`,
      falselabel: i18n2`Can be instantiated`,
      undefinedlabel: i18n2`Unknown abstraction`
    },
    {
      name: "extensible",
      title: i18n2`Extensible`,
      undefinedlable: i18n2`Unknown extensibility`,
      truelabel: i18n2`Yes`,
      falselabel: i18n2`No`
    },
    {
      name: "status",
      title: i18n2`Status`,
      undefinedlabel: "Unknown status",
      deprecatedlabel: i18n2`Deprecated`,
      stablelabel: i18n2`Stable`,
      stabilizinglabel: i18n2`Stabilizing`,
      experimentallabel: i18n2`Experimental`
    },
    {
      name: "identifiable",
      title: i18n2`Identifiable`,
      truelabel: i18n2`Yes`,
      falselabel: i18n2`No`,
      undefinedlabel: i18n2`Unknown identifiability`
    },
    {
      name: "custom",
      title: i18n2`Custom Properties`,
      truelabel: i18n2`Allowed`,
      falselabel: i18n2`Forbidden`,
      undefinedlabel: i18n2`Unknown custom properties`
    },
    {
      name: "additional",
      title: i18n2`Additional Properties`,
      truelabel: i18n2`Allowed`,
      falselabel: i18n2`Forbidden`,
      undefinedlabel: i18n2`Unknown additional properties`
    },
    {
      name: "restrictions",
      title: i18n2`Access Restrictions`,
      readOnlylabel: i18n2`Read only`,
      writeOnlylabel: i18n2`Write only`,
      secretlabel: i18n2`cannot be read or written`,
      undefinedlabel: i18n2`none`
    },
    {
      name: "definedin",
      title: i18n2`Defined In`,
      undefinedlabel: i18n2`Unknown definition`
    }
  ];
  function makecomment(schema) {
    if (schema[keyword`$comment`]) {
      return [
        blockquote(schema[symbols_default.meta].longcomment)
      ];
    }
    return [];
  }
  function makeheader(schema) {
    if (header) {
      return [
        heading(1, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Schema`)),
        paragraph(code("txt", schema[symbols_default.id] + (schema[symbols_default.pointer] ? `#${schema[symbols_default.pointer]}` : ""))),
        schema[symbols_default.meta].longdescription,
        ...makecomment(schema),
        table("left", [
          // iterate over header
          tableRow(
            flist(map(
              headerprops,
              ({ name, title }) => {
                if (links[name]) {
                  return tableCell(link(links[name], i18n2`What does ${title} mean?`, text(title)));
                }
                return tableCell(text(title));
              }
            ), Array)
          ),
          tableRow(
            flist(map(
              headerprops,
              (prop) => {
                if (schema[symbols_default.meta] && typeof schema[symbols_default.meta][prop.name] === "object" && schema[symbols_default.meta][prop.name].link && schema[symbols_default.meta][prop.name].text) {
                  return tableCell(link(rewritelinks(schema[symbols_default.meta][prop.name].link), i18n2`open original schema`, [text(schema[symbols_default.meta][prop.name].text)]));
                }
                const value = schema[symbols_default.meta] ? schema[symbols_default.meta][prop.name] : void 0;
                return tableCell(text(prop[`${String(value)}label`] || i18n2`Unknown`));
              }
            ), Array)
          )
        ])
      ];
    }
    return [];
  }
  function type(property) {
    if (!Array.isArray(property[keyword`type`]) && typeof property[keyword`type`] === "object") {
      return text(i18n2`Unknown Type`);
    }
    const types = Array.isArray(property[keyword`type`]) ? property[keyword`type`] : [property[keyword`type`]];
    const realtypes = flist(filter(types, (mytype) => mytype !== "null" && mytype !== void 0));
    if (property[keyword`allOf`] || property[keyword`anyOf`] || property[keyword`oneOf`] || property[keyword`not`]) {
      return text(i18n2`Merged`);
    } else if (size(realtypes) === 0) {
      return text(i18n2`Not specified`);
    }
    return size(realtypes) === 1 ? inlineCode(realtypes[0]) : text(i18n2`Multiple`);
  }
  function nullable(property) {
    const types = Array.isArray(property[keyword`type`]) ? property[keyword`type`] : [property[keyword`type`]];
    const nulltypes = flist(filter(types, (mytype) => mytype === keyword`null`));
    if (size(nulltypes)) {
      return text(i18n2`can be null`);
    }
    return text(i18n2`cannot be null`);
  }
  function makepropheader(required = [], ispattern = false, slugger) {
    return ([name, definition]) => {
      const cells = [
        tableCell(ispattern ? inlineCode(name) : link(`#${slugger.slug(name)}`, "", text(name))),
        // Property
        tableCell(type(definition)),
        tableCell(text(required.indexOf(name) > -1 ? i18n2`Required` : i18n2`Optional`)),
        tableCell(nullable(definition))
      ];
      if (!singleFile) {
        cells.push(tableCell(schemaLink(
          `${definition[symbols_default.slug]}.md`,
          `${definition[symbols_default.id]}#${definition[symbols_default.pointer]}`,
          text(definition[symbols_default.titles] && definition[symbols_default.titles][0] ? definition[symbols_default.titles][0] : i18n2`Untitled schema`)
        )));
      }
      return tableRow(cells);
    };
  }
  function makeproptable(props = {}, patternProps = {}, additionalProps, required, slugger) {
    if (skipProperties.includes("proptable")) {
      return paragraph();
    }
    const proprows = Object.entries(props).map(makepropheader(required, false, slugger));
    const patternproprows = Object.entries(patternProps).map(makepropheader(required, true, slugger));
    const additionalproprows = (() => {
      if (additionalProps) {
        const any = additionalProps === true;
        const cells = [
          tableCell(text(i18n2`Additional Properties`)),
          tableCell(any ? text("Any") : type(additionalProps)),
          tableCell(text(i18n2`Optional`)),
          tableCell(any ? text("can be null") : nullable(additionalProps))
        ];
        if (!singleFile) {
          cells.push(tableCell(any ? text("") : schemaLink(`${additionalProps[symbols_default.slug]}.md`, `${additionalProps[symbols_default.id]}#${additionalProps[symbols_default.pointer]}`, text(additionalProps[symbols_default.titles][0] || i18n2`Untitled schema`))));
        }
        return [tableRow(cells)];
      }
      return [];
    })();
    const headerCells = [
      tableCell(text(i18n2`Property`)),
      tableCell(text(i18n2`Type`)),
      tableCell(text(i18n2`Required`)),
      tableCell(text(i18n2`Nullable`))
    ];
    if (!singleFile) {
      headerCells.push(tableCell(text(i18n2`Defined by`)));
    }
    return table("left", [
      tableRow(headerCells),
      ...proprows,
      ...patternproprows,
      ...additionalproprows
    ]);
  }
  function makearrayfact(items, additional) {
    if (skipProperties.includes("arrayfact")) {
      return "";
    }
    return listItem([
      paragraph([text(i18n2`Type: `), text(i18n2`an array where each item follows the corresponding schema in the following list:`)]),
      list(
        "ordered",
        [
          ...items.map((schema) => listItem(paragraph(schemaLink(
            `${schema[symbols_default.slug]}.md`,
            i18n2`check type definition`,
            text(gentitle(schema[symbols_default.titles], schema[keyword`type`]))
          )))),
          ...(() => {
            if (additional === true) {
              return [listItem(paragraph(text(i18n2`and all following items may follow any schema`)))];
            } else if (typeof additional === "object") {
              return [listItem(paragraph([
                text(i18n2`and all following items must follow the schema: `),
                schemaLink(
                  `${additional[symbols_default.slug]}.md`,
                  i18n2`check type definition`,
                  text(gentitle(additional[symbols_default.titles], additional[keyword`type`]))
                )
              ]))];
            }
            return [];
          })()
        ]
      )
    ]);
  }
  function maketypefact(definition, isarray = "") {
    const alltypes = Array.isArray(definition[keyword`type`]) ? definition[keyword`type`] : [definition[keyword`type`]];
    const realtypes = alltypes.filter((mytype) => mytype !== keyword`null`);
    const isnullable = alltypes.filter((mytype) => mytype === keyword`null`).length > 0;
    const singletype = realtypes.length <= 1;
    const [firsttype] = realtypes;
    const nulltype = isnullable && realtypes.length === 0;
    const array = firsttype === keyword`array`;
    const merged = !!(definition[keyword`allOf`] || definition[keyword`anyOf`] || definition[keyword`oneOf`] || definition[keyword`not`]);
    if (array && Array.isArray(definition[keyword`items`])) {
      return makearrayfact(definition[keyword`items`], definition[keyword`additionalItems`]);
    } else if (array && definition[keyword`items`]) {
      return maketypefact(definition[keyword`items`], `${isarray}[]`);
    }
    const typefact = (() => {
      if (nulltype) {
        return [inlineCode(`null${isarray}`), text(i18n2`, the value must be null`)];
      } else if (singletype && firsttype && typeof firsttype === "string") {
        return [inlineCode(firsttype + isarray)];
      } else if (!singletype) {
        return [text(isarray ? i18n2`an array of the following:` : i18n2`any of the following: `), ...flist(flat(realtypes.map((mytype, index) => [inlineCode(mytype || i18n2`not defined`), text(index === realtypes.length - 1 ? "" : i18n2` or `)])))];
      } else if (merged) {
        return [text(isarray ? "an array of merged types" : i18n2`merged type`)];
      }
      return [text(i18n2`unknown` + isarray)];
    })();
    const typelink = (() => {
      if (definition[keyword`title`] && typeof definition[keyword`title`] === "string") {
        return [text(" ("), schemaLink(`${definition[symbols_default.slug]}.md`, "", text(definition[keyword`title`])), text(")")];
      } else if (!singletype || firsttype === keyword`object` || merged) {
        if (singleFile) return [];
        return [text(" ("), link(`${definition[symbols_default.slug]}.md`, "", text(i18n2`Details`)), text(")")];
      }
      return [];
    })();
    const retval = listItem(paragraph([text(i18n2`Type: `), ...typefact, ...typelink]));
    return retval;
  }
  function makenullablefact(definition) {
    const alltypes = Array.isArray(definition[keyword`type`]) ? definition[keyword`type`] : [definition[keyword`type`]];
    const isnullable = alltypes.filter((mytype) => mytype === keyword`null`).length > 0;
    if (isnullable) {
      return listItem(paragraph(text(i18n2`can be null`)));
    } else {
      return listItem(paragraph(text(i18n2`cannot be null`)));
    }
  }
  function makedefinedinfact(definition) {
    return listItem(paragraph([
      text(i18n2`defined in: `),
      schemaLink(`${definition[symbols_default.slug]}.md`, `${definition[symbols_default.id]}#${definition[symbols_default.pointer]}`, text(definition[symbols_default.titles] && definition[symbols_default.titles][0] ? definition[symbols_default.titles][0] : i18n2`Untitled schema`))
    ]));
  }
  function makefactlist(name, definition, required = []) {
    const children = [];
    if (required.indexOf(name) > -1) {
      children.push(listItem(text(i18n2`is required`)));
    } else {
      children.push(listItem(text(i18n2`is optional`)));
    }
    if (!skipProperties.includes("typefact")) {
      children.push(maketypefact(definition));
    }
    if (!skipProperties.includes("nullablefact")) {
      children.push(makenullablefact(definition));
    }
    if (!skipProperties.includes("definedinfact")) {
      children.push(makedefinedinfact(definition));
    }
    const additionalfacts = includeProperties.map((propname) => {
      if (definition[propname]) {
        return listItem(text(`${propname}: ${String(definition[propname])}`));
      }
      return void 0;
    }).filter((item) => item !== void 0);
    children.push(...additionalfacts);
    return list("unordered", children);
  }
  function simpletitle(schema) {
    return schema[symbols_default.parent] ? schema[symbols_default.pointer].split("/").pop() : gentitle(schema[symbols_default.titles], schema[keyword`type`]);
  }
  function makejointypelist(schema, depth = 0, maxdepth = 3) {
    if (schema[keyword`oneOf`] && depth <= maxdepth) {
      return [
        paragraph(text(i18n2`one (and only one) of`)),
        list("unordered", [
          ...schema[keyword`oneOf`].map((subschema) => listItem(makejointypelist(subschema, depth + 1)))
        ])
      ];
    } else if (schema[keyword`anyOf`] && depth <= maxdepth) {
      return [
        paragraph(text(i18n2`any of`)),
        list("unordered", [
          ...schema[keyword`anyOf`].map((subschema) => listItem(makejointypelist(subschema, depth + 1)))
        ])
      ];
    } else if (schema[keyword`allOf`] && depth <= maxdepth) {
      return [
        paragraph(text(i18n2`all of`)),
        list("unordered", [
          ...schema[keyword`allOf`].map((subschema) => listItem(makejointypelist(subschema, depth + 1)))
        ])
      ];
    } else if (schema[keyword`not`] && depth <= maxdepth) {
      const subschema = schema[keyword`not`];
      return [
        paragraph(text(i18n2`not`)),
        list("unordered", [
          listItem(makejointypelist(subschema, depth + 1))
        ])
      ];
    } else if (depth > 0) {
      return [
        schemaLink(`${schema[symbols_default.slug]}.md`, i18n2`check type definition`, text(gentitle(schema[symbols_default.titles], schema[keyword`type`])))
      ];
    } else {
      return [];
    }
  }
  function maketypesection(schema, level = 1) {
    if (skipProperties.includes("typesection")) {
      return "";
    }
    const { children } = maketypefact(schema);
    children[0].children.shift();
    return [
      heading(level + 1, text(i18n2`${simpletitle(schema)} Type`)),
      ...children,
      ...makejointypelist(schema)
    ];
  }
  function makeconstraintssection(schema, level = 1) {
    const constraints = [];
    if (schema[keyword`const`] !== void 0) {
      constraints.push(paragraph([strong(text(i18n2`constant`)), text(": "), text(i18n2`the value of this property must be equal to:`)]));
      constraints.push(code("json", JSON.stringify(schema[keyword`const`], void 0, 2)));
    }
    if (schema[keyword`enum`]) {
      const metas = schema[keyword`meta:enum`] || {};
      constraints.push(paragraph([strong(text(i18n2`enum`)), text(": "), text(i18n2`the value of this property must be equal to one of the following values:`)]));
      constraints.push(table("left", [
        tableRow([
          tableCell(text(i18n2`Value`)),
          tableCell(text(i18n2`Explanation`))
        ]),
        ...Array.isArray(schema[keyword`enum`]) ? schema[keyword`enum`].map((value) => tableRow([
          tableCell(inlineCode(JSON.stringify(value))),
          tableCell(text(metas[Array.isArray(value) ? JSON.stringify(value) : value] || ""))
        ])) : []
      ]));
    }
    if (schema[keyword`multipleOf`] !== void 0 && typeof schema[keyword`multipleOf`] === "number") {
      constraints.push(paragraph([strong(text(i18n2`multiple of`)), text(": "), text(i18n2`the value of this number must be a multiple of: `), inlineCode(String(schema[keyword`multipleOf`]))]));
    }
    if (schema[keyword`maximum`] !== void 0 && typeof schema[keyword`maximum`] === "number") {
      constraints.push(paragraph([strong(text(i18n2`maximum`)), text(": "), text(i18n2`the value of this number must smaller than or equal to: `), inlineCode(String(schema[keyword`maximum`]))]));
    }
    if (schema[keyword`exclusiveMaximum`] !== void 0 && typeof schema[keyword`exclusiveMaximum`] === "number") {
      constraints.push(paragraph([strong(text(i18n2`maximum (exclusive)`)), text(": "), text(i18n2`the value of this number must be smaller than: `), inlineCode(String(schema[keyword`exclusiveMaximum`]))]));
    }
    if (schema[keyword`minimum`] !== void 0 && typeof schema[keyword`minimum`] === "number") {
      constraints.push(paragraph([strong(text(i18n2`minimum`)), text(": "), text(i18n2`the value of this number must greater than or equal to: `), inlineCode(String(schema[keyword`minimum`]))]));
    }
    if (schema[keyword`exclusiveMinimum`] !== void 0 && typeof schema[keyword`exclusiveMinimum`] === "number") {
      constraints.push(paragraph([strong(text(i18n2`minimum (exclusive)`)), text(": "), text(i18n2`the value of this number must be greater than: `), inlineCode(String(schema[keyword`exclusiveMinimum`]))]));
    }
    if (schema[keyword`maxLength`] !== void 0 && typeof schema[keyword`maxLength`] === "number") {
      constraints.push(paragraph([strong(text(i18n2`maximum length`)), text(": "), text(i18n2`the maximum number of characters for this string is: `), inlineCode(String(schema[keyword`maxLength`]))]));
    }
    if (schema[keyword`minLength`] !== void 0 && typeof schema[keyword`minLength`] === "number") {
      constraints.push(paragraph([strong(text(i18n2`minimum length`)), text(": "), text(i18n2`the minimum number of characters for this string is: `), inlineCode(String(schema[keyword`minLength`]))]));
    }
    if (schema[keyword`pattern`]) {
      constraints.push(paragraph([strong(text(i18n2`pattern`)), text(": "), text(i18n2`the string must match the following regular expression: `)]));
      constraints.push(code("regexp", schema[keyword`pattern`]));
      constraints.push(paragraph([link(`https://regexr.com/?expression=${encodeURIComponent(schema[keyword`pattern`])}`, i18n2`try regular expression with regexr.com`, text(i18n2`try pattern`))]));
    }
    if (schema.format && typeof schema.format === "string" && formats[schema.format]) {
      constraints.push(paragraph([
        strong(text(formats[keyword([schema.format])].label)),
        text(": "),
        text(formats[schema.format].text),
        link(formats[schema.format].speclink, i18n2`check the specification`, text(formats[schema.format].specname))
      ]));
    } else if (schema.format && typeof schema.format === "string") {
      constraints.push(paragraph([strong(text(i18n2`unknown format`)), text(": "), text(i18n2`the value of this string must follow the format: `), inlineCode(String(schema.format))]));
    }
    if (schema[keyword`contentEncoding`]) {
      constraints.push(paragraph([strong(text(i18n2`encoding`)), text(": "), text(i18n2`the string content must be using the ${schema[keyword`contentEncoding`]} content encoding.`)]));
    }
    if (schema[keyword`contentMediaType`]) {
      constraints.push(paragraph([strong(text(i18n2`media type`)), text(": "), text(i18n2`the media type of the contents of this string is: `), inlineCode(String(schema[keyword`contentMediaType`]))]));
    }
    if (schema[keyword`contentSchema`]) {
      constraints.push(paragraph([
        strong(text(i18n2`schema`)),
        text(": "),
        text(i18n2`the contents of this string should follow this schema: `),
        schemaLink(`${schema[keyword`contentSchema`][symbols_default.slug]}.md`, i18n2`check type definition`, text(gentitle(schema[keyword`contentSchema`][symbols_default.titles], schema[keyword`contentSchema`][keyword`type`])))
      ]));
    }
    if (schema[keyword`maxItems`] !== void 0) {
      constraints.push(paragraph([strong(text(i18n2`maximum number of items`)), text(": "), text(i18n2`the maximum number of items for this array is: `), inlineCode(String(schema[keyword`maxItems`]))]));
    }
    if (schema[keyword`minItems`] !== void 0) {
      constraints.push(paragraph([strong(text(i18n2`minimum number of items`)), text(": "), text(i18n2`the minimum number of items for this array is: `), inlineCode(String(schema[keyword`minItems`]))]));
    }
    if (schema[keyword`uniqueItems`]) {
      constraints.push(paragraph([strong(text(i18n2`unique items`)), text(": "), text(i18n2`all items in this array must be unique. Duplicates are not allowed.`)]));
    }
    if (schema[keyword`minContains`] !== void 0 && schema[keyword`contains`]) {
      constraints.push(paragraph([
        strong(text(i18n2`minimum number of contained items`)),
        text(": "),
        text(`${i18n2`this array may not contain fewer than ${String(schema[keyword`minContains`])} items that validate against the schema:`} `),
        schemaLink(`${schema[keyword`contains`][symbols_default.slug]}.md`, i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`])))
      ]));
    }
    if (schema[keyword`maxContains`] !== void 0 && schema[keyword`contains`]) {
      constraints.push(paragraph([
        strong(text(i18n2`maximum number of contained items`)),
        text(": "),
        text(`${i18n2`this array may not contain more than ${String(schema[keyword`maxContains`])} items that validate against the schema:`} `),
        schemaLink(`${schema[keyword`contains`][symbols_default.slug]}.md`, i18n2`check type definition`, text(gentitle(schema[keyword`contains`][symbols_default.titles], schema[keyword`contains`][keyword`type`])))
      ]));
    }
    if (schema[keyword`maxProperties`] !== void 0) {
      constraints.push(paragraph([strong(text(i18n2`maximum number of properties`)), text(": "), text(i18n2`the maximum number of properties for this object is: `), inlineCode(String(schema[keyword`maxProperties`]))]));
    }
    if (schema[keyword`minProperties`] !== void 0) {
      constraints.push(paragraph([strong(text(i18n2`minimum number of properties`)), text(": "), text(i18n2`the minimum number of properties for this object is: `), inlineCode(String(schema[keyword`minProperties`]))]));
    }
    if (constraints.length > 0) {
      return [heading(level + 1, text(i18n2`${simpletitle(schema)} Constraints`)), ...constraints];
    }
    return [];
  }
  function makeexamples(schema, level = 1) {
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === "yaml") {
      return [
        heading(level + 1, text(i18n2`${simpletitle(schema)} Examples`)),
        ...schema[keyword`examples`].map((example) => paragraph(code("yaml", yaml.dump(example, void 0, 2))))
      ];
    }
    if (schema[keyword`examples`] && schema[keyword`examples`].length > 0 && exampleFormat === "json") {
      return [
        heading(level + 1, text(i18n2`${simpletitle(schema)} Examples`)),
        ...schema[keyword`examples`].map((example) => paragraph(code("json", JSON.stringify(example, void 0, 2))))
      ];
    }
    return [];
  }
  function makedefault(schema, level = 1) {
    if (schema[keyword`default`] !== void 0) {
      return [
        heading(level + 1, text(i18n2`${simpletitle(schema)} Default Value`)),
        paragraph(text(i18n2`The default value is:`)),
        paragraph(code("json", JSON.stringify(schema[keyword`default`], void 0, 2)))
      ];
    }
    return [];
  }
  function makerestrictions(schema, level = 1) {
    if (schema[keyword`readOnly`] && schema[keyword`writeOnly`]) {
      return [
        heading(level + 1, text(i18n2`${simpletitle(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`))
      ];
    }
    if (schema[keyword`readOnly`]) {
      return [
        heading(level + 1, text(i18n2`${simpletitle(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`))
      ];
    }
    if (schema[keyword`writeOnly`]) {
      return [
        heading(level + 1, text(i18n2`${simpletitle(schema)} Access Restrictions`)),
        paragraph(text(i18n2`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`))
      ];
    }
    return [];
  }
  function makeproplist(properties = {}, patternProperties = {}, additionalProperties, required, level = 2) {
    return [
      ...flist(flat(Object.entries(properties || {}).map(([name, definition]) => {
        const description = definition[symbols_default.meta] && definition[symbols_default.meta].longdescription ? definition[symbols_default.meta].longdescription : paragraph(text(i18n2`no description`));
        return [
          heading(level + 1, text(name)),
          description,
          ...makecomment(definition),
          paragraph(inlineCode(name)),
          makefactlist(name, definition, required),
          ...maketypesection(definition, level + 1),
          ...makeconstraintssection(definition, level + 1),
          ...makedefault(definition, level + 1),
          ...makeexamples(definition, level + 1),
          ...makerestrictions(definition, level + 1)
        ];
      }))),
      ...flist(flat(Object.entries(patternProperties || {}).map(([name, definition]) => {
        const description = definition[symbols_default.meta] && definition[symbols_default.meta].longdescription ? definition[symbols_default.meta].longdescription : paragraph(text(i18n2`no description`));
        return [
          heading(level + 1, [text(i18n2`Pattern: `), inlineCode(name)]),
          description,
          ...makecomment(definition),
          paragraph(inlineCode(name)),
          makefactlist(name, definition, required),
          ...maketypesection(definition, level + 1),
          ...makeconstraintssection(definition, level + 1),
          ...makedefault(definition, level + 1),
          ...makeexamples(definition, level + 1),
          ...makerestrictions(definition, level + 1)
        ];
      }))),
      ...((definition) => {
        if (typeof additionalProperties === "object") {
          const description = definition[symbols_default.meta].longdescription || paragraph(text(i18n2`no description`));
          return [
            heading(level + 1, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)),
            description,
            ...makecomment(definition),
            makefactlist(i18n2`Additional properties`, definition, required),
            ...maketypesection(definition, level + 1),
            ...makeconstraintssection(definition, level + 1),
            ...makedefault(definition, level + 1),
            ...makeexamples(definition, level + 1),
            ...makerestrictions(definition, level + 1)
          ];
        } else if (additionalProperties === true) {
          return [
            heading(level + 1, text(i18n2`Additional Properties`)),
            paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`))
          ];
        }
        return [];
      })(additionalProperties)
    ];
  }
  function makedefinitions(schema, slugger) {
    if (schema.definitions || schema[keyword`$defs`]) {
      const defgroups = [
        ...Object.entries(schema[keyword`$defs`] || {}),
        ...Object.entries(schema.definitions || {})
      ].map(([groupname, subschema]) => {
        const grouptable = makeproptable(
          subschema[keyword`properties`],
          subschema[keyword`patternProperties`],
          subschema[keyword`additionalProperties`],
          subschema[keyword`required`],
          slugger
        );
        return [
          heading(2, text(i18n2`Definitions group ${groupname}`)),
          paragraph(text(i18n2`Reference this group by using`)),
          code("json", JSON.stringify({ $ref: `${subschema[symbols_default.id]}#${subschema[symbols_default.pointer]}` })),
          grouptable,
          ...makeproplist(
            subschema[keyword`properties`],
            subschema[keyword`patternProperties`],
            subschema[keyword`additionalProperties`],
            subschema[keyword`required`],
            2
          )
        ];
      });
      return [
        heading(1, text(i18n2`${gentitle(schema[symbols_default.titles], schema[keyword`type`])} Definitions`)),
        ...flist(flat(defgroups))
      ];
    }
    return [];
  }
  function makeproperties(schema, slugger) {
    if (schema[keyword`properties`] || schema[keyword`patternProperties`] || schema[keyword`additionalProperties`]) {
      return [
        heading(1, text(i18n2`${simpletitle(schema)} Properties`)),
        makeproptable(
          schema[keyword`properties`],
          schema[keyword`patternProperties`],
          schema[keyword`additionalProperties`],
          schema[keyword`required`],
          slugger
        ),
        ...makeproplist(
          schema[keyword`properties`],
          schema[keyword`patternProperties`],
          schema[keyword`additionalProperties`],
          schema[keyword`required`],
          1
        )
      ];
    }
    return [];
  }
  console.log("generating markdown");
  return (schemas) => foldl(schemas, {}, (pv, schema) => {
    const slugger = new GhSlugger();
    pv[schema[symbols_default.slug]] = root([
      // todo add more elements
      ...makeheader(schema),
      ...maketypesection(schema, 1),
      ...makeconstraintssection(schema, 1),
      ...makedefault(schema, 1),
      ...makeexamples(schema, 1),
      ...makeproperties(schema, slugger),
      ...makedefinitions(schema, slugger)
    ]);
    return pv;
  });
}
export {
  build as default
};
