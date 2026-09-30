var MotionBlur = class {
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
  }

  addFrame(frame) {
    this.#ensureSize(frame.width, frame.height);
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.drawImage(frame, 0, 0);
    const { data } = this.ctx.getImageData(0, 0, this.width, this.height);
    const accum = this.accum;
    for (let i = 0; i < accum.length; i++) {
      accum[i] += data[i];
    }
    this.count++;
  }

  resolve() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const out = imageData.data;
    const accum = this.accum;
    const count = this.count || 1;
    for (let i = 0; i < accum.length; i++) {
      out[i] = accum[i] / count;
    }
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvas;
  }

  reset() {
    if (this.accum) this.accum.fill(0);
    this.count = 0;
  }

  dispose() {}
};

var QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

var VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

var FRAG_ACCUM = `
precision mediump float;
uniform sampler2D u_tex;
uniform vec2 u_resolution;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec4 c = texture2D(u_tex, uv);
  gl_FragColor = c;
}
`;

var FRAG_RESOLVE = `
precision mediump float;
uniform sampler2D u_tex;
uniform float u_count;
void main() {
  vec4 c = texture2D(u_tex, vec2(gl_FragCoord.xy / vec2(1.0, 1.0)));
  gl_FragColor = c / u_count;
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function program(gl, vertSrc, fragSrc) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(prog));
  }
  return prog;
}

var GPUMotionBlur = class {
  static isSupported() {
    if (_supported !== undefined) return _supported;
    _supported = false;
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl');
      _supported = !!(gl && gl.getExtension('EXT_blend_minmax'));
    } catch {
      _supported = false;
    }
    return _supported;
  }

  constructor() {
    this.canvas = document.createElement('canvas');
    const gl = this.canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false });
    if (!gl || !gl.getExtension('EXT_blend_minmax')) {
      throw new Error('WebGL not supported');
    }
    this.gl = gl;
    this.progAccum = program(gl, VERT, FRAG_ACCUM);
    this.progResolve = program(gl, VERT, FRAG_RESOLVE);
    this.locAccumTex = gl.getUniformLocation(this.progAccum, 'u_tex');
    this.locAccumRes = gl.getUniformLocation(this.progAccum, 'u_resolution');
    this.locResolveTex = gl.getUniformLocation(this.progResolve, 'u_tex');
    this.locResolveCount = gl.getUniformLocation(this.progResolve, 'u_count');
    this.vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.accumTex = null;
    this.frameTex = null;
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
    if (this.frameTex) gl.deleteTexture(this.frameTex);
    this.accumTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.frameTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.frameTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.reset();
  }

  addFrame(frame) {
    this.#ensureSize(frame.width, frame.height);
    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.frameTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frame);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.accumFBO);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.progAccum);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.frameTex);
    gl.uniform1i(this.locAccumTex, 0);
    gl.uniform2f(this.locAccumRes, this.width, this.height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);
    this.count++;
  }

  resolve() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.progResolve);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.uniform1i(this.locResolveTex, 0);
    gl.uniform1f(this.locResolveCount, this.count || 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return this.canvas;
  }

  reset() {
    const gl = this.gl;
    if (this.accumFBO) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.accumFBO);
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
      if (this.frameTex) gl.deleteTexture(this.frameTex);
      if (this.accumFBO) gl.deleteFramebuffer(this.accumFBO);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {}
    this.gl = null;
    this.accumTex = null;
    this.frameTex = null;
  }
};

var _supported;

function isWebGLCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== 'function') return false;
  try {
    if (canvas.getContext('2d')) return false;
    return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  } catch {
    return false;
  }
}

function chooseBackend(canvas, width, backend = 'auto') {
  if (backend === 'gpu') return 'gpu';
  const useGPU = backend === 'gpu' || (backend === 'auto' && width > 256 && isWebGLCanvas(canvas));
  return useGPU && GPUMotionBlur.isSupported() ? 'gpu' : 'cpu';
}

function createMotionBlur(canvas, width, backend = 'auto') {
  if (chooseBackend(canvas, width, backend) === 'gpu') {
    try {
      return new GPUMotionBlur();
    } catch {}
  }
  return new MotionBlur();
}

export { chooseBackend, createMotionBlur, isWebGLCanvas };
