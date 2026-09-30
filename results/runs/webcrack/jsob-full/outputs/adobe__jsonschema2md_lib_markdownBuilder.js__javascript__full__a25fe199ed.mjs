var filename = Symbol("filename");
var fullpath = Symbol("fullpath");
var symbols = {
  pointer: Symbol("pointer"),
  filename: filename,
  fullpath: fullpath,
  id: Symbol("id"),
  titles: Symbol("titles"),
  resolve: Symbol("resolve"),
  slug: Symbol("slug"),
  meta: Symbol("meta"),
  parent: Symbol("parent")
};
var symbols_default = symbols;
import _0xe26c5a from "es2015-i18n-tag";
var {
  default: i18n
} = _0xe26c5a;
function gentitle(_0xb97020, _0xd347c1) {
  if (!Array.isArray(_0xb97020)) {
    return i18n`Untitled schema`;
  }
  const [_0x540cac] = _0xb97020;
  const _0x446e1a = [..._0xb97020].pop();
  if (_0xb97020.length === 1 && _0x540cac !== undefined) {
    return _0x540cac;
  }
  if (_0x446e1a) {
    return _0x446e1a;
  }
  if (typeof _0xd347c1 === "string") {
    return i18n`Untitled ${_0xd347c1} in ${String(_0x540cac)}`;
  }
  if (_0x540cac === undefined) {
    return i18n`Untitled schema`;
  }
  return i18n`Untitled undefined type in ${_0x540cac}`;
}
function gendescription(_0x44e624) {
  if (_0x44e624 && _0x44e624[symbols_default.meta]) {
    return _0x44e624[symbols_default.meta].shortdescription;
  } else {
    return "";
  }
}
var used = new Set();
function keyword(_0x2eb1cf) {
  used.add(_0x2eb1cf[0]);
  return _0x2eb1cf.join("");
}
function report() {
  return used;
}
import { map, list as _0x528ebe, flat, filter, size, foldl } from "ferrum";
import { root, paragraph, text, heading, code, table, tableRow, tableCell, link, inlineCode, list, listItem, strong, blockquote } from "mdast-builder";
import _0x27689f from "es2015-i18n-tag";
import _0x30ce90 from "github-slugger";
import _0x3a9aea from "js-yaml";
var {
  default: i18n2
} = _0x27689f;
function build({
  header: _0xa0fd16,
  links = {},
  includeProperties = [],
  rewritelinks = _0x32031f => _0x32031f,
  exampleFormat = "json",
  skipProperties: _0x4b0092 = [],
  singleFile = false
} = {}) {
  const _0x2c911a = singleFile ? [...new Set([..._0x4b0092, "definedinfact"])] : _0x4b0092;
  function _0x33fd02(_0x4a2452, _0xe2e5eb, _0x5d6fea) {
    if (singleFile) {
      return _0x5d6fea;
    }
    return link(_0x4a2452, _0xe2e5eb, _0x5d6fea);
  }
  const _0x492c31 = {
    label: i18n2`date time`,
    text: i18n2`the string must be a date time string, according to `,
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  const _0xc7eba7 = {
    label: i18n2`date`,
    text: i18n2`the string must be a date string, according to `,
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  const _0x2faad4 = {
    label: i18n2`time`,
    text: i18n2`the string must be a time string, according to `,
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  const _0x5d05e8 = {
    label: i18n2`duration`,
    text: i18n2`the string must be a duration string, according to `,
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  const _0x432608 = {
    label: i18n2`email`,
    text: i18n2`the string must be an email address, according to `,
    specname: "RFC 5322, section 3.4.1",
    speclink: "https://tools.ietf.org/html/rfc5322"
  };
  const _0x3613f1 = {
    label: i18n2`(international) email`,
    text: i18n2`the string must be an (international) email address, according to `,
    specname: "RFC 6531",
    speclink: "https://tools.ietf.org/html/rfc6531"
  };
  const _0x1bdb66 = {
    label: i18n2`hostname`,
    text: i18n2`the string must be a hostname, according to `,
    specname: "RFC 1123, section 2.1",
    speclink: "https://tools.ietf.org/html/rfc1123"
  };
  const _0x5ab1f3 = {
    label: i18n2`(international) hostname`,
    text: i18n2`the string must be an (IDN) hostname, according to `,
    specname: "RFC 5890, section 2.3.2.3",
    speclink: "https://tools.ietf.org/html/rfc5890"
  };
  const _0xbf2d39 = {
    label: i18n2`IPv4`,
    text: i18n2`the string must be an IPv4 address (dotted quad), according to `,
    specname: "RFC 2673, section 3.2",
    speclink: "https://tools.ietf.org/html/rfc2673"
  };
  const _0x41a826 = {
    label: i18n2`IPv6`,
    text: i18n2`the string must be an IPv6 address, according to `,
    specname: "RFC 4291, section 2.2",
    speclink: "https://tools.ietf.org/html/rfc4291"
  };
  const _0x5ebfd2 = {
    label: i18n2`URI`,
    text: i18n2`the string must be a URI, according to `,
    specname: "RFC 3986",
    speclink: "https://tools.ietf.org/html/rfc3986"
  };
  const _0x5c46c9 = {
    label: i18n2`IRI`,
    text: i18n2`the string must be a IRI, according to `,
    specname: "RFC 3987",
    speclink: "https://tools.ietf.org/html/rfc3987"
  };
  const _0x55d1b0 = {
    label: i18n2`URI reference`,
    text: i18n2`the string must be a URI reference, according to `,
    specname: "RFC 3986",
    speclink: "https://tools.ietf.org/html/rfc3986"
  };
  const _0x4ab0f6 = {
    label: i18n2`IRI reference`,
    text: i18n2`the string must be a IRI reference, according to `,
    specname: "RFC 3987",
    speclink: "https://tools.ietf.org/html/rfc3987"
  };
  const _0x47ffd9 = {
    label: i18n2`UUID`,
    text: i18n2`the string must be a UUID, according to `,
    specname: "RFC 4122",
    speclink: "https://tools.ietf.org/html/rfc4122"
  };
  const _0x4a5d37 = {
    label: i18n2`JSON Pointer`,
    text: i18n2`the string must be a JSON Pointer, according to `,
    specname: "RFC 6901, section 5",
    speclink: "https://tools.ietf.org/html/rfc6901"
  };
  const _0x4e4e88 = {
    label: i18n2`Relative JSON Pointer`,
    text: i18n2`the string must be a relative JSON Pointer, according to `,
    specname: "draft-handrews-relative-json-pointer-01",
    speclink: "https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01"
  };
  const _0x26de0c = {
    label: i18n2`RegEx`,
    text: i18n2`the string must be a regular expression, according to `,
    specname: "ECMA-262",
    speclink: "http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf"
  };
  const _0x1fd60c = {
    label: i18n2`URI Template`,
    text: i18n2`the string must be a URI template, according to `,
    specname: "RFC 6570",
    speclink: "https://tools.ietf.org/html/rfc6570"
  };
  const _0x1754aa = {
    "date-time": _0x492c31,
    date: _0xc7eba7,
    time: _0x2faad4,
    duration: _0x5d05e8,
    email: _0x432608,
    "idn-email": _0x3613f1,
    hostname: _0x1bdb66,
    "idn-hostname": _0x5ab1f3,
    ipv4: _0xbf2d39,
    ipv6: _0x41a826,
    uri: _0x5ebfd2,
    iri: _0x5c46c9,
    "uri-reference": _0x55d1b0,
    "iri-reference": _0x4ab0f6,
    uuid: _0x47ffd9,
    "json-pointer": _0x4a5d37,
    "relative-json-pointer": _0x4e4e88,
    regex: _0x26de0c,
    "uri-template": _0x1fd60c
  };
  const _0x12be54 = _0x1754aa;
  const _0x26ead1 = {
    name: "abstract",
    title: i18n2`Abstract`,
    truelabel: i18n2`Cannot be instantiated`,
    falselabel: i18n2`Can be instantiated`,
    undefinedlabel: i18n2`Unknown abstraction`
  };
  const _0x5a33be = {
    name: "extensible",
    title: i18n2`Extensible`,
    undefinedlable: i18n2`Unknown extensibility`,
    truelabel: i18n2`Yes`,
    falselabel: i18n2`No`
  };
  const _0x6558e2 = {
    name: "status",
    title: i18n2`Status`,
    undefinedlabel: "Unknown status",
    deprecatedlabel: i18n2`Deprecated`,
    stablelabel: i18n2`Stable`,
    stabilizinglabel: i18n2`Stabilizing`,
    experimentallabel: i18n2`Experimental`
  };
  const _0x527998 = {
    name: "identifiable",
    title: i18n2`Identifiable`,
    truelabel: i18n2`Yes`,
    falselabel: i18n2`No`,
    undefinedlabel: i18n2`Unknown identifiability`
  };
  const _0x3b6a4d = {
    name: "custom",
    title: i18n2`Custom Properties`,
    truelabel: i18n2`Allowed`,
    falselabel: i18n2`Forbidden`,
    undefinedlabel: i18n2`Unknown custom properties`
  };
  const _0xfaa88f = {
    name: "additional",
    title: i18n2`Additional Properties`,
    truelabel: i18n2`Allowed`,
    falselabel: i18n2`Forbidden`,
    undefinedlabel: i18n2`Unknown additional properties`
  };
  const _0x32fdf2 = {
    name: "restrictions",
    title: i18n2`Access Restrictions`,
    readOnlylabel: i18n2`Read only`,
    writeOnlylabel: i18n2`Write only`,
    secretlabel: i18n2`cannot be read or written`,
    undefinedlabel: i18n2`none`
  };
  const _0x180d63 = {
    name: "definedin",
    title: i18n2`Defined In`,
    undefinedlabel: i18n2`Unknown definition`
  };
  const _0x32c62a = [_0x26ead1, _0x5a33be, _0x6558e2, _0x527998, _0x3b6a4d, _0xfaa88f, _0x32fdf2, _0x180d63];
  function _0x26f2fb(_0x300118) {
    if (_0x300118[keyword`$comment`]) {
      return [blockquote(_0x300118[symbols_default.meta].longcomment)];
    }
    return [];
  }
  function _0x2a1291(_0x4432e0) {
    if (_0xa0fd16) {
      return [heading(1, text(i18n2`${gentitle(_0x4432e0[symbols_default.titles], _0x4432e0[keyword`type`])} Schema`)), paragraph(code("txt", _0x4432e0[symbols_default.id] + (_0x4432e0[symbols_default.pointer] ? "#" + _0x4432e0[symbols_default.pointer] : ""))), _0x4432e0[symbols_default.meta].longdescription, ..._0x26f2fb(_0x4432e0), table("left", [tableRow(_0x528ebe(map(_0x32c62a, ({
        name: _0x4cd788,
        title: _0xfc1de7
      }) => {
        if (links[_0x4cd788]) {
          return tableCell(link(links[_0x4cd788], i18n2`What does ${_0xfc1de7} mean?`, text(_0xfc1de7)));
        }
        return tableCell(text(_0xfc1de7));
      }), Array)), tableRow(_0x528ebe(map(_0x32c62a, _0x3761f8 => {
        if (_0x4432e0[symbols_default.meta] && typeof _0x4432e0[symbols_default.meta][_0x3761f8.name] === "object" && _0x4432e0[symbols_default.meta][_0x3761f8.name].link && _0x4432e0[symbols_default.meta][_0x3761f8.name].text) {
          return tableCell(link(rewritelinks(_0x4432e0[symbols_default.meta][_0x3761f8.name].link), i18n2`open original schema`, [text(_0x4432e0[symbols_default.meta][_0x3761f8.name].text)]));
        }
        const _0x31ba8b = _0x4432e0[symbols_default.meta] ? _0x4432e0[symbols_default.meta][_0x3761f8.name] : undefined;
        return tableCell(text(_0x3761f8[String(_0x31ba8b) + "label"] || i18n2`Unknown`));
      }), Array))])];
    }
    return [];
  }
  function _0x30ca29(_0x2beef1) {
    if (!Array.isArray(_0x2beef1[keyword`type`]) && typeof _0x2beef1[keyword`type`] === "object") {
      return text(i18n2`Unknown Type`);
    }
    const _0x446659 = Array.isArray(_0x2beef1[keyword`type`]) ? _0x2beef1[keyword`type`] : [_0x2beef1[keyword`type`]];
    const _0x414419 = _0x528ebe(filter(_0x446659, _0x3c0c4e => _0x3c0c4e !== "null" && _0x3c0c4e !== undefined));
    if (_0x2beef1[keyword`allOf`] || _0x2beef1[keyword`anyOf`] || _0x2beef1[keyword`oneOf`] || _0x2beef1[keyword`not`]) {
      return text(i18n2`Merged`);
    } else if (size(_0x414419) === 0) {
      return text(i18n2`Not specified`);
    }
    if (size(_0x414419) === 1) {
      return inlineCode(_0x414419[0]);
    } else {
      return text(i18n2`Multiple`);
    }
  }
  function _0x2e7776(_0xdedf05) {
    const _0x2b0b34 = Array.isArray(_0xdedf05[keyword`type`]) ? _0xdedf05[keyword`type`] : [_0xdedf05[keyword`type`]];
    const _0x1b4244 = _0x528ebe(filter(_0x2b0b34, _0x5229e7 => _0x5229e7 === keyword`null`));
    if (size(_0x1b4244)) {
      return text(i18n2`can be null`);
    }
    return text(i18n2`cannot be null`);
  }
  function _0x58b394(_0x363622 = [], _0x3e26e4 = false, _0x1e1cb9) {
    return ([_0x59f1b3, _0x3037b7]) => {
      const _0x2b34f8 = [tableCell(_0x3e26e4 ? inlineCode(_0x59f1b3) : link("#" + _0x1e1cb9.slug(_0x59f1b3), "", text(_0x59f1b3))), tableCell(_0x30ca29(_0x3037b7)), tableCell(text(_0x363622.indexOf(_0x59f1b3) > -1 ? i18n2`Required` : i18n2`Optional`)), tableCell(_0x2e7776(_0x3037b7))];
      if (!singleFile) {
        _0x2b34f8.push(tableCell(_0x33fd02(_0x3037b7[symbols_default.slug] + ".md", _0x3037b7[symbols_default.id] + "#" + _0x3037b7[symbols_default.pointer], text(_0x3037b7[symbols_default.titles] && _0x3037b7[symbols_default.titles][0] ? _0x3037b7[symbols_default.titles][0] : i18n2`Untitled schema`))));
      }
      return tableRow(_0x2b34f8);
    };
  }
  function _0x7e655c(_0x5cb4ed = {}, _0x4b1190 = {}, _0x3d0003, _0xc0b173, _0x493981) {
    if (_0x2c911a.includes("proptable")) {
      return paragraph();
    }
    const _0x5f2d2c = Object.entries(_0x5cb4ed).map(_0x58b394(_0xc0b173, false, _0x493981));
    const _0x5ded46 = Object.entries(_0x4b1190).map(_0x58b394(_0xc0b173, true, _0x493981));
    const _0x34b54d = (() => {
      if (_0x3d0003) {
        const _0x352dc3 = _0x3d0003 === true;
        const _0x47fefc = [tableCell(text(i18n2`Additional Properties`)), tableCell(_0x352dc3 ? text("Any") : _0x30ca29(_0x3d0003)), tableCell(text(i18n2`Optional`)), tableCell(_0x352dc3 ? text("can be null") : _0x2e7776(_0x3d0003))];
        if (!singleFile) {
          _0x47fefc.push(tableCell(_0x352dc3 ? text("") : _0x33fd02(_0x3d0003[symbols_default.slug] + ".md", _0x3d0003[symbols_default.id] + "#" + _0x3d0003[symbols_default.pointer], text(_0x3d0003[symbols_default.titles][0] || i18n2`Untitled schema`))));
        }
        return [tableRow(_0x47fefc)];
      }
      return [];
    })();
    const _0x550e55 = [tableCell(text(i18n2`Property`)), tableCell(text(i18n2`Type`)), tableCell(text(i18n2`Required`)), tableCell(text(i18n2`Nullable`))];
    if (!singleFile) {
      _0x550e55.push(tableCell(text(i18n2`Defined by`)));
    }
    return table("left", [tableRow(_0x550e55), ..._0x5f2d2c, ..._0x5ded46, ..._0x34b54d]);
  }
  function _0x589c5(_0x5af66a, _0x5c39bb) {
    if (_0x2c911a.includes("arrayfact")) {
      return "";
    }
    return listItem([paragraph([text(i18n2`Type: `), text(i18n2`an array where each item follows the corresponding schema in the following list:`)]), list("ordered", [..._0x5af66a.map(_0x24e1c2 => listItem(paragraph(_0x33fd02(_0x24e1c2[symbols_default.slug] + ".md", i18n2`check type definition`, text(gentitle(_0x24e1c2[symbols_default.titles], _0x24e1c2[keyword`type`])))))), ...(() => {
      if (_0x5c39bb === true) {
        return [listItem(paragraph(text(i18n2`and all following items may follow any schema`)))];
      } else if (typeof _0x5c39bb === "object") {
        return [listItem(paragraph([text(i18n2`and all following items must follow the schema: `), _0x33fd02(_0x5c39bb[symbols_default.slug] + ".md", i18n2`check type definition`, text(gentitle(_0x5c39bb[symbols_default.titles], _0x5c39bb[keyword`type`])))]))];
      }
      return [];
    })()])]);
  }
  function _0x99f49d(_0x27fa19, _0x3a053a = "") {
    const _0x4c7c98 = Array.isArray(_0x27fa19[keyword`type`]) ? _0x27fa19[keyword`type`] : [_0x27fa19[keyword`type`]];
    const _0x54f5f5 = _0x4c7c98.filter(_0x139626 => _0x139626 !== keyword`null`);
    const _0x501f86 = _0x4c7c98.filter(_0x517c41 => _0x517c41 === keyword`null`).length > 0;
    const _0x5c7c6e = _0x54f5f5.length <= 1;
    const [_0x2c6c05] = _0x54f5f5;
    const _0x16b7d5 = _0x501f86 && _0x54f5f5.length === 0;
    const _0x14cecc = _0x2c6c05 === keyword`array`;
    const _0x1b8230 = !!_0x27fa19[keyword`allOf`] || !!_0x27fa19[keyword`anyOf`] || !!_0x27fa19[keyword`oneOf`] || !!_0x27fa19[keyword`not`];
    if (_0x14cecc && Array.isArray(_0x27fa19[keyword`items`])) {
      return _0x589c5(_0x27fa19[keyword`items`], _0x27fa19[keyword`additionalItems`]);
    } else if (_0x14cecc && _0x27fa19[keyword`items`]) {
      return _0x99f49d(_0x27fa19[keyword`items`], _0x3a053a + "[]");
    }
    const _0xfc6722 = (() => {
      if (_0x16b7d5) {
        return [inlineCode("null" + _0x3a053a), text(i18n2`, the value must be null`)];
      } else if (_0x5c7c6e && _0x2c6c05 && typeof _0x2c6c05 === "string") {
        return [inlineCode(_0x2c6c05 + _0x3a053a)];
      } else if (!_0x5c7c6e) {
        return [text(_0x3a053a ? i18n2`an array of the following:` : i18n2`any of the following: `), ..._0x528ebe(flat(_0x54f5f5.map((_0xbcfc30, _0x19dd87) => [inlineCode(_0xbcfc30 || i18n2`not defined`), text(_0x19dd87 === _0x54f5f5.length - 1 ? "" : i18n2` or `)])))];
      } else if (_0x1b8230) {
        return [text(_0x3a053a ? "an array of merged types" : i18n2`merged type`)];
      }
      return [text(i18n2`unknown` + _0x3a053a)];
    })();
    const _0x1aa514 = (() => {
      if (_0x27fa19[keyword`title`] && typeof _0x27fa19[keyword`title`] === "string") {
        return [text(" ("), _0x33fd02(_0x27fa19[symbols_default.slug] + ".md", "", text(_0x27fa19[keyword`title`])), text(")")];
      } else if (!_0x5c7c6e || _0x2c6c05 === keyword`object` || _0x1b8230) {
        if (singleFile) {
          return [];
        }
        return [text(" ("), link(_0x27fa19[symbols_default.slug] + ".md", "", text(i18n2`Details`)), text(")")];
      }
      return [];
    })();
    const _0x2a729f = listItem(paragraph([text(i18n2`Type: `), ..._0xfc6722, ..._0x1aa514]));
    return _0x2a729f;
  }
  function _0x3292d7(_0x50c776) {
    const _0x317f7b = Array.isArray(_0x50c776[keyword`type`]) ? _0x50c776[keyword`type`] : [_0x50c776[keyword`type`]];
    const _0x10f182 = _0x317f7b.filter(_0x3946e1 => _0x3946e1 === keyword`null`).length > 0;
    if (_0x10f182) {
      return listItem(paragraph(text(i18n2`can be null`)));
    } else {
      return listItem(paragraph(text(i18n2`cannot be null`)));
    }
  }
  function _0xdda6a8(_0x12dbe1) {
    return listItem(paragraph([text(i18n2`defined in: `), _0x33fd02(_0x12dbe1[symbols_default.slug] + ".md", _0x12dbe1[symbols_default.id] + "#" + _0x12dbe1[symbols_default.pointer], text(_0x12dbe1[symbols_default.titles] && _0x12dbe1[symbols_default.titles][0] ? _0x12dbe1[symbols_default.titles][0] : i18n2`Untitled schema`))]));
  }
  function _0x390e45(_0x6abe0e, _0x5186b0, _0x56ad10 = []) {
    const _0x5f0993 = [];
    if (_0x56ad10.indexOf(_0x6abe0e) > -1) {
      _0x5f0993.push(listItem(text(i18n2`is required`)));
    } else {
      _0x5f0993.push(listItem(text(i18n2`is optional`)));
    }
    if (!_0x2c911a.includes("typefact")) {
      _0x5f0993.push(_0x99f49d(_0x5186b0));
    }
    if (!_0x2c911a.includes("nullablefact")) {
      _0x5f0993.push(_0x3292d7(_0x5186b0));
    }
    if (!_0x2c911a.includes("definedinfact")) {
      _0x5f0993.push(_0xdda6a8(_0x5186b0));
    }
    const _0x474395 = includeProperties.map(_0x5349ce => {
      if (_0x5186b0[_0x5349ce]) {
        return listItem(text(_0x5349ce + ": " + String(_0x5186b0[_0x5349ce])));
      }
      return undefined;
    }).filter(_0x193904 => _0x193904 !== undefined);
    _0x5f0993.push(..._0x474395);
    return list("unordered", _0x5f0993);
  }
  function _0x136e38(_0x3072ef) {
    if (_0x3072ef[symbols_default.parent]) {
      return _0x3072ef[symbols_default.pointer].split("/").pop();
    } else {
      return gentitle(_0x3072ef[symbols_default.titles], _0x3072ef[keyword`type`]);
    }
  }
  function _0x405f0a(_0x38204e, _0x8c7fb2 = 0, _0x4bdf3b = 3) {
    if (_0x38204e[keyword`oneOf`] && _0x8c7fb2 <= _0x4bdf3b) {
      return [paragraph(text(i18n2`one (and only one) of`)), list("unordered", [..._0x38204e[keyword`oneOf`].map(_0x372953 => listItem(_0x405f0a(_0x372953, _0x8c7fb2 + 1)))])];
    } else if (_0x38204e[keyword`anyOf`] && _0x8c7fb2 <= _0x4bdf3b) {
      return [paragraph(text(i18n2`any of`)), list("unordered", [..._0x38204e[keyword`anyOf`].map(_0x37dacb => listItem(_0x405f0a(_0x37dacb, _0x8c7fb2 + 1)))])];
    } else if (_0x38204e[keyword`allOf`] && _0x8c7fb2 <= _0x4bdf3b) {
      return [paragraph(text(i18n2`all of`)), list("unordered", [..._0x38204e[keyword`allOf`].map(_0x92c805 => listItem(_0x405f0a(_0x92c805, _0x8c7fb2 + 1)))])];
    } else if (_0x38204e[keyword`not`] && _0x8c7fb2 <= _0x4bdf3b) {
      const _0x3c052f = _0x38204e[keyword`not`];
      return [paragraph(text(i18n2`not`)), list("unordered", [listItem(_0x405f0a(_0x3c052f, _0x8c7fb2 + 1))])];
    } else if (_0x8c7fb2 > 0) {
      return [_0x33fd02(_0x38204e[symbols_default.slug] + ".md", i18n2`check type definition`, text(gentitle(_0x38204e[symbols_default.titles], _0x38204e[keyword`type`])))];
    } else {
      return [];
    }
  }
  function _0x4e30bf(_0x465c8b, _0x5dd180 = 1) {
    if (_0x2c911a.includes("typesection")) {
      return "";
    }
    const {
      children: _0xaa8dcd
    } = _0x99f49d(_0x465c8b);
    _0xaa8dcd[0].children.shift();
    return [heading(_0x5dd180 + 1, text(i18n2`${_0x136e38(_0x465c8b)} Type`)), ..._0xaa8dcd, ..._0x405f0a(_0x465c8b)];
  }
  function _0x5c5a9b(_0x40852a, _0x1299a0 = 1) {
    const _0x19f26a = [];
    if (_0x40852a[keyword`const`] !== undefined) {
      _0x19f26a.push(paragraph([strong(text(i18n2`constant`)), text(": "), text(i18n2`the value of this property must be equal to:`)]));
      _0x19f26a.push(code("json", JSON.stringify(_0x40852a[keyword`const`], undefined, 2)));
    }
    if (_0x40852a[keyword`enum`]) {
      const _0x677f9c = _0x40852a[keyword`meta:enum`] || {};
      _0x19f26a.push(paragraph([strong(text(i18n2`enum`)), text(": "), text(i18n2`the value of this property must be equal to one of the following values:`)]));
      _0x19f26a.push(table("left", [tableRow([tableCell(text(i18n2`Value`)), tableCell(text(i18n2`Explanation`))]), ...(Array.isArray(_0x40852a[keyword`enum`]) ? _0x40852a[keyword`enum`].map(_0x3e3927 => tableRow([tableCell(inlineCode(JSON.stringify(_0x3e3927))), tableCell(text(_0x677f9c[Array.isArray(_0x3e3927) ? JSON.stringify(_0x3e3927) : _0x3e3927] || ""))])) : [])]));
    }
    if (_0x40852a[keyword`multipleOf`] !== undefined && typeof _0x40852a[keyword`multipleOf`] === "number") {
      _0x19f26a.push(paragraph([strong(text(i18n2`multiple of`)), text(": "), text(i18n2`the value of this number must be a multiple of: `), inlineCode(String(_0x40852a[keyword`multipleOf`]))]));
    }
    if (_0x40852a[keyword`maximum`] !== undefined && typeof _0x40852a[keyword`maximum`] === "number") {
      _0x19f26a.push(paragraph([strong(text(i18n2`maximum`)), text(": "), text(i18n2`the value of this number must smaller than or equal to: `), inlineCode(String(_0x40852a[keyword`maximum`]))]));
    }
    if (_0x40852a[keyword`exclusiveMaximum`] !== undefined && typeof _0x40852a[keyword`exclusiveMaximum`] === "number") {
      _0x19f26a.push(paragraph([strong(text(i18n2`maximum (exclusive)`)), text(": "), text(i18n2`the value of this number must be smaller than: `), inlineCode(String(_0x40852a[keyword`exclusiveMaximum`]))]));
    }
    if (_0x40852a[keyword`minimum`] !== undefined && typeof _0x40852a[keyword`minimum`] === "number") {
      _0x19f26a.push(paragraph([strong(text(i18n2`minimum`)), text(": "), text(i18n2`the value of this number must greater than or equal to: `), inlineCode(String(_0x40852a[keyword`minimum`]))]));
    }
    if (_0x40852a[keyword`exclusiveMinimum`] !== undefined && typeof _0x40852a[keyword`exclusiveMinimum`] === "number") {
      _0x19f26a.push(paragraph([strong(text(i18n2`minimum (exclusive)`)), text(": "), text(i18n2`the value of this number must be greater than: `), inlineCode(String(_0x40852a[keyword`exclusiveMinimum`]))]));
    }
    if (_0x40852a[keyword`maxLength`] !== undefined && typeof _0x40852a[keyword`maxLength`] === "number") {
      _0x19f26a.push(paragraph([strong(text(i18n2`maximum length`)), text(": "), text(i18n2`the maximum number of characters for this string is: `), inlineCode(String(_0x40852a[keyword`maxLength`]))]));
    }
    if (_0x40852a[keyword`minLength`] !== undefined && typeof _0x40852a[keyword`minLength`] === "number") {
      _0x19f26a.push(paragraph([strong(text(i18n2`minimum length`)), text(": "), text(i18n2`the minimum number of characters for this string is: `), inlineCode(String(_0x40852a[keyword`minLength`]))]));
    }
    if (_0x40852a[keyword`pattern`]) {
      _0x19f26a.push(paragraph([strong(text(i18n2`pattern`)), text(": "), text(i18n2`the string must match the following regular expression: `)]));
      _0x19f26a.push(code("regexp", _0x40852a[keyword`pattern`]));
      _0x19f26a.push(paragraph([link("https://regexr.com/?expression=" + encodeURIComponent(_0x40852a[keyword`pattern`]), i18n2`try regular expression with regexr.com`, text(i18n2`try pattern`))]));
    }
    if (_0x40852a.format && typeof _0x40852a.format === "string" && _0x12be54[_0x40852a.format]) {
      _0x19f26a.push(paragraph([strong(text(_0x12be54[keyword([_0x40852a.format])].label)), text(": "), text(_0x12be54[_0x40852a.format].text), link(_0x12be54[_0x40852a.format].speclink, i18n2`check the specification`, text(_0x12be54[_0x40852a.format].specname))]));
    } else if (_0x40852a.format && typeof _0x40852a.format === "string") {
      _0x19f26a.push(paragraph([strong(text(i18n2`unknown format`)), text(": "), text(i18n2`the value of this string must follow the format: `), inlineCode(String(_0x40852a.format))]));
    }
    if (_0x40852a[keyword`contentEncoding`]) {
      _0x19f26a.push(paragraph([strong(text(i18n2`encoding`)), text(": "), text(i18n2`the string content must be using the ${_0x40852a[keyword`contentEncoding`]} content encoding.`)]));
    }
    if (_0x40852a[keyword`contentMediaType`]) {
      _0x19f26a.push(paragraph([strong(text(i18n2`media type`)), text(": "), text(i18n2`the media type of the contents of this string is: `), inlineCode(String(_0x40852a[keyword`contentMediaType`]))]));
    }
    if (_0x40852a[keyword`contentSchema`]) {
      _0x19f26a.push(paragraph([strong(text(i18n2`schema`)), text(": "), text(i18n2`the contents of this string should follow this schema: `), _0x33fd02(_0x40852a[keyword`contentSchema`][symbols_default.slug] + ".md", i18n2`check type definition`, text(gentitle(_0x40852a[keyword`contentSchema`][symbols_default.titles], _0x40852a[keyword`contentSchema`][keyword`type`])))]));
    }
    if (_0x40852a[keyword`maxItems`] !== undefined) {
      _0x19f26a.push(paragraph([strong(text(i18n2`maximum number of items`)), text(": "), text(i18n2`the maximum number of items for this array is: `), inlineCode(String(_0x40852a[keyword`maxItems`]))]));
    }
    if (_0x40852a[keyword`minItems`] !== undefined) {
      _0x19f26a.push(paragraph([strong(text(i18n2`minimum number of items`)), text(": "), text(i18n2`the minimum number of items for this array is: `), inlineCode(String(_0x40852a[keyword`minItems`]))]));
    }
    if (_0x40852a[keyword`uniqueItems`]) {
      _0x19f26a.push(paragraph([strong(text(i18n2`unique items`)), text(": "), text(i18n2`all items in this array must be unique. Duplicates are not allowed.`)]));
    }
    if (_0x40852a[keyword`minContains`] !== undefined && _0x40852a[keyword`contains`]) {
      _0x19f26a.push(paragraph([strong(text(i18n2`minimum number of contained items`)), text(": "), text(i18n2`this array may not contain fewer than ${String(_0x40852a[keyword`minContains`])} items that validate against the schema:` + " "), _0x33fd02(_0x40852a[keyword`contains`][symbols_default.slug] + ".md", i18n2`check type definition`, text(gentitle(_0x40852a[keyword`contains`][symbols_default.titles], _0x40852a[keyword`contains`][keyword`type`])))]));
    }
    if (_0x40852a[keyword`maxContains`] !== undefined && _0x40852a[keyword`contains`]) {
      _0x19f26a.push(paragraph([strong(text(i18n2`maximum number of contained items`)), text(": "), text(i18n2`this array may not contain more than ${String(_0x40852a[keyword`maxContains`])} items that validate against the schema:` + " "), _0x33fd02(_0x40852a[keyword`contains`][symbols_default.slug] + ".md", i18n2`check type definition`, text(gentitle(_0x40852a[keyword`contains`][symbols_default.titles], _0x40852a[keyword`contains`][keyword`type`])))]));
    }
    if (_0x40852a[keyword`maxProperties`] !== undefined) {
      _0x19f26a.push(paragraph([strong(text(i18n2`maximum number of properties`)), text(": "), text(i18n2`the maximum number of properties for this object is: `), inlineCode(String(_0x40852a[keyword`maxProperties`]))]));
    }
    if (_0x40852a[keyword`minProperties`] !== undefined) {
      _0x19f26a.push(paragraph([strong(text(i18n2`minimum number of properties`)), text(": "), text(i18n2`the minimum number of properties for this object is: `), inlineCode(String(_0x40852a[keyword`minProperties`]))]));
    }
    if (_0x19f26a.length > 0) {
      return [heading(_0x1299a0 + 1, text(i18n2`${_0x136e38(_0x40852a)} Constraints`)), ..._0x19f26a];
    }
    return [];
  }
  function _0xf2412c(_0x5f4363, _0x402bf5 = 1) {
    if (_0x5f4363[keyword`examples`] && _0x5f4363[keyword`examples`].length > 0 && exampleFormat === "yaml") {
      return [heading(_0x402bf5 + 1, text(i18n2`${_0x136e38(_0x5f4363)} Examples`)), ..._0x5f4363[keyword`examples`].map(_0x231771 => paragraph(code("yaml", _0x3a9aea.dump(_0x231771, undefined, 2))))];
    }
    if (_0x5f4363[keyword`examples`] && _0x5f4363[keyword`examples`].length > 0 && exampleFormat === "json") {
      return [heading(_0x402bf5 + 1, text(i18n2`${_0x136e38(_0x5f4363)} Examples`)), ..._0x5f4363[keyword`examples`].map(_0x9b1772 => paragraph(code("json", JSON.stringify(_0x9b1772, undefined, 2))))];
    }
    return [];
  }
  function _0x90d901(_0x151433, _0x6b7b16 = 1) {
    if (_0x151433[keyword`default`] !== undefined) {
      return [heading(_0x6b7b16 + 1, text(i18n2`${_0x136e38(_0x151433)} Default Value`)), paragraph(text(i18n2`The default value is:`)), paragraph(code("json", JSON.stringify(_0x151433[keyword`default`], undefined, 2)))];
    }
    return [];
  }
  function _0x403e78(_0xa5b01b, _0xf15abd = 1) {
    if (_0xa5b01b[keyword`readOnly`] && _0xa5b01b[keyword`writeOnly`]) {
      return [heading(_0xf15abd + 1, text(i18n2`${_0x136e38(_0xa5b01b)} Access Restrictions`)), paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written.`))];
    }
    if (_0xa5b01b[keyword`readOnly`]) {
      return [heading(_0xf15abd + 1, text(i18n2`${_0x136e38(_0xa5b01b)} Access Restrictions`)), paragraph(text(i18n2`The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority`))];
    }
    if (_0xa5b01b[keyword`writeOnly`]) {
      return [heading(_0xf15abd + 1, text(i18n2`${_0x136e38(_0xa5b01b)} Access Restrictions`)), paragraph(text(i18n2`The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance.`))];
    }
    return [];
  }
  function _0x362571(_0x18370a = {}, _0x16995e = {}, _0xb81c47, _0x232de4, _0x3e5cfb = 2) {
    return [..._0x528ebe(flat(Object.entries(_0x18370a || {}).map(([_0x2feea8, _0x289391]) => {
      const _0x4ada82 = _0x289391[symbols_default.meta] && _0x289391[symbols_default.meta].longdescription ? _0x289391[symbols_default.meta].longdescription : paragraph(text(i18n2`no description`));
      return [heading(_0x3e5cfb + 1, text(_0x2feea8)), _0x4ada82, ..._0x26f2fb(_0x289391), paragraph(inlineCode(_0x2feea8)), _0x390e45(_0x2feea8, _0x289391, _0x232de4), ..._0x4e30bf(_0x289391, _0x3e5cfb + 1), ..._0x5c5a9b(_0x289391, _0x3e5cfb + 1), ..._0x90d901(_0x289391, _0x3e5cfb + 1), ..._0xf2412c(_0x289391, _0x3e5cfb + 1), ..._0x403e78(_0x289391, _0x3e5cfb + 1)];
    }))), ..._0x528ebe(flat(Object.entries(_0x16995e || {}).map(([_0x38fb04, _0x306a18]) => {
      const _0x1fddb9 = _0x306a18[symbols_default.meta] && _0x306a18[symbols_default.meta].longdescription ? _0x306a18[symbols_default.meta].longdescription : paragraph(text(i18n2`no description`));
      return [heading(_0x3e5cfb + 1, [text(i18n2`Pattern: `), inlineCode(_0x38fb04)]), _0x1fddb9, ..._0x26f2fb(_0x306a18), paragraph(inlineCode(_0x38fb04)), _0x390e45(_0x38fb04, _0x306a18, _0x232de4), ..._0x4e30bf(_0x306a18, _0x3e5cfb + 1), ..._0x5c5a9b(_0x306a18, _0x3e5cfb + 1), ..._0x90d901(_0x306a18, _0x3e5cfb + 1), ..._0xf2412c(_0x306a18, _0x3e5cfb + 1), ..._0x403e78(_0x306a18, _0x3e5cfb + 1)];
    }))), ...(_0x34e134 => {
      if (typeof _0xb81c47 === "object") {
        const _0x2c58ec = _0x34e134[symbols_default.meta].longdescription || paragraph(text(i18n2`no description`));
        return [heading(_0x3e5cfb + 1, text(i18n2`Additional Properties`)), paragraph(text(i18n2`Additional properties are allowed, as long as they follow this schema:`)), _0x2c58ec, ..._0x26f2fb(_0x34e134), _0x390e45(i18n2`Additional properties`, _0x34e134, _0x232de4), ..._0x4e30bf(_0x34e134, _0x3e5cfb + 1), ..._0x5c5a9b(_0x34e134, _0x3e5cfb + 1), ..._0x90d901(_0x34e134, _0x3e5cfb + 1), ..._0xf2412c(_0x34e134, _0x3e5cfb + 1), ..._0x403e78(_0x34e134, _0x3e5cfb + 1)];
      } else if (_0xb81c47 === true) {
        return [heading(_0x3e5cfb + 1, text(i18n2`Additional Properties`)), paragraph(text(i18n2`Additional properties are allowed and do not have to follow a specific schema`))];
      }
      return [];
    })(_0xb81c47)];
  }
  function _0x792d63(_0x513355, _0x12e530) {
    if (_0x513355.definitions || _0x513355[keyword`$defs`]) {
      const _0x5bd426 = [...Object.entries(_0x513355[keyword`$defs`] || {}), ...Object.entries(_0x513355.definitions || {})].map(([_0x4554fa, _0x356ed2]) => {
        const _0x3b0d0c = _0x7e655c(_0x356ed2[keyword`properties`], _0x356ed2[keyword`patternProperties`], _0x356ed2[keyword`additionalProperties`], _0x356ed2[keyword`required`], _0x12e530);
        const _0x5b94b5 = {
          $ref: _0x356ed2[symbols_default.id] + "#" + _0x356ed2[symbols_default.pointer]
        };
        return [heading(2, text(i18n2`Definitions group ${_0x4554fa}`)), paragraph(text(i18n2`Reference this group by using`)), code("json", JSON.stringify(_0x5b94b5)), _0x3b0d0c, ..._0x362571(_0x356ed2[keyword`properties`], _0x356ed2[keyword`patternProperties`], _0x356ed2[keyword`additionalProperties`], _0x356ed2[keyword`required`], 2)];
      });
      return [heading(1, text(i18n2`${gentitle(_0x513355[symbols_default.titles], _0x513355[keyword`type`])} Definitions`)), ..._0x528ebe(flat(_0x5bd426))];
    }
    return [];
  }
  function _0x58f8fa(_0x22c446, _0x2f504d) {
    if (_0x22c446[keyword`properties`] || _0x22c446[keyword`patternProperties`] || _0x22c446[keyword`additionalProperties`]) {
      return [heading(1, text(i18n2`${_0x136e38(_0x22c446)} Properties`)), _0x7e655c(_0x22c446[keyword`properties`], _0x22c446[keyword`patternProperties`], _0x22c446[keyword`additionalProperties`], _0x22c446[keyword`required`], _0x2f504d), ..._0x362571(_0x22c446[keyword`properties`], _0x22c446[keyword`patternProperties`], _0x22c446[keyword`additionalProperties`], _0x22c446[keyword`required`], 1)];
    }
    return [];
  }
  console.log("generating markdown");
  return _0x399966 => foldl(_0x399966, {}, (_0x305fc6, _0x1c7090) => {
    const _0x5d38a7 = new _0x30ce90();
    _0x305fc6[_0x1c7090[symbols_default.slug]] = root([..._0x2a1291(_0x1c7090), ..._0x4e30bf(_0x1c7090, 1), ..._0x5c5a9b(_0x1c7090, 1), ..._0x90d901(_0x1c7090, 1), ..._0xf2412c(_0x1c7090, 1), ..._0x58f8fa(_0x1c7090, _0x5d38a7), ..._0x792d63(_0x1c7090, _0x5d38a7)]);
    return _0x305fc6;
  });
}
export { build as default };