const __create = Object.create;
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __getProtoOf = Object.getPrototypeOf;
const __hasOwnProp = Object.prototype.hasOwnProperty;

const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) =>
  (target = mod != null ? __create(__getProtoOf(mod)) : {},
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  ));

const __toCommonJS = (mod) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const Nav_exports = {};
__export(Nav_exports, { default: () => Nav });
module.exports = __toCommonJS(Nav_exports);

const Menu = ({ className }) =>
  React.createElement(
    "svg",
    { className, viewBox: "0 0 24 24" },
    React.createElement("path", null, "M3 6h18M3 12h18M3 18h18")
  );

const Close = ({ className }) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      className,
      viewBox: "0 0 24 24",
    },
    React.createElement("path", null, "M6 6l12 12M18 6L6 18")
  );

const import_react = require("react");

function useDeviceDetect() {
  const [isMobile, setIsMobile] = import_react.useState(false);

  import_react.useEffect(() => {
    const userAgent =
      typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(userAgent.match(/Mobi|Android|BlackBerry|iPhone/i));
    setIsMobile(mobile);
  }, []);

  return { isMobile };
}

const import_link = __toESM(require("next/link"));

const Nav = ({
  selectedSectionSlugs,
  setShowModal,
  getTemplate,
  onMenuClick,
  isDrawerOpen,
  focusedSectionSlug,
}) => {
  const downloadMarkdown = selectedSectionSlugs
    .map((slug, index) => {
      const template = getTemplate(index);
      if (template) {
        return `${slug}${template.title}`;
      } else {
        return slug;
      }
    })
    .join("");

  const { isMobile } = useDeviceDetect();

  const handleDownload = () => {
    const link = document.createElement("a");
    const blob = new Blob([downloadMarkdown]);
    link.href = URL.createObjectURL(blob);
    link.download = "template.md";
    link.click();

    if (isMobile && isDrawerOpen) {
      onMenuClick();
    }
    setShowModal(true);
  };

  return React.createElement(
    "nav",
    { className: "navbar" },
    React.createElement(
      import_link.default,
      { href: "/", className: "logo-link" },
      React.createElement("img", {
        className: "logo",
        src: "/logo.svg",
        alt: "Logo",
      })
    ),
    React.createElement(
      "div",
      { className: "menu-button-container" },
      React.createElement(
        "button",
        {
          className: "menu-button",
          "aria-label": isDrawerOpen ? "Close menu" : "Open menu",
          onClick: onMenuClick,
        },
        isDrawerOpen
          ? React.createElement(Close, { className: "menu-icon" })
          : React.createElement(Menu, { className: "menu-icon" })
      )
    ),
    React.createElement(
      "button",
      {
        type: "button",
        "aria-label": "Download template",
        className: "download-button",
        onClick: handleDownload,
      },
      React.createElement("img", {
        className: "download-icon",
        src: "/download.svg",
        alt: "Download",
      })
    )
  );
};

module.exports = { default: Nav };
