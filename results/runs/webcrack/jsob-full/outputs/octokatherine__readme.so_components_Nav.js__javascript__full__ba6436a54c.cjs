var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x5b592e, _0x357998) => {
  for (var _0x289523 in _0x357998) {
    __defProp(_0x5b592e, _0x289523, {
      get: _0x357998[_0x289523],
      enumerable: true
    });
  }
};
var __copyProps = (_0x2b323d, _0x513bc7, _0x4dc31c, _0x5075eb) => {
  if (_0x513bc7 && typeof _0x513bc7 === "object" || typeof _0x513bc7 === "function") {
    for (let _0x232ec5 of __getOwnPropNames(_0x513bc7)) {
      if (!__hasOwnProp.call(_0x2b323d, _0x232ec5) && _0x232ec5 !== _0x4dc31c) {
        __defProp(_0x2b323d, _0x232ec5, {
          get: () => _0x513bc7[_0x232ec5],
          enumerable: !(_0x5075eb = __getOwnPropDesc(_0x513bc7, _0x232ec5)) || _0x5075eb.enumerable
        });
      }
    }
  }
  return _0x2b323d;
};
var __toESM = (_0x3de005, _0x41ffcf, _0x24c160) => {
  _0x24c160 = _0x3de005 != null ? __create(__getProtoOf(_0x3de005)) : {};
  return __copyProps(_0x41ffcf || !_0x3de005 || !_0x3de005.__esModule ? __defProp(_0x24c160, "default", {
    value: _0x3de005,
    enumerable: true
  }) : _0x24c160, _0x3de005);
};
var _0x3d1a3f = {
  value: true
};
var __toCommonJS = _0x2cd8e0 => __copyProps(__defProp({}, "__esModule", _0x3d1a3f), _0x2cd8e0);
var Nav_exports = {};
var _0xd2b1b3 = {
  Nav: () => Nav
};
__export(Nav_exports, _0xd2b1b3);
module.exports = __toCommonJS(Nav_exports);
var _0x10abda = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeMiterlimit: "10",
  strokeWidth: "30",
  d: "M80 160h352M80 256h352M80 352h352"
};
var Menu = ({
  className: _0x84ca5c
}) => <svg className={_0x84ca5c} viewBox="0 0 512 512"><title>Menu</title>{React.createElement("path", _0x10abda)}</svg>;
var Menu_default = Menu;
var _0x5a0b49 = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  strokeWidth: "32",
  d: "M368 368L144 144M368 144L144 368"
};
var Close = ({
  className: _0x48de5c
}) => <svg xmlns="http://www.w3.org/2000/svg" className={_0x48de5c} viewBox="0 0 512 512"><title>Close</title>{React.createElement("path", _0x5a0b49)}</svg>;
var Close_default = Close;
var import_react = require("react");
function useDeviceDetect() {
  const [_0x2b582a, _0x6b8674] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const _0x1d9592 = typeof window.navigator === "undefined" ? "" : navigator.userAgent;
    const _0x4c812b = Boolean(_0x1d9592.match(/Mobi|Android|BlackBerry|iPhone/i));
    _0x6b8674(_0x4c812b);
  }, []);
  var _0x127cff = {
    isMobile: _0x2b582a
  };
  return _0x127cff;
}
var import_link = __toESM(require("next/link"));
var Nav = ({
  selectedSectionSlugs: _0x269155,
  setShowModal: _0x509fd3,
  getTemplate: _0x5d741d,
  onMenuClick: _0x1163d2,
  isDrawerOpen: _0x51a3ab,
  focusedSectionSlug: _0x44a196
}) => {
  const _0x3ebc18 = _0x269155.reduce((_0x427d44, _0x15c927) => {
    const _0x458163 = _0x5d741d(_0x15c927);
    if (_0x458163) {
      return "" + _0x427d44 + _0x458163.markdown;
    } else {
      return _0x427d44;
    }
  }, "");
  const {
    isMobile: _0x5158fb
  } = useDeviceDetect();
  const _0x3f1bbe = () => {
    const _0x41baf3 = document.createElement("a");
    const _0x5645c8 = new Blob([_0x3ebc18]);
    _0x41baf3.href = URL.createObjectURL(_0x5645c8);
    _0x41baf3.download = "README.md";
    _0x41baf3.click();
    if (_0x5158fb && _0x51a3ab) {
      _0x1163d2();
    }
    _0x509fd3(true);
  };
  return <nav className="flex justify-between p-4 bg-gray-800 align-center w-full"><import_link.default href="/" className="focus:outline-none focus:ring-2 focus:ring-emerald-400 flex items-center"><img className="w-auto h-12" src="readme.svg" alt="readme.so logo" /></import_link.default><div className="flex flex-row-reverse md:flex-row"><button className="focus:outline-none focus:ring-2 focus:ring-emerald-400" aria-label={_0x51a3ab ? "Close menu" : "Open menu"} onClick={_0x1163d2}>{_0x51a3ab ? <Close_default className="w-10 h-10 md:hidden fill-current text-emerald-500" /> : <Menu_default className="w-10 h-10 md:hidden fill-current text-emerald-500" />}</button><button type="button" aria-label="Download Markdown" className="flex flex-row relative items-center mr-4 md:mr-0 px-4 py-2 text-sm font-bold tracking-wide text-white border border-transparent rounded-md shadow-sm bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500" onClick={_0x3f1bbe}><img className="w-auto h-6 cursor-pointer" src="download.svg" alt="Download" /><span className="hidden md:inline-block ml-2">Download</span></button></div></nav>;
};
var _0x233157 = {
  Nav: Nav
};
if (0) {
  module.exports = _0x233157;
}