const path = require("path");

let nativeBinding = null;
let nativeError = null;
let loadedFrom = null;

function loadNativeBinding() {
  try {
    nativeBinding = require("@opencontext/native");
    loadedFrom = "package";
    return;
  } catch (packageError) {
    try {
      const localBindingPath = path.join(__dirname, "../../native/index.node");
      nativeBinding = require(localBindingPath);
      loadedFrom = "local";
    } catch (localError) {
      nativeError = localError;
    }
  }
}

loadNativeBinding();

function isNativeAvailable() {
  return nativeBinding !== null;
}

function getNativeError() {
  return nativeError;
}

function getNative() {
  if (!nativeBinding) {
    throw new Error(
      "OpenContext native bindings are not available. " +
        (nativeError && nativeError.message
          ? nativeError.message
          : "The native module could not be loaded.")
    );
  }

  return nativeBinding;
}

function handleResult(result) {
  if (result instanceof Error) {
    throw result;
  }

  return result;
}

function initEnvironment() {
  const result = handleResult(getNative().initEnvironment());

  return {
    openContextPath: result.openContextPath,
    version: result.version
  };
}

function listFolders(options = {}) {
  return handleResult(
    getNative().listFolders({
      includeHidden: options.includeHidden ?? false
    })
  );
}

function createFolder(options) {
  return handleResult(
    getNative().createFolder({
      name: options.name,
      parentPath: options.parentPath
    })
  );
}

function renameFolder(options) {
  return handleResult(
    getNative().renameFolder({
      path: options.path,
      newName: options.newName
    })
  );
}

function moveFolder(options) {
  return handleResult(
    getNative().moveFolder({
      path: options.path,
      newParentPath: options.newParentPath
    })
  );
}

function removeFolder(options) {
  const result = handleResult(
    getNative().removeFolder({
      path: options.path,
      recursive: options.recursive ?? false
    })
  );

  return {
    removed: result.removed
  };
}

function listDocs(options) {
  return handleResult(
    getNative().listDocs({
      folderPath: options.folderPath,
      recursive: options.recursive ?? false
    })
  );
}

function createDoc(options) {
  return handleResult(
    getNative().createDoc({
      folderPath: options.folderPath,
      title: options.title,
      description: options.description
    })
  );
}

function moveDoc(options) {
  return handleResult(
    getNative().moveDoc({
      path: options.path,
      newFolderPath: options.newFolderPath
    })
  );
}

function renameDoc(options) {
  return handleResult(
    getNative().renameDoc({
      path: options.path,
      newName: options.newName
    })
  );
}

function removeDoc(options) {
  const result = handleResult(
    getNative().removeDoc({
      path: options.path
    })
  );

  return {
    removed: result.removed
  };
}

function setDocDescription(options) {
  return handleResult(
    getNative().setDocDescription({
      path: options.path,
      description: options.description
    })
  );
}

function getDocMeta(options) {
  return handleResult(getNative().getDocMeta(options.path));
}

function getDocByStableId(stableId) {
  return handleResult(getNative().getDocByStableId(stableId));
}

function getDocContent(path) {
  return handleResult(getNative().getDocContent(path));
}

function saveDocContent(options) {
  return handleResult(
    getNative().saveDocContent({
      path: options.path,
      content: options.content,
      expectedHash: options.expectedHash
    })
  );
}

function generateManifest(options) {
  return handleResult(
    getNative().generateManifest({
      rootPath: options.rootPath,
      outputPath: options.outputPath
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
  generateManifest
};
