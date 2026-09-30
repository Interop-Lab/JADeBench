var QUAD = new Float32Array([-1, -1, 3, -1, -1, 3]);
var VERT = '#version 300 es\nin vec2 position;\nout vec2 vUv;\nvoid main() {\n  vUv = position * 0.5 + 0.5;\n  gl_Position = vec4(position, 0.0, 1.0);\n}';
var FRAG_ACCUM = '#version 300 es\nprecision highp float;\nuniform sampler2D src;\nin vec2 vUv;\nout vec4 fragColor;\nvoid main() { fragColor = texture(src, vUv); }';
var FRAG_RESOLVE = '#version 300 es\nprecision highp float;\nuniform sampler2D accum;\nuniform float scale;\nin vec2 vUv;\nout vec4 fragColor;\nvoid main() { fragColor = vec4(texture(accum, vUv).rgb * scale, 1.0); }';

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error('Shader compile error: ' + info);
  }
  return shader;
}

function program(gl, vertSrc, fragSrc) {
  const vert = compile(gl, gl.VERTEX_SHADER, vertSrc);
  const frag = compile(gl, gl.FRAGMENT_SHADER, fragSrc);
  const prog = gl.createProgram();
  gl.attachShader(prog, vert);
  gl.attachShader(prog, frag);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(prog);
    gl.deleteProgram(prog);
    throw new Error('Program link error: ' + info);
  }
  gl.deleteShader(vert);
  gl.deleteShader(frag);
  return prog;
}

function isWebGLCanvas(canvas) {
  try {
    const gl = canvas.getContext('webgl2');
    if (!gl) return false;
    const ext = gl.getExtension('EXT_color_buffer_float');
    return !!ext;
  } catch (e) {
    return false;
  }
}

function chooseBackend(canvas, options) {
  const gl = canvas.getContext('webgl2', options);
  if (!gl) return null;
  const ext = gl.getExtension('EXT_color_buffer_float');
  if (!ext) return null;
  return gl;
}

function createMotionBlur(canvas, options) {
  const gl = chooseBackend(canvas, options);
  if (!gl) return null;
  return new GPUMotionBlur(gl, canvas);
}

class MotionBlur {
  constructor() {
    this.width = 0;
    this.height = 0;
    this.accum = new Float32Array(0);
    this.count = 0;
  }

  resize(width, height) {
    if (this.width === width && this.height === height && this.accum) return;
    this.width = width;
    this.height = height;
    this.accum = new Float32Array(width * height * 4);
    this.count = 0;
  }

  reset() {
    this.accum.fill(0);
    this.count = 0;
  }

  accumulate(data) {
    const len = this.accum.length;
    for (let i = 0; i < len; i++) {
      this.accum[i] += data[i];
    }
    this.count++;
  }

  resolve(target) {
    const scale = 1.0 / this.count;
    const len = this.accum.length;
    for (let i = 0; i < len; i++) {
      target[i] = this.accum[i] * scale;
    }
  }

  dispose() {}
}

class GPUMotionBlur {
  static isSupported() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      if (!gl) return false;
      return !!gl.getExtension('EXT_color_buffer_float');
    } catch (e) {
      return false;
    }
  }

  constructor(gl, canvas) {
    this.gl = gl;
    this.canvas = canvas;
    this.width = 0;
    this.height = 0;
    this.accumTex = null;
    this.fbo = null;
    this.program = null;
    this.resolveProgram = null;
    this.vao = null;
    this._init();
  }

  _init() {
    const gl = this.gl;
    this.program = program(gl, VERT, FRAG_ACCUM);
    this.resolveProgram = program(gl, VERT, FRAG_RESOLVE);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
  }

  resize(width, height) {
    if (this.width === width && this.height === height && this.accumTex) return;
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

  reset() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  accumulate() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.uniform1i(gl.getUniformLocation(this.program, 'src'), 0);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  resolve() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.resolveProgram);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.uniform1i(gl.getUniformLocation(this.resolveProgram, 'accum'), 0);
    gl.uniform1f(gl.getUniformLocation(this.resolveProgram, 'scale'), 1.0);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  dispose() {
    const gl = this.gl;
    if (this.accumTex) gl.deleteTexture(this.accumTex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    if (this.program) gl.deleteProgram(this.program);
    if (this.resolveProgram) gl.deleteProgram(this.resolveProgram);
    if (this.vao) gl.deleteVertexArray(this.vao);
  }
}

export { chooseBackend, createMotionBlur, isWebGLCanvas };
