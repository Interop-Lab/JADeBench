"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (let name in all)
    __defProp(target, name, { get: all[name], enumerable: true, configurable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = mod => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/DownloadModal.ts
var DownloadModal_exports = {};
__export(DownloadModal_exports, {
  DownloadModal: () => DownloadModal
});
module.exports = __toCommonJS(DownloadModal_exports);

// node_modules/@headlessui/react/dist/headlessui.esm.js
var import_react = require("@headlessui/react");

// src/DownloadModal.ts
var DownloadModal = ({ open, onClose, onDownload }) => {
  return /* @__PURE__ */ import_react.createElement(import_react.Fragment, null, /* @__PURE__ */ import_react.createElement(
    "div",
    {
      className: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${open ? "block" : "hidden"}`,
      onClick: onClose
    },
    /* @__PURE__ */ import_react.createElement(
      "div",
      {
        className: "bg-white rounded-lg p-6 w-96 shadow-xl",
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ import_react.createElement("h2", { className: "text-lg font-semibold mb-4" }, "Download"),
      /* @__PURE__ */ import_react.createElement("p", { className: "text-sm text-gray-600 mb-4" }, "Click below to download your file."),
      /* @__PURE__ */ import_react.createElement(
        "button",
        {
          className: "w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition",
          onClick: onDownload
        },
        "Download"
      )
    )
  ));
};
