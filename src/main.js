// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(), getFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attrib_locs = getAllAttribLocations(gl, program);
const uniform_locs = getAllUniformLocations(gl, program);

// --- GET DATA FROM 3D FILES ---
let ashtray_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let ashtray_convex_drawable;
let clock_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.24, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let clock_convex_drawable;
let tinycube_drawable1 = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let tinycube_drawable2 = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/data/antique_clock.obj', clock_drawable);
    clock_convex_drawable = await makeConvexDrawable(clock_drawable);
    await loadDrawable('/data/ash_tray.obj', ashtray_drawable);
    ashtray_convex_drawable = await makeConvexDrawable(ashtray_drawable);
    await loadDrawable('/data/tiny_cube.obj', tinycube_drawable1, undefined, [0, 1, 0]);
    await loadDrawable('/data/tiny_cube.obj', tinycube_drawable2, undefined, [1, 0, 0]);
    document.getElementById('loading_overlay').style.display = 'none';
    drawScene();
    startcamera();
})();

// --- MAIN LOOP ---
function drawScene() {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up view and projection matrices
    gl.uniformMatrix4fv(uniform_locs["projmat"], false, projectionmatrix);
    gl.uniformMatrix4fv(uniform_locs["viewmat"], false, inv4Mat4f(viewmatrix));

    gl.activeTexture(gl.TEXTURE16);
    gl.uniform1i(uniform_locs["tex"], 16);

    drawDrawable(ashtray_drawable, 1.0);
    drawDrawable(ashtray_convex_drawable, 0.2, 0);
    
    drawDrawable(clock_drawable, 1.0);
    drawDrawable(clock_convex_drawable, 0.2, 0);

    drawDrawable(tinycube_drawable1, undefined, undefined, [1.0, 1.0, 1.0]);
    drawDrawable(tinycube_drawable2, undefined, undefined, [1.0, 1.0, 1.0]);

    requestAnimationFrame(drawScene);
}
