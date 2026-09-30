var MotionBlur = class {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", {
      willReadFrequently: true
    });
    this.accum = null;
    this.width = 0;
    this.height = 0;
    this.count = 0;
  }
  #ensureSize(_0x1cb41b, _0x46cc5c) {
    if (this.width === _0x1cb41b && this.height === _0x46cc5c && this.accum) {
      return;
    }
    this.width = this.canvas.width = _0x1cb41b;
    this.height = this.canvas.height = _0x46cc5c;
    this.accum = new Float32Array(_0x1cb41b * _0x46cc5c * 4);
    this.count = 0;
  }
  add(_0x339700) {
    this.#ensureSize(_0x339700.width, _0x339700.height);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(_0x339700, 0, 0);
    const {
      data: _0x1ee4bf
    } = this.ctx.getImageData(0, 0, this.width, this.height);
    const _0xb6e4 = this.accum;
    for (let _0x248582 = 0; _0x248582 < _0xb6e4.length; _0x248582++) {
      _0xb6e4[_0x248582] += _0x1ee4bf[_0x248582];
    }
    this.count++;
  }
  resolve() {
    const _0x32586d = this.ctx.createImageData(this.width, this.height);
    const _0x521115 = _0x32586d.data;
    const _0xae6ffe = this.accum;
    const _0x2042f9 = this.count || 1;
    for (let _0xb8b278 = 0; _0xb8b278 < _0xae6ffe.length; _0xb8b278++) {
      _0x521115[_0xb8b278] = _0xae6ffe[_0xb8b278] / _0x2042f9;
    }
    this.ctx.putImageData(_0x32586d, 0, 0);
    return this.canvas;
  }
  reset() {
    if (this.accum) {
      this.accum.fill(0);
    }
    this.count = 0;
  }
  dispose() {}
};
var _supported;
var QUAD = new Float32Array([-1, -1, 3, -1, -1, 3]);
var VERT = "#version 300 es\nin vec2 position;\nout vec2 vUv;\nvoid main() {\n  vUv = position * 0.5 + 0.5;\n  gl_Position = vec4(position, 0.0, 1.0);\n}";
var FRAG_ACCUM = "#version 300 es\nprecision highp float;\nuniform sampler2D src;\nin vec2 vUv;\nout vec4 fragColor;\nvoid main() { fragColor = texture(src, vUv); }";
var FRAG_RESOLVE = "#version 300 es\nprecision highp float;\nuniform sampler2D accum;\nuniform float scale;\nin vec2 vUv;\nout vec4 fragColor;\nvoid main() { fragColor = vec4(texture(accum, vUv).rgb * scale, 1.0); }";
function compile(_0x594e4f, _0x2f6e6d, _0x15854c) {
  const _0x2b8ec4 = _0x594e4f.createShader(_0x2f6e6d);
  _0x594e4f.shaderSource(_0x2b8ec4, _0x15854c);
  _0x594e4f.compileShader(_0x2b8ec4);
  if (!_0x594e4f.getShaderParameter(_0x2b8ec4, _0x594e4f.COMPILE_STATUS)) {
    throw new Error("[GPUMotionBlur] shader: " + _0x594e4f.getShaderInfoLog(_0x2b8ec4));
  }
  return _0x2b8ec4;
}
function program(_0x34256b, _0x4a2ca4, _0x396f89) {
  const _0x78f5ab = _0x34256b.createProgram();
  _0x34256b.attachShader(_0x78f5ab, compile(_0x34256b, _0x34256b.VERTEX_SHADER, _0x4a2ca4));
  _0x34256b.attachShader(_0x78f5ab, compile(_0x34256b, _0x34256b.FRAGMENT_SHADER, _0x396f89));
  _0x34256b.bindAttribLocation(_0x78f5ab, 0, "position");
  _0x34256b.linkProgram(_0x78f5ab);
  if (!_0x34256b.getProgramParameter(_0x78f5ab, _0x34256b.LINK_STATUS)) {
    throw new Error("[GPUMotionBlur] link: " + _0x34256b.getProgramInfoLog(_0x78f5ab));
  }
  return _0x78f5ab;
}
var GPUMotionBlur = class {
  static isSupported() {
    if (_supported !== undefined) {
      return _supported;
    }
    _supported = false;
    try {
      const _0x3b0459 = document.createElement("canvas");
      const _0x1f36a0 = _0x3b0459.getContext("webgl2");
      _supported = !!_0x1f36a0 && !!_0x1f36a0.getExtension("EXT_color_buffer_float");
    } catch {
      _supported = false;
    }
    return _supported;
  }
  constructor() {
    this.canvas = document.createElement("canvas");
    const _0x26a303 = this.canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true
    });
    if (!_0x26a303 || !_0x26a303.getExtension("EXT_color_buffer_float")) {
      throw new Error("[GPUMotionBlur] WebGL2 + EXT_color_buffer_float required");
    }
    this.gl = _0x26a303;
    this.accumProgram = program(_0x26a303, VERT, FRAG_ACCUM);
    this.resolveProgram = program(_0x26a303, VERT, FRAG_RESOLVE);
    this.srcLoc = _0x26a303.getUniformLocation(this.accumProgram, "src");
    this.accumLoc = _0x26a303.getUniformLocation(this.resolveProgram, "accum");
    this.scaleLoc = _0x26a303.getUniformLocation(this.resolveProgram, "scale");
    this.vao = _0x26a303.createVertexArray();
    _0x26a303.bindVertexArray(this.vao);
    const _0x357325 = _0x26a303.createBuffer();
    _0x26a303.bindBuffer(_0x26a303.ARRAY_BUFFER, _0x357325);
    _0x26a303.bufferData(_0x26a303.ARRAY_BUFFER, QUAD, _0x26a303.STATIC_DRAW);
    _0x26a303.enableVertexAttribArray(0);
    _0x26a303.vertexAttribPointer(0, 2, _0x26a303.FLOAT, false, 0, 0);
    _0x26a303.bindVertexArray(null);
    this.srcTex = _0x26a303.createTexture();
    _0x26a303.bindTexture(_0x26a303.TEXTURE_2D, this.srcTex);
    _0x26a303.texParameteri(_0x26a303.TEXTURE_2D, _0x26a303.TEXTURE_MIN_FILTER, _0x26a303.LINEAR);
    _0x26a303.texParameteri(_0x26a303.TEXTURE_2D, _0x26a303.TEXTURE_MAG_FILTER, _0x26a303.LINEAR);
    _0x26a303.texParameteri(_0x26a303.TEXTURE_2D, _0x26a303.TEXTURE_WRAP_S, _0x26a303.CLAMP_TO_EDGE);
    _0x26a303.texParameteri(_0x26a303.TEXTURE_2D, _0x26a303.TEXTURE_WRAP_T, _0x26a303.CLAMP_TO_EDGE);
    _0x26a303.pixelStorei(_0x26a303.UNPACK_FLIP_Y_WEBGL, true);
    this.accumTex = null;
    this.fbo = null;
    this.width = 0;
    this.height = 0;
    this.count = 0;
  }
  #ensureSize(_0x3eb712, _0x19e6ed) {
    if (this.width === _0x3eb712 && this.height === _0x19e6ed && this.fbo) {
      return;
    }
    const _0x1885b6 = this.gl;
    this.width = this.canvas.width = _0x3eb712;
    this.height = this.canvas.height = _0x19e6ed;
    if (this.accumTex) {
      _0x1885b6.deleteTexture(this.accumTex);
    }
    if (this.fbo) {
      _0x1885b6.deleteFramebuffer(this.fbo);
    }
    this.accumTex = _0x1885b6.createTexture();
    _0x1885b6.bindTexture(_0x1885b6.TEXTURE_2D, this.accumTex);
    _0x1885b6.texImage2D(_0x1885b6.TEXTURE_2D, 0, _0x1885b6.RGBA16F, _0x3eb712, _0x19e6ed, 0, _0x1885b6.RGBA, _0x1885b6.HALF_FLOAT, null);
    _0x1885b6.texParameteri(_0x1885b6.TEXTURE_2D, _0x1885b6.TEXTURE_MIN_FILTER, _0x1885b6.NEAREST);
    _0x1885b6.texParameteri(_0x1885b6.TEXTURE_2D, _0x1885b6.TEXTURE_MAG_FILTER, _0x1885b6.NEAREST);
    _0x1885b6.texParameteri(_0x1885b6.TEXTURE_2D, _0x1885b6.TEXTURE_WRAP_S, _0x1885b6.CLAMP_TO_EDGE);
    _0x1885b6.texParameteri(_0x1885b6.TEXTURE_2D, _0x1885b6.TEXTURE_WRAP_T, _0x1885b6.CLAMP_TO_EDGE);
    this.fbo = _0x1885b6.createFramebuffer();
    _0x1885b6.bindFramebuffer(_0x1885b6.FRAMEBUFFER, this.fbo);
    _0x1885b6.framebufferTexture2D(_0x1885b6.FRAMEBUFFER, _0x1885b6.COLOR_ATTACHMENT0, _0x1885b6.TEXTURE_2D, this.accumTex, 0);
    _0x1885b6.bindFramebuffer(_0x1885b6.FRAMEBUFFER, null);
    this.reset();
  }
  add(_0x4e6b5f) {
    this.#ensureSize(_0x4e6b5f.width, _0x4e6b5f.height);
    const _0x51c6a8 = this.gl;
    _0x51c6a8.bindTexture(_0x51c6a8.TEXTURE_2D, this.srcTex);
    _0x51c6a8.texImage2D(_0x51c6a8.TEXTURE_2D, 0, _0x51c6a8.RGBA, _0x51c6a8.RGBA, _0x51c6a8.UNSIGNED_BYTE, _0x4e6b5f);
    _0x51c6a8.bindFramebuffer(_0x51c6a8.FRAMEBUFFER, this.fbo);
    _0x51c6a8.viewport(0, 0, this.width, this.height);
    _0x51c6a8.enable(_0x51c6a8.BLEND);
    _0x51c6a8.blendEquation(_0x51c6a8.FUNC_ADD);
    _0x51c6a8.blendFunc(_0x51c6a8.ONE, _0x51c6a8.ONE);
    _0x51c6a8.useProgram(this.accumProgram);
    _0x51c6a8.uniform1i(this.srcLoc, 0);
    _0x51c6a8.activeTexture(_0x51c6a8.TEXTURE0);
    _0x51c6a8.bindTexture(_0x51c6a8.TEXTURE_2D, this.srcTex);
    _0x51c6a8.bindVertexArray(this.vao);
    _0x51c6a8.drawArrays(_0x51c6a8.TRIANGLES, 0, 3);
    _0x51c6a8.bindVertexArray(null);
    _0x51c6a8.disable(_0x51c6a8.BLEND);
    _0x51c6a8.bindFramebuffer(_0x51c6a8.FRAMEBUFFER, null);
    this.count++;
  }
  resolve() {
    const _0x10516c = this.gl;
    _0x10516c.bindFramebuffer(_0x10516c.FRAMEBUFFER, null);
    _0x10516c.viewport(0, 0, this.width, this.height);
    _0x10516c.useProgram(this.resolveProgram);
    _0x10516c.uniform1f(this.scaleLoc, 1 / (this.count || 1));
    _0x10516c.uniform1i(this.accumLoc, 0);
    _0x10516c.activeTexture(_0x10516c.TEXTURE0);
    _0x10516c.bindTexture(_0x10516c.TEXTURE_2D, this.accumTex);
    _0x10516c.bindVertexArray(this.vao);
    _0x10516c.drawArrays(_0x10516c.TRIANGLES, 0, 3);
    _0x10516c.bindVertexArray(null);
    return this.canvas;
  }
  reset() {
    const _0x44c7f6 = this.gl;
    if (this.fbo) {
      _0x44c7f6.bindFramebuffer(_0x44c7f6.FRAMEBUFFER, this.fbo);
      _0x44c7f6.viewport(0, 0, this.width, this.height);
      _0x44c7f6.clearColor(0, 0, 0, 0);
      _0x44c7f6.clear(_0x44c7f6.COLOR_BUFFER_BIT);
      _0x44c7f6.bindFramebuffer(_0x44c7f6.FRAMEBUFFER, null);
    }
    this.count = 0;
  }
  dispose() {
    const _0xc9aadb = this.gl;
    if (!_0xc9aadb) {
      return;
    }
    try {
      if (this.accumTex) {
        _0xc9aadb.deleteTexture(this.accumTex);
      }
      if (this.srcTex) {
        _0xc9aadb.deleteTexture(this.srcTex);
      }
      if (this.fbo) {
        _0xc9aadb.deleteFramebuffer(this.fbo);
      }
      _0xc9aadb.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {}
    this.gl = null;
    this.accumTex = null;
    this.fbo = null;
  }
};
function isWebGLCanvas(_0x394679) {
  if (!_0x394679 || typeof _0x394679.getContext !== "function") {
    return false;
  }
  try {
    if (_0x394679.getContext("2d")) {
      return false;
    }
    return !!_0x394679.getContext("webgl2") || !!_0x394679.getContext("webgl");
  } catch {
    return false;
  }
}
function chooseBackend(_0x9745ea, _0x2e7174, _0xc7fbf2 = "auto") {
  if (_0xc7fbf2 === "cpu") {
    return "cpu";
  }
  const _0x559ed0 = _0xc7fbf2 === "gpu" || _0xc7fbf2 === "auto" && _0x2e7174 > 2 && isWebGLCanvas(_0x9745ea);
  if (_0x559ed0 && GPUMotionBlur.isSupported()) {
    return "gpu";
  } else {
    return "cpu";
  }
}
function createMotionBlur(_0x3c082d, _0x49b66c, _0x4e862b = "auto") {
  if (chooseBackend(_0x3c082d, _0x49b66c, _0x4e862b) === "gpu") {
    try {
      return new GPUMotionBlur();
    } catch {}
  }
  return new MotionBlur();
}
export { chooseBackend, createMotionBlur, isWebGLCanvas };