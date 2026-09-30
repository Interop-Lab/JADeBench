'use strict';

const path = require('path');

let nativeModule = null;
let packageLoadError = null;
let localLoadError = null;
let nativeLoaded = false;
let loadedFrom = null;

function loadNativeModule() {
  if (nativeLoaded) return;
  nativeLoaded = true;

  try {
    nativeModule = require('@aicontextlab/core-native');
    loadedFrom = 'npm';
    return;
  } catch (error) {
    packageLoadError = error;
  }

  try {
    const nativePath = path.join(__dirname, '../../crates/opencontext-node');
    nativeModule = require(nativePath);
    loadedFrom = 'local';
  } catch (error) {
    localLoadError = error;
  }
}

loadNativeModule();

function createNativeUnavailableError() {
  return new Error(
    'OpenContext native bindings not available.\n' +
      '  If installed via npm: try reinstalling the package\n' +
      '  If developing locally: cd crates/opencontext-node && npm run build\n' +
      '  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n' +
      `Error (npm): ${packageLoadError?.message || 'unknown'}\n` +
      `Error (local): ${localLoadError?.message || 'unknown'}`
  );
}

const native = {
  isAvailable() {
    return nativeModule !== null;
  },

  getError() {
    return localLoadError;
  },

  get() {
    if (!nativeModule) {
      throw createNativeUnavailableError();
    }
    return nativeModule;
  },

  require() {
    if (!nativeModule) {
      throw createNativeUnavailableError();
    }
    return nativeModule;
  },

  getLoadedFrom() {
    return loadedFrom;
  },

  get native() {
    return nativeModule;
  },
};

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

function handleResult(result) {
  if (result instanceof Error) {
    throw result;
  }
  return result;
}

function nativeApi() {
  return native.get();
}

function initEnvironment() {
  const result = handleResult(nativeApi().initEnvironment());
  return {
    contextsRoot: result.contexts_root,
    dbPath: result.db_path,
  };
}

function listFolders(options = {}) {
  return handleResult(
    nativeApi().listFolders({
      all: options.all ?? false,
    })
  );
}

function createFolder(folder) {
  return handleResult(
    nativeApi().createFolder({
      path: folder.path,
      description: folder.description,
    })
  );
}

function renameFolder(folder) {
  return handleResult(
    nativeApi().renameFolder({
      path: folder.path,
      newName: folder.newName,
    })
  );
}

function moveFolder(folder) {
  return handleResult(
    nativeApi().moveFolder({
      path: folder.path,
      destFolderPath: folder.destFolderPath,
    })
  );
}

function removeFolder(folder) {
  const result = handleResult(
    nativeApi().removeFolder({
      path: folder.path,
      force: folder.force ?? false,
    })
  );
  return { removed: result.rel_path };
}

function listDocs(query) {
  return handleResult(
    nativeApi().listDocs({
      folderPath: query.folderPath,
      recursive: query.recursive ?? false,
    })
  );
}

function createDoc(doc) {
  return handleResult(
    nativeApi().createDoc({
      folderPath: doc.folderPath,
      name: doc.name,
      description: doc.description,
    })
  );
}

function moveDoc(doc) {
  return handleResult(
    nativeApi().moveDoc({
      docPath: doc.docPath,
      destFolderPath: doc.destFolderPath,
    })
  );
}

function renameDoc(doc) {
  return handleResult(
    nativeApi().renameDoc({
      docPath: doc.docPath,
      newName: doc.newName,
    })
  );
}

function removeDoc(doc) {
  const result = handleResult(
    nativeApi().removeDoc({
      docPath: doc.docPath,
    })
  );
  return { removed: result.rel_path };
}

function setDocDescription(doc) {
  return handleResult(
    nativeApi().setDocDescription({
      docPath: doc.docPath,
      description: doc.description,
    })
  );
}

function getDocMeta(doc) {
  return handleResult(nativeApi().getDocMeta(doc.docPath));
}

function getDocByStableId(stableId) {
  return handleResult(nativeApi().getDocByStableId(stableId));
}

function getDocContent(docId) {
  return handleResult(nativeApi().getDocContent(docId));
}

function saveDocContent(doc) {
  return handleResult(
    nativeApi().saveDocContent({
      docPath: doc.docPath,
      content: doc.content,
      description: doc.description,
    })
  );
}

function generateManifest(options) {
  return handleResult(
    nativeApi().generateManifest({
      folderPath: options.folderPath,
      limit: options.limit,
    })
  );
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
