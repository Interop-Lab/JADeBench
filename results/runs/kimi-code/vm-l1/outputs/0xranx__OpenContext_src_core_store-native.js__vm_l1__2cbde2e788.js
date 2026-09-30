'use strict';

const path = require('path');

let native = null;
let nativeError = null;
let loadError;

try {
  native = require('@aicontextlab/core-native');
} catch (primaryError) {
  loadError = primaryError;
  try {
    native = require(path.resolve(__dirname, '../../crates/opencontext-node'));
  } catch (fallbackError) {
    nativeError = fallbackError;
    loadError = createNativeLoadError(primaryError, fallbackError);
  }
}

function createNativeLoadError(primaryError, fallbackError) {
  const primaryMessage = primaryError?.message ?? 'unknown';
  const fallbackMessage = fallbackError?.message ?? 'unknown';
  return new Error(
    'OpenContext native bindings not available.\n' +
      '  If installed via npm: try reinstalling the package\n' +
      '  If developing locally: cd crates/opencontext-node && npm run build\n' +
      '  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n' +
      `Error (npm): ${primaryMessage}\n` +
      `Error (local): ${fallbackMessage}`,
  );
}

function isNativeAvailable() {
  return native !== null;
}

function getNativeError() {
  return nativeError;
}

function requireNative() {
  if (!native) {
    throw loadError ?? createNativeLoadError();
  }
  return native;
}

function initEnvironment() {
  const result = requireNative().initEnvironment();
  return {
    contextsRoot: result.contexts_root,
    dbPath: result.db_path,
  };
}

function listFolders(options = {}) {
  return requireNative().listFolders({
    all: options.all ?? false,
  });
}

function createFolder(options) {
  return requireNative().createFolder({
    path: options.path,
    description: options.description,
  });
}

function renameFolder(options) {
  return requireNative().renameFolder({
    path: options.path,
    newName: options.newName,
  });
}

function moveFolder(options) {
  return requireNative().moveFolder({
    path: options.path,
    destFolderPath: options.destFolderPath,
  });
}

function removeFolder(options) {
  const result = requireNative().removeFolder({
    path: options.path,
    force: options.force ?? false,
  });
  return { removed: result.rel_path };
}

function listDocs(options) {
  return requireNative().listDocs({
    folderPath: options.folderPath,
    recursive: options.recursive ?? false,
  });
}

function createDoc(options) {
  return requireNative().createDoc({
    folderPath: options.folderPath,
    name: options.name,
    description: options.description,
  });
}

function moveDoc(options) {
  return requireNative().moveDoc({
    docPath: options.docPath,
    destFolderPath: options.destFolderPath,
  });
}

function renameDoc(options) {
  return requireNative().renameDoc({
    docPath: options.docPath,
    newName: options.newName,
  });
}

function removeDoc(options) {
  const result = requireNative().removeDoc({ docPath: options.docPath });
  return { removed: result.rel_path };
}

function setDocDescription(options) {
  return requireNative().setDocDescription({
    docPath: options.docPath,
    description: options.description,
  });
}

function getDocMeta(options) {
  return requireNative().getDocMeta(options.docPath);
}

function getDocByStableId(stableId) {
  return requireNative().getDocByStableId(stableId);
}

function getDocContent(docPath) {
  return requireNative().getDocContent(docPath);
}

function saveDocContent(options) {
  return requireNative().saveDocContent({
    docPath: options.docPath,
    content: options.content,
    description: options.description,
  });
}

function generateManifest(options) {
  return requireNative().generateManifest({
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
