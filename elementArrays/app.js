game.height = 800;
game.width = 800;

gl = game.getContext('webgl2');

gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const vertexShaderText = `#version 300 es
precision mediump float;

layout(location=0) in vec2 aPosition;
layout(location=1) in vec3 aColor;

out vec3 vColor;

void main(){
    vColor = aColor;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShaderText = `#version 300 es
precision mediump float;

in vec3 vColor;

out vec4 outputColor;

void main(){
    outputColor = vec4(vColor, 1.0);
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

gl.useProgram(program);

const elementVertexData = new Float32Array([
	0,0,				0,0,0,
	0.00000,1.00000,	1,0,0,
	0.95106,0.30902,	0,1,0,
	0.58779,-.80902,	0,0,1,
	-.58779,-.80902,	1,1,0,
	-.95106,0.30902,	1,0,1,
]);

const elementIndexData = new Uint8Array([
	0,1,2,
	0,2,3,
	0,3,4,
	0,4,5,
	0,5,1,
]);

const elementVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, elementVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, elementVertexData, gl.STATIC_DRAW);

const colorVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, elementVertexData, gl.STATIC_DRAW);

const elementIndexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementIndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, elementIndexData, gl.STATIC_DRAW);

gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 5 * Float32Array.BYTES_PER_ELEMENT, 2 * Float32Array.BYTES_PER_ELEMENT);

gl.enableVertexAttribArray(0);
gl.enableVertexAttribArray(1);

gl.drawElements(gl.TRIANGLES, 15, gl.UNSIGNED_BYTE, 0);