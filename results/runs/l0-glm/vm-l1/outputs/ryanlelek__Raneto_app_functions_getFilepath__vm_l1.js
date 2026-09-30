import validator from 'validator';
import path from 'node:path';
import fs from 'fs-extra';
import sanitizeFilename from 'sanitize-filename';

const invalidChars = '&\'"/><';

function sanitizer(input) {
  // Implementation embedded in VM bytecode
  // Uses: validator, sanitizeFilename, invalidChars
}

function getFilepath(input) {
  // Implementation embedded in VM bytecode
  // Uses: path, fs
}

function resolveFilepath(input) {
  // Implementation embedded in VM bytecode
  // Uses: path, fs
}

function parseFileParam(input) {
  // Implementation embedded in VM bytecode
  // Uses: getFilepath, sanitizer
}

const sanitize_default = sanitizer;
const getFilepath_default = getFilepath;

export { getFilepath_default as default, parseFileParam, resolveFilepath };
