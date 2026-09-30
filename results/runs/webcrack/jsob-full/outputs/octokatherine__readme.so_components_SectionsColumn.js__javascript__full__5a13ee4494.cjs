var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (_0x312049, _0x39d1e6) => {
  for (var _0x2e4ad5 in _0x39d1e6) {
    __defProp(_0x312049, _0x2e4ad5, {
      get: _0x39d1e6[_0x2e4ad5],
      enumerable: true
    });
  }
};
var __copyProps = (_0x2ff985, _0x575762, _0x1bf5fc, _0x1a21bd) => {
  if (_0x575762 && typeof _0x575762 === "object" || typeof _0x575762 === "function") {
    for (let _0x9bf469 of __getOwnPropNames(_0x575762)) {
      if (!__hasOwnProp.call(_0x2ff985, _0x9bf469) && _0x9bf469 !== _0x1bf5fc) {
        __defProp(_0x2ff985, _0x9bf469, {
          get: () => _0x575762[_0x9bf469],
          enumerable: !(_0x1a21bd = __getOwnPropDesc(_0x575762, _0x9bf469)) || _0x1a21bd.enumerable
        });
      }
    }
  }
  return _0x2ff985;
};
const _0x4d464d = {
  value: true
};
var __toCommonJS = _0x2c60d7 => __copyProps(__defProp({}, "__esModule", _0x4d464d), _0x2c60d7);
var SectionsColumn_exports = {};
const _0x41e539 = {
  SectionsColumn: () => SectionsColumn
};
__export(SectionsColumn_exports, _0x41e539);
module.exports = __toCommonJS(SectionsColumn_exports);
var import_react = require("react");
function useLocalStorage() {
  const [_0x572680, _0x234840] = (0, import_react.useState)(null);
  const [_0x4b53c1, _0x18ab31] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
    const _0x1ee3bc = localStorage.getItem("readme-backup");
    if (_0x1ee3bc) {
      _0x234840(JSON.parse(_0x1ee3bc));
    }
  }, []);
  const _0x5558b1 = _0x12e4ea => {
    try {
      if (_0x4b53c1) {
        clearTimeout(_0x4b53c1);
      }
      _0x18ab31(setTimeout(() => {
        localStorage.setItem("readme-backup", JSON.stringify(_0x12e4ea));
      }, 1000));
    } catch (_0x53b657) {
      console.error("Failed to create local backup");
    }
  };
  const _0x1877be = () => {
    try {
      localStorage.removeItem("readme-backup");
    } catch (_0x23b53a) {
      console.error("Failed to delete local backup");
    }
  };
  const _0x1311ce = {
    backup: _0x572680,
    saveBackup: _0x5558b1,
    deleteBackup: _0x1877be
  };
  return _0x1311ce;
}
var import_react2 = require("react");
var import_sortable = require("@dnd-kit/sortable");
var import_utilities = require("@dnd-kit/utilities");
var SortableItem = (0, import_react2.memo)(function SortableItem2(_0x199d4a) {
  const _0xcb8b54 = {
    id: _0x199d4a.id
  };
  const {
    attributes: _0x1b81be,
    listeners: _0x3b4090,
    setNodeRef: _0x4b258e,
    transform: _0x4ec042,
    transition: _0x207154
  } = (0, import_sortable.useSortable)(_0xcb8b54);
  const _0x17214b = {
    transform: import_utilities.CSS.Transform.toString(_0x4ec042),
    transition: _0x207154
  };
  const _0x5695fb = () => {
    localStorage.setItem("current-focused-slug", _0x199d4a.id);
    _0x199d4a.setFocusedSectionSlug(_0x199d4a.id);
  };
  const _0x596d21 = _0x1f65e0 => {
    _0x199d4a.onDeleteSection(_0x1f65e0, _0x199d4a.section.slug);
  };
  const _0x4d6fb8 = _0x3ac577 => {
    const _0x4e6e77 = window.confirm("The section will be reset to default template; to continue, click OK");
    if (_0x4e6e77 === true) {
      _0x199d4a.onResetSection(_0x3ac577, _0x199d4a.section.slug);
    }
  };
  const _0x52dfbe = _0x3e68b7 => {
    if (_0x3e68b7.key.toLowerCase() === "enter") {
      _0x5695fb();
    }
  };
  return <li ref={_0x4b258e} style={_0x17214b} {..._0x1b81be} onClick={_0x5695fb} onKeyUp={_0x52dfbe} className={"bg-white shadow rounded-md pl-1 pr-14 py-2 flex items-center cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 relative select-none transition-colors " + (_0x199d4a.section.slug === _0x199d4a.focusedSectionSlug ? "ring-2 ring-emerald-400" : "")}><button type="button" className="p-2 -m-1 mr-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400" {..._0x3b4090}><img className="w-5 h-5" src="drag.svg" alt="Drag to reorder" /></button><p>{_0x199d4a.section.name}</p>{_0x199d4a.section.slug === _0x199d4a.focusedSectionSlug && <><button className="p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-8" type="button" aria-label="Reset section" onClick={_0x4d6fb8}><img className="w-auto h-5" src="reset.svg" alt="Reset section" /></button><button className="p-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 absolute right-1" type="button" aria-label="Delete section" onClick={_0x596d21}><img className="w-auto h-5" src="trash.svg" alt="Delete section" /></button></>}</li>;
});
var import_react3 = require("react");
var import_react4 = require("@headlessui/react");
var CustomSection = ({
  setTemplates: _0x3e55e6,
  setSelectedSectionSlugs: _0x2bf84d,
  setFocusedSectionSlug: _0x4f15f7,
  setpageRefreshed: _0x1f3056,
  setAddAction: _0xdc85b5
}) => {
  const [_0x4f119a, _0x2a4ef4] = (0, import_react3.useState)(false);
  const [_0x5846b9, _0x24097b] = (0, import_react3.useState)("");
  const {
    saveBackup: _0x2b0dcd
  } = useLocalStorage();
  const _0x129bfc = (0, import_react3.useRef)(null);
  const _0x16ab00 = _0x2b977e => {
    if (_0x2b977e) {
      _0x2b977e.preventDefault();
    }
    if (!_0x5846b9) {
      return;
    }
    _0x2a4ef4(false);
    const _0x58319d = {
      slug: "custom-" + _0x5846b9.toLowerCase().replace(/\s/g, "-"),
      name: _0x5846b9,
      markdown: "\n## " + _0x5846b9
    };
    localStorage.setItem("current-focused-slug", _0x58319d.slug);
    _0x3e55e6(_0x4da0aa => {
      const _0x18b478 = [..._0x4da0aa, _0x58319d];
      _0x2b0dcd(_0x18b478);
      return _0x18b478;
    });
    _0x1f3056(false);
    _0xdc85b5(true);
    _0x2bf84d(_0x2f3af9 => [..._0x2f3af9, _0x58319d.slug]);
    _0x4f15f7(localStorage.getItem("current-focused-slug"));
  };
  const _0x54ec6c = {
    show: _0x4f119a
  };
  const _0x4d5a0c = {
    onSubmit: _0x16ab00
  };
  return <>{React.createElement(import_react4.Transition, _0x54ec6c, <import_react4.Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={_0x129bfc} onClose={() => _0x2a4ef4(false)}><div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"><import_react4.TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"><import_react4.DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" /></import_react4.TransitionChild><span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span><import_react4.TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"><import_react4.DialogPanel className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">{React.createElement("form", _0x4d5a0c, <div className="mt-3 text-center sm:mt-5"><import_react4.DialogTitle as="h3" className="text-lg leading-6 font-medium text-gray-900">New Custom Section</import_react4.DialogTitle><div className="my-4"><input ref={_0x129bfc} type="text" name="title" id="title" onChange={_0x5305c7 => _0x24097b(_0x5305c7.target.value)} className="shadow-sm p-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 block w-full sm:text-sm border border-gray-300 rounded-md" placeholder="Section Title" aria-label="Section title" /></div></div>)}<div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense"><button type="button" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-base font-medium text-white hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:col-start-2 sm:text-sm disabled:opacity-50" disabled={!_0x5846b9} onClick={_0x16ab00}>Add Section</button><button type="button" className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 sm:mt-0 sm:col-start-1 sm:text-sm" onClick={() => _0x2a4ef4(false)}>Cancel</button></div></import_react4.DialogPanel></import_react4.TransitionChild></div></import_react4.Dialog>)}<div className="mb-3"><button className="flex items-center justify-center w-full h-full py-2 pl-3 pr-6 bg-white font-bold rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors" type="button" onClick={() => _0x2a4ef4(true)}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg><span className="ml-1">Custom Section</span></button></div></>;
};
var CustomSection_default = CustomSection;
var SectionFilter = ({
  searchFilter: _0x7e14cd,
  setSearchFilter: _0x5eadda
}) => {
  return <input type="text" placeholder="Search for a section" aria-label="Search for a section" className="mb-3 w-full py-2 pl-3 pr-6 bg-white rounded-md shadow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400" data-testid="slugs-filter" value={_0x7e14cd} onChange={_0x5aa2e2 => _0x5eadda(_0x5aa2e2.target.value)} />;
};
var SectionFilter_default = SectionFilter;
var import_core = require("@dnd-kit/core");
var import_modifiers = require("@dnd-kit/modifiers");
var import_sortable2 = require("@dnd-kit/sortable");
var import_react5 = require("react");
var kebabCaseToTitleCase = _0x122291 => {
  return _0x122291.split("-").map(_0x471853 => {
    return _0x471853.slice(0, 1).toUpperCase() + _0x471853.slice(1);
  }).join(" ");
};
var SectionsColumn = ({
  selectedSectionSlugs: _0x2ad015,
  setSelectedSectionSlugs: _0x2220cc,
  sectionSlugs: _0x258b7b,
  setSectionSlugs: _0x3e5937,
  setFocusedSectionSlug: _0x149175,
  focusedSectionSlug: _0x40fb7d,
  templates: _0x44b3d0,
  originalTemplate: _0x6df68c,
  setTemplates: _0x53cef8,
  getTemplate: _0xe7667b
}) => {
  const _0x404dca = {
    coordinateGetter: import_sortable2.sortableKeyboardCoordinates
  };
  const _0x3efd23 = (0, import_core.useSensors)((0, import_core.useSensor)(import_core.MouseSensor), (0, import_core.useSensor)(import_core.TouchSensor), (0, import_core.useSensor)(import_core.KeyboardSensor, _0x404dca));
  const [_0x2a73a3, _0x283da9] = (0, import_react5.useState)(false);
  const [_0x361c6a, _0x22e0f1] = (0, import_react5.useState)(false);
  const [_0x5a9b87, _0x4ec2b3] = (0, import_react5.useState)([]);
  const [_0x368c5a, _0x7d83c7] = (0, import_react5.useState)("");
  const [_0xf228af, _0x2a1d70] = (0, import_react5.useState)([]);
  const {
    saveBackup: _0x28ab78,
    deleteBackup: _0x36fdfc
  } = useLocalStorage();
  (0, import_react5.useEffect)(() => {
    const _0x4bf26f = localStorage.getItem("current-slug-list") === null ? "title-and-description" : localStorage.getItem("current-slug-list");
    _0x4ec2b3(_0x4bf26f);
    if (_0x4bf26f.length > 0) {
      _0x283da9(true);
      const _0x382aef = _0x4bf26f.split(",");
      _0x382aef.forEach(function (_0x3aa7fe) {
        _0x3e5937(_0x3f94fa => _0x3f94fa.filter(_0x21d88a => _0x21d88a !== _0x3aa7fe));
      });
      _0x2220cc(_0x382aef);
      _0x149175(_0x382aef[0]);
      localStorage.setItem("current-focused-slug", _0x382aef[0]);
    }
  }, []);
  const _0x470410 = (_0xa02c51, _0x30552f) => {
    return _0xa02c51.filter(_0x3edf1c => _0x3edf1c !== _0x30552f);
  };
  const _0x19cb47 = (_0xac3cab, _0x5b21d7) => {
    localStorage.setItem("current-focused-slug", _0x5b21d7);
    _0x283da9(false);
    _0x22e0f1(true);
    _0x3e5937(_0x15eefc => _0x470410(_0x15eefc, _0x5b21d7));
    _0x2a1d70(_0x2ad3f0 => _0x470410(_0x2ad3f0, _0x5b21d7));
    _0x2220cc(_0x3d40b4 => [..._0x3d40b4, _0x5b21d7]);
    _0x149175(localStorage.getItem("current-focused-slug"));
    _0x256f51();
  };
  (0, import_react5.useEffect)(() => {
    localStorage.setItem("current-slug-list", _0x2ad015);
  }, [_0x2ad015]);
  const _0x382455 = _0x1a4c68 => {
    const {
      active: _0x321372,
      over: _0x204610
    } = _0x1a4c68;
    if (_0x321372.id !== _0x204610.id) {
      _0x2220cc(_0x3c117b => {
        const _0x44972e = _0x3c117b.findIndex(_0x5d5e51 => _0x5d5e51 === _0x321372.id);
        const _0x4655b3 = _0x3c117b.findIndex(_0x74f518 => _0x74f518 === _0x204610.id);
        return (0, import_sortable2.arrayMove)(_0x3c117b, _0x44972e, _0x4655b3);
      });
    }
  };
  const _0x596929 = (_0x2d4c07, _0x49d0b0) => {
    _0x2d4c07.stopPropagation();
    _0x2220cc(_0x30929b => _0x30929b.filter(_0x3da1a7 => _0x3da1a7 !== _0x49d0b0));
    _0x3e5937(_0x3f0b5c => [..._0x3f0b5c, _0x49d0b0]);
    _0x149175(null);
    localStorage.setItem("current-focused-slug", "noEdit");
  };
  const _0x23bffe = (_0x30e90b, _0x125ac0) => {
    _0x30e90b.stopPropagation();
    let _0x17e028;
    if (_0x125ac0.slice(0, 6) === "custom") {
      const _0xf122d5 = kebabCaseToTitleCase(_0x125ac0.slice(6, _0x125ac0.length));
      const _0xcdb0c2 = {
        slug: _0x125ac0,
        name: _0xf122d5,
        markdown: "\n## " + _0xf122d5
      };
      _0x17e028 = _0xcdb0c2;
    } else {
      _0x17e028 = _0x6df68c.find(_0xd04a75 => _0xd04a75.slug === _0x125ac0);
    }
    const _0x4973f0 = _0x44b3d0.map(_0x530993 => {
      if (_0x530993.slug === _0x17e028.slug) {
        return _0x17e028;
      }
      return _0x530993;
    });
    _0x53cef8(_0x4973f0);
    _0x28ab78(_0x4973f0);
  };
  const _0x22fcb0 = () => {
    const _0x1850ca = localStorage.getItem("current-slug-list");
    const _0x22b893 = window.confirm("All sections of your readme will be removed; to continue, click OK");
    if (_0x22b893 === true) {
      const _0x8ba5a3 = _0x1850ca ? _0x1850ca.split(",") : [];
      _0x3e5937(_0x2aba42 => [..._0x2aba42, ..._0x8ba5a3].filter(_0x512e06 => _0x512e06 !== "title-and-description"));
      _0x2220cc(["title-and-description"]);
      _0x149175("title-and-description");
      localStorage.setItem("current-focused-slug", "noEdit");
      _0x53cef8(_0x6df68c);
      _0x36fdfc();
    }
  };
  const _0x10b9f6 = (0, import_react5.useMemo)(() => {
    if (_0x2a73a3 || _0x361c6a) {
      return [...new Set(_0x2ad015)];
    } else {
      return _0x2ad015;
    }
  }, [_0x2ad015, _0x2a73a3, _0x361c6a]);
  const _0x3ab933 = (0, import_react5.useMemo)(() => {
    let _0x42bbf6 = [..._0x258b7b];
    if (_0x2a73a3 && _0x5a9b87.indexOf("title-and-description") === -1) {
      if (!_0x42bbf6.includes("title-and-description")) {
        _0x42bbf6.push("title-and-description");
      }
    }
    const _0x15d308 = _0xf228af.length ? [..._0xf228af].sort() : [..._0x42bbf6].sort();
    if (_0x2a73a3 || _0x361c6a) {
      return [...new Set(_0x15d308)];
    } else {
      return _0x15d308;
    }
  }, [_0x258b7b, _0xf228af, _0x2a73a3, _0x361c6a, _0x5a9b87]);
  const _0x1ad7ca = _0x3a415b => {
    const _0x5720d0 = _0x258b7b.filter(_0x185030 => {
      return _0xe7667b(_0x185030).name.toLowerCase().includes(_0x3a415b.toLowerCase());
    });
    if (_0x5720d0.length) {
      return _0x5720d0;
    } else {
      return [undefined];
    }
  };
  const _0x256f51 = () => _0x7d83c7("");
  (0, import_react5.useEffect)(() => {
    if (!_0x368c5a) {
      _0x2a1d70([]);
      return;
    }
    const _0x5251af = _0x1ad7ca(_0x368c5a.trim());
    _0x2a1d70(_0x5251af);
  }, [_0x368c5a]);
  const _0x46822e = {
    items: _0x10b9f6
  };
  const _0x195ee5 = {
    searchFilter: _0x368c5a,
    setSearchFilter: _0x7d83c7
  };
  return <div className="sections w-full md:w-64 lg:w-80"><h3 className="px-1 text-sm font-medium border-b-2 border-transparent text-emerald-500 whitespace-nowrap focus:outline-none">Sections<button className="focus:outline-none focus:ring-2 focus:ring-emerald-400 float-right hover:text-emerald-600 transition-colors" type="button" onClick={_0x22fcb0}><span className="pl-2 float-right">Reset</span><img className="w-auto h-5 inline-block" src="reset.svg" alt="Reset" /></button></h3><div className="px-3 pr-4 overflow-y-scroll full-screen">{_0x2ad015.length > 0 && <h4 className="mb-3 text-xs leading-6 text-gray-900">Click on a section below to edit the contents</h4>}<ul className="mb-12 space-y-3"><import_core.DndContext sensors={_0x3efd23} collisionDetection={import_core.closestCenter} onDragEnd={_0x382455} modifiers={[import_modifiers.restrictToVerticalAxis]}>{React.createElement(import_sortable2.SortableContext, _0x46822e, _0x10b9f6.map(_0x4eb827 => {
            const _0xa45146 = _0xe7667b(_0x4eb827);
            if (_0xa45146) {
              const _0x11eb15 = {
                key: _0x4eb827,
                id: _0x4eb827,
                section: _0xa45146,
                focusedSectionSlug: _0x40fb7d,
                setFocusedSectionSlug: _0x149175,
                onDeleteSection: _0x596929,
                onResetSection: _0x23bffe
              };
              return React.createElement(SortableItem, _0x11eb15);
            }
          }))}</import_core.DndContext></ul>{_0x258b7b.length > 0 && <h4 className="mb-3 text-xs leading-6 text-gray-900 overflow-ellipsis">Click on a section below to add it to your readme</h4>}{React.createElement(SectionFilter_default, _0x195ee5)}<CustomSection_default setSelectedSectionSlugs={_0x2220cc} setFocusedSectionSlug={_0x149175} setpageRefreshed={_0x283da9} setAddAction={_0x22e0f1} setTemplates={_0x53cef8} /><ul className="mb-12 space-y-3">{_0x3ab933.map(_0x34c9a1 => {
          if (_0x34c9a1 === undefined) {
            return React.createElement("h4", {
              className: "mb-3 text-xs leading-6 text-gray-900",
              key: "unavailable-section"
            }, "The section you're looking for is unavailable");
          } else {
            const _0x512821 = _0xe7667b(_0x34c9a1);
            if (_0x512821) {
              const _0x3e967b = {
                key: _0x34c9a1
              };
              return React.createElement("li", _0x3e967b, <button className="flex items-center w-full h-full py-2 pl-3 pr-6 bg-white rounded-md shadow cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors" type="button" onClick={_0xda8632 => _0x19cb47(_0xda8632, _0x34c9a1)}><span>{_0x512821.name}</span></button>);
            }
          }
        })}</ul></div></div>;
};
const _0x3fc201 = {
  SectionsColumn: SectionsColumn
};
if (0) {
  module.exports = _0x3fc201;
}