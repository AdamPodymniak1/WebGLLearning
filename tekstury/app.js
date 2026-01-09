game.width = 800;
game.height = 800;

const gl = game.getContext('webgl');

const vertexShaderText = `
precision mediump float;

attribute vec3 vertPosition;
attribute vec2 vertTexCoord;

varying vec2 fragTexCoord;

uniform mat4 mWorld;
uniform mat4 mView;
uniform mat4 mProj;

void main(){
    fragTexCoord = vertTexCoord;
    gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
}
`

const fragmentShaderText = `
precision mediump float;

varying vec2 fragTexCoord;

uniform sampler2D sampler;

void main(){
    gl_FragColor = texture2D(sampler, fragTexCoord);
}
`

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(vertexShader, vertexShaderText);
gl.shaderSource(fragmentShader, fragmentShaderText);

gl.compileShader(vertexShader);
if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error("ERROR IN VERTEX SHADER!", gl.getShaderInfoLog(vertexShader));
}
gl.compileShader(fragmentShader);
if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    console.error("ERROR IN FRAGMENT SHADER!", gl.getShaderInfoLog(fragmentShader));
}

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error("ERROR IN LINKER!", gl.getShaderInfoLog(program));
}

// UV zamiast RGB
var boxVertices = 
[
	-1.0, 1.0, -1.0,   0, 0,
	-1.0, 1.0, 1.0,    0, 1,
	1.0, 1.0, 1.0,     1, 1,
	1.0, 1.0, -1.0,    1, 0,

	-1.0, 1.0, 1.0,    0, 0,
	-1.0, -1.0, 1.0,   1, 0,
	-1.0, -1.0, -1.0,  1, 1,
	-1.0, 1.0, -1.0,   0, 1,

	1.0, 1.0, 1.0,    1, 1,
	1.0, -1.0, 1.0,   0, 1,
	1.0, -1.0, -1.0,  0, 0,
	1.0, 1.0, -1.0,   1, 0,

	1.0, 1.0, 1.0,    1, 1,
	1.0, -1.0, 1.0,    1, 0,
	-1.0, -1.0, 1.0,    0, 0,
	-1.0, 1.0, 1.0,    0, 1,

	1.0, 1.0, -1.0,    0, 0,
	1.0, -1.0, -1.0,    0, 1,
	-1.0, -1.0, -1.0,    1, 1,
	-1.0, 1.0, -1.0,    1, 0,

	-1.0, -1.0, -1.0,   1, 1,
	-1.0, -1.0, 1.0,    1, 0,
	1.0, -1.0, 1.0,     0, 0,
	1.0, -1.0, -1.0,    0, 1,
];

var boxIndices =
[
	0, 1, 2,
	0, 2, 3,

	5, 4, 6,
	6, 4, 7,

	8, 9, 10,
	8, 10, 11,

	13, 12, 14,
	15, 14, 12,

	16, 17, 18,
	16, 18, 19,

	21, 20, 22,
	22, 20, 23
];

let boxVertexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObject);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

let boxIndexBufferObject = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObject);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);

let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
let texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');

gl.vertexAttribPointer(
    positionAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    0
)
gl.vertexAttribPointer(
    texCoordAttribLocation,
    2,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    3 * Float32Array.BYTES_PER_ELEMENT
)

gl.enableVertexAttribArray(positionAttribLocation);
gl.enableVertexAttribArray(texCoordAttribLocation);

// TWORZENIE TEKSTUR

let boxTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, boxTexture);
// S i T zamiast UV z jakiegoś powodu (bruh). Skalowanie tekstury, by się mieściła
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
 // ładowanie tekstury
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImg);

gl.bindTexture(gl.TEXTURE_2D, null); // unbindowanie (dobra praktyka, muszę sprawdzić dlaczego)

gl.useProgram(program);

let matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
let matViewUniformLocation = gl.getUniformLocation(program, 'mView');
let matProjUniformLocation = gl.getUniformLocation(program, 'mProj');

let worldMatrix = glMatrix.mat4.identity(new Float32Array(16));
let viewMatrix = glMatrix.mat4.lookAt(new Float32Array(16), [0, 0, -8], [0, 0, 0], [0, 1, 0]);
let projMatrix = glMatrix.mat4.perspective(new Float32Array(16), glMatrix.glMatrix.toRadian(45), game.width / game.height, 0.1, 1000);

gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
gl.uniformMatrix4fv(matViewUniformLocation, gl.FALSE, viewMatrix);
gl.uniformMatrix4fv(matProjUniformLocation, gl.FALSE, projMatrix);

// GŁÓWNA PĘTLA RENDEROWANIA

let angle = 0;
let identityMatrix = glMatrix.mat4.identity(new Float32Array(16));
let xRotationMatrix = new Float32Array(16);
let yRotationMatrix = new Float32Array(16);

function frame(){
    angle = performance.now() / 1000 / 6 * 2 * Math.PI;
    glMatrix.mat4.rotate(xRotationMatrix, identityMatrix, angle, [0, 1, 0]);
    glMatrix.mat4.rotate(yRotationMatrix, identityMatrix, angle / 4, [1, 0, 0]);
    glMatrix.mat4.mul(worldMatrix, xRotationMatrix, yRotationMatrix);
    gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

    
    gl.clearColor(0.75, 0.85, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.frontFace(gl.CCW);

    //ładowanie tekstury do outputu
    gl.bindTexture(gl.TEXTURE_2D, boxTexture);
    gl.activeTexture(gl.TEXTURE0);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(frame);
}

requestAnimationFrame(frame);