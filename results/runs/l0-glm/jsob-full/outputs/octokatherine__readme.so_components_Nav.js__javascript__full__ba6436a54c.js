"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, source) => {
  for (var key in source)
    __defProp(target, key, { get: source[key], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
  }
  return to;
};
var __toESM = (mod, isCommonJS, target) => (
  target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isCommonJS || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Nav_exports = {};
__export(Nav_exports, { default: () => Nav });
module.exports = __toCommonJS(Nav_exports);

var MenuPaths = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "10",
  d: "M2 12 H52 M2 24 H52 M2 36 H52"
};

var Menu = ({ className }) =>
  React.createElement(
    "svg",
    { className, viewBox: "0 0 54 42" },
    React.createElement("title", null, "Menu"),
    React.createElement("path", MenuPaths)
  );
var Menu_default = Menu;

var ClosePaths = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "32",
  d: "M64 64 L192 192 M192 64 L64 192"
};

var Close = ({ className }) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      className,
      viewBox: "0 0 256 256"
    },
    React.createElement("title", null, "Close"),
    React.createElement("path", ClosePaths)
  );
var Close_default = Close;

var import_react = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
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
  const markdown = selectedSectionSlugs.reduce(
    (accumulator, sectionSlug) => {
      const template = getTemplate(sectionSlug);
      if (template) {
        return "" + accumulator + template.markdown;
      } else {
        return accumulator;
      }
    },
    ""
  );

  const { isMobile } = useDeviceDetect();

  const downloadMarkdown = () => {
    const link = document.createElement("a");
    const blob = new Blob([markdown]);
    link.href = URL.createObjectURL(blob);
    link.download = "README.md";
    link.click();
    if (isMobile === isDrawerOpen) {
      onMenuClick();
    }
    setShowModal(true);
  };

  return React.createElement(
    "nav",
    { className: "Nav_nav__oR7U2" },
    React.createElement(
      import_link.default,
      { href: "/", className: "Nav_home__3F57N" },
      React.createElement("img", {
        className: "Nav_logo__WZqB9",
        src: "/logo.svg",
        alt: "logo"
      })
    ),
    React.createElement(
      "div",
      { className: "Nav_toggle__mD8wA" },
      React.createElement(
        "button",
        {
          className: "Nav_button__mSg43",
          "aria-label": isDrawerOpen ? "Close menu" : "Open menu",
          onClick: onMenuClick
        },
        isDrawerOpen
          ? React.createElement(Close_default, { className: "Nav_icon__bts2m" })
          : React.createElement(Menu_default, { className: "Nav_icon__bts2m" })
      )
    ),
    React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Download",
        className: "Nav_button__mSg43",
        onClick: downloadMarkdown
      },
      React.createElement("img", {
        className: "Nav_icon__bts2m",
        src: "/download.svg",
        alt: "download"
      }),
      React.createElement(
        "span",
        { className: "Nav_buttonLabel__r0G1d" },
        "Download"
      )
    )
  );
};
