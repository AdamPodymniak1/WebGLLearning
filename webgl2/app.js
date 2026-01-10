game.width = 800;
game.height = 800;

gl = game.getContext('webgl2');

const vertexShaderText = `#version 300 es
precision mediump float;

in vec2 vertexPosition;

void main(){
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}
`;

const fragmentShaderText = `#version 300 es
precision mediump float;

out vec4 outputColor;

void main(){
    outputColor = vec4(0.294, 0.0, 0.51, 1.0);
}
`

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderText);
gl.compileShader(vertexShader);
if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error("ERROR IN VERTEX SHADER: ", gl.getShaderInfoLog(vertexShader));
}

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, fragmentShaderText);
gl.compileShader(fragmentShader);
if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    console.error("ERROR IN FRAGMENT SHADER: ", gl.getShaderInfoLog(fragmentShader));
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error("ERROR IN PROGRAM LINKING: ", gl.getProgramInfoLog(program));
}

const triangleVertices = [
    0.0, 0.5,
    -0.5, -0.5,
    0.5, -0.5
];

const triangleVerticesCPUBuffer = new Float32Array(triangleVertices);

const triangleGeoBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesCPUBuffer, gl.STATIC_DRAW);

const vertexPositionAttribLocation = gl.getAttribLocation(program, 'vertexPosition');

game.width = game.clientWidth;
game.height = game.clientHeight;
gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

gl.viewport(0, 0, game.width, game.height);

gl.useProgram(program);
gl.enableVertexAttribArray(vertexPositionAttribLocation);

gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
gl.vertexAttribPointer(
    vertexPositionAttribLocation,
    2,
    gl.FLOAT,
    false,
    2 * Float32Array.BYTES_PER_ELEMENT,
    0
);

gl.drawArrays(gl.TRIANGLES, 0, 3);