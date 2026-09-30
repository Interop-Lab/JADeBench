class MotionBlur {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.accum = null;
    this.width = 0;
    this.height = 0;
    this.count = 0;
  }

  #ensureSize(width, height) {
    if (this.width === width && this.height === height && this.accum) return;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.accum = new Float32Array(width * height * 4);
    this.count = 0;
  }

  add(source) {
    this.#ensureSize(source.width, source.height);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(source, 0, 0);
    const { data } = this.ctx.getImageData(0, 0, this.width, this.height);
    for (let index = 0; index < this.accum.length; index++) {
      this.accum[index] += data[index];
    }
    this.count++;
  }

  resolve() {
    const image = this.ctx.createImageData(this.width, this.height);
    const divisor = this.count || 1;
    for (let index = 0; index < this.accum.length; index++) {
      image.data[index] = this.accum[index] / divisor;
    }
    this.ctx.putImageData(image, 0, 0);
    return this.canvas;
  }

  reset() {
    if (this.accum) this.accum.fill(0);
    this.count = 0;
  }

  dispose() {}
}

let supported;

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
    throw new Error(`[GPUMotionBlur] shader: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}

function program(gl, vertexSource, fragmentSource) {
  const result = gl.createProgram();
  gl.attachShader(result, compile(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(result, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.bindAttribLocation(result, 0, 'position');
  gl.linkProgram(result);
  if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
    throw new Error(`[GPUMotionBlur] link: ${gl.getProgramInfoLog(result)}`);
  }
  return result;
}

class GPUMotionBlur {
  static isSupported() {
    if (supported !== undefined) return supported;
    supported = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      supported = Boolean(gl && gl.getExtension('EXT_color_buffer_float'));
    } catch {
      supported = false;
    }
    return supported;
  }

  constructor() {
    this.canvas = document.createElement('canvas');
    const gl = this.canvas.getContext('webgl2', {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
      throw new Error('[GPUMotionBlur] WebGL2 + EXT_color_buffer_float required');
    }
    this.gl = gl;
    this.accumProgram = program(gl, VERT, FRAG_ACCUM);
    this.resolveProgram = program(gl, VERT, FRAG_RESOLVE);
    this.srcLoc = gl.getUniformLocation(this.accumProgram, 'src');
    this.accumLoc = gl.getUniformLocation(this.resolveProgram, 'accum');
    this.scaleLoc = gl.getUniformLocation(this.resolveProgram, 'scale');
    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);
    this.srcTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.accumTex = null;
    this.fbo = null;
    this.width = 0;
    this.height = 0;
    this.count = 0;
  }

  #ensureSize(width, height) {
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

  add(source) {
    this.#ensureSize(source.width, source.height);
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.useProgram(this.accumProgram);
    gl.uniform1i(this.srcLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    gl.disable(gl.BLEND);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.count++;
  }

  resolve() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.resolveProgram);
    gl.uniform1f(this.scaleLoc, 1 / (this.count || 1));
    gl.uniform1i(this.accumLoc, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
    return this.canvas;
  }

  reset() {
    const gl = this.gl;
    if (this.fbo) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
      gl.viewport(0, 0, this.width, this.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    this.count = 0;
  }

  dispose() {
    const gl = this.gl;
    if (!gl) return;
    try {
      if (this.accumTex) gl.deleteTexture(this.accumTex);
      if (this.srcTex) gl.deleteTexture(this.srcTex);
      if (this.fbo) gl.deleteFramebuffer(this.fbo);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {}
    this.gl = null;
    this.accumTex = null;
    this.srcTex = null;
  }
}

function isWebGLCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return false;
  try {
    if (canvas.getContext('2d')) return false;
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

function chooseBackend(canvas, frameCount, preference = 'auto') {
  if (preference === 'cpu') return 'cpu';
  const useGPU =
    preference === 'gpu' ||
    (preference === 'auto' && frameCount > 2 && isWebGLCanvas(canvas));
  return useGPU && GPUMotionBlur.isSupported() ? 'gpu' : 'cpu';
}

function createMotionBlur(canvas, frameCount, preference = 'auto') {
  if (chooseBackend(canvas, frameCount, preference) === 'gpu') {
    try {
      return new GPUMotionBlur();
    } catch {}
  }
  return new MotionBlur();
}

export { chooseBackend, createMotionBlur, isWebGLCanvas };
