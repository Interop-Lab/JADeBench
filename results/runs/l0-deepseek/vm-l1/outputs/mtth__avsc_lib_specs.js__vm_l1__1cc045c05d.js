'use strict';

const TYPE_REFS = {
  date: { type: 'int', logicalType: 'date' },
  decimal: { type: 'bytes', logicalType: 'decimal' },
  time_ms: { type: 'long', logicalType: 'time-millis' },
  timestamp_ms: { type: 'long', logicalType: 'timestamp-millis' }
};

class Tokenizer {
  constructor(str) {
    this.str = str;
    this.pos = 0;
  }

  next() {
    this._skipWhitespace();
    if (this.pos >= this.str.length) return null;
    const c = this.str[this.pos];
    if (c === '{' || c === '}' || c === '[' || c === ']' || c === ':' || c === ',') {
      this.pos++;
      return c;
    }
    if (c === '"') return this._readString();
    if (c === '-' || (c >= '0' && c <= '9')) return this._readNumber();
    return this._readWord();
  }

  error(msg, pos) {
    const p = pos === undefined ? this.pos : pos;
    throw new Error(msg + ' at position ' + p);
  }

  _skipWhitespace() {
    while (this.pos < this.str.length && /\s/.test(this.str[this.pos])) this.pos++;
  }

  _readString() {
    const start = this.pos;
    this.pos++;
    let out = '';
    while (this.pos < this.str.length) {
      const c = this.str[this.pos++];
      if (c === '"') return out;
      if (c === '\\') {
        const e = this.str[this.pos++];
        if (e === 'u') {
          const hex = this.str.slice(this.pos, this.pos + 4);
          if (!/^[0-9a-fA-F]{4}$/.test(hex)) this.error('Invalid unicode escape', this.pos - 2);
          out += String.fromCharCode(parseInt(hex, 16));
          this.pos += 4;
        } else {
          out += { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }[e] || e;
        }
      } else {
        out += c;
      }
    }
    this.error('Unterminated string', start);
  }

  _readNumber() {
    const start = this.pos;
    if (this.str[this.pos] === '-') this.pos++;
    while (this.pos < this.str.length && /[0-9]/.test(this.str[this.pos])) this.pos++;
    if (this.str[this.pos] === '.') {
      this.pos++;
      while (this.pos < this.str.length && /[0-9]/.test(this.str[this.pos])) this.pos++;
    }
    if (this.str[this.pos] === 'e' || this.str[this.pos] === 'E') {
      this.pos++;
      if (this.str[this.pos] === '+' || this.str[this.pos] === '-') this.pos++;
      while (this.pos < this.str.length && /[0-9]/.test(this.str[this.pos])) this.pos++;
    }
    return parseFloat(this.str.slice(start, this.pos));
  }

  _readWord() {
    const start = this.pos;
    while (this.pos < this.str.length && /[A-Za-z0-9_.$-]/.test(this.str[this.pos])) this.pos++;
    return this.str.slice(start, this.pos);
  }

  _endOfJson() {
    this._skipWhitespace();
    return this.pos >= this.str.length;
  }
}

class Reader {
  constructor(buffer, offset) {
    this.buffer = buffer;
    this.view = new DataView(buffer.buffer, buffer.byteOffset + (offset || 0), buffer.byteLength - (offset || 0));
    this.pos = 0;
  }

  static readProtocol(str, opts) {
    const reader = new Reader(str);
    return reader._readProtocol(opts);
  }

  static readSchema(str, opts) {
    const reader = new Reader(str);
    return reader._readSchema(opts);
  }

  _readProtocol(opts) {
    const protocol = { types: {}, messages: {} };
    const tokenizer = new Tokenizer(this.buffer.toString('utf8'));
    let token = tokenizer.next();
    if (token !== '{') tokenizer.error('Expected {');
    token = tokenizer.next();
    while (token !== '}') {
      if (token === null) tokenizer.error('Unexpected end of input');
      if (token !== '"') tokenizer.error('Expected property name');
      const name = token;
      token = tokenizer.next();
      if (token !== ':') tokenizer.error('Expected :');
      token = tokenizer.next();
      if (name === 'protocol') {
        protocol.name = token;
      } else if (name === 'namespace') {
        protocol.namespace = token;
      } else if (name === 'doc') {
        protocol.doc = token;
      } else if (name === 'types') {
        if (token !== '[') tokenizer.error('Expected [');
        token = tokenizer.next();
        while (token !== ']') {
          if (token === null) tokenizer.error('Unexpected end of input');
          const type = this._readType(token, tokenizer);
          protocol.types[type.name] = type;
          token = tokenizer.next();
          if (token === ',') token = tokenizer.next();
        }
      } else if (name === 'messages') {
        if (token !== '{') tokenizer.error('Expected {');
        token = tokenizer.next();
        while (token !== '}') {
          if (token === null) tokenizer.error('Unexpected end of input');
          if (token !== '"') tokenizer.error('Expected message name');
          const msgName = token;
          token = tokenizer.next();
          if (token !== ':') tokenizer.error('Expected :');
          token = tokenizer.next();
          const message = this._readMessage(token, tokenizer);
          protocol.messages[msgName] = message;
          token = tokenizer.next();
          if (token === ',') token = tokenizer.next();
        }
      } else {
        tokenizer.error('Unknown protocol property: ' + name);
      }
      token = tokenizer.next();
      if (token === ',') token = tokenizer.next();
    }
    return protocol;
  }

