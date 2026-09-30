const path = require("path");

const NATIVE_BINDINGS_ERROR = `OpenContext native bindings not available.
  If installed via npm: try reinstalling the package
  If developing locally: cd crates/opencontext-node && npm run build
  If optional deps were skipped: npm install -g @aicontextlab/cli --include=optional`;

let nativeBindings = null;
let nativeError = null;
let npmLoadError = null;
let localLoadError = null;
let nativeLoadedFrom = null;

function loadNativeBindings() {
  try {
    nativeBindings = require("@aicontextlab/core-native");
    nativeLoadedFrom = "npm";
    return;
  } catch (error) {
    npmLoadError = error;
  }

  try {
    const localBindingsPath = path.join(
      __dirname,
      "../../crates/opencontext-node",
    );
    nativeBindings = require(localBindingsPath);
    nativeLoadedFrom = "local";
  } catch (error) {
    localLoadError = error;
    nativeError = error;
  }
}

function unavailableBindingsError() {
  return new Error(
    `${NATIVE_BINDINGS_ERROR}\nError (npm): ${npmLoadError?.message || "unknown"}` +
      `\nError (local): ${localLoadError?.message || "unknown"}`,
  );
}

loadNativeBindings();

const native = {
  isAvailable() {
    return nativeBindings !== null;
  },

  getError() {
    return nativeError;
  },

  get() {
    if (!nativeBindings) {
      throw unavailableBindingsError();
    }
    return nativeBindings;
  },

  require() {
    if (!nativeBindings) {
      throw unavailableBindingsError();
    }
  },

  getLoadedFrom() {
    return nativeLoadedFrom;
  },

  get native() {
    return nativeBindings;
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

function initEnvironment() {
  const result = handleResult(native.get().initEnvironment());
  return {
    contextsRoot: result.contexts_root,
    dbPath: result.db_path,
  };
}

function listFolders(options = {}) {
  return handleResult(
    native.get().listFolders({
      all: options.all ?? false,
    }),
  );
}

function createFolder(options) {
  return handleResult(
    native.get().createFolder({
      path: options.path,
      description: options.description,
    }),
  );
}

function renameFolder(options) {
  return handleResult(
    native.get().renameFolder({
      path: options.path,
      newName: options.newName,
    }),
  );
}

function moveFolder(options) {
  return handleResult(
    native.get().moveFolder({
      path: options.path,
      destFolderPath: options.destFolderPath,
    }),
  );
}

function removeFolder(options) {
  const result = handleResult(
    native.get().removeFolder({
      path: options.path,
      force: options.force ?? false,
    }),
  );
  return { removed: result.rel_path };
}

function listDocs(options) {
  return handleResult(
    native.get().listDocs({
      folderPath: options.folderPath,
      recursive: options.recursive ?? false,
    }),
  );
}

function createDoc(options) {
  return handleResult(
    native.get().createDoc({
      folderPath: options.folderPath,
      name: options.name,
      description: options.description,
    }),
  );
}

function moveDoc(options) {
  return handleResult(
    native.get().moveDoc({
      docPath: options.docPath,
      destFolderPath: options.destFolderPath,
    }),
  );
}

function renameDoc(options) {
  return handleResult(
    native.get().renameDoc({
      docPath: options.docPath,
      newName: options.newName,
    }),
  );
}

function removeDoc(options) {
  const result = handleResult(
    native.get().removeDoc({
      docPath: options.docPath,
    }),
  );
  return { removed: result.rel_path };
}

function setDocDescription(options) {
  return handleResult(
    native.get().setDocDescription({
      docPath: options.docPath,
      description: options.description,
    }),
  );
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
  return handleResult(
    native.get().saveDocContent({
      docPath: options.docPath,
      content: options.content,
      description: options.description,
    }),
  );
}

function generateManifest(options) {
  return handleResult(
    native.get().generateManifest({
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
