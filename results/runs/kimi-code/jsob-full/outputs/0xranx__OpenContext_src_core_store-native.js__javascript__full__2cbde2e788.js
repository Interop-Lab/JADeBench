let native;
let nativeError;

try {
  native = require("/tmp/crates/opencontext-node");
} catch (error) {
  try {
    native = require("@aicontextlab/core-native");
  } catch (fallbackError) {
    nativeError = error;
  }
}

function isNativeAvailable() {
  return native !== undefined;
}

function getNativeError() {
  return nativeError;
}

function handleResult(result) {
  if (result instanceof Error) {
    throw result;
  }
  return result;
}

function callNative(method, options) {
  return handleResult(native[method](options));
}

function initEnvironment() {
  const result = handleResult(native.initEnvironment());
  return {
    contextsRoot: result.contexts_root,
    dbPath: result.db_path,
  };
}

function listFolders(options = {}) {
  return callNative("listFolders", options);
}

function createFolder(options) {
  return callNative("createFolder", {
    path: options.path,
    description: options.description,
  });
}

function renameFolder(options) {
  return callNative("renameFolder", {
    path: options.path,
    newName: options.newName,
  });
}

function moveFolder(options) {
  return callNative("moveFolder", {
    path: options.path,
    destFolderPath: options.destFolderPath,
  });
}

function removeFolder(options) {
  const result = handleResult(native.removeFolder({
    path: options.path,
    force: options.force,
  }));
  return { removed: result.rel_path };
}

function listDocs(options) {
  return callNative("listDocs", {
    folderPath: options.folderPath,
    recursive: options.recursive,
  });
}

function createDoc(options) {
  return callNative("createDoc", {
    folderPath: options.folderPath,
    name: options.name,
    description: options.description,
  });
}

function moveDoc(options) {
  return callNative("moveDoc", {
    docPath: options.docPath,
    destFolderPath: options.destFolderPath,
  });
}

function renameDoc(options) {
  return callNative("renameDoc", {
    docPath: options.docPath,
    newName: options.newName,
  });
}

function removeDoc(options) {
  const result = handleResult(native.removeDoc({ docPath: options.docPath }));
  return { removed: result.rel_path };
}

function setDocDescription(options) {
  return callNative("setDocDescription", {
    docPath: options.docPath,
    description: options.description,
  });
}

function getDocMeta(options) {
  return callNative("getDocMeta", options.docPath);
}

function getDocByStableId(stableId) {
  return callNative("getDocByStableId", stableId);
}

function getDocContent(options) {
  return callNative("getDocContent", options);
}

function saveDocContent(options) {
  return callNative("saveDocContent", {
    docPath: options.docPath,
    content: options.content,
    description: options.description,
  });
}

function generateManifest(options) {
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
