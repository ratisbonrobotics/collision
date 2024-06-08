// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(), getFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attrib_locs = getAllAttribLocations(gl, program);
const uniform_locs = getAllUniformLocations(gl, program);

// --- GET DATA FROM 3D FILES ---
let ashtray_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let ashtray_convex_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };

let clock_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.14, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let clock_convex_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.14, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/data/antique_clock.obj', clock_drawable);
    await loadDrawable('/data/antique_clock_convex_hull.obj', clock_convex_drawable);
    await loadDrawable('/data/ash_tray.obj', ashtray_drawable);
    await loadDrawable('/data/ash_tray_convex_hull.obj', ashtray_convex_drawable);
    document.getElementById('loading_overlay').style.display = 'none';

    console.log(separatingAxisTest(ashtray_convex_drawable, clock_convex_drawable));
    drawScene();
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

    drawDrawable(ashtray_drawable, 1.0, 1);
    drawDrawable(ashtray_convex_drawable, 0.2, 0);
    
    drawDrawable(clock_drawable, 1.0, 1);
    drawDrawable(clock_convex_drawable, 0.2, 0);
    requestAnimationFrame(drawScene);
}