  _readSchema(opts) {
    const tokenizer = new Tokenizer(this.buffer.toString('utf8'));
    const token = tokenizer.next();
    if (token === null) tokenizer.error('Unexpected end of input');
    return this._readType(token, tokenizer);
  }

  _readType(token, tokenizer) {
    if (typeof token === 'string' && token[0] === '"') {
      return token;
    }
    if (token === '{') {
      const type = {};
      token = tokenizer.next();
      while (token !== '}') {
        if (token === null) tokenizer.error('Unexpected end of input');
        if (token !== '"') tokenizer.error('Expected property name');
        const name = token;
        token = tokenizer.next();
        if (token !== ':') tokenizer.error('Expected :');
        token = tokenizer.next();
        if (name === 'type') {
          type.type = token;
        } else if (name === 'name') {
          type.name = token;
        } else if (name === 'namespace') {
          type.namespace = token;
        } else if (name === 'doc') {
          type.doc = token;
        } else if (name === 'fields') {
          if (token !== '[') tokenizer.error('Expected [');
          type.fields = [];
          token = tokenizer.next();
          while (token !== ']') {
            if (token === null) tokenizer.error('Unexpected end of input');
            type.fields.push(this._readField(token, tokenizer));
            token = tokenizer.next();
            if (token === ',') token = tokenizer.next();
          }
        } else if (name === 'items') {
          type.items = this._readType(token, tokenizer);
        } else if (name === 'values') {
          type.values = this._readType(token, tokenizer);
        } else if (name === 'size') {
          type.size = token;
        } else if (name === 'symbols') {
          if (token !== '[') tokenizer.error('Expected [');
          type.symbols = [];
          token = tokenizer.next();
          while (token !== ']') {
            if (token === null) tokenizer.error('Unexpected end of input');
            type.symbols.push(token);
            token = tokenizer.next();
            if (token === ',') token = tokenizer.next();
          }
        } else if (name === 'logicalType') {
          type.logicalType = token;
        } else if (name === 'precision') {
          type.precision = token;
        } else if (name === 'scale') {
          type.scale = token;
        } else if (name === 'aliases') {
          if (token !== '[') tokenizer.error('Expected [');
          type.aliases = [];
          token = tokenizer.next();
          while (token !== ']') {
            if (token === null) tokenizer.error('Unexpected end of input');
            type.aliases.push(token);
            token = tokenizer.next();
            if (token === ',') token = tokenizer.next();
          }
        } else {
          type[name] = token;
        }
        token = tokenizer.next();
        if (token === ',') token = tokenizer.next();
      }
      return type;
    }
    if (token === '[') {
      const arr = [];
      token = tokenizer.next();
      while (token !== ']') {
        if (token === null) tokenizer.error('Unexpected end of input');
        arr.push(this._readType(token, tokenizer));
        token = tokenizer.next();
        if (token === ',') token = tokenizer.next();
      }
      return arr;
    }
    tokenizer.error('Invalid type: ' + token);
  }

  _readField(token, tokenizer) {
    const field = {};
    if (token !== '{') tokenizer.error('Expected {');
    token = tokenizer.next();
    while (token !== '}') {
      if (token === null) tokenizer.error('Unexpected end of input');
      if (token !== '"') tokenizer.error('Expected property name');
      const name = token;
      token = tokenizer.next();
      if (token !== ':') tokenizer.error('Expected :');
      token = tokenizer.next();
      if (name === 'type') {
        field.type = this._readType(token, tokenizer);
      } else if (name === 'name') {
        field.name = token;
      } else if (name === 'doc') {
        field.doc = token;
      } else if (name === 'default') {
        field.default = token;
      } else if (name === 'order') {
        field.order = token;
      } else if (name === 'aliases') {
        if (token !== '[') tokenizer.error('Expected [');
        field.aliases = [];
        token = tokenizer.next();
        while (token !== ']') {
          if (token === null) tokenizer.error('Unexpected end of input');
          field.aliases.push(token);
          token = tokenizer.next();
          if (token === ',') token = tokenizer.next();
        }
      } else {
        field[name] = token;
      }
      token = tokenizer.next();
      if (token === ',') token = tokenizer.next();
    }
    return field;
  }

