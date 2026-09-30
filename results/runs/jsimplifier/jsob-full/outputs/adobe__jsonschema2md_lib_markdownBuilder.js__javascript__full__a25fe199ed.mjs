"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = build;
var _es2015I18nTag = _interopRequireDefault(require("es2015-i18n-tag"));
var _ferrum = require("ferrum");
var _mdastBuilder = require("mdast-builder");
var _githubSlugger = _interopRequireDefault(require("github-slugger"));
var _jsYaml = _interopRequireDefault(require("js-yaml"));
var _templateObject;
var _templateObject2;
var _templateObject3;
var _templateObject4;
var _templateObject5;
var _templateObject6;
var _templateObject7;
var _templateObject8;
var _templateObject9;
var _templateObject0;
var _templateObject1;
var _templateObject10;
var _templateObject11;
var _templateObject12;
var _templateObject13;
var _templateObject14;
var _templateObject15;
var _templateObject16;
var _templateObject17;
var _templateObject18;
var _templateObject19;
var _templateObject20;
var _templateObject21;
var _templateObject22;
var _templateObject23;
var _templateObject24;
var _templateObject25;
var _templateObject26;
var _templateObject27;
var _templateObject28;
var _templateObject29;
var _templateObject30;
var _templateObject31;
var _templateObject32;
var _templateObject33;
var _templateObject34;
var _templateObject35;
var _templateObject36;
var _templateObject37;
var _templateObject38;
var _templateObject39;
var _templateObject40;
var _templateObject41;
var _templateObject42;
var _templateObject43;
var _templateObject44;
var _templateObject45;
var _templateObject46;
var _templateObject47;
var _templateObject48;
var _templateObject49;
var _templateObject50;
var _templateObject51;
var _templateObject52;
var _templateObject53;
var _templateObject54;
var _templateObject55;
var _templateObject56;
var _templateObject57;
var _templateObject58;
var _templateObject59;
var _templateObject60;
var _templateObject61;
var _templateObject62;
var _templateObject63;
var _templateObject64;
var _templateObject65;
var _templateObject66;
var _templateObject67;
var _templateObject68;
var _templateObject69;
var _templateObject70;
var _templateObject71;
var _templateObject72;
var _templateObject73;
var _templateObject74;
var _templateObject75;
var _templateObject76;
var _templateObject77;
var _templateObject78;
var _templateObject79;
var _templateObject80;
var _templateObject81;
var _templateObject82;
var _templateObject83;
var _templateObject84;
var _templateObject85;
var _templateObject86;
var _templateObject87;
var _templateObject88;
var _templateObject89;
var _templateObject90;
var _templateObject91;
var _templateObject92;
var _templateObject93;
var _templateObject94;
var _templateObject95;
var _templateObject96;
var _templateObject97;
var _templateObject98;
var _templateObject99;
var _templateObject100;
var _templateObject101;
var _templateObject102;
var _templateObject103;
var _templateObject104;
var _templateObject105;
var _templateObject106;
var _templateObject107;
var _templateObject108;
var _templateObject109;
var _templateObject110;
var _templateObject111;
var _templateObject112;
var _templateObject113;
var _templateObject114;
var _templateObject115;
var _templateObject116;
var _templateObject117;
var _templateObject118;
var _templateObject119;
var _templateObject120;
var _templateObject121;
var _templateObject122;
var _templateObject123;
var _templateObject124;
var _templateObject125;
var _templateObject126;
var _templateObject127;
var _templateObject128;
var _templateObject129;
var _templateObject130;
var _templateObject131;
var _templateObject132;
var _templateObject133;
var _templateObject134;
var _templateObject135;
var _templateObject136;
var _templateObject137;
var _templateObject138;
var _templateObject139;
var _templateObject140;
var _templateObject141;
var _templateObject142;
var _templateObject143;
var _templateObject144;
var _templateObject145;
var _templateObject146;
var _templateObject147;
var _templateObject148;
var _templateObject149;
var _templateObject150;
var _templateObject151;
var _templateObject152;
var _templateObject153;
var _templateObject154;
var _templateObject155;
var _templateObject156;
var _templateObject157;
var _templateObject158;
var _templateObject159;
var _templateObject160;
var _templateObject161;
var _templateObject162;
var _templateObject163;
var _templateObject164;
var _templateObject165;
var _templateObject166;
var _templateObject167;
var _templateObject168;
var _templateObject169;
var _templateObject170;
var _templateObject171;
var _templateObject172;
var _templateObject173;
var _templateObject174;
var _templateObject175;
var _templateObject176;
var _templateObject177;
var _templateObject178;
var _templateObject179;
var _templateObject180;
var _templateObject181;
var _templateObject182;
var _templateObject183;
var _templateObject184;
var _templateObject185;
var _templateObject186;
var _templateObject187;
var _templateObject188;
var _templateObject189;
var _templateObject190;
var _templateObject191;
var _templateObject192;
var _templateObject193;
var _templateObject194;
var _templateObject195;
var _templateObject196;
var _templateObject197;
var _templateObject198;
var _templateObject199;
var _templateObject200;
var _templateObject201;
var _templateObject202;
var _templateObject203;
var _templateObject204;
var _templateObject205;
var _templateObject206;
var _templateObject207;
var _templateObject208;
var _templateObject209;
var _templateObject210;
var _templateObject211;
var _templateObject212;
var _templateObject213;
var _templateObject214;
var _templateObject215;
var _templateObject216;
var _templateObject217;
var _templateObject218;
var _templateObject219;
var _templateObject220;
var _templateObject221;
var _templateObject222;
var _templateObject223;
var _templateObject224;
var _templateObject225;
var _templateObject226;
var _templateObject227;
var _templateObject228;
var _templateObject229;
var _templateObject230;
var _templateObject231;
var _templateObject232;
var _templateObject233;
var _templateObject234;
var _templateObject235;
var _templateObject236;
var _templateObject237;
var _templateObject238;
var _templateObject239;
var _templateObject240;
var _templateObject241;
var _templateObject242;
var _templateObject243;
var _templateObject244;
var _templateObject245;
var _templateObject246;
var _templateObject247;
var _templateObject248;
var _templateObject249;
var _templateObject250;
var _templateObject251;
var _templateObject252;
var _templateObject253;
var _templateObject254;
var _templateObject255;
var _templateObject256;
var _templateObject257;
var _templateObject258;
var _templateObject259;
var _templateObject260;
var _templateObject261;
var _templateObject262;
var _templateObject263;
var _templateObject264;
var _templateObject265;
var _templateObject266;
var _templateObject267;
var _templateObject268;
var _templateObject269;
var _templateObject270;
var _templateObject271;
var _templateObject272;
var _templateObject273;
var _templateObject274;
var _templateObject275;
var _templateObject276;
var _templateObject277;
var _templateObject278;
var _templateObject279;
var _templateObject280;
var _templateObject281;
var _templateObject282;
var _templateObject283;
var _templateObject284;
var _templateObject285;
var _templateObject286;
var _templateObject287;
var _templateObject288;
var _templateObject289;
var _templateObject290;
var _templateObject291;
var _templateObject292;
var _templateObject293;
var _templateObject294;
var _templateObject295;
var _templateObject296;
var _templateObject297;
var _templateObject298;
var _templateObject299;
var _templateObject300;
var _templateObject301;
var _templateObject302;
var _templateObject303;
var _templateObject304;
var _templateObject305;
var _templateObject306;
var _templateObject307;
var _templateObject308;
var _templateObject309;
var _templateObject310;
var _templateObject311;
var _templateObject312;
var _templateObject313;
var _templateObject314;
var _templateObject315;
var _templateObject316;
var _templateObject317;
var _templateObject318;
var _templateObject319;
var _templateObject320;
var _templateObject321;
var _templateObject322;
var _templateObject323;
var _templateObject324;
function _interopRequireDefault(e) {
  if (e && e.__esModule) {
    return e;
  } else {
    return {
      default: e
    };
  }
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArray(r) {
  if (typeof Symbol != "undefined" && r[Symbol.iterator] != null || r["@@iterator"] != null) {
    return Array.from(r);
  }
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) {
    return _arrayLikeToArray(r);
  }
}
function _typeof(o) {
  "@babel/helpers - typeof";

  if (typeof Symbol == "function" && typeof Symbol.iterator == "symbol") {
    _typeof = function _typeof(o) {
      return typeof o;
    };
  } else {
    _typeof = function _typeof(o) {
      if (o && typeof Symbol == "function" && o.constructor === Symbol && o !== Symbol.prototype) {
        return "symbol";
      } else {
        return typeof o;
      }
    };
  }
  return _typeof(o);
}
function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if (typeof r == "string") {
      return _arrayLikeToArray(r, a);
    }
    var t = {}.toString.call(r).slice(8, -1);
    if (t === "Object" && r.constructor) {
      t = r.constructor.name;
    }
    if (t === "Map" || t === "Set") {
      return Array.from(r);
    } else if (t === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t)) {
      return _arrayLikeToArray(r, a);
    } else {
      return undefined;
    }
  }
}
function _arrayLikeToArray(r, a) {
  if (a == null || a > r.length) {
    a = r.length;
  }
  for (var e = 0, n = Array(a); e < a; e++) {
    n[e] = r[e];
  }
  return n;
}
function _iterableToArrayLimit(r, l) {
  var t = r == null ? null : typeof Symbol != "undefined" && r[Symbol.iterator] || r["@@iterator"];
  if (t != null) {
    var e;
    var n;
    var i;
    var u;
    var a = [];
    var f = true;
    var o = false;
    try {
      i = (t = t.call(r)).next;
      if (l === 0) {
        if (Object(t) !== t) {
          return;
        }
        f = false;
      } else {
        for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = true) {}
      }
    } catch (r) {
      o = true;
      n = r;
    } finally {
      try {
        if (!f && t.return != null && (u = t.return(), Object(u) !== u)) {
          return;
        }
      } finally {
        if (o) {
          throw n;
        }
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) {
    return r;
  }
}
function _taggedTemplateLiteral(e, t) {
  if (!t) {
    t = e.slice(0);
  }
  return Object.freeze(Object.defineProperties(e, {
    raw: {
      value: Object.freeze(t)
    }
  }));
}
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
var i18n = _es2015I18nTag.default.default;
function gentitle(_0xb97020, _0xd347c1) {
  if (!Array.isArray(_0xb97020)) {
    return i18n(_templateObject ||= _taggedTemplateLiteral(["Untitled schema"]));
  }
  var _xb = _slicedToArray(_0xb97020, 1);
  var _0x540cac = _xb[0];
  var _0x446e1a = [].concat(_0xb97020).pop();
  if (_0xb97020.length === 1 && _0x540cac !== undefined) {
    return _0x540cac;
  }
  if (_0x446e1a) {
    return _0x446e1a;
  }
  if (typeof _0xd347c1 === "string") {
    return i18n(_templateObject2 ||= _taggedTemplateLiteral(["Untitled ", " in ", ""]), _0xd347c1, String(_0x540cac));
  }
  if (_0x540cac === undefined) {
    return i18n(_templateObject3 ||= _taggedTemplateLiteral(["Untitled schema"]));
  }
  return i18n(_templateObject4 ||= _taggedTemplateLiteral(["Untitled undefined type in ", ""]), _0x540cac);
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
var i18n2 = _es2015I18nTag.default.default;
function build(_ref = {}) {
  var _0xa0fd16 = _ref.header;
  var _ref$links = _ref.links;
  var links = _ref$links === undefined ? {} : _ref$links;
  var _ref$includePropertie = _ref.includeProperties;
  var includeProperties = _ref$includePropertie === undefined ? [] : _ref$includePropertie;
  var _ref$rewritelinks = _ref.rewritelinks;
  var rewritelinks = _ref$rewritelinks === undefined ? function (_0x32031f) {
    return _0x32031f;
  } : _ref$rewritelinks;
  var _ref$exampleFormat = _ref.exampleFormat;
  var exampleFormat = _ref$exampleFormat === undefined ? "json" : _ref$exampleFormat;
  var _ref$skipProperties = _ref.skipProperties;
  var _0x4b0092 = _ref$skipProperties === undefined ? [] : _ref$skipProperties;
  var _ref$singleFile = _ref.singleFile;
  var singleFile = _ref$singleFile === undefined ? false : _ref$singleFile;
  var _0x2c911a = singleFile ? [].concat(new Set([].concat(_0x4b0092, "definedinfact"))) : _0x4b0092;
  function _0x33fd02(_0x4a2452, _0xe2e5eb, _0x5d6fea) {
    if (singleFile) {
      return _0x5d6fea;
    }
    return _mdastBuilder.link(_0x4a2452, _0xe2e5eb, _0x5d6fea);
  }
  var _0x492c31 = {
    label: i18n2(_templateObject5 ||= _taggedTemplateLiteral(["date time"])),
    text: i18n2(_templateObject6 ||= _taggedTemplateLiteral(["the string must be a date time string, according to "])),
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  var _0xc7eba7 = {
    label: i18n2(_templateObject7 ||= _taggedTemplateLiteral(["date"])),
    text: i18n2(_templateObject8 ||= _taggedTemplateLiteral(["the string must be a date string, according to "])),
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  var _0x2faad4 = {
    label: i18n2(_templateObject9 ||= _taggedTemplateLiteral(["time"])),
    text: i18n2(_templateObject0 ||= _taggedTemplateLiteral(["the string must be a time string, according to "])),
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  var _0x5d05e8 = {
    label: i18n2(_templateObject1 ||= _taggedTemplateLiteral(["duration"])),
    text: i18n2(_templateObject10 ||= _taggedTemplateLiteral(["the string must be a duration string, according to "])),
    specname: "RFC 3339, section 5.6",
    speclink: "https://tools.ietf.org/html/rfc3339"
  };
  var _0x432608 = {
    label: i18n2(_templateObject11 ||= _taggedTemplateLiteral(["email"])),
    text: i18n2(_templateObject12 ||= _taggedTemplateLiteral(["the string must be an email address, according to "])),
    specname: "RFC 5322, section 3.4.1",
    speclink: "https://tools.ietf.org/html/rfc5322"
  };
  var _0x3613f1 = {
    label: i18n2(_templateObject13 ||= _taggedTemplateLiteral(["(international) email"])),
    text: i18n2(_templateObject14 ||= _taggedTemplateLiteral(["the string must be an (international) email address, according to "])),
    specname: "RFC 6531",
    speclink: "https://tools.ietf.org/html/rfc6531"
  };
  var _0x1bdb66 = {
    label: i18n2(_templateObject15 ||= _taggedTemplateLiteral(["hostname"])),
    text: i18n2(_templateObject16 ||= _taggedTemplateLiteral(["the string must be a hostname, according to "])),
    specname: "RFC 1123, section 2.1",
    speclink: "https://tools.ietf.org/html/rfc1123"
  };
  var _0x5ab1f3 = {
    label: i18n2(_templateObject17 ||= _taggedTemplateLiteral(["(international) hostname"])),
    text: i18n2(_templateObject18 ||= _taggedTemplateLiteral(["the string must be an (IDN) hostname, according to "])),
    specname: "RFC 5890, section 2.3.2.3",
    speclink: "https://tools.ietf.org/html/rfc5890"
  };
  var _0xbf2d39 = {
    label: i18n2(_templateObject19 ||= _taggedTemplateLiteral(["IPv4"])),
    text: i18n2(_templateObject20 ||= _taggedTemplateLiteral(["the string must be an IPv4 address (dotted quad), according to "])),
    specname: "RFC 2673, section 3.2",
    speclink: "https://tools.ietf.org/html/rfc2673"
  };
  var _0x41a826 = {
    label: i18n2(_templateObject21 ||= _taggedTemplateLiteral(["IPv6"])),
    text: i18n2(_templateObject22 ||= _taggedTemplateLiteral(["the string must be an IPv6 address, according to "])),
    specname: "RFC 4291, section 2.2",
    speclink: "https://tools.ietf.org/html/rfc4291"
  };
  var _0x5ebfd2 = {
    label: i18n2(_templateObject23 ||= _taggedTemplateLiteral(["URI"])),
    text: i18n2(_templateObject24 ||= _taggedTemplateLiteral(["the string must be a URI, according to "])),
    specname: "RFC 3986",
    speclink: "https://tools.ietf.org/html/rfc3986"
  };
  var _0x5c46c9 = {
    label: i18n2(_templateObject25 ||= _taggedTemplateLiteral(["IRI"])),
    text: i18n2(_templateObject26 ||= _taggedTemplateLiteral(["the string must be a IRI, according to "])),
    specname: "RFC 3987",
    speclink: "https://tools.ietf.org/html/rfc3987"
  };
  var _0x55d1b0 = {
    label: i18n2(_templateObject27 ||= _taggedTemplateLiteral(["URI reference"])),
    text: i18n2(_templateObject28 ||= _taggedTemplateLiteral(["the string must be a URI reference, according to "])),
    specname: "RFC 3986",
    speclink: "https://tools.ietf.org/html/rfc3986"
  };
  var _0x4ab0f6 = {
    label: i18n2(_templateObject29 ||= _taggedTemplateLiteral(["IRI reference"])),
    text: i18n2(_templateObject30 ||= _taggedTemplateLiteral(["the string must be a IRI reference, according to "])),
    specname: "RFC 3987",
    speclink: "https://tools.ietf.org/html/rfc3987"
  };
  var _0x47ffd9 = {
    label: i18n2(_templateObject31 ||= _taggedTemplateLiteral(["UUID"])),
    text: i18n2(_templateObject32 ||= _taggedTemplateLiteral(["the string must be a UUID, according to "])),
    specname: "RFC 4122",
    speclink: "https://tools.ietf.org/html/rfc4122"
  };
  var _0x4a5d37 = {
    label: i18n2(_templateObject33 ||= _taggedTemplateLiteral(["JSON Pointer"])),
    text: i18n2(_templateObject34 ||= _taggedTemplateLiteral(["the string must be a JSON Pointer, according to "])),
    specname: "RFC 6901, section 5",
    speclink: "https://tools.ietf.org/html/rfc6901"
  };
  var _0x4e4e88 = {
    label: i18n2(_templateObject35 ||= _taggedTemplateLiteral(["Relative JSON Pointer"])),
    text: i18n2(_templateObject36 ||= _taggedTemplateLiteral(["the string must be a relative JSON Pointer, according to "])),
    specname: "draft-handrews-relative-json-pointer-01",
    speclink: "https://tools.ietf.org/html/draft-handrews-relative-json-pointer-01"
  };
  var _0x26de0c = {
    label: i18n2(_templateObject37 ||= _taggedTemplateLiteral(["RegEx"])),
    text: i18n2(_templateObject38 ||= _taggedTemplateLiteral(["the string must be a regular expression, according to "])),
    specname: "ECMA-262",
    speclink: "http://www.ecma-international.org/publications/files/ECMA-ST/Ecma-262.pdf"
  };
  var _0x1fd60c = {
    label: i18n2(_templateObject39 ||= _taggedTemplateLiteral(["URI Template"])),
    text: i18n2(_templateObject40 ||= _taggedTemplateLiteral(["the string must be a URI template, according to "])),
    specname: "RFC 6570",
    speclink: "https://tools.ietf.org/html/rfc6570"
  };
  var _0x1754aa = {
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
  var _0x12be54 = _0x1754aa;
  var _0x26ead1 = {
    name: "abstract",
    title: i18n2(_templateObject41 ||= _taggedTemplateLiteral(["Abstract"])),
    truelabel: i18n2(_templateObject42 ||= _taggedTemplateLiteral(["Cannot be instantiated"])),
    falselabel: i18n2(_templateObject43 ||= _taggedTemplateLiteral(["Can be instantiated"])),
    undefinedlabel: i18n2(_templateObject44 ||= _taggedTemplateLiteral(["Unknown abstraction"]))
  };
  var _0x5a33be = {
    name: "extensible",
    title: i18n2(_templateObject45 ||= _taggedTemplateLiteral(["Extensible"])),
    undefinedlable: i18n2(_templateObject46 ||= _taggedTemplateLiteral(["Unknown extensibility"])),
    truelabel: i18n2(_templateObject47 ||= _taggedTemplateLiteral(["Yes"])),
    falselabel: i18n2(_templateObject48 ||= _taggedTemplateLiteral(["No"]))
  };
  var _0x6558e2 = {
    name: "status",
    title: i18n2(_templateObject49 ||= _taggedTemplateLiteral(["Status"])),
    undefinedlabel: "Unknown status",
    deprecatedlabel: i18n2(_templateObject50 ||= _taggedTemplateLiteral(["Deprecated"])),
    stablelabel: i18n2(_templateObject51 ||= _taggedTemplateLiteral(["Stable"])),
    stabilizinglabel: i18n2(_templateObject52 ||= _taggedTemplateLiteral(["Stabilizing"])),
    experimentallabel: i18n2(_templateObject53 ||= _taggedTemplateLiteral(["Experimental"]))
  };
  var _0x527998 = {
    name: "identifiable",
    title: i18n2(_templateObject54 ||= _taggedTemplateLiteral(["Identifiable"])),
    truelabel: i18n2(_templateObject55 ||= _taggedTemplateLiteral(["Yes"])),
    falselabel: i18n2(_templateObject56 ||= _taggedTemplateLiteral(["No"])),
    undefinedlabel: i18n2(_templateObject57 ||= _taggedTemplateLiteral(["Unknown identifiability"]))
  };
  var _0x3b6a4d = {
    name: "custom",
    title: i18n2(_templateObject58 ||= _taggedTemplateLiteral(["Custom Properties"])),
    truelabel: i18n2(_templateObject59 ||= _taggedTemplateLiteral(["Allowed"])),
    falselabel: i18n2(_templateObject60 ||= _taggedTemplateLiteral(["Forbidden"])),
    undefinedlabel: i18n2(_templateObject61 ||= _taggedTemplateLiteral(["Unknown custom properties"]))
  };
  var _0xfaa88f = {
    name: "additional",
    title: i18n2(_templateObject62 ||= _taggedTemplateLiteral(["Additional Properties"])),
    truelabel: i18n2(_templateObject63 ||= _taggedTemplateLiteral(["Allowed"])),
    falselabel: i18n2(_templateObject64 ||= _taggedTemplateLiteral(["Forbidden"])),
    undefinedlabel: i18n2(_templateObject65 ||= _taggedTemplateLiteral(["Unknown additional properties"]))
  };
  var _0x32fdf2 = {
    name: "restrictions",
    title: i18n2(_templateObject66 ||= _taggedTemplateLiteral(["Access Restrictions"])),
    readOnlylabel: i18n2(_templateObject67 ||= _taggedTemplateLiteral(["Read only"])),
    writeOnlylabel: i18n2(_templateObject68 ||= _taggedTemplateLiteral(["Write only"])),
    secretlabel: i18n2(_templateObject69 ||= _taggedTemplateLiteral(["cannot be read or written"])),
    undefinedlabel: i18n2(_templateObject70 ||= _taggedTemplateLiteral(["none"]))
  };
  var _0x180d63 = {
    name: "definedin",
    title: i18n2(_templateObject71 ||= _taggedTemplateLiteral(["Defined In"])),
    undefinedlabel: i18n2(_templateObject72 ||= _taggedTemplateLiteral(["Unknown definition"]))
  };
  var _0x32c62a = [_0x26ead1, _0x5a33be, _0x6558e2, _0x527998, _0x3b6a4d, _0xfaa88f, _0x32fdf2, _0x180d63];
  function _0x26f2fb(_0x300118) {
    if (_0x300118[keyword(_templateObject73 ||= _taggedTemplateLiteral(["$comment"]))]) {
      return [_mdastBuilder.blockquote(_0x300118[symbols_default.meta].longcomment)];
    }
    return [];
  }
  function _0x2a1291(_0x4432e0) {
    if (_0xa0fd16) {
      return [].concat(_mdastBuilder.heading(1, _mdastBuilder.text(i18n2(_templateObject74 ||= _taggedTemplateLiteral(["", " Schema"]), gentitle(_0x4432e0[symbols_default.titles], _0x4432e0[keyword(_templateObject75 ||= _taggedTemplateLiteral(["type"]))])))), _mdastBuilder.paragraph(_mdastBuilder.code("txt", _0x4432e0[symbols_default.id] + (_0x4432e0[symbols_default.pointer] ? "#" + _0x4432e0[symbols_default.pointer] : ""))), _0x4432e0[symbols_default.meta].longdescription, _0x26f2fb(_0x4432e0), _mdastBuilder.table("left", [_mdastBuilder.tableRow(_ferrum.list(_ferrum.map(_0x32c62a, function (_ref2) {
        var _0x4cd788 = _ref2.name;
        var _0xfc1de7 = _ref2.title;
        if (links[_0x4cd788]) {
          return _mdastBuilder.tableCell(_mdastBuilder.link(links[_0x4cd788], i18n2(_templateObject76 ||= _taggedTemplateLiteral(["What does ", " mean?"]), _0xfc1de7), _mdastBuilder.text(_0xfc1de7)));
        }
        return _mdastBuilder.tableCell(_mdastBuilder.text(_0xfc1de7));
      }), Array)), _mdastBuilder.tableRow(_ferrum.list(_ferrum.map(_0x32c62a, function (_0x3761f8) {
        if (_0x4432e0[symbols_default.meta] && _typeof(_0x4432e0[symbols_default.meta][_0x3761f8.name]) === "object" && _0x4432e0[symbols_default.meta][_0x3761f8.name].link && _0x4432e0[symbols_default.meta][_0x3761f8.name].text) {
          return _mdastBuilder.tableCell(_mdastBuilder.link(rewritelinks(_0x4432e0[symbols_default.meta][_0x3761f8.name].link), i18n2(_templateObject77 ||= _taggedTemplateLiteral(["open original schema"])), [_mdastBuilder.text(_0x4432e0[symbols_default.meta][_0x3761f8.name].text)]));
        }
        var _0x31ba8b = _0x4432e0[symbols_default.meta] ? _0x4432e0[symbols_default.meta][_0x3761f8.name] : undefined;
        return _mdastBuilder.tableCell(_mdastBuilder.text(_0x3761f8[String(_0x31ba8b) + "label"] || i18n2(_templateObject78 ||= _taggedTemplateLiteral(["Unknown"]))));
      }), Array))]));
    }
    return [];
  }
  function _0x30ca29(_0x2beef1) {
    if (!Array.isArray(_0x2beef1[keyword(_templateObject79 ||= _taggedTemplateLiteral(["type"]))]) && _typeof(_0x2beef1[keyword(_templateObject80 ||= _taggedTemplateLiteral(["type"]))]) === "object") {
      return _mdastBuilder.text(i18n2(_templateObject81 ||= _taggedTemplateLiteral(["Unknown Type"])));
    }
    var _0x446659 = Array.isArray(_0x2beef1[keyword(_templateObject82 ||= _taggedTemplateLiteral(["type"]))]) ? _0x2beef1[keyword(_templateObject83 ||= _taggedTemplateLiteral(["type"]))] : [_0x2beef1[keyword(_templateObject84 ||= _taggedTemplateLiteral(["type"]))]];
    var _0x414419 = _ferrum.list(_ferrum.filter(_0x446659, function (_0x3c0c4e) {
      return _0x3c0c4e !== "null" && _0x3c0c4e !== undefined;
    }));
    if (_0x2beef1[keyword(_templateObject85 ||= _taggedTemplateLiteral(["allOf"]))] || _0x2beef1[keyword(_templateObject86 ||= _taggedTemplateLiteral(["anyOf"]))] || _0x2beef1[keyword(_templateObject87 ||= _taggedTemplateLiteral(["oneOf"]))] || _0x2beef1[keyword(_templateObject88 ||= _taggedTemplateLiteral(["not"]))]) {
      return _mdastBuilder.text(i18n2(_templateObject89 ||= _taggedTemplateLiteral(["Merged"])));
    } else if (_ferrum.size(_0x414419) === 0) {
      return _mdastBuilder.text(i18n2(_templateObject90 ||= _taggedTemplateLiteral(["Not specified"])));
    }
    if (_ferrum.size(_0x414419) === 1) {
      return _mdastBuilder.inlineCode(_0x414419[0]);
    } else {
      return _mdastBuilder.text(i18n2(_templateObject91 ||= _taggedTemplateLiteral(["Multiple"])));
    }
  }
  function _0x2e7776(_0xdedf05) {
    var _0x2b0b34 = Array.isArray(_0xdedf05[keyword(_templateObject92 ||= _taggedTemplateLiteral(["type"]))]) ? _0xdedf05[keyword(_templateObject93 ||= _taggedTemplateLiteral(["type"]))] : [_0xdedf05[keyword(_templateObject94 ||= _taggedTemplateLiteral(["type"]))]];
    var _0x1b4244 = _ferrum.list(_ferrum.filter(_0x2b0b34, function (_0x5229e7) {
      return _0x5229e7 === keyword(_templateObject95 ||= _taggedTemplateLiteral(["null"]));
    }));
    if (_ferrum.size(_0x1b4244)) {
      return _mdastBuilder.text(i18n2(_templateObject96 ||= _taggedTemplateLiteral(["can be null"])));
    }
    return _mdastBuilder.text(i18n2(_templateObject97 ||= _taggedTemplateLiteral(["cannot be null"])));
  }
  function _0x58b394(_0x363622 = [], _0x3e26e4 = false, _0x1e1cb9) {
    return function (item) {
      var _0x59f1b3 = item[0];
      var _0x3037b7 = item[1];
    };
  }
  function _0x7e655c(_0x5cb4ed = {}, _0x4b1190 = {}, _0x3d0003, _0xc0b173, _0x493981) {
    if (_0x2c911a.includes("proptable")) {
      return _mdastBuilder.paragraph();
    }
    var _0x5f2d2c = Object.entries(_0x5cb4ed).map(_0x58b394(_0xc0b173, false, _0x493981));
    var _0x5ded46 = Object.entries(_0x4b1190).map(_0x58b394(_0xc0b173, true, _0x493981));
    var _0x34b54d = function () {
      if (_0x3d0003) {
        var _0x352dc3 = _0x3d0003 === true;
        var _0x47fefc = [_mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject98 ||= _taggedTemplateLiteral(["Additional Properties"])))), _mdastBuilder.tableCell(_0x352dc3 ? _mdastBuilder.text("Any") : _0x30ca29(_0x3d0003)), _mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject99 ||= _taggedTemplateLiteral(["Optional"])))), _mdastBuilder.tableCell(_0x352dc3 ? _mdastBuilder.text("can be null") : _0x2e7776(_0x3d0003))];
        if (!singleFile) {
          _0x47fefc.push(_mdastBuilder.tableCell(_0x352dc3 ? _mdastBuilder.text("") : _0x33fd02(_0x3d0003[symbols_default.slug] + ".md", _0x3d0003[symbols_default.id] + "#" + _0x3d0003[symbols_default.pointer], _mdastBuilder.text(_0x3d0003[symbols_default.titles][0] || i18n2(_templateObject100 ||= _taggedTemplateLiteral(["Untitled schema"]))))));
        }
        return [_mdastBuilder.tableRow(_0x47fefc)];
      }
      return [];
    }();
    var _0x550e55 = [_mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject101 ||= _taggedTemplateLiteral(["Property"])))), _mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject102 ||= _taggedTemplateLiteral(["Type"])))), _mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject103 ||= _taggedTemplateLiteral(["Required"])))), _mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject104 ||= _taggedTemplateLiteral(["Nullable"]))))];
    if (!singleFile) {
      _0x550e55.push(_mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject105 ||= _taggedTemplateLiteral(["Defined by"])))));
    }
    return _mdastBuilder.table("left", [].concat(_mdastBuilder.tableRow(_0x550e55), _0x5f2d2c, _0x5ded46, _0x34b54d));
  }
  function _0x589c5(_0x5af66a, _0x5c39bb) {
    if (_0x2c911a.includes("arrayfact")) {
      return "";
    }
    return _mdastBuilder.listItem([_mdastBuilder.paragraph([_mdastBuilder.text(i18n2(_templateObject106 ||= _taggedTemplateLiteral(["Type: "]))), _mdastBuilder.text(i18n2(_templateObject107 ||= _taggedTemplateLiteral(["an array where each item follows the corresponding schema in the following list:"])))]), _mdastBuilder.list("ordered", [].concat(_0x5af66a.map(function (_0x24e1c2) {
      return _mdastBuilder.listItem(_mdastBuilder.paragraph(_0x33fd02(_0x24e1c2[symbols_default.slug] + ".md", i18n2(_templateObject108 ||= _taggedTemplateLiteral(["check type definition"])), _mdastBuilder.text(gentitle(_0x24e1c2[symbols_default.titles], _0x24e1c2[keyword(_templateObject109 ||= _taggedTemplateLiteral(["type"]))])))));
    }), function () {
      if (_0x5c39bb === true) {
        return [_mdastBuilder.listItem(_mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject110 ||= _taggedTemplateLiteral(["and all following items may follow any schema"])))))];
      } else if (_typeof(_0x5c39bb) === "object") {
        return [_mdastBuilder.listItem(_mdastBuilder.paragraph([_mdastBuilder.text(i18n2(_templateObject111 ||= _taggedTemplateLiteral(["and all following items must follow the schema: "]))), _0x33fd02(_0x5c39bb[symbols_default.slug] + ".md", i18n2(_templateObject112 ||= _taggedTemplateLiteral(["check type definition"])), _mdastBuilder.text(gentitle(_0x5c39bb[symbols_default.titles], _0x5c39bb[keyword(_templateObject113 ||= _taggedTemplateLiteral(["type"]))])))]))];
      }
      return [];
    }()))]);
  }
  function _0x99f49d(_0x27fa19, _0x3a053a = "") {
    var _0x4c7c98 = Array.isArray(_0x27fa19[keyword(_templateObject114 ||= _taggedTemplateLiteral(["type"]))]) ? _0x27fa19[keyword(_templateObject115 ||= _taggedTemplateLiteral(["type"]))] : [_0x27fa19[keyword(_templateObject116 ||= _taggedTemplateLiteral(["type"]))]];
    var _0x54f5f5 = _0x4c7c98.filter(function (_0x139626) {
      return _0x139626 !== keyword(_templateObject117 ||= _taggedTemplateLiteral(["null"]));
    });
    var _0x501f86 = _0x4c7c98.filter(function (_0x517c41) {
      return _0x517c41 === keyword(_templateObject118 ||= _taggedTemplateLiteral(["null"]));
    }).length > 0;
    var _0x5c7c6e = _0x54f5f5.length <= 1;
    var _x54f5f = _slicedToArray(_0x54f5f5, 1);
    var _0x2c6c05 = _x54f5f[0];
    var _0x16b7d5 = _0x501f86 && _0x54f5f5.length === 0;
    var _0x14cecc = _0x2c6c05 === keyword(_templateObject119 ||= _taggedTemplateLiteral(["array"]));
    var _0x1b8230 = !!_0x27fa19[keyword(_templateObject120 ||= _taggedTemplateLiteral(["allOf"]))] || !!_0x27fa19[keyword(_templateObject121 ||= _taggedTemplateLiteral(["anyOf"]))] || !!_0x27fa19[keyword(_templateObject122 ||= _taggedTemplateLiteral(["oneOf"]))] || !!_0x27fa19[keyword(_templateObject123 ||= _taggedTemplateLiteral(["not"]))];
    if (_0x14cecc && Array.isArray(_0x27fa19[keyword(_templateObject124 ||= _taggedTemplateLiteral(["items"]))])) {
      return _0x589c5(_0x27fa19[keyword(_templateObject125 ||= _taggedTemplateLiteral(["items"]))], _0x27fa19[keyword(_templateObject126 ||= _taggedTemplateLiteral(["additionalItems"]))]);
    } else if (_0x14cecc && _0x27fa19[keyword(_templateObject127 ||= _taggedTemplateLiteral(["items"]))]) {
      return _0x99f49d(_0x27fa19[keyword(_templateObject128 ||= _taggedTemplateLiteral(["items"]))], _0x3a053a + "[]");
    }
    var _0xfc6722 = function () {
      if (_0x16b7d5) {
        return [_mdastBuilder.inlineCode("null" + _0x3a053a), _mdastBuilder.text(i18n2(_templateObject129 ||= _taggedTemplateLiteral([", the value must be null"])))];
      } else if (_0x5c7c6e && _0x2c6c05 && typeof _0x2c6c05 === "string") {
        return [_mdastBuilder.inlineCode(_0x2c6c05 + _0x3a053a)];
      } else if (!_0x5c7c6e) {
        return [].concat(_mdastBuilder.text(_0x3a053a ? i18n2(_templateObject130 ||= _taggedTemplateLiteral(["an array of the following:"])) : i18n2(_templateObject131 ||= _taggedTemplateLiteral(["any of the following: "]))), _ferrum.list(_ferrum.flat(_0x54f5f5.map(function (_0xbcfc30, _0x19dd87) {
          return [_mdastBuilder.inlineCode(_0xbcfc30 || i18n2(_templateObject132 ||= _taggedTemplateLiteral(["not defined"]))), _mdastBuilder.text(_0x19dd87 === _0x54f5f5.length - 1 ? "" : i18n2(_templateObject133 ||= _taggedTemplateLiteral([" or "])))];
        }))));
      } else if (_0x1b8230) {
        return [_mdastBuilder.text(_0x3a053a ? "an array of merged types" : i18n2(_templateObject134 ||= _taggedTemplateLiteral(["merged type"])))];
      }
      return [_mdastBuilder.text(i18n2(_templateObject135 ||= _taggedTemplateLiteral(["unknown"])) + _0x3a053a)];
    }();
    var _0x1aa514 = function () {
      if (_0x27fa19[keyword(_templateObject136 ||= _taggedTemplateLiteral(["title"]))] && typeof _0x27fa19[keyword(_templateObject137 ||= _taggedTemplateLiteral(["title"]))] === "string") {
        return [_mdastBuilder.text(" ("), _0x33fd02(_0x27fa19[symbols_default.slug] + ".md", "", _mdastBuilder.text(_0x27fa19[keyword(_templateObject138 ||= _taggedTemplateLiteral(["title"]))])), _mdastBuilder.text(")")];
      } else if (!_0x5c7c6e || _0x2c6c05 === keyword(_templateObject139 ||= _taggedTemplateLiteral(["object"])) || _0x1b8230) {
        if (singleFile) {
          return [];
        }
        return [_mdastBuilder.text(" ("), _mdastBuilder.link(_0x27fa19[symbols_default.slug] + ".md", "", _mdastBuilder.text(i18n2(_templateObject140 ||= _taggedTemplateLiteral(["Details"])))), _mdastBuilder.text(")")];
      }
      return [];
    }();
    var _0x2a729f = _mdastBuilder.listItem(_mdastBuilder.paragraph([].concat(_mdastBuilder.text(i18n2(_templateObject141 ||= _taggedTemplateLiteral(["Type: "]))), _0xfc6722, _0x1aa514)));
    return _0x2a729f;
  }
  function _0x3292d7(_0x50c776) {
    var _0x317f7b = Array.isArray(_0x50c776[keyword(_templateObject142 ||= _taggedTemplateLiteral(["type"]))]) ? _0x50c776[keyword(_templateObject143 ||= _taggedTemplateLiteral(["type"]))] : [_0x50c776[keyword(_templateObject144 ||= _taggedTemplateLiteral(["type"]))]];
    var _0x10f182 = _0x317f7b.filter(function (_0x3946e1) {
      return _0x3946e1 === keyword(_templateObject145 ||= _taggedTemplateLiteral(["null"]));
    }).length > 0;
    if (_0x10f182) {
      return _mdastBuilder.listItem(_mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject146 ||= _taggedTemplateLiteral(["can be null"])))));
    } else {
      return _mdastBuilder.listItem(_mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject147 ||= _taggedTemplateLiteral(["cannot be null"])))));
    }
  }
  function _0xdda6a8(_0x12dbe1) {
    return _mdastBuilder.listItem(_mdastBuilder.paragraph([_mdastBuilder.text(i18n2(_templateObject148 ||= _taggedTemplateLiteral(["defined in: "]))), _0x33fd02(_0x12dbe1[symbols_default.slug] + ".md", _0x12dbe1[symbols_default.id] + "#" + _0x12dbe1[symbols_default.pointer], _mdastBuilder.text(_0x12dbe1[symbols_default.titles] && _0x12dbe1[symbols_default.titles][0] ? _0x12dbe1[symbols_default.titles][0] : i18n2(_templateObject149 ||= _taggedTemplateLiteral(["Untitled schema"]))))]));
  }
  function _0x390e45(_0x6abe0e, _0x5186b0, _0x56ad10 = []) {
    var _0x5f0993 = [];
    if (_0x56ad10.indexOf(_0x6abe0e) > -1) {
      _0x5f0993.push(_mdastBuilder.listItem(_mdastBuilder.text(i18n2(_templateObject150 ||= _taggedTemplateLiteral(["is required"])))));
    } else {
      _0x5f0993.push(_mdastBuilder.listItem(_mdastBuilder.text(i18n2(_templateObject151 ||= _taggedTemplateLiteral(["is optional"])))));
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
    var _0x474395 = includeProperties.map(function (_0x5349ce) {
      if (_0x5186b0[_0x5349ce]) {
        return _mdastBuilder.listItem(_mdastBuilder.text(_0x5349ce + ": " + String(_0x5186b0[_0x5349ce])));
      }
      return undefined;
    }).filter(function (_0x193904) {
      return _0x193904 !== undefined;
    });
    _0x5f0993.push.apply(_0x5f0993, _toConsumableArray(_0x474395));
    return _mdastBuilder.list("unordered", _0x5f0993);
  }
  function _0x136e38(_0x3072ef) {
    if (_0x3072ef[symbols_default.parent]) {
      return _0x3072ef[symbols_default.pointer].split("/").pop();
    } else {
      return gentitle(_0x3072ef[symbols_default.titles], _0x3072ef[keyword(_templateObject152 ||= _taggedTemplateLiteral(["type"]))]);
    }
  }
  function _0x405f0a(_0x38204e, _0x8c7fb2 = 0, _0x4bdf3b = 3) {
    if (_0x38204e[keyword(_templateObject153 ||= _taggedTemplateLiteral(["oneOf"]))] && _0x8c7fb2 <= _0x4bdf3b) {
      return [_mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject154 ||= _taggedTemplateLiteral(["one (and only one) of"])))), _mdastBuilder.list("unordered", [].concat(_0x38204e[keyword(_templateObject155 ||= _taggedTemplateLiteral(["oneOf"]))].map(function (_0x372953) {
        return _mdastBuilder.listItem(_0x405f0a(_0x372953, _0x8c7fb2 + 1));
      })))];
    } else if (_0x38204e[keyword(_templateObject156 ||= _taggedTemplateLiteral(["anyOf"]))] && _0x8c7fb2 <= _0x4bdf3b) {
      return [_mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject157 ||= _taggedTemplateLiteral(["any of"])))), _mdastBuilder.list("unordered", [].concat(_0x38204e[keyword(_templateObject158 ||= _taggedTemplateLiteral(["anyOf"]))].map(function (_0x37dacb) {
        return _mdastBuilder.listItem(_0x405f0a(_0x37dacb, _0x8c7fb2 + 1));
      })))];
    } else if (_0x38204e[keyword(_templateObject159 ||= _taggedTemplateLiteral(["allOf"]))] && _0x8c7fb2 <= _0x4bdf3b) {
      return [_mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject160 ||= _taggedTemplateLiteral(["all of"])))), _mdastBuilder.list("unordered", [].concat(_0x38204e[keyword(_templateObject161 ||= _taggedTemplateLiteral(["allOf"]))].map(function (_0x92c805) {
        return _mdastBuilder.listItem(_0x405f0a(_0x92c805, _0x8c7fb2 + 1));
      })))];
    } else if (_0x38204e[keyword(_templateObject162 ||= _taggedTemplateLiteral(["not"]))] && _0x8c7fb2 <= _0x4bdf3b) {
      var _0x3c052f = _0x38204e[keyword(_templateObject163 ||= _taggedTemplateLiteral(["not"]))];
      return [_mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject164 ||= _taggedTemplateLiteral(["not"])))), _mdastBuilder.list("unordered", [_mdastBuilder.listItem(_0x405f0a(_0x3c052f, _0x8c7fb2 + 1))])];
    } else if (_0x8c7fb2 > 0) {
      return [_0x33fd02(_0x38204e[symbols_default.slug] + ".md", i18n2(_templateObject165 ||= _taggedTemplateLiteral(["check type definition"])), _mdastBuilder.text(gentitle(_0x38204e[symbols_default.titles], _0x38204e[keyword(_templateObject166 ||= _taggedTemplateLiteral(["type"]))])))];
    } else {
      return [];
    }
  }
  function _0x4e30bf(_0x465c8b, _0x5dd180 = 1) {
    if (_0x2c911a.includes("typesection")) {
      return "";
    }
    var _x99f49d = _0x99f49d(_0x465c8b);
    var _0xaa8dcd = _x99f49d.children;
    _0xaa8dcd[0].children.shift();
    return [].concat(_mdastBuilder.heading(_0x5dd180 + 1, _mdastBuilder.text(i18n2(_templateObject167 ||= _taggedTemplateLiteral(["", " Type"]), _0x136e38(_0x465c8b)))), _0xaa8dcd, _0x405f0a(_0x465c8b));
  }
  function _0x5c5a9b(_0x40852a, _0x1299a0 = 1) {
    var _0x19f26a = [];
    if (_0x40852a[keyword(_templateObject168 ||= _taggedTemplateLiteral(["const"]))] !== undefined) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject169 ||= _taggedTemplateLiteral(["constant"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject170 ||= _taggedTemplateLiteral(["the value of this property must be equal to:"])))]));
      _0x19f26a.push(_mdastBuilder.code("json", JSON.stringify(_0x40852a[keyword(_templateObject171 ||= _taggedTemplateLiteral(["const"]))], undefined, 2)));
    }
    if (_0x40852a[keyword(_templateObject172 ||= _taggedTemplateLiteral(["enum"]))]) {
      var _0x677f9c = _0x40852a[keyword(_templateObject173 ||= _taggedTemplateLiteral(["meta:enum"]))] || {};
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject174 ||= _taggedTemplateLiteral(["enum"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject175 ||= _taggedTemplateLiteral(["the value of this property must be equal to one of the following values:"])))]));
      _0x19f26a.push(_mdastBuilder.table("left", [].concat(_mdastBuilder.tableRow([_mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject176 ||= _taggedTemplateLiteral(["Value"])))), _mdastBuilder.tableCell(_mdastBuilder.text(i18n2(_templateObject177 ||= _taggedTemplateLiteral(["Explanation"]))))]), Array.isArray(_0x40852a[keyword(_templateObject178 ||= _taggedTemplateLiteral(["enum"]))]) ? _0x40852a[keyword(_templateObject179 ||= _taggedTemplateLiteral(["enum"]))].map(function (_0x3e3927) {
        return _mdastBuilder.tableRow([_mdastBuilder.tableCell(_mdastBuilder.inlineCode(JSON.stringify(_0x3e3927))), _mdastBuilder.tableCell(_mdastBuilder.text(_0x677f9c[Array.isArray(_0x3e3927) ? JSON.stringify(_0x3e3927) : _0x3e3927] || ""))]);
      }) : [])));
    }
    if (_0x40852a[keyword(_templateObject180 ||= _taggedTemplateLiteral(["multipleOf"]))] !== undefined && typeof _0x40852a[keyword(_templateObject181 ||= _taggedTemplateLiteral(["multipleOf"]))] === "number") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject182 ||= _taggedTemplateLiteral(["multiple of"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject183 ||= _taggedTemplateLiteral(["the value of this number must be a multiple of: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject184 ||= _taggedTemplateLiteral(["multipleOf"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject185 ||= _taggedTemplateLiteral(["maximum"]))] !== undefined && typeof _0x40852a[keyword(_templateObject186 ||= _taggedTemplateLiteral(["maximum"]))] === "number") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject187 ||= _taggedTemplateLiteral(["maximum"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject188 ||= _taggedTemplateLiteral(["the value of this number must smaller than or equal to: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject189 ||= _taggedTemplateLiteral(["maximum"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject190 ||= _taggedTemplateLiteral(["exclusiveMaximum"]))] !== undefined && typeof _0x40852a[keyword(_templateObject191 ||= _taggedTemplateLiteral(["exclusiveMaximum"]))] === "number") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject192 ||= _taggedTemplateLiteral(["maximum (exclusive)"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject193 ||= _taggedTemplateLiteral(["the value of this number must be smaller than: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject194 ||= _taggedTemplateLiteral(["exclusiveMaximum"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject195 ||= _taggedTemplateLiteral(["minimum"]))] !== undefined && typeof _0x40852a[keyword(_templateObject196 ||= _taggedTemplateLiteral(["minimum"]))] === "number") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject197 ||= _taggedTemplateLiteral(["minimum"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject198 ||= _taggedTemplateLiteral(["the value of this number must greater than or equal to: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject199 ||= _taggedTemplateLiteral(["minimum"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject200 ||= _taggedTemplateLiteral(["exclusiveMinimum"]))] !== undefined && typeof _0x40852a[keyword(_templateObject201 ||= _taggedTemplateLiteral(["exclusiveMinimum"]))] === "number") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject202 ||= _taggedTemplateLiteral(["minimum (exclusive)"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject203 ||= _taggedTemplateLiteral(["the value of this number must be greater than: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject204 ||= _taggedTemplateLiteral(["exclusiveMinimum"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject205 ||= _taggedTemplateLiteral(["maxLength"]))] !== undefined && typeof _0x40852a[keyword(_templateObject206 ||= _taggedTemplateLiteral(["maxLength"]))] === "number") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject207 ||= _taggedTemplateLiteral(["maximum length"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject208 ||= _taggedTemplateLiteral(["the maximum number of characters for this string is: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject209 ||= _taggedTemplateLiteral(["maxLength"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject210 ||= _taggedTemplateLiteral(["minLength"]))] !== undefined && typeof _0x40852a[keyword(_templateObject211 ||= _taggedTemplateLiteral(["minLength"]))] === "number") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject212 ||= _taggedTemplateLiteral(["minimum length"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject213 ||= _taggedTemplateLiteral(["the minimum number of characters for this string is: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject214 ||= _taggedTemplateLiteral(["minLength"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject215 ||= _taggedTemplateLiteral(["pattern"]))]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject216 ||= _taggedTemplateLiteral(["pattern"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject217 ||= _taggedTemplateLiteral(["the string must match the following regular expression: "])))]));
      _0x19f26a.push(_mdastBuilder.code("regexp", _0x40852a[keyword(_templateObject218 ||= _taggedTemplateLiteral(["pattern"]))]));
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.link("https://regexr.com/?expression=" + encodeURIComponent(_0x40852a[keyword(_templateObject219 ||= _taggedTemplateLiteral(["pattern"]))]), i18n2(_templateObject220 ||= _taggedTemplateLiteral(["try regular expression with regexr.com"])), _mdastBuilder.text(i18n2(_templateObject221 ||= _taggedTemplateLiteral(["try pattern"]))))]));
    }
    if (_0x40852a.format && typeof _0x40852a.format === "string" && _0x12be54[_0x40852a.format]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(_0x12be54[keyword([_0x40852a.format])].label)), _mdastBuilder.text(": "), _mdastBuilder.text(_0x12be54[_0x40852a.format].text), _mdastBuilder.link(_0x12be54[_0x40852a.format].speclink, i18n2(_templateObject222 ||= _taggedTemplateLiteral(["check the specification"])), _mdastBuilder.text(_0x12be54[_0x40852a.format].specname))]));
    } else if (_0x40852a.format && typeof _0x40852a.format === "string") {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject223 ||= _taggedTemplateLiteral(["unknown format"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject224 ||= _taggedTemplateLiteral(["the value of this string must follow the format: "]))), _mdastBuilder.inlineCode(String(_0x40852a.format))]));
    }
    if (_0x40852a[keyword(_templateObject225 ||= _taggedTemplateLiteral(["contentEncoding"]))]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject226 ||= _taggedTemplateLiteral(["encoding"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject227 ||= _taggedTemplateLiteral(["the string content must be using the ", " content encoding."]), _0x40852a[keyword(_templateObject228 ||= _taggedTemplateLiteral(["contentEncoding"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject229 ||= _taggedTemplateLiteral(["contentMediaType"]))]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject230 ||= _taggedTemplateLiteral(["media type"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject231 ||= _taggedTemplateLiteral(["the media type of the contents of this string is: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject232 ||= _taggedTemplateLiteral(["contentMediaType"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject233 ||= _taggedTemplateLiteral(["contentSchema"]))]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject234 ||= _taggedTemplateLiteral(["schema"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject235 ||= _taggedTemplateLiteral(["the contents of this string should follow this schema: "]))), _0x33fd02(_0x40852a[keyword(_templateObject236 ||= _taggedTemplateLiteral(["contentSchema"]))][symbols_default.slug] + ".md", i18n2(_templateObject237 ||= _taggedTemplateLiteral(["check type definition"])), _mdastBuilder.text(gentitle(_0x40852a[keyword(_templateObject238 ||= _taggedTemplateLiteral(["contentSchema"]))][symbols_default.titles], _0x40852a[keyword(_templateObject239 ||= _taggedTemplateLiteral(["contentSchema"]))][keyword(_templateObject240 ||= _taggedTemplateLiteral(["type"]))])))]));
    }
    if (_0x40852a[keyword(_templateObject241 ||= _taggedTemplateLiteral(["maxItems"]))] !== undefined) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject242 ||= _taggedTemplateLiteral(["maximum number of items"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject243 ||= _taggedTemplateLiteral(["the maximum number of items for this array is: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject244 ||= _taggedTemplateLiteral(["maxItems"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject245 ||= _taggedTemplateLiteral(["minItems"]))] !== undefined) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject246 ||= _taggedTemplateLiteral(["minimum number of items"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject247 ||= _taggedTemplateLiteral(["the minimum number of items for this array is: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject248 ||= _taggedTemplateLiteral(["minItems"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject249 ||= _taggedTemplateLiteral(["uniqueItems"]))]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject250 ||= _taggedTemplateLiteral(["unique items"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject251 ||= _taggedTemplateLiteral(["all items in this array must be unique. Duplicates are not allowed."])))]));
    }
    if (_0x40852a[keyword(_templateObject252 ||= _taggedTemplateLiteral(["minContains"]))] !== undefined && _0x40852a[keyword(_templateObject253 ||= _taggedTemplateLiteral(["contains"]))]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject254 ||= _taggedTemplateLiteral(["minimum number of contained items"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject255 ||= _taggedTemplateLiteral(["this array may not contain fewer than ", " items that validate against the schema:"]), String(_0x40852a[keyword(_templateObject256 ||= _taggedTemplateLiteral(["minContains"]))])) + " "), _0x33fd02(_0x40852a[keyword(_templateObject257 ||= _taggedTemplateLiteral(["contains"]))][symbols_default.slug] + ".md", i18n2(_templateObject258 ||= _taggedTemplateLiteral(["check type definition"])), _mdastBuilder.text(gentitle(_0x40852a[keyword(_templateObject259 ||= _taggedTemplateLiteral(["contains"]))][symbols_default.titles], _0x40852a[keyword(_templateObject260 ||= _taggedTemplateLiteral(["contains"]))][keyword(_templateObject261 ||= _taggedTemplateLiteral(["type"]))])))]));
    }
    if (_0x40852a[keyword(_templateObject262 ||= _taggedTemplateLiteral(["maxContains"]))] !== undefined && _0x40852a[keyword(_templateObject263 ||= _taggedTemplateLiteral(["contains"]))]) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject264 ||= _taggedTemplateLiteral(["maximum number of contained items"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject265 ||= _taggedTemplateLiteral(["this array may not contain more than ", " items that validate against the schema:"]), String(_0x40852a[keyword(_templateObject266 ||= _taggedTemplateLiteral(["maxContains"]))])) + " "), _0x33fd02(_0x40852a[keyword(_templateObject267 ||= _taggedTemplateLiteral(["contains"]))][symbols_default.slug] + ".md", i18n2(_templateObject268 ||= _taggedTemplateLiteral(["check type definition"])), _mdastBuilder.text(gentitle(_0x40852a[keyword(_templateObject269 ||= _taggedTemplateLiteral(["contains"]))][symbols_default.titles], _0x40852a[keyword(_templateObject270 ||= _taggedTemplateLiteral(["contains"]))][keyword(_templateObject271 ||= _taggedTemplateLiteral(["type"]))])))]));
    }
    if (_0x40852a[keyword(_templateObject272 ||= _taggedTemplateLiteral(["maxProperties"]))] !== undefined) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject273 ||= _taggedTemplateLiteral(["maximum number of properties"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject274 ||= _taggedTemplateLiteral(["the maximum number of properties for this object is: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject275 ||= _taggedTemplateLiteral(["maxProperties"]))]))]));
    }
    if (_0x40852a[keyword(_templateObject276 ||= _taggedTemplateLiteral(["minProperties"]))] !== undefined) {
      _0x19f26a.push(_mdastBuilder.paragraph([_mdastBuilder.strong(_mdastBuilder.text(i18n2(_templateObject277 ||= _taggedTemplateLiteral(["minimum number of properties"])))), _mdastBuilder.text(": "), _mdastBuilder.text(i18n2(_templateObject278 ||= _taggedTemplateLiteral(["the minimum number of properties for this object is: "]))), _mdastBuilder.inlineCode(String(_0x40852a[keyword(_templateObject279 ||= _taggedTemplateLiteral(["minProperties"]))]))]));
    }
    if (_0x19f26a.length > 0) {
      return [].concat(_mdastBuilder.heading(_0x1299a0 + 1, _mdastBuilder.text(i18n2(_templateObject280 ||= _taggedTemplateLiteral(["", " Constraints"]), _0x136e38(_0x40852a)))), _0x19f26a);
    }
    return [];
  }
  function _0xf2412c(_0x5f4363, _0x402bf5 = 1) {
    if (_0x5f4363[keyword(_templateObject281 ||= _taggedTemplateLiteral(["examples"]))] && _0x5f4363[keyword(_templateObject282 ||= _taggedTemplateLiteral(["examples"]))].length > 0 && exampleFormat === "yaml") {
      return [].concat(_mdastBuilder.heading(_0x402bf5 + 1, _mdastBuilder.text(i18n2(_templateObject283 ||= _taggedTemplateLiteral(["", " Examples"]), _0x136e38(_0x5f4363)))), _0x5f4363[keyword(_templateObject284 ||= _taggedTemplateLiteral(["examples"]))].map(function (_0x231771) {
        return _mdastBuilder.paragraph(_mdastBuilder.code("yaml", _jsYaml.default.dump(_0x231771, undefined, 2)));
      }));
    }
    if (_0x5f4363[keyword(_templateObject285 ||= _taggedTemplateLiteral(["examples"]))] && _0x5f4363[keyword(_templateObject286 ||= _taggedTemplateLiteral(["examples"]))].length > 0 && exampleFormat === "json") {
      return [].concat(_mdastBuilder.heading(_0x402bf5 + 1, _mdastBuilder.text(i18n2(_templateObject287 ||= _taggedTemplateLiteral(["", " Examples"]), _0x136e38(_0x5f4363)))), _0x5f4363[keyword(_templateObject288 ||= _taggedTemplateLiteral(["examples"]))].map(function (_0x9b1772) {
        return _mdastBuilder.paragraph(_mdastBuilder.code("json", JSON.stringify(_0x9b1772, undefined, 2)));
      }));
    }
    return [];
  }
  function _0x90d901(_0x151433, _0x6b7b16 = 1) {
    if (_0x151433[keyword(_templateObject289 ||= _taggedTemplateLiteral(["default"]))] !== undefined) {
      return [_mdastBuilder.heading(_0x6b7b16 + 1, _mdastBuilder.text(i18n2(_templateObject290 ||= _taggedTemplateLiteral(["", " Default Value"]), _0x136e38(_0x151433)))), _mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject291 ||= _taggedTemplateLiteral(["The default value is:"])))), _mdastBuilder.paragraph(_mdastBuilder.code("json", JSON.stringify(_0x151433[keyword(_templateObject292 ||= _taggedTemplateLiteral(["default"]))], undefined, 2)))];
    }
    return [];
  }
  function _0x403e78(_0xa5b01b, _0xf15abd = 1) {
    if (_0xa5b01b[keyword(_templateObject293 ||= _taggedTemplateLiteral(["readOnly"]))] && _0xa5b01b[keyword(_templateObject294 ||= _taggedTemplateLiteral(["writeOnly"]))]) {
      return [_mdastBuilder.heading(_0xf15abd + 1, _mdastBuilder.text(i18n2(_templateObject295 ||= _taggedTemplateLiteral(["", " Access Restrictions"]), _0x136e38(_0xa5b01b)))), _mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject296 ||= _taggedTemplateLiteral(["The value of this property is managed exclusively by the owning authority and never exposed to the outside. It can neither be read nor written."]))))];
    }
    if (_0xa5b01b[keyword(_templateObject297 ||= _taggedTemplateLiteral(["readOnly"]))]) {
      return [_mdastBuilder.heading(_0xf15abd + 1, _mdastBuilder.text(i18n2(_templateObject298 ||= _taggedTemplateLiteral(["", " Access Restrictions"]), _0x136e38(_0xa5b01b)))), _mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject299 ||= _taggedTemplateLiteral(["The value of this property is managed exclusively by the owning authority, and attempts by an application to modify the value of this property are expected to be ignored or rejected by that owning authority"]))))];
    }
    if (_0xa5b01b[keyword(_templateObject300 ||= _taggedTemplateLiteral(["writeOnly"]))]) {
      return [_mdastBuilder.heading(_0xf15abd + 1, _mdastBuilder.text(i18n2(_templateObject301 ||= _taggedTemplateLiteral(["", " Access Restrictions"]), _0x136e38(_0xa5b01b)))), _mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject302 ||= _taggedTemplateLiteral(["The value of this property is never present when the instance is retrieved from the owning authority. It can be present when sent to the owning authority to update or create the document (or the resource it represents), but it will not be included in any updated or newly created version of the instance."]))))];
    }
    return [];
  }
  function _0x362571(_0x18370a = {}, _0x16995e = {}, _0xb81c47, _0x232de4, _0x3e5cfb = 2) {
    return [].concat(_ferrum.list(_ferrum.flat(Object.entries(_0x18370a || {}).map(function (item) {
      var _0x2feea8 = item[0];
      var _0x289391 = item[1];
    }))), _ferrum.list(_ferrum.flat(Object.entries(_0x16995e || {}).map(function (item) {
      var _0x38fb04 = item[0];
      var _0x306a18 = item[1];
    }))), function (_0x34e134) {
      if (_typeof(_0xb81c47) === "object") {
        var _0x2c58ec = _0x34e134[symbols_default.meta].longdescription || _mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject303 ||= _taggedTemplateLiteral(["no description"]))));
        return [].concat(_mdastBuilder.heading(_0x3e5cfb + 1, _mdastBuilder.text(i18n2(_templateObject304 ||= _taggedTemplateLiteral(["Additional Properties"])))), _mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject305 ||= _taggedTemplateLiteral(["Additional properties are allowed, as long as they follow this schema:"])))), _0x2c58ec, _0x26f2fb(_0x34e134), _0x390e45(i18n2(_templateObject306 ||= _taggedTemplateLiteral(["Additional properties"])), _0x34e134, _0x232de4), _0x4e30bf(_0x34e134, _0x3e5cfb + 1), _0x5c5a9b(_0x34e134, _0x3e5cfb + 1), _0x90d901(_0x34e134, _0x3e5cfb + 1), _0xf2412c(_0x34e134, _0x3e5cfb + 1), _0x403e78(_0x34e134, _0x3e5cfb + 1));
      } else if (_0xb81c47 === true) {
        return [_mdastBuilder.heading(_0x3e5cfb + 1, _mdastBuilder.text(i18n2(_templateObject307 ||= _taggedTemplateLiteral(["Additional Properties"])))), _mdastBuilder.paragraph(_mdastBuilder.text(i18n2(_templateObject308 ||= _taggedTemplateLiteral(["Additional properties are allowed and do not have to follow a specific schema"]))))];
      }
      return [];
    }(_0xb81c47));
  }
  function _0x792d63(_0x513355, _0x12e530) {
    if (_0x513355.definitions || _0x513355[keyword(_templateObject309 ||= _taggedTemplateLiteral(["$defs"]))]) {
      var _0x5bd426 = [].concat(Object.entries(_0x513355[keyword(_templateObject310 ||= _taggedTemplateLiteral(["$defs"]))] || {}), Object.entries(_0x513355.definitions || {})).map(function (item) {
        var _0x4554fa = item[0];
        var _0x356ed2 = item[1];
      });
      return [].concat(_mdastBuilder.heading(1, _mdastBuilder.text(i18n2(_templateObject311 ||= _taggedTemplateLiteral(["", " Definitions"]), gentitle(_0x513355[symbols_default.titles], _0x513355[keyword(_templateObject312 ||= _taggedTemplateLiteral(["type"]))])))), _ferrum.list(_ferrum.flat(_0x5bd426)));
    }
    return [];
  }
  function _0x58f8fa(_0x22c446, _0x2f504d) {
    if (_0x22c446[keyword(_templateObject313 ||= _taggedTemplateLiteral(["properties"]))] || _0x22c446[keyword(_templateObject314 ||= _taggedTemplateLiteral(["patternProperties"]))] || _0x22c446[keyword(_templateObject315 ||= _taggedTemplateLiteral(["additionalProperties"]))]) {
      return [].concat(_mdastBuilder.heading(1, _mdastBuilder.text(i18n2(_templateObject316 ||= _taggedTemplateLiteral(["", " Properties"]), _0x136e38(_0x22c446)))), _0x7e655c(_0x22c446[keyword(_templateObject317 ||= _taggedTemplateLiteral(["properties"]))], _0x22c446[keyword(_templateObject318 ||= _taggedTemplateLiteral(["patternProperties"]))], _0x22c446[keyword(_templateObject319 ||= _taggedTemplateLiteral(["additionalProperties"]))], _0x22c446[keyword(_templateObject320 ||= _taggedTemplateLiteral(["required"]))], _0x2f504d), _0x362571(_0x22c446[keyword(_templateObject321 ||= _taggedTemplateLiteral(["properties"]))], _0x22c446[keyword(_templateObject322 ||= _taggedTemplateLiteral(["patternProperties"]))], _0x22c446[keyword(_templateObject323 ||= _taggedTemplateLiteral(["additionalProperties"]))], _0x22c446[keyword(_templateObject324 ||= _taggedTemplateLiteral(["required"]))], 1));
    }
    return [];
  }
  console.log("generating markdown");
  return function (_0x399966) {
    return _ferrum.foldl(_0x399966, {}, function (_0x305fc6, _0x1c7090) {
      var _0x5d38a7 = new _githubSlugger.default();
      _0x305fc6[_0x1c7090[symbols_default.slug]] = _mdastBuilder.root([].concat(_0x2a1291(_0x1c7090), _0x4e30bf(_0x1c7090, 1), _0x5c5a9b(_0x1c7090, 1), _0x90d901(_0x1c7090, 1), _0xf2412c(_0x1c7090, 1), _0x58f8fa(_0x1c7090, _0x5d38a7), _0x792d63(_0x1c7090, _0x5d38a7)));
      return _0x305fc6;
    });
  };
}