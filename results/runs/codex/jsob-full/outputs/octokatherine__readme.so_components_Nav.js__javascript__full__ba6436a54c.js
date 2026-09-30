var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;

var __export = (target, exports) => {
  for (var name in exports) {
    __defProp(target, name, { get: exports[name], enumerable: true });
  }
};

var __copyProps = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let key of __getOwnPropNames(source)) {
      if (!__hasOwnProp.call(target, key) && key !== except) {
        __defProp(target, key, {
          get: () => source[key],
          enumerable:
            !(descriptor = __getOwnPropDesc(source, key)) || descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

var __toESM = (moduleValue, isNodeMode, target) => {
  target =
    moduleValue != null ? __createModuleWrapper(moduleValue) : {};
  return __copyProps(
    isNodeMode || !moduleValue || !moduleValue.__esModule
      ? __defProp(target, "default", {
          value: moduleValue,
          enumerable: true,
        })
      : target,
    moduleValue,
  );
};

function __createModuleWrapper(moduleValue) {
  return Object.create(__getProtoOf(moduleValue));
}

var __toCommonJS = (moduleValue) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), moduleValue);

var Nav_exports = {};
__export(Nav_exports, { Nav: () => Nav });
module.exports = __toCommonJS(Nav_exports);

var react = require("react");
var nextLink = __toESM(require("next/link"));

var menuPathProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeMiterlimit: "10",
  strokeWidth: "30",
  d: "M80 160h352M80 256h352M80 352h352",
};

var Menu = ({ className }) =>
  React.createElement(
    "svg",
    { className, viewBox: "0 0 512 512" },
    React.createElement("title", null, "Menu"),
    React.createElement("path", menuPathProps),
  );

var closePathProps = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "32",
  d: "M368 368L144 144M368 144L144 368",
};

var Close = ({ className }) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      className,
      viewBox: "0 0 512 512",
    },
    React.createElement("title", null, "Close"),
    React.createElement("path", closePathProps),
  );

function useDeviceDetect() {
  const [isMobile, setIsMobile] = react.useState(false);

  react.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    setIsMobile(Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i)));
  }, []);

  return { isMobile };
}

var Nav = ({
  selectedSectionSlugs,
  setShowModal,
  getTemplate,
  onMenuClick,
  isDrawerOpen,
  focusedSectionSlug,
}) => {
  const markdown = selectedSectionSlugs.reduce((content, sectionSlug) => {
    const template = getTemplate(sectionSlug);
    return template ? content + template.markdown : content;
  }, "");
  const { isMobile } = useDeviceDetect();

  const downloadMarkdown = () => {
    const link = document.createElement("a");
    const file = new Blob([markdown]);
    link.href = URL.createObjectURL(file);
    link.download = "README.md";
    link.click();

    if (isMobile && isDrawerOpen) {
      onMenuClick();
    }
    setShowModal(true);
  };

  return React.createElement(
    "nav",
    { className: "flex justify-between p-4 bg-gray-800 align-center w-full" },
    React.createElement(
      nextLink.default,
      {
        href: "/",
        className:
          "focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center",
      },
      React.createElement("img", {
        className: "w-auto h-12",
        src: "readme.svg",
        alt: "readme.so logo",
      }),
    ),
    React.createElement(
      "div",
      { className: "flex flex-row-reverse md:flex-row" },
      React.createElement(
        "button",
        {
          className:
            "focus:outline-none focus:ring-2 focus:ring-emerald-400",
          "aria-label": isDrawerOpen ? "Close menu" : "Open menu",
          onClick: onMenuClick,
        },
        isDrawerOpen
          ? React.createElement(Close, {
              className:
                "w-10 h-10 md:hidden fill-current text-emerald-500",
            })
          : React.createElement(Menu, {
              className:
                "w-10 h-10 md:hidden fill-current text-emerald-500",
            }),
      ),
      React.createElement(
        "button",
        {
          type: "button",
          "aria-label": "Download Markdown",
          className:
            "flex flex-row relative items-center mr-4 md:mr-0 px-4 py-2 text-sm font-bold tracking-wide text-white border border-transparent rounded-md shadow-sm bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500",
          onClick: downloadMarkdown,
        },
        React.createElement("img", {
          className: "w-auto h-6 cursor-pointer",
          src: "download.svg",
          alt: "Download",
        }),
        React.createElement(
          "span",
          { className: "hidden md:inline-block ml-2" },
          "Download",
        ),
      ),
    ),
  );
};
