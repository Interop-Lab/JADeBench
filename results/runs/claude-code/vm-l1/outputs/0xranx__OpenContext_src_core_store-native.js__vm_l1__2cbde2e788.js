const path = require("path");

let binding;
let npmLoadError;
let localLoadError;

try {
  binding = require("@aicontextlab/core-native");
} catch (error) {
  npmLoadError = error;

  try {
    binding = require(path.join(__dirname, "../../crates/opencontext-node"));
  } catch (localError) {
    localLoadError = localError;
  }
}

function isNativeAvailable() {
  return Boolean(binding);
}

function getNativeError() {
  if (binding) return null;

  const npmMessage = npmLoadError?.message ?? "unknown";
  const localMessage = localLoadError?.message ?? "unknown";

  return new Error(
    "OpenContext native bindings not available.\n" +
      "  If installed via npm: try reinstalling the package\n" +
      "  If developing locally: cd crates/opencontext-node && npm run build\n" +
      "  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional\n" +
      `Error (npm): ${npmMessage}\n` +
      `Error (local): ${localMessage}`,
  );
}

function getNativeBinding() {
  if (!binding) throw getNativeError();
  return binding;
}

function handleResult(result) {
  if (result instanceof Error) throw result;
  return result;
}

function initEnvironment() {
  const result = handleResult(getNativeBinding().initEnvironment());
  return {
    contextsRoot: result.contexts_root,
    dbPath: result.db_path,
  };
}

function listFolders(options) {
  return handleResult(
    getNativeBinding().listFolders({ all: options?.all ?? false }),
  );
}

function createFolder(options) {
  return handleResult(
    getNativeBinding().createFolder({
      path: options.path,
      description: options.description,
    }),
  );
}

function renameFolder(options) {
  return handleResult(
    getNativeBinding().renameFolder({
      path: options.path,
      newName: options.newName,
    }),
  );
}

function moveFolder(options) {
  return handleResult(
    getNativeBinding().moveFolder({
      path: options.path,
      destFolderPath: options.destFolderPath,
    }),
  );
}

function removeFolder(options) {
  const result = handleResult(
    getNativeBinding().removeFolder({
      path: options.path,
      force: options.force ?? false,
    }),
  );
  return { removed: result.rel_path };
}

function listDocs(options) {
  return handleResult(
    getNativeBinding().listDocs({
      folderPath: options.folderPath,
      recursive: options.recursive ?? false,
    }),
  );
}

function createDoc(options) {
  return handleResult(
    getNativeBinding().createDoc({
      folderPath: options.folderPath,
      name: options.name,
      description: options.description,
    }),
  );
}

function moveDoc(options) {
  return handleResult(
    getNativeBinding().moveDoc({
      docPath: options.docPath,
      destFolderPath: options.destFolderPath,
    }),
  );
}

function renameDoc(options) {
  return handleResult(
    getNativeBinding().renameDoc({
      docPath: options.docPath,
      newName: options.newName,
    }),
  );
}

function removeDoc(options) {
  const result = handleResult(
    getNativeBinding().removeDoc({ docPath: options.docPath }),
  );
  return { removed: result.rel_path };
}

function setDocDescription(options) {
  return handleResult(
    getNativeBinding().setDocDescription({
      docPath: options.docPath,
      description: options.description,
    }),
  );
}

function getDocMeta(docPath) {
  return handleResult(getNativeBinding().getDocMeta(docPath));
}

function getDocByStableId(stableId) {
  return handleResult(getNativeBinding().getDocByStableId(stableId));
}

function getDocContent(docPath) {
  return handleResult(getNativeBinding().getDocContent(docPath));
}

function saveDocContent(options) {
  return handleResult(
    getNativeBinding().saveDocContent({
      docPath: options.docPath,
      content: options.content,
      description: options.description,
    }),
  );
}

function generateManifest(options) {
  return handleResult(
    getNativeBinding().generateManifest({
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
