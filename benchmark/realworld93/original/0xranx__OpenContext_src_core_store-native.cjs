var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// ../work/0xranx__OpenContext/src/core/native.js
var require_native = __commonJS({
  "../work/0xranx__OpenContext/src/core/native.js"(exports2, module2) {
    var path = require("path");
    var native2 = null;
    var nativeError = null;
    var npmError = null;
    var localError = null;
    var initialized = false;
    var loadedFrom = null;
    function loadNative() {
      if (initialized) return;
      initialized = true;
      try {
        native2 = require("@aicontextlab/core-native");
        loadedFrom = "npm";
        return;
      } catch (e) {
        npmError = e;
      }
      try {
        const nativePath = path.join(__dirname, "../../crates/opencontext-node");
        native2 = require(nativePath);
        loadedFrom = "local";
      } catch (e) {
        localError = e;
        nativeError = e;
      }
    }
    loadNative();
    function isAvailable() {
      return native2 !== null;
    }
    function getError() {
      return nativeError;
    }
    function get() {
      if (!native2) {
        throw new Error(
          `OpenContext native bindings not available.
  If installed via npm: try reinstalling the package
  If developing locally: cd crates/opencontext-node && npm run build
  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional
Error (npm): ${npmError?.message || "unknown"}
Error (local): ${localError?.message || "unknown"}`
        );
      }
      return native2;
    }
    function require_() {
      if (!native2) {
        throw new Error(
          `OpenContext native bindings not available.
  If installed via npm: try reinstalling the package
  If developing locally: cd crates/opencontext-node && npm run build
  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional
Error (npm): ${npmError?.message || "unknown"}
Error (local): ${localError?.message || "unknown"}`
        );
      }
    }
    function getLoadedFrom() {
      return loadedFrom;
    }
    module2.exports = {
      isAvailable,
      getError,
      get,
      require: require_,
      getLoadedFrom,
      // Direct access (for advanced use)
      get native() {
        return native2;
      }
    };
  }
});

// ../work/0xranx__OpenContext/src/core/store-native.js
var native = require_native();
var isNativeAvailable = native.isAvailable;
var getNativeError = native.getError;
function handleResult(result) {
  if (result instanceof Error) {
    throw result;
  }
  return result;
}
function initEnvironment() {
  const info = handleResult(native.get().initEnvironment());
  return {
    contextsRoot: info.contexts_root,
    dbPath: info.db_path
  };
}
function listFolders(options = {}) {
  return handleResult(native.get().listFolders({ all: options.all ?? false }));
}
function createFolder(options) {
  return handleResult(native.get().createFolder({
    path: options.path,
    description: options.description
  }));
}
function renameFolder(options) {
  return handleResult(native.get().renameFolder({
    path: options.path,
    newName: options.newName
  }));
}
function moveFolder(options) {
  return handleResult(native.get().moveFolder({
    path: options.path,
    destFolderPath: options.destFolderPath
  }));
}
function removeFolder(options) {
  const result = handleResult(native.get().removeFolder({
    path: options.path,
    force: options.force ?? false
  }));
  return { removed: result.rel_path };
}
function listDocs(options) {
  return handleResult(native.get().listDocs({
    folderPath: options.folderPath,
    recursive: options.recursive ?? false
  }));
}
function createDoc(options) {
  return handleResult(native.get().createDoc({
    folderPath: options.folderPath,
    name: options.name,
    description: options.description
  }));
}
function moveDoc(options) {
  return handleResult(native.get().moveDoc({
    docPath: options.docPath,
    destFolderPath: options.destFolderPath
  }));
}
function renameDoc(options) {
  return handleResult(native.get().renameDoc({
    docPath: options.docPath,
    newName: options.newName
  }));
}
function removeDoc(options) {
  const result = handleResult(native.get().removeDoc({
    docPath: options.docPath
  }));
  return { removed: result.rel_path };
}
function setDocDescription(options) {
  return handleResult(native.get().setDocDescription({
    docPath: options.docPath,
    description: options.description
  }));
}
function getDocMeta(options) {
  return handleResult(native.get().getDocMeta(options.docPath));
}
function getDocByStableId(stableId) {
  return handleResult(native.get().getDocByStableId(stableId));
}
function getDocContent(docPath) {
  return handleResult(native.get().getDocContent(docPath));
}
function saveDocContent(options) {
  return handleResult(native.get().saveDocContent({
    docPath: options.docPath,
    content: options.content,
    description: options.description
  }));
}
function generateManifest(options) {
  return handleResult(native.get().generateManifest({
    folderPath: options.folderPath,
    limit: options.limit
  }));
}
module.exports = {
  // Availability checks
  isNativeAvailable,
  getNativeError,
  // Store API
  initEnvironment,
  listFolders,
  createFolder,
  renameFolder,
  moveFolder,
  removeFolder,
  listDocs,
  createDoc,
  moveDoc,
  renameDoc,
  removeDoc,
  setDocDescription,
  getDocMeta,
  getDocByStableId,
  getDocContent,
  saveDocContent,
  generateManifest
};
