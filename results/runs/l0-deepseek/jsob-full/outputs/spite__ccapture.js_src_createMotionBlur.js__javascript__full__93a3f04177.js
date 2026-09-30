const MotionBlur = class {
  constructor() {
    const contextOptions = {};
    contextOptions["preserveDrawingBuffer"] = true;
    this.canvas = document.getElementById("canvas");
    this.ctx = this.canvas.getContext("2d", contextOptions);
    this.width = -1;
    this.height = -1;
    this.accumulator = null;
    this.frameCount = 0;
  }

  #ensureSize(width, height) {
    if (this.width === width && this.height === height && this.accumulator) return;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.accumulator = new Float32Array(width * height * 3);
  }

  accumulate(source) {
    this.#ensureSize(source.width, source.height);
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.drawImage(source, 0, 0, this.width, this.height);
    const { data: frameData } = this.ctx.getImageData(0, 0, this.width, this.height);
    const accumulator = this.accumulator;
    for (let i = 0; i < accumulator.length; i++) accumulator[i] += frameData[i];
    this.frameCount++;
  }

  resolve() {
    const imageData = this.ctx.createImageData(this.width, this.height);
    const pixels = imageData.data;
    const accumulator = this.accumulator;
    const divisor = this.frameCount || 1;
    for (let i = 0; i < accumulator.length; i++) pixels[i] = accumulator[i] / divisor;
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvas;
  }

  clear() {
    if (this.ctx) this.ctx.clearRect(0, 0, this.width, this.height);
    this.frameCount = 0;
  }

  dispose() {}
};

const QUAD = new Float32Array([
  -1, -1,
  1, -1,
  -1, 1,
  -1, 1,
  1, -1,
  1, 1
]);

const VERT = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAG_ACCUM = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
void main() {
  gl_FragColor = texture2D(u_texture, v_uv);
}
`;

const FRAG_RESOLVE = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_accum;
uniform float u_divisor;
void main() {
  vec4 color = texture2D(u_accum, v_uv);
  gl_FragColor = vec4(color.rgb / u_divisor, 1.0);
}
`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error("Shader compile failed: " + gl.getShaderInfoLog(shader));
  }
  return shader;
}

function program(gl, vertexSource, fragmentSource) {
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    throw new Error("Program link failed: " + gl.getProgramInfoLog(prog));
  }
  return prog;
}

let _supported;

const GPUMotionBlur = class {
  static isSupported() {
    if (_supported !== undefined) return _supported;
    _supported = false;
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl");
      _supported = !!(gl && gl.getExtension("OES_texture_float"));
    } catch {
      _supported = false;
    }
    return _supported;
  }

  constructor() {
    this.canvas = document.createElement("canvas");
    const contextOptions = {};
    contextOptions["alpha"] = false;
    contextOptions["preserveDrawingBuffer"] = true;
    const gl = this.canvas.getContext("webgl", contextOptions);
    if (!gl || !gl.getExtension("OES_texture_float")) {
      throw new Error("WebGL float textures not supported");
    }
    this.gl = gl;
    this.accumProgram = program(gl, VERT, FRAG_ACCUM);
    this.resolveProgram = program(gl, VERT, FRAG_RESOLVE);
    this.accumTexture = gl.createTexture();
    this.resolveTexture = gl.createTexture();
    this.framebuffer = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, this.accumTexture);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    this.quadBuffer = buffer;
    gl.bindTexture(gl.TEXTURE_2D, this.resolveTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.width = null;
    this.height = null;
    this.frameCount = 0;
    this.accumulator = null;
    this.divisor = 1;
  }

  #ensureSize(width, height) {
    if (this.width === width && this.height === height && this.accumulator) return;
    const gl = this.gl;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    if (this.accumTexture) gl.deleteTexture(this.accumTexture);
    if (this.resolveTexture) gl.deleteTexture(this.resolveTexture);
    this.accumTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.accumTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.resolveTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.resolveTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.accumTexture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.clear();
  }

  accumulate(source) {
    this.#ensureSize(source.width, source.height);
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.accumTexture, 0);
    gl.bindTexture(gl.TEXTURE_2D, source);
    gl.useProgram(this.accumProgram);
    gl.viewport(0, 0, this.width, this.height);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.frameCount++;
  }

  resolve() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.resolveTexture, 0);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.resolveProgram);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTexture);
    gl.uniform1f(gl.getUniformLocation(this.resolveProgram, "u_divisor"), this.frameCount || 1);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return this.canvas;
  }

  clear() {
    const gl = this.gl;
    if (this.framebuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    this.frameCount = 0;
  }

  dispose() {
    const gl = this.gl;
    if (!gl) return;
    try {
      if (this.accumTexture) gl.deleteTexture(this.accumTexture);
      if (this.resolveTexture) gl.deleteTexture(this.resolveTexture);
      if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {}
    this.gl = null;
    this.accumTexture = null;
    this.resolveTexture = null;
  }
};

function isWebGLCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== "function") return false;
  try {
    if (canvas.getContext("2d")) return false;
    return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

function chooseBackend(canvas, width, backend = "auto") {
  if (backend === "cpu") return "cpu";
  const useGPU = backend === "gpu" || (backend === "auto" && width > 0 && isWebGLCanvas(canvas));
  return useGPU && GPUMotionBlur.isSupported() ? "gpu" : "cpu";
}

function createMotionBlur(canvas, width, backend = "auto") {
  if (chooseBackend(canvas, width, backend) === "gpu") {
    try {
      return new GPUMotionBlur();
    } catch {}
  }
  return new MotionBlur();
}

export { chooseBackend, createMotionBlur, isWebGLCanvas };
