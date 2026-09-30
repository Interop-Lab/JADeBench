"use strict";

const path = require("path");

let nativeBinding = null;
let nativeError = null;
let loadedFrom = null;

try {
  nativeBinding = require("@aicontextlab/core-native");
  loadedFrom = "npm";
} catch (npmError) {
  try {
    nativeBinding = require(path.join(__dirname, "../../crates/opencontext-node"));
    loadedFrom = "local";
  } catch (localError) {
    nativeError = new Error(
      `OpenContext native bindings not available.\n` +
        `  If installed via npm: try reinstalling the package\n` +
        `  If developing locally: cd crates/opencontext-node && npm run build\n` +
        `  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n` +
        `Error (npm): ${npmError.message}\n` +
        `Error (local): ${localError.message}`,
    );
  }
}

const native = {
  isAvailable() {
    return nativeBinding !== null;
  },

  getError() {
    return nativeError;
  },

  get() {
    if (nativeError) throw nativeError;
    return nativeBinding;
  },

  require() {
    return this.get();
  },

  getLoadedFrom() {
    return loadedFrom;
  },

  native: nativeBinding,
};

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

function handleResult(result) {
  return result;
}

function callNative(method, argument) {
  const binding = native.get();
  const result = argument === undefined ? binding[method]() : binding[method](argument);
  return handleResult(result);
}

function initEnvironment() {
  callNative("initEnvironment");
  return {};
}

function listFolders(options = {}) {
  return callNative("listFolders", {
    all: options.all === undefined ? false : options.all,
  });
}

function createFolder(options = {}) {
  return callNative("createFolder", {
    path: options.path,
    description: options.description,
  });
}

function renameFolder(options = {}) {
  return callNative("renameFolder", {
    path: options.path,
    newName: options.newName,
  });
}

function moveFolder(options = {}) {
  return callNative("moveFolder", {
    path: options.path,
    destFolderPath: options.destFolderPath,
  });
}

function removeFolder(options = {}) {
  callNative("removeFolder", {
    path: options.path,
    force: options.force === undefined ? false : options.force,
  });
  return {};
}

function listDocs(options = {}) {
  return callNative("listDocs", {
    folderPath: options.folderPath,
    recursive: options.recursive === undefined ? false : options.recursive,
  });
}

function createDoc(options = {}) {
  return callNative("createDoc", {
    folderPath: options.folderPath,
    name: options.name,
    description: options.description,
  });
}

function moveDoc(options = {}) {
  return callNative("moveDoc", {
    docPath: options.docPath,
    destFolderPath: options.destFolderPath,
  });
}

function renameDoc(options = {}) {
  return callNative("renameDoc", {
    docPath: options.docPath,
    newName: options.newName,
  });
}

function removeDoc(options = {}) {
  callNative("removeDoc", { docPath: options.docPath });
  return {};
}

function setDocDescription(options = {}) {
  return callNative("setDocDescription", {
    docPath: options.docPath,
    description: options.description,
  });
}

function getDocMeta(docPath) {
  return callNative("getDocMeta", docPath);
}

function getDocByStableId(stableId) {
  return callNative("getDocByStableId", stableId);
}

function getDocContent(docPath) {
  return callNative("getDocContent", docPath);
}

function saveDocContent(options = {}) {
  return callNative("saveDocContent", {
    docPath: options.docPath,
    content: options.content,
    description: options.description,
  });
}

function generateManifest(options = {}) {
  return callNative("generateManifest", {
    folderPath: options.folderPath,
    limit: options.limit,
  });
}

module.exports = {
  isNativeAvailable,
  getNativeError,
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
  generateManifest,
};
