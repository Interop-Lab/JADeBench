var __create = Object.create;
var __defineProperty = Object.defineProperty;
var __getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var __getOwnPropertyNames = Object.getOwnPropertyNames;
var __getPrototypeOf = Object.getPrototypeOf;
var __hasOwnProperty = Object.prototype.hasOwnProperty;

var exportProperties = (target, properties) => {
  for (var name in properties) {
    __defineProperty(target, name, {
      get: properties[name],
      enumerable: true,
    });
  }
};

var copyProperties = (target, source, except, descriptor) => {
  if (source && (typeof source === "object" || typeof source === "function")) {
    for (let name of __getOwnPropertyNames(source)) {
      if (!__hasOwnProperty.call(target, name) && name !== except) {
        __defineProperty(target, name, {
          get: () => source[name],
          enumerable:
            !(descriptor = __getOwnPropertyDescriptor(source, name)) ||
            descriptor.enumerable,
        });
      }
    }
  }
  return target;
};

var toESModule = (value, isNodeMode, target) => {
  target = value != null ? __create(__getPrototypeOf(value)) : {};
  return copyProperties(
    isNodeMode || !value || !value.__esModule
      ? __defineProperty(target, "default", {
          value,
          enumerable: true,
        })
      : target,
    value,
  );
};

var toCommonJS = (value) =>
  copyProperties(
    __defineProperty({}, "__esModule", { value: true }),
    value,
  );

var Nav;
var NavExports = {};
exportProperties(NavExports, { Nav: () => Nav });
module.exports = toCommonJS(NavExports);

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

var react = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = (0, react.useState)(false);

  (0, react.useEffect)(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const detectedMobile = Boolean(
      userAgent.match(/Mobi|Android|BlackBerry|iPhone/i),
    );
    setIsMobile(detectedMobile);
  }, []);

  return { isMobile };
}

var linkModule = toESModule(require("next/link"));

Nav = ({
  selectedSectionSlugs,
  setShowModal,
  getTemplate,
  onMenuClick,
  isDrawerOpen,
  focusedSectionSlug: _focusedSectionSlug,
}) => {
  const markdown = selectedSectionSlugs.reduce((content, sectionSlug) => {
    const template = getTemplate(sectionSlug);
    return template ? content + template.markdown : content;
  }, "");
  const { isMobile } = useDeviceDetect();
  const mobileMenuIconClass =
    "w-10 h-10 md:hidden fill-current text-emerald-500";

  const downloadMarkdown = () => {
    const downloadLink = document.createElement("a");
    const markdownFile = new Blob([markdown]);

    downloadLink.href = URL.createObjectURL(markdownFile);
    downloadLink.download = "README.md";
    downloadLink.click();

    if (isMobile && isDrawerOpen) {
      onMenuClick();
    }
    setShowModal(true);
  };

  return React.createElement(
    "nav",
    {
      className:
        "flex justify-between p-4 bg-gray-800 align-center w-full",
    },
    React.createElement(
      linkModule.default,
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
          ? React.createElement(Close, { className: mobileMenuIconClass })
          : React.createElement(Menu, { className: mobileMenuIconClass }),
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
