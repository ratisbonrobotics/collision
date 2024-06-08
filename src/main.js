// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(), getFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attrib_locs = getAllAttribLocations(gl, program);
const uniform_locs = getAllUniformLocations(gl, program);

// --- RENDER SCENE ---
function renderScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up view and projection matrices
    gl.uniformMatrix4fv(uniform_locs["projmat"], false, projectionmatrix);
    gl.uniformMatrix4fv(uniform_locs["viewmat"], false, inv4Mat4f(viewmatrix));

    gl.activeTexture(gl.TEXTURE16);
    gl.uniform1i(uniform_locs["tex"], 16);

    // draw ash tray
    gl.uniformMatrix4fv(uniform_locs["modelmat"], false, ashtray_drawable["modelmatrix"]);
    for (let p = 0; p < ashtray_drawable["vertexbuffer"].length; p++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, ashtray_drawable["vertexbuffer"][p]["verticies"], attrib_locs["vertexpos"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, ashtray_drawable["normalbuffer"][p], attrib_locs["vertexnorm"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, ashtray_drawable["texcoordbuffer"][p], attrib_locs["texcoord"], 2);

        gl.bindTexture(gl.TEXTURE_2D, ashtray_drawable["texture"][p]);
        
        gl.drawArrays(gl.TRIANGLES, 0, ashtray_drawable["vertexbuffer"][p]["n_verticies"]);
    }

    // draw clock
    gl.uniformMatrix4fv(uniform_locs["modelmat"], false, clock_drawable["modelmatrix"]);
    for (let p = 0; p < clock_drawable["vertexbuffer"].length; p++) {
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, clock_drawable["vertexbuffer"][p]["verticies"], attrib_locs["vertexpos"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, clock_drawable["normalbuffer"][p], attrib_locs["vertexnorm"], 3);
        connectBufferToAttribute(gl, gl.ARRAY_BUFFER, clock_drawable["texcoordbuffer"][p], attrib_locs["texcoord"], 2);

        gl.bindTexture(gl.TEXTURE_2D, clock_drawable["texture"][p]);
        
        gl.drawArrays(gl.TRIANGLES, 0, clock_drawable["vertexbuffer"][p]["n_verticies"]);
    }  
}

// --- GET DATA FROM 3D FILES ---
let ashtray_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "verticies": [], "keys": [] };
let clock_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(10.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "verticies": [], "keys": [] };

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/data/antique_clock.obj', clock_drawable);
    await loadDrawable('/data/ash_tray.obj', ashtray_drawable);
    document.getElementById('loading_overlay').style.display = 'none';
    drawScene();
})();

// --- MAIN LOOP ---
function drawScene() {
    renderScene();
    requestAnimationFrame(drawScene);
}
