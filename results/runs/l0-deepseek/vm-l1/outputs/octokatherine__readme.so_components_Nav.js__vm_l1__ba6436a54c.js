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
  if (from && typeof from === "object" || typeof from === "function") {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
};

const __toESM = (mod, isNodeMode, target) => {
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  __copyProps(
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  );
};

const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

const Nav_exports = {};
__export(Nav_exports, {
  Nav: () => Nav
});
module.exports = __toCommonJS(Nav_exports);

const import_react = require("react");
const import_link = __toESM(require("next/link"));

function useDeviceDetect() {
  const [isMobile, setIsMobile] = import_react.useState(false);

  import_react.useEffect(() => {
    const userAgent = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const mobile = Boolean(
      userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i)
    );
    setIsMobile(mobile);
  }, []);

  return { isMobile };
}

function Menu({ isOpen }) {
  return import_react.default.createElement(
    "div",
    { className: isOpen ? "menu open" : "menu" },
    import_react.default.createElement(
      "ul",
      null,
      import_react.default.createElement(
        "li",
        null,
        import_react.default.createElement(import_link.default, { href: "/" }, "Home")
      ),
      import_react.default.createElement(
        "li",
        null,
        import_react.default.createElement(import_link.default, { href: "/about" }, "About")
      ),
      import_react.default.createElement(
        "li",
        null,
        import_react.default.createElement(import_link.default, { href: "/contact" }, "Contact")
      )
    )
  );
}

function Close({ onClick }) {
  return import_react.default.createElement(
    "button",
    { className: "close", onClick },
    import_react.default.createElement("span", null, "\u00d7")
  );
}

function Nav() {
  const { isMobile } = useDeviceDetect();
  const [isOpen, setIsOpen] = import_react.useState(false);

  return import_react.default.createElement(
    "nav",
    { className: "nav" },
    import_react.default.createElement(
      "div",
      { className: "logo" },
      import_react.default.createElement(import_link.default, { href: "/" }, "Logo")
    ),
    isMobile
      ? import_react.default.createElement(
          import_react.default.Fragment,
          null,
          import_react.default.createElement(
            "button",
            { className: "hamburger", onClick: () => setIsOpen(!isOpen) },
            "\u2630"
          ),
          isOpen && import_react.default.createElement(Menu, { isOpen }),
          isOpen && import_react.default.createElement(Close, { onClick: () => setIsOpen(false) })
        )
      : import_react.default.createElement(Menu, { isOpen: true })
  );
}

module.exports = __toCommonJS(Nav_exports);
