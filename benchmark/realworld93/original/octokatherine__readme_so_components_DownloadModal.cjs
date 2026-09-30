var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../work/octokatherine__readme.so/components/DownloadModal.js
var DownloadModal_exports = {};
__export(DownloadModal_exports, {
  DownloadModal: () => DownloadModal
});
module.exports = __toCommonJS(DownloadModal_exports);
var import_react = require("@headlessui/react");
var DownloadModal = ({ showModal, setShowModal }) => {
  return /* @__PURE__ */ React.createElement(import_react.Transition, { show: showModal }, /* @__PURE__ */ React.createElement(
    import_react.Dialog,
    {
      as: "div",
      className: "fixed inset-0 z-10 overflow-y-auto",
      onClose: () => setShowModal(false)
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0" }, /* @__PURE__ */ React.createElement(
      import_react.TransitionChild,
      {
        enter: "ease-out duration-300",
        enterFrom: "opacity-0",
        enterTo: "opacity-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100",
        leaveTo: "opacity-0"
      },
      /* @__PURE__ */ React.createElement(import_react.DialogBackdrop, { className: "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" })
    ), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline-block sm:align-middle sm:h-screen", "aria-hidden": "true" }, "\u200B"), /* @__PURE__ */ React.createElement(
      import_react.TransitionChild,
      {
        enter: "ease-out duration-300",
        enterFrom: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95",
        enterTo: "opacity-100 translate-y-0 sm:scale-100",
        leave: "ease-in duration-200",
        leaveFrom: "opacity-100 translate-y-0 sm:scale-100",
        leaveTo: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      },
      /* @__PURE__ */ React.createElement(import_react.DialogPanel, { className: "inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: "text-center text-7xl" }, "\u{1F389}"), /* @__PURE__ */ React.createElement("div", { className: "mt-3 text-center sm:mt-5" }, /* @__PURE__ */ React.createElement(import_react.DialogTitle, { as: "h3", className: "text-lg font-medium leading-6 text-gray-900" }, "Readme Generated!"), /* @__PURE__ */ React.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React.createElement("p", { className: "text-sm text-gray-500" }, "Thanks for using readme.so! Feel free to reach out to me on", " ", /* @__PURE__ */ React.createElement(
        "a",
        {
          href: "https://twitter.com/katherinecodes",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "text-emerald-500 hover:text-emerald-400"
        },
        "Twitter"
      ), " ", "with any feedback."), /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-sm text-gray-500" }, "If you found this product helpful, consider supporting me!")))), /* @__PURE__ */ React.createElement("div", { className: "flex justify-center mx-auto mt-5 sm:mt-6" }, /* @__PURE__ */ React.createElement(
        "a",
        {
          href: "https://www.buymeacoffee.com/katherinecodes",
          target: "_blank",
          rel: "noopener noreferrer"
        },
        /* @__PURE__ */ React.createElement(
          "img",
          {
            src: "https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=katherinecodes&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff",
            alt: "Buy me a coffee"
          }
        )
      )))
    ))
  ));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DownloadModal
});
