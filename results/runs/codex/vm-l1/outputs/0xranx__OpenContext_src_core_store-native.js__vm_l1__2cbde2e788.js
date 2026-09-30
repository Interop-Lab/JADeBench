const path = require("path");

let nativeBindings = null;
let npmLoadError = null;
let localLoadError = null;

try {
  nativeBindings = require("@aicontextlab/core-native");
} catch (error) {
  npmLoadError = error;
  try {
    nativeBindings = require(path.join(__dirname, "../../crates/opencontext-node"));
  } catch (fallbackError) {
    localLoadError = fallbackError;
  }
}

function isNativeAvailable() {
  return nativeBindings !== null;
}

function getNativeError() {
  return localLoadError;
}

function getNativeBindings() {
  if (nativeBindings) return nativeBindings;

  throw new Error(
    "OpenContext native bindings not available.\n" +
      "  If installed via npm: try reinstalling the package\n" +
      "  If developing locally: cd crates/opencontext-node && npm run build\n" +
      "  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n" +
      `Error (npm): ${npmLoadError.message}\n` +
      `Error (local): ${localLoadError.message}`,
  );
}

function initEnvironment() {
  getNativeBindings().initEnvironment();
  return {};
}

function listFolders(options) {
  const bindings = getNativeBindings();
  const { all = false } = options === undefined ? {} : options;
  return bindings.listFolders({ all: all || false });
}

function createFolder(options) {
  return getNativeBindings().createFolder({
    path: options.path,
    description: options.description,
  });
}

function renameFolder(options) {
  return getNativeBindings().renameFolder({
    path: options.path,
    newName: options.newName,
  });
}

function moveFolder(options) {
  return getNativeBindings().moveFolder({
    path: options.path,
    destFolderPath: options.destFolderPath,
  });
}

function removeFolder(options) {
  getNativeBindings().removeFolder({
    path: options.path,
    force: options.force || false,
  });
  return {};
}

function listDocs(options) {
  return getNativeBindings().listDocs({
    folderPath: options.folderPath,
    recursive: options.recursive || false,
  });
}

function createDoc(options) {
  return getNativeBindings().createDoc({
    folderPath: options.folderPath,
    name: options.name,
    description: options.description,
  });
}

function moveDoc(options) {
  return getNativeBindings().moveDoc({
    docPath: options.docPath,
    destFolderPath: options.destFolderPath,
  });
}

function renameDoc(options) {
  return getNativeBindings().renameDoc({
    docPath: options.docPath,
    newName: options.newName,
  });
}

function removeDoc(options) {
  getNativeBindings().removeDoc({ docPath: options.docPath });
  return {};
}

function setDocDescription(options) {
  return getNativeBindings().setDocDescription({
    docPath: options.docPath,
    description: options.description,
  });
}

function getDocMeta(options) {
  return getNativeBindings().getDocMeta(options.docPath);
}

function getDocByStableId(stableId) {
  return getNativeBindings().getDocByStableId(stableId);
}

function getDocContent(docPath) {
  return getNativeBindings().getDocContent(docPath);
}

function saveDocContent(options) {
  return getNativeBindings().saveDocContent({
    docPath: options.docPath,
    content: options.content,
    description: options.description,
  });
}

function generateManifest(options) {
  return getNativeBindings().generateManifest({
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
