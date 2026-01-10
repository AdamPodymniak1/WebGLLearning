async function loadJSON(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to load ${url}`);
    }
    return await response.json();
}

async function main() {
    const model = await loadJSON('./Susan.json');

	game.width = 800;
	game.height = 800;

	const gl = game.getContext('webgl');

	const vertexShaderText = `
	precision mediump float;

	attribute vec3 vertPosition;
	attribute vec2 vertTexCoord;
	attribute vec3 vertNormal;

	varying vec2 fragTexCoord;
	varying vec3 fragNormal;

	uniform mat4 mWorld;
	uniform mat4 mView;
	uniform mat4 mProj;

	void main(){
		fragTexCoord = vertTexCoord;
		fragNormal = (mWorld * vec4(vertNormal, 0)).xyz;
		gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);
	}
	`

	const fragmentShaderText = `
	precision mediump float;

	struct DirectionalLight{
		vec3 direction;
		vec3 color;
	};

	varying vec2 fragTexCoord;
	varying vec3 fragNormal;

	uniform vec3 ambientLightIntensity;
	uniform DirectionalLight sun;
	uniform sampler2D sampler;

	void main(){
		vec3 surfaceNormal = normalize(fragNormal);
		vec3 normSunDirection = normalize(sun.direction);

		vec4 texel = texture2D(sampler, fragTexCoord);

		vec3 lightIntensity = ambientLightIntensity + sun.color * max(dot(fragNormal, normSunDirection), 0.0);

		gl_FragColor = vec4(texel.rgb * lightIntensity, texel.a);
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

	let modelVertices = model.meshes[0].vertices;
	let modelIndices = [].concat.apply([], model.meshes[0].faces);
	let modelTexCoords = model.meshes[0].texturecoords[0];
	let modelNormals = model.meshes[0].normals;

	let modelPosVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelVertices), gl.STATIC_DRAW);

	let modelTexCoordVertexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelTexCoords), gl.STATIC_DRAW);

	let modelIndexBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, modelIndexBufferObject);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(modelIndices), gl.STATIC_DRAW);

	let modelNormalBufferObject = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, modelNormalBufferObject);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(modelNormals), gl.STATIC_DRAW);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelPosVertexBufferObject);
	let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	gl.vertexAttribPointer(
		positionAttribLocation,
		3,
		gl.FLOAT,
		gl.FALSE,
		3 * Float32Array.BYTES_PER_ELEMENT,
		0
	)
	gl.enableVertexAttribArray(positionAttribLocation);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, modelTexCoordVertexBufferObject);
	let texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoord');
	gl.vertexAttribPointer(
		texCoordAttribLocation,
		2,
		gl.FLOAT,
		gl.FALSE,
		2 * Float32Array.BYTES_PER_ELEMENT,
		0
	)
	gl.enableVertexAttribArray(texCoordAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, modelNormalBufferObject);
	let normalAttribLocation = gl.getAttribLocation(program, 'vertNormal');
	gl.vertexAttribPointer(
		normalAttribLocation,
		3,
		gl.FLOAT,
		gl.TRUE,
		3 * Float32Array.BYTES_PER_ELEMENT,
		0
	)
	gl.enableVertexAttribArray(normalAttribLocation);

	let modelTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, modelTexture);
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texImg);

	gl.bindTexture(gl.TEXTURE_2D, null);
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

	let angle = 0;
	let identityMatrix = glMatrix.mat4.identity(new Float32Array(16));
	let xRotationMatrix = new Float32Array(16);
	let yRotationMatrix = new Float32Array(16);

	// LIGHTING

	gl.useProgram(program); // w razie jakby w kodzie było więcej różnych programów
	let ambientLightIntensityUniformLocation = gl.getUniformLocation(program, 'ambientLightIntensity');
	let sunlightDirectionUniformLocation = gl.getUniformLocation(program, 'sun.direction');
	let sunlightIntensityUniformLocation = gl.getUniformLocation(program, 'sun.color');

	gl.uniform3f(ambientLightIntensityUniformLocation, 0.2, 0.2, 0.2);
	gl.uniform3f(sunlightDirectionUniformLocation, 3.0, 4.0, -2.0);
	gl.uniform3f(sunlightIntensityUniformLocation, 0.9, 0.9, 0.9);

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

		gl.bindTexture(gl.TEXTURE_2D, modelTexture);
		gl.activeTexture(gl.TEXTURE0);

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.drawElements(gl.TRIANGLES, modelIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(frame);
	}

	requestAnimationFrame(frame);
}

main();