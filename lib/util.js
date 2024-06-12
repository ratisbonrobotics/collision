function loadExternalHTML(url, targetId) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () {
    let doc = new DOMParser().parseFromString(xhr.responseText, "text/html");
    let target = document.getElementById(targetId);

    Array.from(doc.body.childNodes).forEach(node => {
      if (node.nodeName.toLowerCase() !== "script") target.appendChild(node.cloneNode(true));
    });

    Array.from(doc.getElementsByTagName("script")).forEach(script => {
      let newScript = document.createElement("script");
      newScript.text = script.innerText;
      document.body.appendChild(newScript);
    });
  };
  xhr.open("GET", url, true);
  xhr.send();
}

function createColorImageURL(color) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  canvas.getContext('2d').fillStyle = `rgb(${color[0] * 255},${color[1] * 255},${color[2] * 255})`;
  canvas.getContext('2d').fillRect(0, 0, 1, 1);
  return canvas.toDataURL();
}

function degToRad(angle) {
  return (angle * Math.PI) / 180;
}

function generateGaussianNoise(mean, stddev) {
  return mean + stddev * Math.sqrt(-2.0 * Math.log(Math.random() + Number.MIN_VALUE)) * Math.cos(2.0 * Math.PI * Math.random() + Number.MIN_VALUE);
}

function resizeCanvas(canvas) {
  canvas.width = Math.pow(2, Math.floor(Math.log(window.innerWidth * 0.88) / Math.log(2)));
  canvas.height = canvas.width / 2;
}

async function parseMTL(filename, memory_saving) {
  const data = (await (await fetch(filename)).text()).split("\n").map((line) => line.split(/\s+/).filter(Boolean));
  let materials = {};
  let material_name = "";

  for (const line of data) {
    if (line[0] == "newmtl") {
      material_name = line[1];
      materials[material_name] = {};
    } else if (line[0] == "map_Kd") {
      const imageSrc = filename.split("/").slice(0, -1).join("/") + "/" + line[line.length - 1];
      const image = new Image();
      if(memory_saving){
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = imageSrc;
          console.log("Loaded image", imageSrc);
        });
      }
      else{
        image.src = imageSrc;
      }
      materials[material_name]["map_Kd"] = image;
      if (line.includes("-o")) {
        const offsetIndex = line.indexOf("-o");
        materials[material_name]["map_Kd_offset"] = line.slice(offsetIndex + 1, offsetIndex + 4).map(parseFloat);
      }
      if (line.includes("-s")) {
        const scaleIndex = line.indexOf("-s");
        materials[material_name]["map_Kd_scale"] = line.slice(scaleIndex + 1, scaleIndex + 4).map(parseFloat);
      }
    } else if (line[0] == "Ns" || line[0] == "Ni" || line[0] == "d" ||
      line[0] == "illum" || line[0] == "Ka" || line[0] == "Ks" || line[0] == "Ke") {
      materials[material_name][line[0]] = line.slice(1).map(parseFloat);
    }
  }

  return materials;
}

