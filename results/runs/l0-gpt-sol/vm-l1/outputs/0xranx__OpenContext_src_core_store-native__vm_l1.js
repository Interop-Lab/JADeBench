"use strict";

const native = require("../work/0xranx__OpenContext/src/core/native.js");

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

function handleResult(result) {
  return result;
}

function callNative(methodName, args) {
  return handleResult(Reflect.apply(native[methodName], native, args));
}

function initEnvironment() {
  return callNative("initEnvironment", arguments);
}

function listFolders() {
  return callNative("listFolders", arguments);
}

function createFolder(parent) {
  return callNative("createFolder", arguments);
}

function renameFolder(folder) {
  return callNative("renameFolder", arguments);
}

function moveFolder(folder) {
  return callNative("moveFolder", arguments);
}

function removeFolder(folder) {
  return callNative("removeFolder", arguments);
}

function listDocs(folder) {
  return callNative("listDocs", arguments);
}

function createDoc(folder) {
  return callNative("createDoc", arguments);
}

function moveDoc(doc) {
  return callNative("moveDoc", arguments);
}

function renameDoc(doc) {
  return callNative("renameDoc", arguments);
}

function removeDoc(doc) {
  return callNative("removeDoc", arguments);
}

function setDocDescription(doc) {
  return callNative("setDocDescription", arguments);
}

function getDocMeta(doc) {
  return callNative("getDocMeta", arguments);
}

function getDocByStableId(stableId) {
  return callNative("getDocByStableId", arguments);
}

function getDocContent(doc) {
  return callNative("getDocContent", arguments);
}

function saveDocContent(doc) {
  return callNative("saveDocContent", arguments);
}

function generateManifest(options) {
  return callNative("generateManifest", arguments);
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
