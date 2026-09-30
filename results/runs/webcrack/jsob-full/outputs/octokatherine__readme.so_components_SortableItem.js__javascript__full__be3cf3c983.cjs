var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0xbfa70a, _0x2a9742) => {
  for (var _0x23a8f5 in _0x2a9742) {
    __defProp(_0xbfa70a, _0x23a8f5, {
      get: _0x2a9742[_0x23a8f5],
      enumerable: true
    });
  }
};
var __copyProps = (_0x34206d, _0x3aaf63, _0x128dfe, _0x39f4f3) => {
  if (_0x3aaf63 && typeof _0x3aaf63 === "object" || typeof _0x3aaf63 === "function") {
    for (let _0x26601c of __getOwnPropNames(_0x3aaf63)) {
      if (!__hasOwnProp.call(_0x34206d, _0x26601c) && _0x26601c !== _0x128dfe) {
        __defProp(_0x34206d, _0x26601c, {
          get: () => _0x3aaf63[_0x26601c],
          enumerable: !(_0x39f4f3 = __getOwnPropDesc(_0x3aaf63, _0x26601c)) || _0x39f4f3.enumerable
        });
      }
    }
  }
  return _0x34206d;
};
var _0x122bd5 = {
  value: true
};
var __toCommonJS = _0x2f95e8 => __copyProps(__defProp({}, "__esModule", _0x122bd5), _0x2f95e8);
var SortableItem_exports = {};
var _0x50d5a3 = {
  SortableItem: () => SortableItem
};
__export(SortableItem_exports, _0x50d5a3);
module.exports = __toCommonJS(SortableItem_exports);
var import_react = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");
var SortableItem = (0, import_react.memo)(function SortableItem2(_0x17b55b) {
  var _0x21e4c5 = {
    id: _0x17b55b.id
  };
  const {
    attributes: _0x5b0baf,
    listeners: _0x2dfd19,
    setNodeRef: _0x334ec1,
    transform: _0x2b9fad,
    transition: _0x12f346
  } = (0, import_sortable.useSortable)(_0x21e4c5);
  const _0x34b655 = {
    transform: import_utilities.CSS.Transform.toString(_0x2b9fad),
    transition: _0x12f346
  };
  const _0x492f74 = () => {
    localStorage.setItem("current-focused-slug", _0x17b55b.id);
    _0x17b55b.setFocusedSectionSlug(_0x17b55b.id);
  };
  const _0x3fc59c = _0x5ecdad => {
    _0x17b55b.onDeleteSection(_0x5ecdad, _0x17b55b.section.slug);
  };
  const _0x2706fd = _0x3b3ac5 => {
    const _0x2f2dc9 = window.confirm("The section will be reset to default template; to continue, click OK");
    if (_0x2f2dc9 === true) {
      _0x17b55b.onResetSection(_0x3b3ac5, _0x17b55b.section.slug);
    }
  };
  const _0x5b5c35 = _0x35c8a9 => {
    if (_0x35c8a9.key.toLowerCase() === "enter") {
      _0x492f74();
    }
  };
  return <li ref={_0x334ec1} style={_0x34b655} {..._0x5b0baf} onClick={_0x492f74} onKeyUp={_0x5b5c35} className={"bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors " + (_0x17b55b.section.slug === _0x17b55b.focusedSectionSlug ? "ring-2 ring-emerald-400" : "")}><button type="button" className="p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400" {..._0x2dfd19}><img className="w-5 h-5" src="drag.svg" alt="Drag to reorder" /></button><p>{_0x17b55b.section.name}</p>{_0x17b55b.section.slug === _0x17b55b.focusedSectionSlug && <><button className="p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8" type="button" aria-label="Reset section" onClick={_0x2706fd}><img className="w-auto h-5" src="reset.svg" alt="Reset section" /></button><button className="p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1" type="button" aria-label="Delete section" onClick={_0x3fc59c}><img className="w-auto h-5" src="trash.svg" alt="Delete section" /></button></>}</li>;
});
var _0x4ca4ab = {
  SortableItem: SortableItem
};
if (0) {
  module.exports = _0x4ca4ab;
}