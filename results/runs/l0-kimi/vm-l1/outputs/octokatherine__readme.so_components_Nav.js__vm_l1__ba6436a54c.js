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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

var Nav_exports = {};
__export(Nav_exports, {
  Nav: () => Nav
});

var import_react = require("react");
var import_link = __toESM(require("next/link"));

function useDeviceDetect() {
  const [isMobile, setIsMobile] = import_react.useState(false);
  import_react.useEffect(() => {
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
    const mobile = Boolean(userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
    setIsMobile(mobile);
  }, []);
  return { isMobile };
}

function Menu(props) {
  return import_react.createElement("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props }, import_react.createElement("line", { x1: 3, y1: 12, x2: 21, y2: 12 }), import_react.createElement("line", { x1: 3, y1: 6, x2: 21, y2: 6 }), import_react.createElement("line", { x1: 3, y1: 18, x2: 21, y2: 18 }));
}

var Menu_default = Menu;

function Close(props) {
  return import_react.createElement("svg", { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props }, import_react.createElement("line", { x1: 18, y1: 6, x2: 6, y2: 18 }), import_react.createElement("line", { x1: 6, y1: 6, x2: 18, y2: 18 }));
}

var Close_default = Close;

function Nav() {
  const [isOpen, setIsOpen] = import_react.useState(false);
  const { isMobile } = useDeviceDetect();
  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);
  const menuItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Contact", href: "/contact" }
  ];
  return import_react.createElement("nav", { className: "bg-white shadow-md" }, import_react.createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" }, import_react.createElement("div", { className: "flex justify-between h-16" }, import_react.createElement("div", { className: "flex-shrink-0 flex items-center" }, import_react.createElement(import_link.default, { href: "/", className: "text-xl font-bold text-gray-800" }, "Logo")), import_react.createElement("div", { className: "flex items-center" }, isMobile ? import_react.createElement("button", { onClick: toggleMenu, className: "text-gray-600 hover:text-gray-900 focus:outline-none" }, isOpen ? import_react.createElement(Close_default, { className: "h-6 w-6" }) : import_react.createElement(Menu_default, { className: "h-6 w-6" })) : import_react.createElement("div", { className: "hidden md:flex space-x-8" }, menuItems.map((item) => import_react.createElement(import_link.default, { key: item.href, href: item.href, className: "text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium" }, item.label))))), isMobile && isOpen && import_react.createElement("div", { className: "md:hidden" }, import_react.createElement("div", { className: "px-2 pt-2 pb-3 space-y-1 sm:px-3" }, menuItems.map((item) => import_react.createElement(import_link.default, { key: item.href, href: item.href, onClick: closeMenu, className: "text-gray-600 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium" }, item.label))))));
}

module.exports = __toCommonJS(Nav_exports);
0 && (module.exports = { Nav });
