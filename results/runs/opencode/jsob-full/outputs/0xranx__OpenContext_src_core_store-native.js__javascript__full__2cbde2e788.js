"use strict";

const path = require("path");

// The native package is optional.  Keep module loading successful when it has
// not been installed so callers can inspect availability and the load error.
let nativeBinding = null;
let nativeError = null;

try {
  nativeBinding = require("@aicontextlab/core-native");
} catch (npmError) {
  try {
    nativeBinding = require(path.resolve(__dirname, "../../crates/opencontext-node"));
  } catch (localError) {
    nativeError = new Error(
      "OpenContext native bindings not available.\n" +
        "  If installed via npm: try reinstalling the package\n" +
        "  If developing locally: cd crates/opencontext-node && npm run build\n" +
        "  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n" +
        `Error (npm): ${npmError.message}\n` +
        `Error (local): ${localError.message}`,
    );
  }
}

function isNativeAvailable() {
  return nativeBinding !== null;
}

function getNativeError() {
  return nativeError;
}

function getNative() {
  if (nativeError) throw nativeError;
  return nativeBinding;
}

function handleResult(result) {
  if (result instanceof Error) throw result;
  return result;
}

function initEnvironment() {
  const result = handleResult(getNative().initEnvironment());
  return {
    contextsRoot: result.contexts_root,
    dbPath: result.db_path,
  };
}

function listFolders(options = {}) {
  return handleResult(getNative().listFolders({ all: options.all ?? false }));
}

function createFolder(options) {
  return handleResult(
    getNative().createFolder({
      path: options.path,
      description: options.description,
    }),
  );
}

function renameFolder(options) {
  return handleResult(
    getNative().renameFolder({ path: options.path, newName: options.newName }),
  );
}

function moveFolder(options) {
  return handleResult(
    getNative().moveFolder({
      path: options.path,
      destFolderPath: options.destFolderPath,
    }),
  );
}

function removeFolder(options) {
  const result = handleResult(
    getNative().removeFolder({
      path: options.path,
      force: options.force ?? false,
    }),
  );
  return { removed: result.rel_path };
}

function listDocs(options = {}) {
  return handleResult(
    getNative().listDocs({
      folderPath: options.folderPath,
      recursive: options.recursive ?? false,
    }),
  );
}

function createDoc(options) {
  return handleResult(
    getNative().createDoc({
      folderPath: options.folderPath,
      name: options.name,
      description: options.description,
    }),
  );
}

function moveDoc(options) {
  return handleResult(
    getNative().moveDoc({
      docPath: options.docPath,
      destFolderPath: options.destFolderPath,
    }),
  );
}

function renameDoc(options) {
  return handleResult(
    getNative().renameDoc({
      docPath: options.docPath,
      newName: options.newName,
    }),
  );
}

function removeDoc(options) {
  const result = handleResult(
    getNative().removeDoc({ docPath: options.docPath }),
  );
  return { removed: result.rel_path };
}

function setDocDescription(options) {
  return handleResult(
    getNative().setDocDescription({
      docPath: options.docPath,
      description: options.description,
    }),
  );
}

function getDocMeta(options) {
  return handleResult(getNative().getDocMeta(options.docPath));
}

function getDocByStableId(options) {
  return handleResult(getNative().getDocByStableId(options));
}

function getDocContent(docPath) {
  return handleResult(getNative().getDocContent(docPath));
}

function saveDocContent(options) {
  return handleResult(
    getNative().saveDocContent({
      docPath: options.docPath,
      content: options.content,
      description: options.description,
    }),
  );
}

function generateManifest(options) {
  return handleResult(
    getNative().generateManifest({
      folderPath: options.folderPath,
      limit: options.limit,
    }),
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
