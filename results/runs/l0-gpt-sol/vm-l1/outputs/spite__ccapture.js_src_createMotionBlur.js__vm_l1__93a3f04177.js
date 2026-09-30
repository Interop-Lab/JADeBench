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
void main() {
  fragColor = texture(src, vUv);
}`;

const FRAG_RESOLVE = `#version 300 es
precision highp float;
uniform sampler2D accum;
uniform float scale;
in vec2 vUv;
out vec4 fragColor;
void main() {
  fragColor = vec4(texture(accum, vUv).rgb * scale, 1.0);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Unable to create shader");
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "Shader compilation failed";
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function program(gl, vertexSource, fragmentSource) {
  const vertexShader = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  const result = gl.createProgram();

  if (!result) {
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    throw new Error("Unable to create WebGL program");
  }

  gl.attachShader(result, vertexShader);
  gl.attachShader(result, fragmentShader);
  gl.linkProgram(result);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(result, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(result) || "Program linking failed";
    gl.deleteProgram(result);
    throw new Error(message);
  }

  return result;
}

function sourceWidth(source) {
  return source?.videoWidth || source?.naturalWidth || source?.width || 0;
}

function sourceHeight(source) {
  return source?.videoHeight || source?.naturalHeight || source?.height || 0;
}

class MotionBlur {
  constructor(canvas) {
    if (!canvas || typeof canvas.getContext !== "function") {
      throw new TypeError("A canvas is required");
    }

    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) {
      throw new Error("Unable to create a 2D rendering context");
    }

    this.canvas = canvas;
    this.ctx = context;
    this.width = 0;
    this.height = 0;
    this.accum = null;
    this.count = 0;
  }

  _resize(width, height) {
    if (
      this.width === width &&
      this.height === height &&
      this.accum
    ) {
      return;
    }

    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.accum = new Float32Array(width * height * 4);
    this.count = 0;
  }

  accumFrame(source) {
    if (!source) {
      throw new TypeError("A frame source is required");
    }

    const width = sourceWidth(source);
    const height = sourceHeight(source);

    if (!width || !height) {
      return;
    }

    this._resize(width, height);

    let pixels;
    if (
      typeof ImageData !== "undefined" &&
      source instanceof ImageData
    ) {
      pixels = source.data;
    } else if (
      source.data &&
      typeof source.data.length === "number" &&
      source.width === width &&
      source.height === height
    ) {
      pixels = source.data;
    } else {
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.drawImage(source, 0, 0, width, height);
      pixels = this.ctx.getImageData(0, 0, width, height).data;
    }

    for (let i = 0; i < pixels.length; i++) {
      this.accum[i] += pixels[i];
    }

    this.count++;
  }

  accum(source) {
    this.accumFrame(source);
  }

  resolve() {
    if (!this.accum || this.count === 0) {
      return;
    }

    const image = this.ctx.createImageData(this.width, this.height);
    const output = image.data;
    const scale = 1 / this.count;

    for (let i = 0; i < output.length; i += 4) {
      output[i] = this.accum[i] * scale;
      output[i + 1] = this.accum[i + 1] * scale;
      output[i + 2] = this.accum[i + 2] * scale;
      output[i + 3] = 255;
    }

    this.ctx.putImageData(image, 0, 0);
  }

  reset() {
    if (this.accum) {
      this.accum.fill(0);
    }
    this.count = 0;
  }

  dispose() {}
}

let supported;

class GPUMotionBlur {
  static isSupported() {
    if (supported !== undefined) {
      return supported;
    }

    if (
      typeof document === "undefined" ||
      typeof document.createElement !== "function"
    ) {
      return (supported = false);
    }

    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2");
      supported = !!(
        gl &&
        gl.getExtension("EXT_color_buffer_float")
      );

      const loseContext = gl?.getExtension("WEBGL_lose_context");
      loseContext?.loseContext();
    } catch {
      supported = false;
    }

