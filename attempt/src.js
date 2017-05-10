
function webgl(id) {
    this.canvas = document.getElementById(id);
    this.canvas.style.width="300px";
    this.canvas.style.height="300px";
    this.glCtx = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    this.gl = WebGLDebugUtils.makeDebugContext(this.glCtx,throwOnGLError,logAndValidate);
    if (!this.gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
    }

    this.gl.clearColor(1.0,0.0,0.0,1.0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
};

webgl.prototype.draw = function() {
    
}

var test = webgl('cavs');
