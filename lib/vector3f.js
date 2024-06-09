function crossVec3f(v1, v2) {
    return [
        v1[1] * v2[2] - v1[2] * v2[1],
        v1[2] * v2[0] - v1[0] * v2[2],
        v1[0] * v2[1] - v1[1] * v2[0]
    ];
}

function addScalVec3f(s, v) {
    return [v[0] + s, v[1] + s, v[2] + s];
}

function multScalVec3f(s, v) {
    return [v[0] * s, v[1] * s, v[2] * s];
}

function addVec3f(v1, v2) {
    return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
}

function subVec3f(v1, v2) {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

function dotVec3f(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

function normVec3f(v) {
    let magnitude = Math.sqrt(dotVec3f(v, v));
    return [v[0] / magnitude, v[1] / magnitude, v[2] / magnitude];
}

function multVec3fMat4f(v, m) {
    const x = v[0], y = v[1], z = v[2];
    const w = m[3] * x + m[7] * y + m[11] * z + m[15];
    const resultX = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    const resultY = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    const resultZ = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
    return [resultX, resultY, resultZ];
  }