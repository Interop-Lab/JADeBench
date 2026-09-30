"use strict";

const native = require("../native");
const {
  normalizeResults,
  formatPlain,
  formatJson
} = require("./formatter");

const isNativeAvailable = native.isAvailable;
const getNativeError = native.getError;

function requireNative() {
  if (isNativeAvailable) {
    return;
  }

  const error = getNativeError();
  if (error instanceof Error) {
    throw error;
  }

  throw new Error(error || "Native module is not available");
}

class NativeSearcher {
  constructor(...args) {
    requireNative();
    this.nativeSearcher = new native.NativeSearcher(...args);
  }

  initialize(...args) {
    return this.nativeSearcher.initialize(...args);
  }

  search(options) {
    return normalizeResults(this.nativeSearcher.search(options));
  }

  formatResults(results, options) {
    if (
      options === "json" ||
      (options && typeof options === "object" && options.format === "json")
    ) {
      return this.formatResultsJson(results, options);
    }

    return this.formatResultsPlain(results, options);
  }

  formatResultsPlain(results, options) {
    return formatPlain(results, options);
  }

  formatResultsJson(results, options) {
    return formatJson(results, options);
  }
}

class NativeIndexer {
  constructor(...args) {
    requireNative();
    this.nativeIndexer = new native.NativeIndexer(...args);
  }

  initialize(...args) {
    return this.nativeIndexer.initialize(...args);
  }

  buildIndex(...args) {
    return this.nativeIndexer.buildIndex(...args);
  }

  addFile(file) {
    return this.nativeIndexer.addFile(file);
  }

  removeFile(file) {
    return this.nativeIndexer.removeFile(file);
  }

  clean(...args) {
    return this.nativeIndexer.clean(...args);
  }

  getStats(...args) {
    return this.nativeIndexer.getStats(...args);
  }

  indexExists(...args) {
    return this.nativeIndexer.indexExists(...args);
  }
}

module.exports = {
  isNativeAvailable,
  getNativeError,
  NativeSearcher,
  NativeIndexer
};
