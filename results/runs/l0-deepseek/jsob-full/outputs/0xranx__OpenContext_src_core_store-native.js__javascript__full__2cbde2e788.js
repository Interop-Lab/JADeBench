const __commonJS = (cb) => {
  let module = { exports: {} };
  cb(module.exports, module);
  return module.exports;
};

const require_native = __commonJS((module) => {
  const native = require('bindings')('native');
  let loadedFrom = null;
  let loadError = null;
  let fallbackError = null;
  let fallbackLoadedFrom = null;
  let initialized = false;
  let fallback = null;

  function initialize() {
    if (initialized) return;
    initialized = true;
    try {
      native = require('bindings')('native');
      loadedFrom = 'bindings';
      return;
    } catch (error) {
      loadError = error;
    }
    try {
      const fallbackPath = require('path').join(__dirname, 'native');
      native = require(fallbackPath);
      loadedFrom = 'fallback';
    } catch (error) {
      fallbackError = error;
      fallbackLoadedFrom = error;
    }
  }

  initialize();

  function isAvailable() {
    return native !== null;
  }

  function getError() {
    return fallbackError;
  }

  function get() {
    if (!native) {
      throw new Error(
        'Native module not loaded. bindings error: ' +
          (loadError?.message || 'unknown') +
          '; fallback error: ' +
          (fallbackLoadedFrom?.message || 'unknown')
      );
    }
    return native;
  }

  function requireNative() {
    if (!native) {
      throw new Error(
        'Native module not loaded. bindings error: ' +
          (loadError?.message || 'unknown') +
          '; fallback error: ' +
          (fallbackLoadedFrom?.message || 'unknown')
      );
    }
  }

  function getLoadedFrom() {
    return loadedFrom;
  }

  module.exports = {
    isAvailable,
    getError,
    get,
    require: requireNative,
    getLoadedFrom,
    get native() {
      return native;
    },
  };
});

const native = require_native();
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
    rootPath: result.rootPath,
    homePath: result.homePath,
  };
}

function listFolders(options = {}) {
  const args = {
    path: options.path ?? false,
  };
  return handleResult(native.get().listFolders(args));
}

function createFolder(input) {
  const args = {
    path: input.path,
    name: input.name,
  };
  return handleResult(native.get().createFolder(args));
}

function renameFolder(input) {
  const args = {
    path: input.path,
    newName: input.newName,
  };
  return handleResult(native.get().renameFolder(args));
}

function moveFolder(input) {
  const args = {
    path: input.path,
    newPath: input.newPath,
  };
  return handleResult(native.get().moveFolder(args));
}

function removeFolder(input) {
  const args = {
    path: input.path,
    recursive: input.recursive ?? false,
  };
  const result = handleResult(native.get().removeFolder(args));
  return {
    success: result.success,
  };
}

function listDocs(input) {
  const args = {
    folderPath: input.folderPath,
    recursive: input.recursive ?? false,
  };
  return handleResult(native.get().listDocs(args));
}

function createDoc(input) {
  const args = {
    folderPath: input.folderPath,
    name: input.name,
    content: input.content,
  };
  return handleResult(native.get().createDoc(args));
}

function moveDoc(input) {
  const args = {
    path: input.path,
    newPath: input.newPath,
  };
  return handleResult(native.get().moveDoc(args));
}

function renameDoc(input) {
  const args = {
    path: input.path,
    newName: input.newName,
  };
  return handleResult(native.get().renameDoc(args));
}

function removeDoc(input) {
  const args = {
    path: input.path,
  };
  const result = handleResult(native.get().removeDoc(args));
  return {
    success: result.success,
  };
}

function setDocDescription(input) {
  const args = {
    path: input.path,
    description: input.description,
  };
  return handleResult(native.get().setDocDescription(args));
}

function getDocMeta(input) {
  return handleResult(native.get().getDocMeta(input.path));
}

function getDocByStableId(stableId) {
  return handleResult(native.get().getDocByStableId(stableId));
}

function getDocContent(path) {
  return handleResult(native.get().getDocContent(path));
}

function saveDocContent(input) {
  const args = {
    path: input.path,
    content: input.content,
    encoding: input.encoding,
  };
  return handleResult(native.get().saveDocContent(args));
}

function generateManifest(input) {
  const args = {
    folderPath: input.folderPath,
    name: input.name,
  };
  return handleResult(native.get().generateManifest(args));
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