async function parseOBJ(filename) {
  let filename_final;

  if (filename.split(".")[filename.split(".").length - 1] === "gz") {
    const response = await fetch(filename);
    filename_final = URL.createObjectURL(await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).blob());
  } else {
    filename_final = filename;
  }

  const data = (await (await fetch(filename_final)).text()).split("\n").map((line) => line.split(/\s+/).filter(Boolean));
  let materials = {};
  let objects = {};

  let all = { v: [], vt: [], vn: [] };
  let temp_o = "";
  let temp_g = "";
  let temp_m = "";
  let temp_s = 0;

  for (const line of data) {
    if (line[0] == "mtllib") {
      materials = { ...materials, ...(await parseMTL(filename.split("/").slice(0, -1).join("/") + "/" + line[1], false)) };
    } else if (line[0] == "o") {
      temp_o = line[1];
      temp_g = "";
      temp_s = 0;
      temp_m = "";
      objects[temp_o] = { v: [], vt: [], vn: [], m: [], g: [], s: [] };
    } else if (line[0] == "v" || line[0] == "vt" || line[0] == "vn") {
      all[line[0]].push(line.slice(1).map(parseFloat));
    } else if (line[0] == "g") {
      temp_g = line[1];
    } else if (line[0] == "usemtl") {
      temp_m = line[1];
    } else if (line[0] == "s") {
      temp_s = line[1];
      if (temp_s == "off") {
        temp_s = 0;
      }
    } else if (line[0] == "f") {
      let faces = line.slice(1).map((str) => str.split("/").map((str) => parseInt(str) - 1));

      for (f of faces) {
        objects[temp_o]["v"].push(...all["v"][f[0]]);
        if (all["vt"][f[1]] !== undefined)
          objects[temp_o]["vt"].push(...all["vt"][f[1]]);
        objects[temp_o]["vn"].push(...all["vn"][f[2]]);
        objects[temp_o]["m"].push(materials[temp_m]);
        objects[temp_o]["g"].push(temp_g);
        objects[temp_o]["s"].push(temp_s);
      }
    }
  }

  if (filename.split(".")[-1] === ".gz")
    URL.revokeObjectURL(filename_final);

  return objects;
}

async function loadDrawable(obj_path, drawable, maxObjects, color) {
  let obj = await parseOBJ(obj_path);

  const entries = maxObjects !== null && maxObjects !== undefined ? Object.entries(obj).slice(0, maxObjects) : Object.entries(obj);

  const texturePromises = entries.map(async ([_, value]) => {
    if (value["m"][0] && value["m"][0]["map_Kd"] && value["m"][0]["map_Kd"].src) {
      return createTexture(gl, value["m"][0]["map_Kd"].src);
    } else {
      if (color === undefined)
        return createTexture(gl, createColorImageURL([1, 1, 1])); // WHITE
      else{
        return createTexture(gl, createColorImageURL(color));
      }
    }
  });

  const textures = await Promise.all(texturePromises);

  for (const [index, [key, value]] of entries.entries()) {
    drawable["vertexbuffer"][index] = {};
    drawable["vertexbuffer"][index]["vertices"] = createBuffer(gl, gl.ARRAY_BUFFER, value["v"]);
    drawable["vertexbuffer"][index]["n_vertices"] = Math.floor(value["v"].length / 3);
    drawable["texcoordbuffer"][index] = createBuffer(gl, gl.ARRAY_BUFFER, value["vt"]);
    drawable["normalbuffer"][index] = createBuffer(gl, gl.ARRAY_BUFFER, value["vn"]);
    drawable["texture"][index] = textures[index];

    drawable["vertices"][index] = value["v"];
    drawable["keys"][index] = key;

    if(value["m"][0]){
      drawable["material"][index] = {
        "Ka": value["m"][0]["Ka"] || [1, 1, 1],
        "Kd": value["m"][0]["Kd"] || [1, 1, 1],
        "Ke": value["m"][0]["Ke"] || [1, 1, 1],
        "Ks": value["m"][0]["Ks"] || [1, 1, 1],
        "Ns": value["m"][0]["Ns"] || 0,
        "Ni": value["m"][0]["Ni"] || 0,
        "d": value["m"][0]["d"] || 1,
        "illum": value["m"][0]["illum"] || 1
      };
    }
  }
}

