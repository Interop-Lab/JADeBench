'use strict';

const { tokenChars } = require('./validation');

function push(destination, name, value) {
if (destination[name] === undefined) {
destination[name] = [value];
} else {
destination[name].push(value);
}
}

function parse(header) {
const offers = Object.create(null);
let index = 0;

function skipWhitespace() {
while (index < header.length) {
const code = header.charCodeAt(index);
if (code !== 0x20 && code !== 0x09) break;
index++;
}
}

function parseToken() {
const start = index;

while (index < header.length && tokenChars[header.charCodeAt(index)]) {
index++;
}

if (start === index) {
throw new SyntaxError(`Unexpected character at ${index}`);
}

return header.slice(start, index);
}

function parseValue() {
if (header[index] === '"') {
index++;
let value = '';

while (index < header.length) {
const character = header[index++];

if (character === '"') {
return value;
}

if (character === '\\') {
if (index >= header.length) {
throw new SyntaxError(`Unexpected end of input`);
}
value += header[index++];
} else {
value += character;
}
}

throw new SyntaxError(`Unexpected end of input`);
}

return parseToken();
}

while (index < header.length) {
skipWhitespace();

if (index >= header.length) break;

const extensionName = parseToken();
const params = Object.create(null);

skipWhitespace();

while (index < header.length && header[index] === ';') {
index++;
skipWhitespace();

const parameterName = parseToken();
skipWhitespace();

let parameterValue = true;

if (header[index] === '=') {
index++;
skipWhitespace();
parameterValue = parseValue();
skipWhitespace();
}

push(params, parameterName, parameterValue);
skipWhitespace();
}

push(offers, extensionName, params);

if (index >= header.length) break;

if (header[index] !== ',') {
throw new SyntaxError(`Unexpected character at ${index}`);
}

index++;
skipWhitespace();

if (index >= header.length) {
throw new SyntaxError(`Unexpected end of input`);
}
}

return offers;
}

function format(object) {
return Object.keys(object)
.map((extensionName) => {
let offers = object[extensionName];

if (!Array.isArray(offers)) {
offers = [offers];
}

return offers
.map((parameters) => {
const keys = Object.keys(parameters);

if (keys.length === 0) {
return extensionName;
}

return `${extensionName}; ${keys
.map((parameterName) => {
let values = parameters[parameterName];

if (!Array.isArray(values)) {
values = [values];
}

return values
.map((value) =>
value === true ? parameterName : `${parameterName}=${value}`
)
.join('; ')
})
.join('; ')}`;
})
.join(', ');
})
.join(', ');
}

module.exports = {
format,
parse
};
