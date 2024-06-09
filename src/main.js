// --- MAKE SHADERS AND PROGRAM ---
const program = createAndUseProgram(gl, getVertexShaderSource(), getFragmentShaderSource());

// --- GET ATTRIBUTE AND UNIFORM LOCATIONS ---
const attrib_locs = getAllAttribLocations(gl, program);
const uniform_locs = getAllUniformLocations(gl, program);

// --- GET DATA FROM 3D FILES ---
let ashtray_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let ashtray_convex_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };

let clock_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.24, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let clock_convex_drawable = { "vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.24, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };

let tinycube_drawable1 = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };
let tinycube_drawable2 = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": modelMat4f(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0, 1.0), "vertices": [], "keys": [] };

let line = {"tex": undefined, "vertices": [[0,0,0],[1,1,1]], "vertexbuffer": undefined};

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    line["tex"] = await createTexture(gl, createColorImageURL([1, 0, 0]));
    line["vertexbuffer"] = createBuffer(gl, gl.ARRAY_BUFFER, [...line["vertices"][0], ...line["vertices"][1]]);

    await loadDrawable('/data/antique_clock.obj', clock_drawable);
    await loadDrawable('/data/antique_clock_convex_hull.obj', clock_convex_drawable);
    await loadDrawable('/data/ash_tray.obj', ashtray_drawable);
    await loadDrawable('/data/ash_tray_convex_hull.obj', ashtray_convex_drawable);
    await loadDrawable('/data/tiny_cube.obj', tinycube_drawable1, undefined, [0, 1, 0]);
    await loadDrawable('/data/tiny_cube.obj', tinycube_drawable2, undefined, [1, 0, 0]);
    document.getElementById('loading_overlay').style.display = 'none';
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

    drawDrawable(tinycube_drawable1, undefined, undefined, [1.0, 1.0, 1.0]);
    drawDrawable(tinycube_drawable2, undefined, undefined, [1.0, 1.0, 1.0]);

    drawLine(line);

    drawDrawable(ashtray_drawable, 0.4);
    drawDrawable(ashtray_convex_drawable, 0.2, 0);
    
    drawDrawable(clock_drawable, 0.4);
    drawDrawable(clock_convex_drawable, 0.2, 0);

    requestAnimationFrame(drawScene);
}