  _readMessage(token, tokenizer) {
    const message = {};
    if (token !== '{') tokenizer.error('Expected {');
    token = tokenizer.next();
    while (token !== '}') {
      if (token === null) tokenizer.error('Unexpected end of input');
      if (token !== '"') tokenizer.error('Expected property name');
      const name = token;
      token = tokenizer.next();
      if (token !== ':') tokenizer.error('Expected :');
      token = tokenizer.next();
      if (name === 'request') {
        message.request = this._readType(token, tokenizer);
      } else if (name === 'response') {
        message.response = this._readType(token, tokenizer);
      } else if (name === 'errors') {
        if (token !== '[') tokenizer.error('Expected [');
        message.errors = [];
        token = tokenizer.next();
        while (token !== ']') {
          if (token === null) tokenizer.error('Unexpected end of input');
          message.errors.push(this._readType(token, tokenizer));
          token = tokenizer.next();
          if (token === ',') token = tokenizer.next();
        }
      } else if (name === 'doc') {
        message.doc = token;
      } else if (name === 'one-way') {
        message.oneWay = token;
      } else {
        message[name] = token;
      }
      token = tokenizer.next();
      if (token === ',') token = tokenizer.next();
    }
    return message;
  }
}

function assembleProtocol(schema, opts) {
  const protocol = { types: {}, messages: {} };
  const tokenizer = new Tokenizer(schema);
  let token = tokenizer.next();
  if (token !== '{') tokenizer.error('Expected {');
  token = tokenizer.next();
  while (token !== '}') {
    if (token === null) tokenizer.error('Unexpected end of input');
    if (token !== '"') tokenizer.error('Expected property name');
    const name = token;
    token = tokenizer.next();
    if (token !== ':') tokenizer.error('Expected :');
    token = tokenizer.next();
    if (name === 'protocol') {
      protocol.name = token;
    } else if (name === 'namespace') {
      protocol.namespace = token;
    } else if (name === 'doc') {
      protocol.doc = token;
    } else if (name === 'types') {
      if (token !== '[') tokenizer.error('Expected [');
      token = tokenizer.next();
      while (token !== ']') {
        if (token === null) tokenizer.error('Unexpected end of input');
        const type = this._readType(token, tokenizer);
        protocol.types[type.name] = type;
        token = tokenizer.next();
        if (token === ',') token = tokenizer.next();
      }
    } else if (name === 'messages') {
      if (token !== '{') tokenizer.error('Expected {');
      token = tokenizer.next();
      while (token !== '}') {
        if (token === null) tokenizer.error('Unexpected end of input');
        if (token !== '"') tokenizer.error('Expected message name');
        const msgName = token;
        token = tokenizer.next();
        if (token !== ':') tokenizer.error('Expected :');
        token = tokenizer.next();
        const message = this._readMessage(token, tokenizer);
        protocol.messages[msgName] = message;
        token = tokenizer.next();
        if (token === ',') token = tokenizer.next();
      }
    } else {
      tokenizer.error('Unknown protocol property: ' + name);
    }
    token = tokenizer.next();
    if (token === ',') token = tokenizer.next();
  }
  return protocol;
}

function read(schema) {
  const reader = new Reader(schema);
  return reader._readSchema();
}

function extractJavadoc(str) {
  const out = [];
  const lines = str.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*\/\*\*?\s*(.*?)\s*\*\/\s*$/);
    if (match) {
      out.push(match[1]);
    } else if (/^\s*\/\*\*/.test(line)) {
      let doc = line.replace(/^\s*\/\*\*/, '').replace(/\s*\*\/\s*$/, '');
      while (++i < lines.length && !/\*\/\s*$/.test(lines[i])) {
        doc += '\n' + lines[i].replace(/^\s*\*\s?/, '');
      }
      if (i < lines.length) {
        doc += '\n' + lines[i].replace(/^\s*\*\s?/, '').replace(/\s*\*\/\s*$/, '');
      }
      out.push(doc);
    }
  }
  return out;
}

function protocolNamespace(protocol) {
  return protocol.namespace || '';
}

module.exports = {
  Tokenizer,
  assembleProtocol,
  read,
  readProtocol: Reader.readProtocol,
  readSchema: Reader.readSchema
};
