var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x501499, _0x4e088b) => {
  for (var _0x5239ca in _0x4e088b) {
    __defProp(_0x501499, _0x5239ca, {
      get: _0x4e088b[_0x5239ca],
      enumerable: true
    });
  }
};
var __copyProps = (_0x1316b4, _0x3a997a, _0x51daff, _0x44de25) => {
  if (_0x3a997a && typeof _0x3a997a === "object" || typeof _0x3a997a === "function") {
    for (let _0x270c10 of __getOwnPropNames(_0x3a997a)) {
      if (!__hasOwnProp.call(_0x1316b4, _0x270c10) && _0x270c10 !== _0x51daff) {
        __defProp(_0x1316b4, _0x270c10, {
          get: () => _0x3a997a[_0x270c10],
          enumerable: !(_0x44de25 = __getOwnPropDesc(_0x3a997a, _0x270c10)) || _0x44de25.enumerable
        });
      }
    }
  }
  return _0x1316b4;
};
var _0x1fa9c3 = {
  value: true
};
var __toCommonJS = _0x11fd84 => __copyProps(__defProp({}, "__esModule", _0x1fa9c3), _0x11fd84);
var DownloadModal_exports = {};
var _0x341f25 = {
  DownloadModal: () => DownloadModal
};
__export(DownloadModal_exports, _0x341f25);
module.exports = __toCommonJS(DownloadModal_exports);
var import_react = require("@headlessui/react");
var DownloadModal = ({
  showModal: _0x1b5988,
  setShowModal: _0x50db41
}) => {
  var _0x13ef53 = {
    show: _0x1b5988
  };
  return React.createElement(import_react.Transition, _0x13ef53, <import_react.Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={() => _0x50db41(false)}><div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"><import_react.TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><import_react.DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" /></import_react.TransitionChild><span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span><import_react.TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"><import_react.DialogPanel className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom bg-white rounded-lg shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6"><div><p className="text-center text-7xl">🎉</p><div className="mt-3 text-center sm:mt-5"><import_react.DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">Readme Generated!</import_react.DialogTitle><div className="mt-2"><p className="text-sm text-gray-500">Thanks for using readme.so! Feel free to reach out to me on <a href="https://twitter.com/katherinecodes" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">Twitter</a> with any feedback.</p><p className="mt-3 text-sm text-gray-500">If you found this product helpful, consider supporting me!</p></div></div></div><div className="flex justify-center mx-auto mt-5 sm:mt-6"><a href="https://www.buymeacoffee.com/katherinecodes" target="_blank" rel="noopener noreferrer"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=katherinecodes&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" alt="Buy me a coffee" /></a></div></import_react.DialogPanel></import_react.TransitionChild></div></import_react.Dialog>);
};
var _0x46aa04 = {
  DownloadModal: DownloadModal
};
if (0) {
  module.exports = _0x46aa04;
}