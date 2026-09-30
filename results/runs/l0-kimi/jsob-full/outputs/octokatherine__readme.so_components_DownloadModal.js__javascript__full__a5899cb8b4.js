var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x501499, _0x4e088b) => {
  for (var _0x5239ca in _0x4e088b)
    __defProp(_0x501499, _0x5239ca, { get: _0x4e088b[_0x5239ca], enumerable: true });
};
var __copyProps = (_0x1316b4, _0x3a997a, _0x51daff, _0x44de25) => {
  if (_0x3a997a && (typeof _0x3a997a === "object" || typeof _0x3a997a === "function")) {
    for (let _0x270c10 of __getOwnPropNames(_0x3a997a))
      if (!__hasOwnProp.call(_0x1316b4, _0x270c10) && _0x270c10 !== _0x51daff)
        __defProp(_0x1316b4, _0x270c10, {
          get: () => _0x3a997a[_0x270c10],
          enumerable: !(_0x44de25 = __getOwnPropDesc(_0x3a997a, _0x270c10)) || _0x44de25.enumerable,
        });
  }
  return _0x1316b4;
};
var __toCommonJS = (_0x11fd84) =>
  __copyProps(__defProp({}, "__esModule", { value: true }), _0x11fd84);
var DownloadModal_exports = {};
var _0x341f25 = {};
_0x341f25.DownloadModal = () => DownloadModal;
__export(DownloadModal_exports, _0x341f25);
module.exports = __toCommonJS(DownloadModal_exports);
var import_react = require("react");
var DownloadModal = ({ showModal: _0x1b5988, setShowModal: _0x50db41 }) => {
  var _0x5cc377 = {
    "fixed inset-0 z-50 flex items-center justify-center": "fixed inset-0 z-50 flex items-center justify-center",
    "transition-opacity duration-300": "transition-opacity duration-300",
    "opacity-0": "opacity-0",
    "opacity-100": "opacity-100",
    "fixed inset-0 bg-black/50 backdrop-blur-sm": "fixed inset-0 bg-black/50 backdrop-blur-sm",
    "transition-all duration-300": "transition-all duration-300",
    "scale-95 opacity-0": "scale-95 opacity-0",
    "scale-100 opacity-100": "scale-100 opacity-100",
    "bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden":
      "bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden",
    "p-6": "p-6",
    "text-center": "text-center",
    "text-4xl mb-4": "text-4xl mb-4",
    "text-2xl font-bold text-gray-900 mb-2": "text-2xl font-bold text-gray-900 mb-2",
    "Download Complete!": "Download Complete!",
    "text-gray-600 mb-6": "text-gray-600 mb-6",
    "Your file has been downloaded successfully.": "Your file has been downloaded successfully.",
    "https://example.com/download": "https://example.com/download",
    "_blank": "_blank",
    "noopener noreferrer": "noopener noreferrer",
    "text-blue-600 hover:text-blue-800 underline": "text-blue-600 hover:text-blue-800 underline",
    "Click here": "Click here",
    " if it didn't open automatically.": " if it didn't open automatically.",
    "mt-6 flex justify-center": "mt-6 flex justify-center",
    "inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors":
      "inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors",
    "Close": "Close",
    "https://cdn.example.com/icon.png": "https://cdn.example.com/icon.png",
    "Download icon": "Download icon",
  };
  var _0x13ef53 = {};
  _0x13ef53.show = _0x1b5988;
  return React.createElement(
    import_react.Transition,
    _0x13ef53,
    React.createElement(
      import_react.Dialog,
      { as: _0x5cc377["fixed inset-0 z-50 flex items-center justify-center"], className: _0x5cc377["transition-opacity duration-300"], onClose: () => _0x50db41(false) },
      React.createElement(_0x5cc377["fixed inset-0 bg-black/50 backdrop-blur-sm"], { className: _0x5cc377["fixed inset-0 z-50 flex items-center justify-center"] }),
      React.createElement("span", { className: _0x5cc377["fixed inset-0 z-50 flex items-center justify-center"], "aria-hidden": _0x5cc377["opacity-0"] }, "\u200B"),
      React.createElement(
        import_react.Transition.Child,
        {
          enter: _0x5cc377["transition-all duration-300"],
          enterFrom: _0x5cc377["scale-95 opacity-0"],
          enterTo: _0x5cc377["scale-100 opacity-100"],
          leave: _0x5cc377["transition-all duration-300"],
          leaveFrom: _0x5cc377["scale-100 opacity-100"],
          leaveTo: _0x5cc377["scale-95 opacity-0"],
        },
        React.createElement(
          import_react.Dialog.Panel,
          { className: _0x5cc377["bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"] },
          React.createElement(
            _0x5cc377["p-6"],
            null,
            React.createElement("p", { className: _0x5cc377["text-center"] }, "\u{1F389}"),
            React.createElement(
              _0x5cc377["text-center"],
              null,
              React.createElement(
                import_react.Dialog.Title,
                { as: "h3", className: _0x5cc377["text-2xl font-bold text-gray-900 mb-2"] },
                _0x5cc377["Download Complete!"]
              ),
              React.createElement(
                _0x5cc377["text-gray-600 mb-6"],
                null,
                React.createElement("p", { className: _0x5cc377["text-gray-600 mb-6"] }, _0x5cc377["Your file has been downloaded successfully."], " ", React.createElement("a", { href: _0x5cc377["https://example.com/download"], target: _0x5cc377["_blank"], rel: _0x5cc377["noopener noreferrer"], className: _0x5cc377["text-blue-600 hover:text-blue-800 underline"] }, _0x5cc377["Click here"]), " ", _0x5cc377[" if it didn't open automatically."]),
                React.createElement("p", { className: _0x5cc377["text-gray-600 mb-6"] }, _0x5cc377["mt-6 flex justify-center"])
              )
            ),
            React.createElement(
              _0x5cc377["mt-6 flex justify-center"],
              null,
              React.createElement(
                "a",
                { href: _0x5cc377["https://example.com/download"], target: _0x5cc377["_blank"], rel: _0x5cc377["noopener noreferrer"] },
                React.createElement(_0x5cc377["inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"], { src: _0x5cc377["https://cdn.example.com/icon.png"], alt: _0x5cc377["Download icon"] })
              )
            )
          )
        )
      )
    )
  );
};
var _0x46aa04 = {};
_0x46aa04.DownloadModal = DownloadModal;
module.exports = _0x46aa04;
