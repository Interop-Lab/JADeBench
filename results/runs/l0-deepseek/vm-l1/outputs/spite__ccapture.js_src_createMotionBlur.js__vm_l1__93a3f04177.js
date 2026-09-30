const _supported = typeof WebGL2RenderingContext !== 'undefined';

const QUAD = new Float32Array([-1, -1, 3, -1, -1, 3]);

const VERT = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const FRAG_ACCUM = `#version 300 es
precision highp float;
uniform sampler2D src;
in vec2 vUv;
out vec4 fragColor;
void main() { fragColor = texture(src, vUv); }`;

const FRAG_RESOLVE = `#version 300 es
precision highp float;
uniform sampler2D accum;
uniform float scale;
in vec2 vUv;
out vec4 fragColor;
void main() { fragColor = vec4(texture(accum, vUv).rgb * scale, 1.0); }`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(info);
  }
  return shader;
}

function program(gl, vertSource, fragSource) {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSource);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error(info);
  }
  return prog;
}

class MotionBlur {
  constructor() {
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.accum = null;
    this.count = 0;
  }

  resize(width, height) {
    if (this.width === width && this.height === height && this.accum) return;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.accum = new Float32Array(width * height * 4);
    this.count = 0;
  }

  add() {}

  resolve() {}

  reset() {}

  dispose() {}
}

class GPUMotionBlur extends MotionBlur {
  static isSupported() {
    return _supported;
  }

  constructor(canvas) {
    super();
    this.canvas = canvas;
    this.gl = canvas.getContext('webgl2');
    if (!this.gl) throw new Error('WebGL2 not supported');
    this.accumTex = null;
    this.fbo = null;
    this.progAccum = program(this.gl, VERT, FRAG_ACCUM);
    this.progResolve = program(this.gl, VERT, FRAG_RESOLVE);
    this.uAccum = this.gl.getUniformLocation(this.progResolve, 'accum');
    this.uScale = this.gl.getUniformLocation(this.progResolve, 'scale');
    this.uSrc = this.gl.getUniformLocation(this.progAccum, 'src');
    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);
    this.buf = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buf);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, QUAD, this.gl.STATIC_DRAW);
    const loc = this.gl.getAttribLocation(this.progAccum, 'position');
    this.gl.enableVertexAttribArray(loc);
    this.gl.vertexAttribPointer(loc, 2, this.gl.FLOAT, false, 0, 0);
  }

  resize(width, height) {
    if (this.width === width && this.height === height && this.fbo) return;
    const gl = this.gl;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    if (this.accumTex) gl.deleteTexture(this.accumTex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    this.accumTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.accumTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.reset();
  }

  add() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.progAccum);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.uniform1i(this.uSrc, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.count++;
  }

  resolve() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.progResolve);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.uniform1i(this.uAccum, 0);
    gl.uniform1f(this.uScale, 1 / this.count);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  reset() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.progAccum);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.count = 0;
  }

  dispose() {
    const gl = this.gl;
    if (this.accumTex) gl.deleteTexture(this.accumTex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    gl.deleteBuffer(this.buf);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.progAccum);
    gl.deleteProgram(this.progResolve);
  }
}

function isWebGLCanvas(canvas) {
  return canvas && typeof canvas.getContext === 'function' && canvas.getContext('webgl2') !== null;
}

function chooseBackend(canvas, opts = {}) {
  if (opts.forceCPU) return new MotionBlur();
  if (isWebGLCanvas(canvas)) return new GPUMotionBlur(canvas);
  return new MotionBlur();
}

function createMotionBlur(canvas, opts = {}) {
  return chooseBackend(canvas, opts);
}

export { chooseBackend, createMotionBlur, isWebGLCanvas };