    return supported;
  }

  constructor(canvas, options = {}) {
    if (!canvas || typeof canvas.getContext !== "function") {
      throw new TypeError("A canvas is required");
    }

    const gl =
      options.gl ||
      canvas.getContext("webgl2", options.contextAttributes);

    if (!gl) {
      throw new Error("WebGL2 is not available");
    }

    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error("Floating-point color buffers are not supported");
    }

    this.canvas = canvas;
    this.gl = gl;
    this.width = 0;
    this.height = 0;
    this.count = 0;
    this.accumTex = null;
    this.srcTex = null;
    this.fbo = null;

    this.accumProgram = program(gl, VERT, FRAG_ACCUM);
    this.resolveProgram = program(gl, VERT, FRAG_RESOLVE);

    this.accumSourceLocation = gl.getUniformLocation(
      this.accumProgram,
      "src"
    );
    this.resolveAccumLocation = gl.getUniformLocation(
      this.resolveProgram,
      "accum"
    );
    this.resolveScaleLocation = gl.getUniformLocation(
      this.resolveProgram,
      "scale"
    );

    this.vao = gl.createVertexArray();
    this.buffer = gl.createBuffer();

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);

    this._configurePosition(this.accumProgram);
    this._configurePosition(this.resolveProgram);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  _configurePosition(shaderProgram) {
    const gl = this.gl;
    const position = gl.getAttribLocation(shaderProgram, "position");

    if (position >= 0) {
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    }
  }

  _createTexture(internalFormat, format, type) {
    const gl = this.gl;
    const texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      gl.CLAMP_TO_EDGE
    );
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      gl.CLAMP_TO_EDGE
    );
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      internalFormat,
      this.width,
      this.height,
      0,
      format,
      type,
      null
    );

    return texture;
  }

  _resize(width, height) {
    if (
      this.width === width &&
      this.height === height &&
      this.fbo
    ) {
      return;
    }

    const gl = this.gl;

    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;

    if (this.accumTex) {
      gl.deleteTexture(this.accumTex);
    }
    if (this.srcTex) {
      gl.deleteTexture(this.srcTex);
    }
    if (this.fbo) {
      gl.deleteFramebuffer(this.fbo);
    }

    this.accumTex = this._createTexture(
      gl.RGBA16F,
      gl.RGBA,
      gl.HALF_FLOAT
    );
    this.srcTex = this._createTexture(
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE
    );
    this.fbo = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.accumTex,
      0
    );

    if (
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) !==
      gl.FRAMEBUFFER_COMPLETE
    ) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      throw new Error("Unable to create the accumulation framebuffer");
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.reset();
  }

  accum(source) {
    if (!source) {
      throw new TypeError("A frame source is required");
    }

    const width = sourceWidth(source);
    const height = sourceHeight(source);

    if (!width || !height) {
      return;
    }

    this._resize(width, height);

    const gl = this.gl;

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.srcTex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    if (
      source.data &&
      typeof source.data.length === "number" &&
      source.width === width &&
      source.height === height
    ) {
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        width,
        height,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source.data
      );
    } else {
      gl.texSubImage2D(
        gl.TEXTURE_2D,
        0,
        0,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        source
      );
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, width, height);
    gl.useProgram(this.accumProgram);
    gl.uniform1i(this.accumSourceLocation, 0);
    gl.bindVertexArray(this.vao);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.BLEND);

    gl.bindVertexArray(null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    this.count++;
  }

  resolve() {
    if (!this.accumTex || this.count === 0) {
      return;
    }

    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.resolveProgram);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumTex);
    gl.uniform1i(this.resolveAccumLocation, 0);
    gl.uniform1f(this.resolveScaleLocation, 1 / this.count);

    gl.bindVertexArray(this.vao);
    gl.disable(gl.BLEND);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.bindVertexArray(null);
  }

  reset() {
    this.count = 0;

    if (!this.fbo) {
      return;
    }

    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
    gl.viewport(0, 0, this.width, this.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  dispose() {
    const gl = this.gl;

    if (this.accumTex) gl.deleteTexture(this.accumTex);
    if (this.srcTex) gl.deleteTexture(this.srcTex);
    if (this.fbo) gl.deleteFramebuffer(this.fbo);
    if (this.buffer) gl.deleteBuffer(this.buffer);
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.accumProgram) gl.deleteProgram(this.accumProgram);
    if (this.resolveProgram) gl.deleteProgram(this.resolveProgram);

    this.accumTex = null;
    this.srcTex = null;
    this.fbo = null;
    this.buffer = null;
    this.vao = null;
    this.accumProgram = null;
    this.resolveProgram = null;
    this.count = 0;
  }
}

function isWebGLCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== "function") {
    return false;
  }

  try {
    return !!canvas.getContext("webgl2");
  } catch {
    return false;
  }
}

function chooseBackend(canvas, options = {}) {
  if (
    options === false ||
    options === "cpu" ||
    options?.backend === "cpu" ||
    options?.gpu === false
  ) {
    return MotionBlur;
  }

  if (
    isWebGLCanvas(canvas) &&
    (options === true ||
      options === "gpu" ||
      options?.backend === "gpu" ||
      GPUMotionBlur.isSupported())
  ) {
    return GPUMotionBlur;
  }

  return MotionBlur;
}

function createMotionBlur(canvas, options = {}) {
  const Backend = chooseBackend(canvas, options);
  return new Backend(canvas, options);
}

export { chooseBackend, createMotionBlur, isWebGLCanvas };
