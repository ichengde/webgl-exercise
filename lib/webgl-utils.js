const topWindow = this;

/** @module webgl-utils */

export function isInIFrame(w) {
  w = w || topWindow;
  return w !== w.top;
}

/**
 * Wrapped logging export function.
 * @param {string} msg The message to log.
 */
export function error(msg) {
  if (topWindow.console) {
    if (topWindow.console.error) {
      topWindow.console.error(msg);
    } else if (topWindow.console.log) {
      topWindow.console.log(msg);
    }
  }
}


/**
 * Error Callback
 * @callback ErrorCallback
 * @param {string} msg error message.
 * @memberOf module:webgl-utils
 */


/**
 * Loads a shader.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} shaderSource The shader source.
 * @param {number} shaderType The type of shader.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
export function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
  const errFn = opt_errorCallback || error;
  // Create the shader object
  const shader = gl.createShader(shaderType);

  // Load the shader source
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check the compile status
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    // Something went wrong during compilation; get the error
    const lastError = gl.getShaderInfoLog(shader);
    errFn("*** Error compiling shader '" + shader + "':" + lastError);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Creates a program, attaches shaders, binds attrib locations, links the
 * program and calls useProgram.
 * @param {WebGLShader[]} shaders The shaders to attach
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @memberOf module:webgl-utils
 */
export function createProgram(
  gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
  const errFn = opt_errorCallback || error;
  const program = gl.createProgram();
  shaders.forEach(function (shader) {
    gl.attachShader(program, shader);
  });
  if (opt_attribs) {
    opt_attribs.forEach(function (attrib, ndx) {
      gl.bindAttribLocation(
        program,
        opt_locations ? opt_locations[ndx] : ndx,
        attrib);
    });
  }
  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    // something went wrong with the link
    const lastError = gl.getProgramInfoLog(program);
    errFn("Error in program linking:" + lastError);

    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Loads a shader from a script tag.
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext to use.
 * @param {string} scriptId The id of the script tag.
 * @param {number} opt_shaderType The type of shader. If not passed in it will
 *     be derived from the type of the script tag.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors.
 * @return {WebGLShader} The created shader.
 */
export function createShaderFromScript(
  gl, scriptId, opt_shaderType, opt_errorCallback) {
  let shaderSource = "";
  let shaderType;
  const shaderScript = document.getElementById(scriptId);
  if (!shaderScript) {
    throw ("*** Error: unknown script element" + scriptId);
  }
  shaderSource = shaderScript.text;

  if (!opt_shaderType) {
    if (shaderScript.type === "x-shader/x-vertex") {
      shaderType = gl.VERTEX_SHADER;
    } else if (shaderScript.type === "x-shader/x-fragment") {
      shaderType = gl.FRAGMENT_SHADER;
    } else if (shaderType !== gl.VERTEX_SHADER && shaderType !== gl.FRAGMENT_SHADER) {
      throw ("*** Error: unknown shader type");
    }
  }

  return loadShader(
    gl, shaderSource, opt_shaderType ? opt_shaderType : shaderType,
    opt_errorCallback);
}

const defaultShaderType = [
  "VERTEX_SHADER",
  "FRAGMENT_SHADER",
];

/**
 * Creates a program from 2 script tags.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderScriptIds Array of ids of the script
 *        tags for the shaders. The first is assumed to be the
 *        vertex shader, the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram} The created program.
 * @memberOf module:webgl-utils
 */
export function createProgramFromScripts(
  gl, shaderScriptIds, opt_attribs, opt_locations, opt_errorCallback) {
  const shaders = [];
  for (let ii = 0; ii < shaderScriptIds.length; ++ii) {
    shaders.push(createShaderFromScript(
      gl, shaderScriptIds[ii], gl[defaultShaderType[ii]], opt_errorCallback));
  }
  return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
}

/**
 * Creates a program from 2 sources.
 *
 * @param {WebGLRenderingContext} gl The WebGLRenderingContext
 *        to use.
 * @param {string[]} shaderSourcess Array of sources for the
 *        shaders. The first is assumed to be the vertex shader,
 *        the second the fragment shader.
 * @param {string[]} [opt_attribs] An array of attribs names. Locations will be assigned by index if not passed in
 * @param {number[]} [opt_locations] The locations for the. A parallel array to opt_attribs letting you assign locations.
 * @param {module:webgl-utils.ErrorCallback} opt_errorCallback callback for errors. By default it just prints an error to the console
 *        on error. If you want something else pass an callback. It's passed an error message.
 * @return {WebGLProgram} The created program.
 * @memberOf module:webgl-utils
 */
export function createProgramFromSources(
  gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
  const shaders = [];
  for (let ii = 0; ii < shaderSources.length; ++ii) {
    shaders.push(loadShader(
      gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback));
  }
  return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
}

/**
 * Resize a canvas to match the size its displayed.
 * @param {HTMLCanvasElement} canvas The canvas to resize.
 * @param {number} [multiplier] amount to multiply by.
 *    Pass in window.devicePixelRatio for native pixels.
 * @return {boolean} true if the canvas was resized.
 * @memberOf module:webgl-utils
 */
export function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  const width = canvas.clientWidth * multiplier | 0;
  const height = canvas.clientHeight * multiplier | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

