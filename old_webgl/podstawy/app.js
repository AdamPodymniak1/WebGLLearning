game.width = 800;
game.height = 800;

const gl = game.getContext('webgl');

// kolor czyszczenia ekranu
gl.clearColor(0.75, 0.85, 0.8, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT)

// shader odpowiadający za geometrię (zwraca pozycje)
// attribute - zmienna
// varying - zwracana
// uniform - stałe, które pozostają niezmienne w vertex i fragment shaderach
const vertexShaderText = `
precision mediump float;

attribute vec2 vertPosition;
attribute vec3 vertColor;

varying vec3 fragColor;

void main(){
    fragColor = vertColor;
    gl_Position = vec4(vertPosition, 0, 1.0);
}
`

// shader odpowiadający za kolory
// varying - zmienna
// zwraca tylko gl_FragColor
const fragmentShaderText = `
precision mediump float;

varying vec3 fragColor;

void main(){
    gl_FragColor = vec4(fragColor, 1.0);
}
`

// tworzenie shaderów
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

// wskazywanie kodu shaderów
gl.shaderSource(vertexShader, vertexShaderText);
gl.shaderSource(fragmentShader, fragmentShaderText);

//kompilowanie shaderów i wyłapywanie błędów
gl.compileShader(vertexShader);
if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)){
    console.error("ERROR IN VERTEX SHADER!", gl.getShaderInfoLog(vertexShader));
}
gl.compileShader(fragmentShader);
if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)){
    console.error("ERROR IN FRAGMENT SHADER!", gl.getShaderInfoLog(fragmentShader));
}

// łączenie shaderów w jeden program i wyłapywanie błędów
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
    console.error("ERROR IN LINKER!", gl.getShaderInfoLog(program));
}

// TWORZENIE BUFFERA

// Najpierw (x,y), potem (R, G, B)
let triangleVertices = [
    0.0, 0.5,   1.0, 0.0, 0.0,
    -0.5,-0.5,  0.0, 1.0, 0.0,
    0.5, -0.5,   0.0, 0.0, 1.0
]

// przekazywanie danych do GPU
let triangleVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW); // używa ostatniego otwartego buffera (Float32, ponieważ JS używa Float64)

let positionAttribLocation = gl.getAttribLocation(program, 'vertPosition'); // znalezienie atrybutu do którego będziemy przypisywać dane z buffera
let colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

gl.vertexAttribPointer(
    positionAttribLocation, // miejsce atrybutu
    2, // liczba elementów na atrybut (vec2 = 2)
    gl.FLOAT, // typ elementów
    gl.FALSE, // czy jest normalizowalny
    5 * Float32Array.BYTES_PER_ELEMENT, // ile pamięci zajmuje każdy element
    0 // offset od początku vertexu do szukanego atrybutu
)
gl.vertexAttribPointer(
    colorAttribLocation,
    3,
    gl.FLOAT,
    gl.FALSE,
    5 * Float32Array.BYTES_PER_ELEMENT,
    2 * Float32Array.BYTES_PER_ELEMENT // bo kolory w triangleVertices zaczynają się od indexu 2
)

gl.enableVertexAttribArray(positionAttribLocation); // włącza atrybut do użytku
gl.enableVertexAttribArray(colorAttribLocation);

// GŁÓWNA PĘTLA RENDERUJĄCA

gl.useProgram(program); // jakiego programu używamy
gl.drawArrays(
    gl.TRIANGLES, // rysowanie trójkątami (poligonami)
    0, // od którego elementu buffera zaczynamy (index)
    triangleVertices.length / 2 // ile elementów przerobimy
);