async function makeConvexDrawable(drawable){
  let convex_drawable = {"vertexbuffer": [], "normalbuffer": [], "texcoordbuffer": [], "texture": [], "material": [], "modelmatrix": drawable["modelmatrix"], "vertices": [], "keys": [] };
  const arrayOfFaces = Array.from({ length: drawable["vertices"][0].length / 3 }, (_, i) => drawable["vertices"][0].slice(i * 3, i * 3 + 3));
  const uniqueVertices = [...new Set(arrayOfFaces.map(JSON.stringify))].map(JSON.parse);
  let convex_vertices = await calculateConvexHull(uniqueVertices.flat(), drawable["keys"][0]);
  
  convex_drawable["vertexbuffer"][0] = {};
  convex_drawable["vertexbuffer"][0]["vertices"] = createBuffer(gl, gl.ARRAY_BUFFER, convex_vertices);
  convex_drawable["vertexbuffer"][0]["n_vertices"] = Math.floor(convex_vertices.length / 3);
  convex_drawable["texcoordbuffer"][0] = createBuffer(gl, gl.ARRAY_BUFFER, Array(convex_vertices.length).fill("0.0"));
  convex_drawable["normalbuffer"][0] = createBuffer(gl, gl.ARRAY_BUFFER, Array(convex_vertices.length).fill("0.0"));
  convex_drawable["texture"][0] = await createTexture(gl, createColorImageURL([1, 1, 1])); // WHITE
  convex_drawable["vertices"][0] = convex_vertices;
  convex_drawable["keys"][0] = drawable["keys"][0];

  return convex_drawable;
}

async function calculateConvexHull(vertices, name){
  let obj = await parseOBJ('/data/' + name + '_convex_hull.obj');
  return Object.entries(obj)[0][1]["v"];
}

function separatingAxisTest(drawable1, drawable2) {
  const transformedVertices1 = transformVertices(drawable1.vertices[0], drawable1.modelmatrix);
  const transformedVertices2 = transformVertices(drawable2.vertices[0], drawable2.modelmatrix);

  const axes1 = getUniqueAxes(transformedVertices1);
  const axes2 = getUniqueAxes(transformedVertices2);
  const axes = [...axes1, ...axes2];

  let minOverlap = Infinity;
  let smallestAxis;

  for (const axis of axes) {
    const projection1 = projectVertices(transformedVertices1, axis);
    const projection2 = projectVertices(transformedVertices2, axis);

    if (!overlap(projection1, projection2)) {
      return { collision: false };
    } else {
      const overlapAmount = Math.min(projection1[1] - projection2[0], projection2[1] - projection1[0]);
      if (overlapAmount < minOverlap) {
        minOverlap = overlapAmount;
        smallestAxis = axis;
      }
    }
  }

  const centroid1 = calculateCentroid(transformedVertices1);
  const centroid2 = calculateCentroid(transformedVertices2);
  const direction = subVec3f(centroid1, centroid2);
  if (dotVec3f(direction, smallestAxis) < 0) {
    smallestAxis = smallestAxis.map(value => -value);
  }

  return {
    collision: true,
    directionOfCollision: smallestAxis.map(value => value * minOverlap)
  };
}

function calculateCentroid(vertices) {
  let centroid = [0, 0, 0];
  const numVertices = vertices.length / 3;
  for (let i = 0; i < vertices.length; i += 3) {
    centroid[0] += vertices[i];
    centroid[1] += vertices[i+1];
    centroid[2] += vertices[i+2];
  }
  return centroid.map(coord => coord / numVertices);
}

function transformVertices(vertices, modelMatrix) {
  const transformedVertices = [];

  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vertices.slice(i, i + 3);
    const transformedVertex = multVec3fMat4f(vertex, modelMatrix);
    transformedVertices.push(...transformedVertex);
  }

  return transformedVertices;
}

function getUniqueAxes(vertices) {
  const axes = new Set();

  for (let i = 0; i < vertices.length; i += 9) {
    const v1 = vertices.slice(i, i + 3);
    const v2 = vertices.slice(i + 3, i + 6);
    const v3 = vertices.slice(i + 6, i + 9);

    const edge1 = subVec3f(v2, v1);
    const edge2 = subVec3f(v3, v1);

    const normal = normVec3f(crossVec3f(edge1, edge2));
    axes.add(normal.join(','));
  }

  return Array.from(axes).map(axis => axis.split(',').map(parseFloat));
}

function projectVertices(vertices, axis) {
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < vertices.length; i += 3) {
    const vertex = vertices.slice(i, i + 3);
    const projection = dotVec3f(vertex, axis);

    min = Math.min(min, projection);
    max = Math.max(max, projection);
  }

  return [min, max];
}

function overlap(projection1, projection2) {
  return projection1[0] <= projection2[1] && projection2[0] <= projection1[1];
}
