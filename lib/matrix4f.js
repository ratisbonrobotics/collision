function multMat4f(a, b) {
    return [
        a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
        a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
        a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
        a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],

        a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
        a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
        a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
        a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],

        a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
        a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
        a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
        a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],

        a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
        a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
        a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
        a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]];
}

function inv4Mat4f(m) {
    let s0 = m[0] * m[5] - m[4] * m[1];
    let s1 = m[0] * m[6] - m[4] * m[2];
    let s2 = m[0] * m[7] - m[4] * m[3];
    let s3 = m[1] * m[6] - m[5] * m[2];
    let s4 = m[1] * m[7] - m[5] * m[3];
    let s5 = m[2] * m[7] - m[6] * m[3];

    let c5 = m[10] * m[15] - m[14] * m[11];
    let c4 = m[9] * m[15] - m[13] * m[11];
    let c3 = m[9] * m[14] - m[13] * m[10];
    let c2 = m[8] * m[15] - m[12] * m[11];
    let c1 = m[8] * m[14] - m[12] * m[10];
    let c0 = m[8] * m[13] - m[12] * m[9];

    let det = s0 * c5 - s1 * c4 + s2 * c3 + s3 * c2 - s4 * c1 + s5 * c0;
    
    if (det === 0) {
        throw new Error("Matrix is not invertible");
    }

    let invdet = 1.0 / det;

    let b = [
        (m[5] * c5 - m[6] * c4 + m[7] * c3) * invdet,
        (-m[1] * c5 + m[2] * c4 - m[3] * c3) * invdet,
        (m[13] * s5 - m[14] * s4 + m[15] * s3) * invdet,
        (-m[9] * s5 + m[10] * s4 - m[11] * s3) * invdet,

        (-m[4] * c5 + m[6] * c2 - m[7] * c1) * invdet,
        (m[0] * c5 - m[2] * c2 + m[3] * c1) * invdet,
        (-m[12] * s5 + m[14] * s2 - m[15] * s1) * invdet,
        (m[8] * s5 - m[10] * s2 + m[11] * s1) * invdet,

        (m[4] * c4 - m[5] * c2 + m[7] * c0) * invdet,
        (-m[0] * c4 + m[1] * c2 - m[3] * c0) * invdet,
        (m[12] * s4 - m[13] * s2 + m[15] * s0) * invdet,
        (-m[8] * s4 + m[9] * s2 - m[11] * s0) * invdet,

        (-m[4] * c3 + m[5] * c1 - m[6] * c0) * invdet,
        (m[0] * c3 - m[1] * c1 + m[2] * c0) * invdet,
        (-m[12] * s3 + m[13] * s1 - m[14] * s0) * invdet,
        (m[8] * s3 - m[9] * s1 + m[10] * s0) * invdet
    ];

    return b;
}

function inv3Mat4f(m) {
    let a = m[0], b = m[1], c = m[2];
    let d = m[4], e = m[5], f = m[6];
    let g = m[8], h = m[9], i = m[10];

    let det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);

    if (det === 0) {
        throw new Error("Matrix is not invertible");
    }

    let invDet = 1.0 / det;

    return [
        invDet * (e * i - f * h), invDet * (c * h - b * i), invDet * (b * f - c * e), 0,
        invDet * (f * g - d * i), invDet * (a * i - c * g), invDet * (c * d - a * f), 0,
        invDet * (d * h - e * g), invDet * (b * g - a * h), invDet * (a * e - b * d), 0,
        0, 0, 0, 1
    ];
}

function transp4Mat4f(m) {
    return [
        m[0], m[4], m[8], m[12],
        m[1], m[5], m[9], m[13],
        m[2], m[6], m[10], m[14],
        m[3], m[7], m[11], m[15]
    ];
}

function transp3Mat4f(m) {
    return [
        m[0], m[4], m[8], m[3],
        m[1], m[5], m[9], m[7],
        m[2], m[6], m[10], m[11],
        m[12], m[13], m[14], m[15]
    ];
}

function identMat4f() {
    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function translMat4f(tx, ty, tz) {
    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        tx, ty, tz, 1.0];
}

function xRotMat4f(rads) {
    let s = Math.sin(rads);
    let c = Math.cos(rads);
    return [
        1.0, 0.0, 0.0, 0.0,
        0.0, c, -s, 0.0,
        0.0, s, c, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function yRotMat4f(rads) {
    let s = Math.sin(rads);
    let c = Math.cos(rads);
    return [
        c, 0.0, s, 0.0,
        0.0, 1.0, 0.0, 0.0,
        -s, 0.0, c, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function zRotMat4f(rads) {
    let s = Math.sin(rads);
    let c = Math.cos(rads);
    return [
        c, -s, 0.0, 0.0,
        s, c, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function scaleMat4f(sx, sy, sz) {
    return [
        sx, 0.0, 0.0, 0.0,
        0.0, sy, 0.0, 0.0,
        0.0, 0.0, sz, 0.0,
        0.0, 0.0, 0.0, 1.0];
}

function modelMat4f(tx, ty, tz, rx, ry, rz, sx, sy, sz) {
    let modelmatrix = identMat4f();
    modelmatrix = multMat4f(translMat4f(tx, ty, tz), modelmatrix);
    modelmatrix = multMat4f(multMat4f(multMat4f(xRotMat4f(rx), yRotMat4f(ry)), zRotMat4f(rz)), modelmatrix);
    modelmatrix = multMat4f(scaleMat4f(sx, sy, sz), modelmatrix);
    return modelmatrix;
}

function perspecMat4f(fov, aspect, near, far) {
    let f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    let rangeInv = 1.0 / (near - far);

    return [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ];
}

function multMatVec4f(m, v) {
    return [
        m[0] * v[0] + m[1] * v[1] + m[2] * v[2] + m[3] * v[3],
        m[4] * v[0] + m[5] * v[1] + m[6] * v[2] + m[7] * v[3],
        m[8] * v[0] + m[9] * v[1] + m[10] * v[2] + m[11] * v[3],
        m[12] * v[0] + m[13] * v[1] + m[14] * v[2] + m[15] * v[3]
    ];
}

function setRot3Mat4f(m, r) {
    m[0] = r[0];
    m[1] = r[1];
    m[2] = r[2];
    m[4] = r[3];
    m[5] = r[4];
    m[6] = r[5];
    m[8] = r[6];
    m[9] = r[7];
    m[10] = r[8];
}

function lookAtMat4f(eye, center, up) {
    let f = subVec3f(center, eye);
    f = normVec3f(f);

    let s = crossVec3f(f, up);
    s = normVec3f(s);

    let u = crossVec3f(s, f);

    return [
        s[0], u[0], -f[0], 0,
        s[1], u[1], -f[1], 0,
        s[2], u[2], -f[2], 0,
        -dotVec3f(s, eye), -dotVec3f(u, eye), dotVec3f(f, eye), 1
    ];
}

function orthoMat4f(left, right, bottom, top, near, far) {
    let lr = 1.0 / (left - right);
    let bt = 1.0 / (bottom - top);
    let nf = 1.0 / (near - far);

    return [
        -2.0 * lr, 0.0, 0.0, 0.0,
        0.0, -2.0 * bt, 0.0, 0.0,
        0.0, 0.0, 2.0 * nf, 0.0,
        (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1.0
    ];
}