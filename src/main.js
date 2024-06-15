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

let tinycube_drawable1_unique_vertices;
let tinycube_drawable2_unique_vertices;

(async function loadData() {
    document.getElementById('loading_overlay').style.display = 'flex';
    await loadDrawable('/data/antique_clock.obj', clock_drawable);
    clock_convex_drawable = await makeConvexDrawable(clock_drawable);
    await loadDrawable('/data/ash_tray.obj', ashtray_drawable);
    ashtray_convex_drawable = await makeConvexDrawable(ashtray_drawable);
    await loadDrawable('/data/tiny_cube.obj', tinycube_drawable1, undefined, [0, 1, 0]);
    await loadDrawable('/data/tiny_cube.obj', tinycube_drawable2, undefined, [1, 0, 0]);
    document.getElementById('loading_overlay').style.display = 'none';

    tinycube_drawable1_unique_vertices = extractUniqueVertices(ashtray_convex_drawable["vertices"][0]);
    tinycube_drawable2_unique_vertices = extractUniqueVertices(clock_convex_drawable["vertices"][0]);

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

    for(let i = 0; i < tinycube_drawable1_unique_vertices.length; i++){
        let v = multVec3fMat4f(tinycube_drawable1_unique_vertices[i], ashtray_convex_drawable["modelmatrix"]);
        
        tinycube_drawable1["modelmatrix"][12] = v[0];
        tinycube_drawable1["modelmatrix"][13] = v[1];
        tinycube_drawable1["modelmatrix"][14] = v[2];
        drawDrawable(tinycube_drawable1, undefined, undefined, [1.0, 1.0, 1.0]);
    }

    for(let i = 0; i < tinycube_drawable2_unique_vertices.length; i++){
        let v = multVec3fMat4f(tinycube_drawable2_unique_vertices[i], clock_convex_drawable["modelmatrix"]);

        tinycube_drawable2["modelmatrix"][12] = v[0];
        tinycube_drawable2["modelmatrix"][13] = v[1];
        tinycube_drawable2["modelmatrix"][14] = v[2];
        drawDrawable(tinycube_drawable2, undefined, undefined, [1.0, 1.0, 1.0]);
    }

    drawDrawable(ashtray_drawable, 1.0);
    drawDrawable(ashtray_convex_drawable, 0.2, 0);
    
    drawDrawable(clock_drawable, 1.0);
    drawDrawable(clock_convex_drawable, 0.2, 0);

    
    requestAnimationFrame(drawScene);
}
