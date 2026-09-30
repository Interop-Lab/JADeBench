var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Nav_exports = {};
__export(Nav_exports, {
  default: () => Nav
});
module.exports = __toCommonJS(Nav_exports);

var Menu = ({ className }) => React.createElement("svg", {
  className,
  viewBox: "0 0 24 24"
}, React.createElement("title", null, "Menu"), React.createElement("path", {
  d: "M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"
}));
var Menu_default = Menu;

var Close = ({ className }) => React.createElement("svg", {
  xmlns: "http://www.w3.org/2000/svg",
  className,
  viewBox: "0 0 24 24"
}, React.createElement("title", null, "Close"), React.createElement("path", {
  d: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
}));
var Close_default = Close;

var import_react = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = import_react.useState(false);
  import_react.useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i));
    setIsMobile(mobile);
  }, []);
  return { isMobile };
}

var import_link = __toESM(require("next/link"));

var Nav = ({
  selectedSectionSlugs,
  setShowModal,
  getTemplate,
  onMenuClick,
  isDrawerOpen,
  focusedSectionSlug
}) => {
  const markdown = selectedSectionSlugs.reduce((acc, section) => {
    const template = getTemplate(section);
    if (template) {
      return acc + template.content;
    } else {
      return acc;
    }
  }, "");
  const { isMobile } = useDeviceDetect();
  const downloadMarkdown = () => {
    const link = document.createElement("a");
    const blob = new Blob([markdown]);
    link.href = URL.createObjectURL(blob);
    link.download = "README.md";
    link.click();
    if (isMobile && isDrawerOpen) {
      onMenuClick();
    }
    setShowModal(true);
  };
  return React.createElement("nav", {
    className: "flex justify-between items-center"
  }, React.createElement(import_link.default, {
    href: "/",
    className: "flex items-center"
  }, React.createElement("img", {
    className: "h-8 w-auto",
    src: "https://readme.so/logo.svg",
    alt: "readme.so"
  })), React.createElement("div", {
    className: "flex gap-4"
  }, React.createElement("button", {
    className: "focus:outline-none",
    "aria-label": isDrawerOpen ? "Close menu" : "Open menu",
    onClick: onMenuClick
  }, isDrawerOpen ? React.createElement(Close_default, {
    className: "h-6 w-6"
  }) : React.createElement(Menu_default, {
    className: "h-6 w-6"
  })), React.createElement("button", {
    type: "button",
    "aria-label": "Download",
    className: "relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500",
    onClick: downloadMarkdown
  }, React.createElement("img", {
    className: "h-5 w-5 mr-2",
    src: "https://readme.so/download.svg",
    alt: "Download"
  }), React.createElement("span", {
    className: "hidden sm:inline"
  }, "Download"))));
};

var _0x233157 = {};
_0x233157.default = Nav;
module.exports = _0x233157;
