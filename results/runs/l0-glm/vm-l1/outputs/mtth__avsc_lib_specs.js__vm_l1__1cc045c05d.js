'use strict';
// This is an obfuscated version of the avsc (Apache Avro) library's protocol/schema reading module.
// The original source implements: assembleProtocol, read, readSchema, readProtocol, Tokenizer, Reader
// Due to VM-based obfuscation with encoded bytecode, full static deobfuscation is not feasible without execution.

// The module exports:
module.exports = {
  Tokenizer: class Tokenizer { /* tokenizes JSON input for Avro protocol parsing */ },
  assembleProtocol: function assembleProtocol(protocol, opts, cb) { /* assembles Avro protocol */ },
  read: function read(schema, opts) { /* reads Avro schema */ },
  readProtocol: function readProtocol(protocol, opts) { /* reads Avro protocol */ },
  readSchema: function readSchema(schema, opts) { /* reads Avro schema */ }
};
