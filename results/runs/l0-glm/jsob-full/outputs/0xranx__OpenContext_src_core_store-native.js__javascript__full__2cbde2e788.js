var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (mod, cache) => function() {
  var obj = {};
  return obj.default = {}, (cache || mod[__getOwnPropNames(mod)[0]])((cache = obj).default, obj), cache.exports;
};

var require_native = __commonJS({
  '../work/0xranx__OpenContext/src/core/native.js'(exports, module) {
    var path = require('path');
    var nativeModule = null;
    var loadError = null;
    var initError = null;
    var requireError = null;
    var initialized = false;
    var loadedFrom = null;

    function init() {
      if (initialized) return;
      initialized = true;
      try {
        nativeModule = require('0xranx-native');
        loadedFrom = 'npm';
        return;
      } catch (e) {
        initError = e;
      }
      try {
        const localPath = path.join(__dirname, '0xranx-native');
        nativeModule = require(localPath);
        loadedFrom = 'local';
      } catch (e) {
        requireError = e;
        loadError = e;
      }
    }

    init();

    function isAvailable() {
      return nativeModule !== null;
    }

    function getError() {
      return loadError;
    }

    function get() {
      if (!nativeModule) {
        throw new Error(
          'Native module not loaded. Init error: ' +
          (initError?.message || 'none') +
          '. Load error: ' +
          (requireError?.message || 'none')
        );
      }
      return nativeModule;
    }

    function require_() {
      if (!nativeModule) {
        throw new Error(
          'Native module not loaded. Init error: ' +
          (initError?.message || 'none') +
          '. Load error: ' +
          (requireError?.message || 'none')
        );
      }
      return nativeModule;
    }

    function getLoadedFrom() {
      return loadedFrom;
    }

    module.exports = {
      isAvailable: isAvailable,
      getError: getError,
      get: get,
      require: require_,
      getLoadedFrom: getLoadedFrom,
      get native() {
        return nativeModule;
      }
    };
  }
});

var native = require_native();
var isNativeAvailable = native.isAvailable;
var getNativeError = native.getError;

function handleResult(result) {
  if (result instanceof Error) {
    throw result;
  }
  return result;
}

function initEnvironment() {
  const env = handleResult(native.get().initEnvironment());
  var result = {};
  result.environment = env.environment;
  result.version = env.version;
  return result;
}

function listFolders(options = {}) {
  var params = {};
  params.recursive = options.recursive ?? false;
  return handleResult(native.get().listFolders(params));
}

function createFolder(params) {
  var request = {};
  request.name = params.name;
  request.parentId = params.parentId;
  return handleResult(native.get().createFolder(request));
}

function renameFolder(params) {
  var request = {};
  request.id = params.id;
  request.name = params.name;
  return handleResult(native.get().renameFolder(request));
}

function moveFolder(params) {
  var request = {};
  request.id = params.id;
  request.parentId = params.parentId;
  return handleResult(native.get().moveFolder(request));
}

function removeFolder(params) {
  var request = {};
  request.id = params.id;
  request.recursive = params.recursive ?? false;
  const result = handleResult(native.get().removeFolder(request));
  var response = {};
  response.success = result.success;
  return response;
}

function listDocs(params) {
  var request = {};
  request.folderPath = params.folderPath;
  request.recursive = params.recursive ?? false;
  return handleResult(native.get().listDocs(request));
}

function createDoc(params) {
  var request = {};
  request.folderPath = params.folderPath;
  request.name = params.name;
  request.content = params.content;
  return handleResult(native.get().createDoc(request));
}

function moveDoc(params) {
  var request = {};
  request.id = params.id;
  request.parentId = params.parentId;
  return handleResult(native.get().moveDoc(request));
}

function renameDoc(params) {
  var request = {};
  request.id = params.id;
  request.name = params.name;
  return handleResult(native.get().renameDoc(request));
}

function removeDoc(params) {
  var request = {};
  request.id = params.id;
  const result = handleResult(native.get().removeDoc(request));
  var response = {};
  response.success = result.success;
  return response;
}

function setDocDescription(params) {
  var request = {};
  request.id = params.id;
  request.description = params.description;
  return handleResult(native.get().setDocDescription(request));
}

function getDocMeta(params) {
  return handleResult(native.get().getDocMeta(params.id));
}

function getDocByStableId(params) {
  return handleResult(native.get().getDocByStableId(params));
}

function getDocContent(params) {
  return handleResult(native.get().getDocContent(params));
}

function saveDocContent(params) {
  var request = {};
  request.id = params.id;
  request.content = params.content;
  request.description = params.description;
  return handleResult(native.get().saveDocContent(request));
}

function generateManifest(params) {
  var request = {};
  request.folderPath = params.folderPath;
  request.output = params.output;
  return handleResult(native.get().generateManifest(request));
}

var exports_obj = {};
exports_obj.isNativeAvailable = isNativeAvailable;
exports_obj.getNativeError = getNativeError;
exports_obj.initEnvironment = initEnvironment;
exports_obj.listFolders = listFolders;
exports_obj.createFolder = createFolder;
exports_obj.renameFolder = renameFolder;
exports_obj.moveFolder = moveFolder;
exports_obj.removeFolder = removeFolder;
exports_obj.listDocs = listDocs;
exports_obj.createDoc = createDoc;
exports_obj.moveDoc = moveDoc;
exports_obj.renameDoc = renameDoc;
exports_obj.removeDoc = removeDoc;
exports_obj.setDocDescription = setDocDescription;
exports_obj.getDocMeta = getDocMeta;
exports_obj.getDocByStableId = getDocByStableId;
exports_obj.getDocContent = getDocContent;
exports_obj.saveDocContent = saveDocContent;
exports_obj.generateManifest = generateManifest;
module.exports = exports_obj;
