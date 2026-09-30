const FULLSCREEN_TRIANGLE = new Float32Array([-1, -1, 3, -1, -1, 3]);

const VERTEX_SHADER = `#version 300 es
in vec2 position;
out vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const ACCUMULATE_SHADER = `#version 300 es
precision highp float;
uniform sampler2D src;
in vec2 vUv;
out vec4 fragColor;
void main() { fragColor = texture(src, vUv); }`;

const RESOLVE_SHADER = `#version 300 es
precision highp float;
uniform sampler2D accum;
uniform float scale;
in vec2 vUv;
out vec4 fragColor;
void main() { fragColor = vec4(texture(accum, vUv).rgb * scale, 1.0); }`;

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function createProgram(gl, vertexSource, fragmentSource) {
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, compileShader(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(shaderProgram, compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.bindAttribLocation(shaderProgram, 0, "position");
  gl.linkProgram(shaderProgram);
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(shaderProgram));
  }
  return shaderProgram;
}

class MotionBlur {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.accum = null;
    this.width = 0;
    this.height = 0;
    this.count = 0;
  }

  resize(width, height) {
    if (this.width === width && this.height === height && this.accum) return;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.accum = new Float32Array(width * height * 4);
    this.count = 0;
  }

  add(sourceCanvas) {
    this.resize(sourceCanvas.width, sourceCanvas.height);
    const source = sourceCanvas.getContext("2d").getImageData(0, 0, this.width, this.height).data;
    for (let index = 0; index < source.length; index++) {
      this.accum[index] += source[index];
    }
    this.count++;
  }

  resolve() {
    const image = this.ctx.createImageData(this.width, this.height);
    const scale = this.count ? 1 / this.count : 0;
    for (let index = 0; index < image.data.length; index++) {
      image.data[index] = this.accum[index] * scale;
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

let gpuSupport;

class GPUMotionBlur {
  static isSupported() {
    if (gpuSupport !== undefined) return gpuSupport;
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      gpuSupport = Boolean(gl && gl.getExtension("EXT_color_buffer_float"));
    } catch {
      gpuSupport = false;
    }
    return gpuSupport;
  }

  constructor() {
    this.canvas = document.createElement("canvas");
    this.gl = this.canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    this.gl.getExtension("EXT_color_buffer_float");

    const gl = this.gl;
    this.accumProgram = createProgram(gl, VERTEX_SHADER, ACCUMULATE_SHADER);
    this.resolveProgram = createProgram(gl, VERTEX_SHADER, RESOLVE_SHADER);
    this.srcLoc = gl.getUniformLocation(this.accumProgram, "src");
    this.accumLoc = gl.getUniformLocation(this.resolveProgram, "accum");
    this.scaleLoc = gl.getUniformLocation(this.resolveProgram, "scale");

    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    const vertices = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertices);
    gl.bufferData(gl.ARRAY_BUFFER, FULLSCREEN_TRIANGLE, gl.STATIC_DRAW);
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

  resize(width, height) {
    if (this.width === width && this.height === height && this.fbo) return;
    const gl = this.gl;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    if (this.accumTex) gl.deleteTexture(this.accumTex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);

    this.accumTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);

    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.accumTex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.reset();
  }

  add(sourceCanvas) {
    const gl = this.gl;
    this.resize(sourceCanvas.width, sourceCanvas.height);
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, sourceCanvas);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.accumProgram);
    gl.uniform1i(this.srcLoc, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
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
    gl.uniform1f(this.scaleLoc, this.count ? 1 / this.count : 0);
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.count = 0;
  }

  dispose() {
    const gl = this.gl;
    gl.deleteTexture(this.srcTex);
    gl.deleteTexture(this.accumTex);
    gl.deleteFramebuffer(this.fbo);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    this.accumTex = null;
    this.fbo = null;
    this.gl = null;
  }
}

function isWebGLCanvas(canvas) {
  return Boolean(canvas && typeof canvas.getContext === "function" && canvas.getContext("2d") === null);
}

function chooseBackend(preference = "auto", sourceCanvas) {
  if (preference === "cpu") return "cpu";
  if (preference === "gpu") return GPUMotionBlur.isSupported() ? "gpu" : "cpu";
  return GPUMotionBlur.isSupported() && (!sourceCanvas || isWebGLCanvas(sourceCanvas)) ? "gpu" : "cpu";
}

function createMotionBlur(preference, sourceCanvas) {
  return chooseBackend(preference, sourceCanvas) === "gpu" ? new GPUMotionBlur() : new MotionBlur();
}

Object.assign(globalThis, {
  compile: compileShader,
  program: createProgram,
  MotionBlur,
  GPUMotionBlur,
  QUAD: FULLSCREEN_TRIANGLE,
  VERT: VERTEX_SHADER,
  FRAG_ACCUM: ACCUMULATE_SHADER,
  FRAG_RESOLVE: RESOLVE_SHADER,
  isWebGLCanvas,
  chooseBackend,
  createMotionBlur,
});

export { chooseBackend, createMotionBlur, isWebGLCanvas };
