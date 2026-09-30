var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, { get: exports[name], enumerable: true, configurable: true });
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable, configurable: true });
      }
    }
  }
  return to;
};
var __toESM = (mod, isCommonJS, hasDefault) => {
  if (hasDefault || mod && mod.__esModule) return mod;
  var newObj = {};
  if (mod != null) {
    for (var keys = __getOwnPropNames(mod), i = 0, n = keys.length, key; i < n; i++) {
      key = keys[i];
      if (key !== "default") __defProp(newObj, key, { get: () => mod[key], enumerable: true });
    }
  }
  newObj.default = mod;
  return newObj;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Nav_exports = {};
__export(Nav_exports, {
  Nav: () => Nav
});
module.exports = __toCommonJS(Nav_exports);

var import_react = require("react");
var import_link = require("next/link");

function Menu(props) {
  return /* @__PURE__ */ import_react.default.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props
  }, /* @__PURE__ */ import_react.default.createElement("line", {
    x1: 4,
    y1: 12,
    x2: 20,
    y2: 12
  }), /* @__PURE__ */ import_react.default.createElement("line", {
    x1: 4,
    y1: 6,
    x2: 20,
    y2: 6
  }), /* @__PURE__ */ import_react.default.createElement("line", {
    x1: 4,
    y1: 18,
    x2: 20,
    y2: 18
  }));
}

var Menu_default = Menu;

function Close(props) {
  return /* @__PURE__ */ import_react.default.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    ...props
  }, /* @__PURE__ */ import_react.default.createElement("path", {
    d: "M18 6 6 18"
  }), /* @__PURE__ */ import_react.default.createElement("path", {
    d: "m6 6 12 12"
  }));
}

var Close_default = Close;

function useDeviceDetect() {
  const [isMobile, setIsMobile] = import_react.useState(false);
  import_react.useEffect(() => {
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    setIsMobile(mobile);
  }, []);
  return { isMobile };
}

function Nav(_props) {
  const { isMobile } = useDeviceDetect();
  const [open, setOpen] = import_react.useState(false);
  return /* @__PURE__ */ import_react.default.createElement("nav", null, /* @__PURE__ */ import_react.default.createElement("div", null, /* @__PURE__ */ import_react.default.createElement(Menu_default, {
    onClick: () => setOpen(!open)
  })), open && /* @__PURE__ */ import_react.default.createElement(import_link.default, {
    href: "/"
  }, "Home"));
}

0 && (module.exports = { Nav });
