const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const ACCUMULATE_FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D u_image;
uniform sampler2D u_accumulation;
uniform float u_frame;
varying vec2 v_uv;
void main() {
  vec4 image = texture2D(u_image, v_uv);
  vec4 accumulation = texture2D(u_accumulation, v_uv);
  gl_FragColor = accumulation + image;
}`;

const RESOLVE_FRAGMENT_SHADER = `
precision mediump float;
uniform sampler2D u_accumulation;
uniform float u_frame;
varying vec2 v_uv;
void main() {
  gl_FragColor = texture2D(u_accumulation, v_uv) / max(u_frame, 1.0);
}`;

class MotionBlur {
  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 0;
    this.canvas.height = 0;
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    this.width = 0;
    this.height = 0;
    this.frame = 0;
    this.accumulation = null;
  }

  #ensureSize(width, height) {
    if (this.width === width && this.height === height && this.accumulation) {
      return;
    }

    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;
    this.accumulation = new Float32Array(width * height * 4);
    this.frame = 0;
  }

  accumulate(source) {
    this.#ensureSize(source.width, source.height);
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.drawImage(source, 0, 0, this.width, this.height);

    const { data } = this.context.getImageData(0, 0, this.width, this.height);
    for (let i = 0; i < this.accumulation.length; i++) {
      this.accumulation[i] += data[i];
    }
    this.frame++;
  }

  resolve() {
    const image = this.context.createImageData(this.width, this.height);
    const divisor = this.frame || 1;

    for (let i = 0; i < this.accumulation.length; i++) {
      image.data[i] = this.accumulation[i] / divisor;
    }

    this.context.putImageData(image, 0, 0);
    return this.canvas;
  }

  reset() {
    if (this.accumulation) {
      this.accumulation.fill(0);
    }
    this.frame = 0;
  }

  destroy() {
    this.reset();
    this.canvas = null;
    this.context = null;
    this.accumulation = null;
  }
}

let webGLSupported;

class GPUMotionBlur {
  static isSupported() {
    if (webGLSupported !== undefined) {
      return webGLSupported;
    }

    webGLSupported = false;
    try {
      const canvas = document.createElement("canvas");
      const context =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      webGLSupported = Boolean(context);
    } catch {
      webGLSupported = false;
    }

    return webGLSupported;
  }

  constructor() {
    this.canvas = document.createElement("canvas");
    this.gl =
      this.canvas.getContext("webgl2") ||
      this.canvas.getContext("webgl") ||
      this.canvas.getContext("experimental-webgl");

    if (!this.gl) {
      throw new Error("WebGL is not available");
    }

    this.width = 0;
    this.height = 0;
    this.frame = 0;
    this.program = null;
    this.resolveProgram = null;
    this.texture = null;
    this.framebuffer = null;
    this.vertexBuffer = null;
    this.accumulationTexture = null;

    const gl = this.gl;
    this.program = this.#createProgram(VERTEX_SHADER, ACCUMULATE_FRAGMENT_SHADER);
    this.resolveProgram = this.#createProgram(VERTEX_SHADER, RESOLVE_FRAGMENT_SHADER);
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);

    this.texture = gl.createTexture();
    this.accumulationTexture = gl.createTexture();
    this.framebuffer = gl.createFramebuffer();
    this.#ensureSize(0, 0);
  }

  #createProgram(vertexSource, fragmentSource) {
    const gl = this.gl;

    const compileShader = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader));
      }
      return shader;
    };

    const program = gl.createProgram();
    gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }
    return program;
  }

  #ensureSize(width, height) {
    if (this.width === width && this.height === height) {
      return;
    }

    const gl = this.gl;
    this.width = this.canvas.width = width;
    this.height = this.canvas.height = height;

    if (this.framebuffer) {
      gl.deleteFramebuffer(this.framebuffer);
    }

    this.framebuffer = gl.createFramebuffer();
    gl.bindTexture(gl.TEXTURE_2D, this.accumulationTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.accumulationTexture,
      0
    );
    this.frame = 0;
  }

  accumulate(source) {
    this.#ensureSize(source.width, source.height);
    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const position = gl.getAttribLocation(this.program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(gl.getUniformLocation(this.program, "u_image"), 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.accumulationTexture);
    gl.uniform1i(gl.getUniformLocation(this.program, "u_accumulation"), 1);
    gl.uniform1f(gl.getUniformLocation(this.program, "u_frame"), this.frame);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.frame++;
  }

  resolve() {
    const gl = this.gl;

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.width, this.height);
    gl.useProgram(this.resolveProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

    const position = gl.getAttribLocation(this.resolveProgram, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.accumulationTexture);
    gl.uniform1i(gl.getUniformLocation(this.resolveProgram, "u_accumulation"), 0);
    gl.uniform1f(gl.getUniformLocation(this.resolveProgram, "u_frame"), this.frame);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    return this.canvas;
  }

  reset() {
    const gl = this.gl;
    if (gl && this.framebuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    this.frame = 0;
  }

  destroy() {
    const gl = this.gl;
    if (!gl) return;

    if (this.program) gl.deleteProgram(this.program);
    if (this.resolveProgram) gl.deleteProgram(this.resolveProgram);
    if (this.texture) gl.deleteTexture(this.texture);
    if (this.accumulationTexture) gl.deleteTexture(this.accumulationTexture);
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
    if (this.vertexBuffer) gl.deleteBuffer(this.vertexBuffer);

    this.gl = null;
    this.program = null;
    this.resolveProgram = null;
    this.texture = null;
    this.accumulationTexture = null;
    this.framebuffer = null;
    this.vertexBuffer = null;
  }
}

function isWebGLCanvas(canvas) {
  if (!canvas || typeof canvas.getContext !== "function") {
    return false;
  }

  try {
    if (canvas.getContext("2d")) {
      return false;
    }

    return Boolean(
      canvas.getContext("webgl") ||
      canvas.getContext("webgl2") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function chooseBackend(canvas, frameCount, preference = "auto") {
  if (preference === "cpu") {
    return "cpu";
  }

  const shouldUseGPU =
    preference === "gpu" ||
    (preference === "auto" && frameCount > 1 && isWebGLCanvas(canvas));

  return shouldUseGPU && GPUMotionBlur.isSupported() ? "gpu" : "cpu";
}

function createMotionBlur(canvas, frameCount, preference = "auto") {
  if (chooseBackend(canvas, frameCount, preference) === "gpu") {
    try {
      return new GPUMotionBlur();
    } catch {
      // Fall back when GPU setup fails.
    }
  }

  return new MotionBlur();
}

export { chooseBackend, createMotionBlur, isWebGLCanvas };
