function getVertexShaderSource() {
    return `
        precision highp float;

        attribute vec4 vertexpos;
        attribute vec3 vertexnorm;
        attribute vec2 texcoord;

        uniform mat4 modelmat;
        uniform mat4 viewmat;
        uniform mat4 projmat;

        varying vec2 o_texcoord;
        varying vec3 o_vertexnorm;
        
        void main() {
            gl_Position = projmat * viewmat * modelmat * vertexpos;
            o_texcoord = texcoord;
            o_vertexnorm = normalize((modelmat * vec4(vertexnorm, 0.0)).xyz);
        }
    `;
}

function getFragmentShaderSource() {
    return `
        precision highp float;
        uniform sampler2D tex;

        uniform vec3 Ka;
        uniform float blend;
        uniform int diff;
        
        varying vec2 o_texcoord;
        varying vec3 o_vertexnorm;

        void main() {
            vec3 texColor = vec3(texture2D(tex, o_texcoord).rgb);
            vec3 ambient = Ka * texColor;

            vec3 norm = normalize(o_vertexnorm);
            vec3 lightDirection = vec3(0.0, 1.0, 0.0);
            float diffuseIntensity = max(dot(norm, lightDirection), 0.0);
            vec3 diffuse = texColor * diffuseIntensity;

            if (diff == 0)
                diffuse = vec3(0.0, 0.0, 0.0);

            vec3 color = ambient + diffuse;
            gl_FragColor = vec4(color, blend);
        }
    `;
}