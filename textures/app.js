game.height = 800;
game.width = 800;

gl = game.getContext('webgl2');

gl.clearColor(0.08, 0.08, 0.08, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

const vertexShaderText = `#version 300 es
precision mediump float;

layout(location=0) in vec2 aPosition;
layout(location=1) in vec2 aTexCoord;

out vec2 vTexCoord;

void main(){
	vTexCoord = aTexCoord;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const fragmentShaderText = `#version 300 es
precision mediump float;

uniform sampler2D uPixelSampler;
uniform sampler2D uImageSampler;

in vec2 vTexCoord;

out vec4 outputColor;

void main(){
    outputColor = texture(uPixelSampler, vTexCoord) * texture(uImageSampler, vTexCoord);
}
`

const program = gl.createProgram();
{
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

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error("ERROR IN PROGRAM LINKING: ", gl.getProgramInfoLog(program));
}
gl.useProgram(program);
}

const vertexBufferData = new Float32Array([
	-0.7, -0.7,
	0, 0.7,
	0.7, -0.7
]);

const texCoordBufferData = new Float32Array([
	0, 0,
	0.5, 1,
	1, 0
]);

const pixels = new Uint8Array([
	255,255,255,		230,25,75,			60,180,75,			255,225,25,
	67,99,216,			245,130,49,			145,30,180,			70,240,240,
	240,50,230,			188,246,12,			250,190,190,		0,128,128,
	230,190,255,		154,99,36,			255,250,200,		0,0,0,
]);

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexBufferData, gl.STATIC_DRAW);
gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(0);

const texCoordBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texCoordBufferData, gl.STATIC_DRAW);
gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(1);

const loadImage = () => new Promise(resolve => {
	const image = new Image();
	image.addEventListener('load', () => resolve(image));
	image.src = './jes.jpg';
});

const run = async() => {
	const image = await loadImage();

	gl.clearColor(0.08, 0.08, 0.08, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	gl.uniform1i(gl.getUniformLocation(program, 'uPixelSampler'), 0);
	gl.uniform1i(gl.getUniformLocation(program, 'uImageSampler'), 5);

	const pixelTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, pixelTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 3, 4, 0, gl.RGB, gl.UNSIGNED_BYTE, pixels);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	const imageTexture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0 + 5);
	gl.bindTexture(gl.TEXTURE_2D, imageTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.naturalWidth, image.naturalHeight, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
	gl.generateMipmap(gl.TEXTURE_2D);

	gl.drawArrays(gl.TRIANGLES, 0, 3);
}

run();