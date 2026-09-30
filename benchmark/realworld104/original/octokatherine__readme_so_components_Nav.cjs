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
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/octokatherine__readme.so/components/Nav.js
var Nav_exports = {};
__export(Nav_exports, {
  Nav: () => Nav
});
module.exports = __toCommonJS(Nav_exports);

// ../work/octokatherine__readme.so/components/icons/Menu.js
var Menu = ({ className }) => /* @__PURE__ */ React.createElement("svg", { className, viewBox: "0 0 512 512" }, /* @__PURE__ */ React.createElement("title", null, "Menu"), /* @__PURE__ */ React.createElement(
  "path",
  {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeMiterlimit: "10",
    strokeWidth: "30",
    d: "M80 160h352M80 256h352M80 352h352"
  }
));
var Menu_default = Menu;

// ../work/octokatherine__readme.so/components/icons/Close.js
var Close = ({ className }) => /* @__PURE__ */ React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className, viewBox: "0 0 512 512" }, /* @__PURE__ */ React.createElement("title", null, "Close"), /* @__PURE__ */ React.createElement(
  "path",
  {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "32",
    d: "M368 368L144 144M368 144L144 368"
  }
));
var Close_default = Close;

// ../work/octokatherine__readme.so/hooks/useDeviceDetect.js
var import_react = require("react");
function useDeviceDetect() {
  const [isMobile, setMobile] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i));
    setMobile(mobile);
  }, []);
  return { isMobile };
}

// ../work/octokatherine__readme.so/components/Nav.js
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
      return `${acc}${template.markdown}`;
    } else {
      return acc;
    }
  }, ``);
  const { isMobile } = useDeviceDetect();
  const downloadMarkdownFile = () => {
    const a = document.createElement("a");
    const blob = new Blob([markdown]);
    a.href = URL.createObjectURL(blob);
    a.download = "README.md";
    a.click();
    if (isMobile && isDrawerOpen) {
      onMenuClick();
    }
    setShowModal(true);
  };
  return /* @__PURE__ */ React.createElement("nav", { className: "flex justify-between p-4 bg-gray-800 align-center w-full" }, /* @__PURE__ */ React.createElement(
    import_link.default,
    {
      href: "/",
      className: "focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center"
    },
    /* @__PURE__ */ React.createElement("img", { className: "w-auto h-12", src: "readme.svg", alt: "readme.so logo" })
  ), /* @__PURE__ */ React.createElement("div", { className: "flex flex-row-reverse md:flex-row" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "focus:outline-none focus:ring-2 focus:ring-emerald-400",
      "aria-label": isDrawerOpen ? "Close menu" : "Open menu",
      onClick: onMenuClick
    },
    isDrawerOpen ? /* @__PURE__ */ React.createElement(Close_default, { className: "w-10 h-10 md:hidden fill-current text-emerald-500" }) : /* @__PURE__ */ React.createElement(Menu_default, { className: "w-10 h-10 md:hidden fill-current text-emerald-500" })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "aria-label": "Download Markdown",
      className: "flex flex-row relative items-center mr-4 md:mr-0 px-4 py-2 text-sm font-bold tracking-wide text-white border border-transparent rounded-md shadow-sm bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500",
      onClick: downloadMarkdownFile
    },
    /* @__PURE__ */ React.createElement("img", { className: "w-auto h-6 cursor-pointer", src: "download.svg", alt: "Download" }),
    /* @__PURE__ */ React.createElement("span", { className: "hidden md:inline-block ml-2" }, "Download")
  )));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Nav
});
