game.height = 800;
game.width = 800;

gl = game.getContext('webgl2');

gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const vertexShaderText = `#version 300 es
precision mediump float;

layout(location=1) in float aPointSize;
layout(location=0) in vec2 aPosition;
layout(location=2) in vec3 aColor;

out vec3 vColor;

void main(){
    vColor = aColor;
    gl_Position = vec4(aPosition, 0.0, 1.0);
    gl_PointSize = aPointSize;
}
`
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderText);
gl.compileShader(vertexShader);
if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error("ERROR IN VERTEX SHADER: ", gl.getShaderInfoLog(vertexShader));
}

const fragmentShaderText = `#version 300 es
precision mediump float;

in vec3 vColor;

out vec4 outputColor;

void main(){
    outputColor = vec4(vColor, 1.0);
}
`
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

gl.useProgram(program);

const positionData = new Float32Array([
    0.0, 0.5,
    -0.5, -0.5,
    0.5, -0.5,
]);

const pointSizeData = new Float32Array([
    100, 30, 30
]);

const colorData = new Float32Array([
    0.8, 0.1, 0.1,
    0.1, 0.8, 0.1,
    0.1, 0.1, 0.8
]);

const aPositionLocation = 0;
const aPointSizeLocation = 1;
const aColorLocation = 2;

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positionData, gl.STATIC_DRAW);

const pointSizeBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, pointSizeBuffer);
gl.bufferData(gl.ARRAY_BUFFER, pointSizeData, gl.STATIC_DRAW);

const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(aPositionLocation, 2, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, pointSizeBuffer);
gl.vertexAttribPointer(aPointSizeLocation, 1, gl.FLOAT, false, 0, 0);

gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(aColorLocation, 3, gl.FLOAT, false, 0, 0);

gl.enableVertexAttribArray(aPositionLocation);
gl.enableVertexAttribArray(aPointSizeLocation);
gl.enableVertexAttribArray(aColorLocation);

gl.drawArrays(gl.POINTS, 0, 3);