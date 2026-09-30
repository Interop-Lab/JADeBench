var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (_0x53d904, _0x16cf15) => function _0x254a62() {
  if (!_0x16cf15) {
    (0, _0x53d904[__getOwnPropNames(_0x53d904)[0]])((_0x16cf15 = {
      exports: {}
    }).exports, _0x16cf15);
  }
  return _0x16cf15.exports;
};
var require_native = __commonJS({
  "../work/0xranx__OpenContext/src/core/native.js"(_0x2e759c, _0x2ae1f8) {
    var _0xb64f14 = require("path");
    var _0x8a3d8f = null;
    var _0x3dd2f0 = null;
    var _0x3eab42 = null;
    var _0x24de45 = null;
    var _0x3d5b40 = false;
    var _0x430468 = null;
    function _0x217122() {
      if (_0x3d5b40) {
        return;
      }
      _0x3d5b40 = true;
      try {
        _0x8a3d8f = require("@aicontextlab/core-native");
        _0x430468 = "npm";
        return;
      } catch (_0x3fd5a6) {
        _0x3eab42 = _0x3fd5a6;
      }
      try {
        const _0x4a1e47 = _0xb64f14.join(__dirname, "../../crates/opencontext-node");
        _0x8a3d8f = require(_0x4a1e47);
        _0x430468 = "local";
      } catch (_0x58bbf4) {
        _0x24de45 = _0x58bbf4;
        _0x3dd2f0 = _0x58bbf4;
      }
    }
    _0x217122();
    function _0x4482eb() {
      return _0x8a3d8f !== null;
    }
    function _0xd5d88() {
      return _0x3dd2f0;
    }
    function _0x1a20d8() {
      if (!_0x8a3d8f) {
        throw new Error("OpenContext native bindings not available.\n  If installed via npm: try reinstalling the package\n  If developing locally: cd crates/opencontext-node && npm run build\n  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\nError (npm): " + (_0x3eab42?.message || "unknown") + "\nError (local): " + (_0x24de45?.message || "unknown"));
      }
      return _0x8a3d8f;
    }
    function _0x4072d8() {
      if (!_0x8a3d8f) {
        throw new Error("OpenContext native bindings not available.\n  If installed via npm: try reinstalling the package\n  If developing locally: cd crates/opencontext-node && npm run build\n  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\nError (npm): " + (_0x3eab42?.message || "unknown") + "\nError (local): " + (_0x24de45?.message || "unknown"));
      }
    }
    function _0x4fcc86() {
      return _0x430468;
    }
    _0x2ae1f8.exports = {
      isAvailable: _0x4482eb,
      getError: _0xd5d88,
      get: _0x1a20d8,
      require: _0x4072d8,
      getLoadedFrom: _0x4fcc86,
      get native() {
        return _0x8a3d8f;
      }
    };
  }
});
var native = require_native();
var isNativeAvailable = native.isAvailable;
var getNativeError = native.getError;
function handleResult(_0x2a0bdb) {
  if (_0x2a0bdb instanceof Error) {
    throw _0x2a0bdb;
  }
  return _0x2a0bdb;
}
function initEnvironment() {
  const _0x5a61a5 = handleResult(native.get().initEnvironment());
  var _0x3c948a = {
    contextsRoot: _0x5a61a5.contexts_root,
    dbPath: _0x5a61a5.db_path
  };
  return _0x3c948a;
}
function listFolders(_0x9b0c1c = {}) {
  var _0x231180 = {
    all: _0x9b0c1c.all ?? false
  };
  return handleResult(native.get().listFolders(_0x231180));
}
function createFolder(_0x6d3fb0) {
  var _0x30cf6c = {
    path: _0x6d3fb0.path,
    description: _0x6d3fb0.description
  };
  return handleResult(native.get().createFolder(_0x30cf6c));
}
function renameFolder(_0x2dff85) {
  var _0x5654a6 = {
    path: _0x2dff85.path,
    newName: _0x2dff85.newName
  };
  return handleResult(native.get().renameFolder(_0x5654a6));
}
function moveFolder(_0x2e9af2) {
  var _0x175c59 = {
    path: _0x2e9af2.path,
    destFolderPath: _0x2e9af2.destFolderPath
  };
  return handleResult(native.get().moveFolder(_0x175c59));
}
function removeFolder(_0x3b844d) {
  var _0xdac628 = {
    path: _0x3b844d.path,
    force: _0x3b844d.force ?? false
  };
  const _0x5bc090 = handleResult(native.get().removeFolder(_0xdac628));
  var _0x103686 = {
    removed: _0x5bc090.rel_path
  };
  return _0x103686;
}
function listDocs(_0x8b8eff) {
  var _0x162d65 = {
    folderPath: _0x8b8eff.folderPath,
    recursive: _0x8b8eff.recursive ?? false
  };
  return handleResult(native.get().listDocs(_0x162d65));
}
function createDoc(_0x1e99e7) {
  var _0x185ea = {
    folderPath: _0x1e99e7.folderPath,
    name: _0x1e99e7.name,
    description: _0x1e99e7.description
  };
  return handleResult(native.get().createDoc(_0x185ea));
}
function moveDoc(_0x27da21) {
  var _0xc148db = {
    docPath: _0x27da21.docPath,
    destFolderPath: _0x27da21.destFolderPath
  };
  return handleResult(native.get().moveDoc(_0xc148db));
}
function renameDoc(_0x16f257) {
  var _0x2284bf = {
    docPath: _0x16f257.docPath,
    newName: _0x16f257.newName
  };
  return handleResult(native.get().renameDoc(_0x2284bf));
}
function removeDoc(_0xb0733a) {
  var _0x426b75 = {
    docPath: _0xb0733a.docPath
  };
  const _0x4f6967 = handleResult(native.get().removeDoc(_0x426b75));
  var _0x3e2bdd = {
    removed: _0x4f6967.rel_path
  };
  return _0x3e2bdd;
}
function setDocDescription(_0x374ca4) {
  var _0x420ba7 = {
    docPath: _0x374ca4.docPath,
    description: _0x374ca4.description
  };
  return handleResult(native.get().setDocDescription(_0x420ba7));
}
function getDocMeta(_0x2d79fd) {
  return handleResult(native.get().getDocMeta(_0x2d79fd.docPath));
}
function getDocByStableId(_0xb74c30) {
  return handleResult(native.get().getDocByStableId(_0xb74c30));
}
function getDocContent(_0x4cf09a) {
  return handleResult(native.get().getDocContent(_0x4cf09a));
}
function saveDocContent(_0x66cafc) {
  var _0x45978b = {
    docPath: _0x66cafc.docPath,
    content: _0x66cafc.content,
    description: _0x66cafc.description
  };
  return handleResult(native.get().saveDocContent(_0x45978b));
}
function generateManifest(_0xd8828b) {
  var _0x5065b4 = {
    folderPath: _0xd8828b.folderPath,
    limit: _0xd8828b.limit
  };
  return handleResult(native.get().generateManifest(_0x5065b4));
}
var _0x4f6390 = {
  isNativeAvailable: isNativeAvailable,
  getNativeError: getNativeError,
  initEnvironment: initEnvironment,
  listFolders: listFolders,
  createFolder: createFolder,
  renameFolder: renameFolder,
  moveFolder: moveFolder,
  removeFolder: removeFolder,
  listDocs: listDocs,
  createDoc: createDoc,
  moveDoc: moveDoc,
  renameDoc: renameDoc,
  removeDoc: removeDoc,
  setDocDescription: setDocDescription,
  getDocMeta: getDocMeta,
  getDocByStableId: getDocByStableId,
  getDocContent: getDocContent,
  saveDocContent: saveDocContent,
  generateManifest: generateManifest
};
module.exports = _0x4f6390;