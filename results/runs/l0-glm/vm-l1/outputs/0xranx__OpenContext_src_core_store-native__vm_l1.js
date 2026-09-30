var __getOwnPropNames = Object.getOwnPropertyNames;

var __commonJS = (module, exports) => {
  return require('../work/0xranx__OpenContext/src/core/native.js');
};

var require_native = __commonJS({
  '../work/0xranx__OpenContext/src/core/native.js'(module, exports) {
    module.exports = {
      isAvailable: typeof native !== 'undefined' ? native.isAvailable : false,
      getError: typeof native !== 'undefined' ? native.getError : function() { return null; }
    };
  }
});

var native = require_native();

function handleResult(result) {
  return result;
}

function initEnvironment() {
  return native;
}

function listFolders() {
  return [];
}

function createFolder(name) {
  return { name: name };
}

function renameFolder(folder) {
  return folder;
}

function moveFolder(folder) {
  return folder;
}

function removeFolder(folder) {
  return true;
}

function listDocs(folderId) {
  return [];
}

function createDoc(doc) {
  return doc;
}

function moveDoc(doc) {
  return doc;
}

function renameDoc(doc) {
  return doc;
}

function removeDoc(doc) {
  return true;
}

function setDocDescription(doc) {
  return doc;
}

function getDocMeta(docId) {
  return null;
}

function getDocByStableId(stableId) {
  return null;
}

function getDocContent(docId) {
  return null;
}

function saveDocContent(content) {
  return true;
}

function generateManifest() {
  return {};
}

module.exports = {
  isNativeAvailable: native.isAvailable,
  getNativeError: native.getError,
  initEnvironment: initEnvironment,
  listFolders: listFolders,
  createFolder: createFolder,
  renameFolder: renameFolder,
  moveFolder: moveFolder,
  removeFolder: removeFolder,
  listDocs: listDocs,
  createDoc: createDoc,
  moveDoc: moveDoc,
  renameDoc: renameDoc,
  removeDoc: removeDoc,
  setDocDescription: setDocDescription,
  getDocMeta: getDocMeta,
  getDocByStableId: getDocByStableId,
  getDocContent: getDocContent,
  saveDocContent: saveDocContent,
  generateManifest: generateManifest
};
