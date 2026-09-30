var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x1dc831, _0x1c479b) => {
  for (var _0x573e37 in _0x1c479b) {
    __defProp(_0x1dc831, _0x573e37, {
      get: _0x1c479b[_0x573e37],
      enumerable: true
    });
  }
};
var __copyProps = (_0x4320c9, _0x24162d, _0x5bf8fd, _0x21ca3f) => {
  if (_0x24162d && typeof _0x24162d === "object" || typeof _0x24162d === "function") {
    for (let _0x4da212 of __getOwnPropNames(_0x24162d)) {
      if (!__hasOwnProp.call(_0x4320c9, _0x4da212) && _0x4da212 !== _0x5bf8fd) {
        __defProp(_0x4320c9, _0x4da212, {
          get: () => _0x24162d[_0x4da212],
          enumerable: !(_0x21ca3f = __getOwnPropDesc(_0x24162d, _0x4da212)) || _0x21ca3f.enumerable
        });
      }
    }
  }
  return _0x4320c9;
};
var _0x2649af = {
  value: true
};
var __toCommonJS = _0x39ef66 => __copyProps(__defProp({}, "__esModule", _0x2649af), _0x39ef66);
var Tabs_exports = {};
var _0x5abfa9 = {
  default: () => Tabs_default
};
__export(Tabs_exports, _0x5abfa9);
module.exports = __toCommonJS(Tabs_exports);
var Heading = ({
  children: _0x418de9,
  className = ""
}) => {
  var _0x55e2de = {
    className: "border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none \n    text-emerald-500 " + className
  };
  return React.createElement("h3", _0x55e2de, _0x418de9);
};
var Tab = ({
  children: _0x531585,
  isActive: _0x465584,
  className = "",
  onClick = () => null
}) => {
  return <button onClick={onClick} type="button" className={"border-transparent whitespace-nowrap px-1 border-b-2 font-medium text-sm focus:outline-none \n    " + (_0x465584 ? "text-emerald-500" : "text-gray-500 hover:text-gray-700") + " " + className}>{_0x531585}</button>;
};
var _0x4b5311 = {
  Heading: Heading,
  Tab: Tab
};
var ColumnHeader = _0x4b5311;
var ColumnHeader_default = ColumnHeader;
var TAB = {
  EDITOR: "editor",
  PREVIEW: "preview",
  RAW: "raw"
};
var Tabs = ({
  selectedTab: _0x30ab23,
  setSelectedTab: _0x276d56
}) => {
  return <div className="flex"><div className="flex flex-0 pb-3"><ColumnHeader_default.Tab isActive={_0x30ab23 === TAB.EDITOR} className="flex-1" onClick={() => _0x276d56(TAB.EDITOR)}>Editor</ColumnHeader_default.Tab></div><div className="flex flex-1 justify-end border-b border-gray-200"><nav className="-mb-px flex space-x-8" aria-label="Tabs"><ColumnHeader_default.Tab isActive={_0x30ab23 === TAB.PREVIEW} className="pb-3" onClick={() => _0x276d56(TAB.PREVIEW)}>Preview</ColumnHeader_default.Tab><ColumnHeader_default.Tab isActive={_0x30ab23 === TAB.RAW} className="pb-3" onClick={() => _0x276d56(TAB.RAW)}>Raw</ColumnHeader_default.Tab></nav></div></div>;
};
var Tabs_default = Tabs;