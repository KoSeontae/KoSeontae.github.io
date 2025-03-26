// Homework02.js

import { resizeAspectRatio, setupText } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let vao;

let dx = 0.0;
let dy = 0.0;
const halfSide = 0.1;

let overlayText;

function initWebGL() {
  if (!gl) {
    console.error('WebGL 2 not supported');
    return false;
  }

  canvas.width = 600;
  canvas.height = 600;
  resizeAspectRatio(gl, canvas);

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.1, 0.2, 0.3, 1.0);
  return true;
}

async function initShader() {
  const vertexShaderSource = await readShaderFile('shVert.glsl');
  const fragmentShaderSource = await readShaderFile('shFrag.glsl');
  shader = new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

function setupKeyboardEvents() {
  window.addEventListener('keydown', (event) => {
    let newDx = dx;
    let newDy = dy;

    if (event.key === 'ArrowUp') newDy += 0.01;
    if (event.key === 'ArrowDown') newDy -= 0.01;
    if (event.key === 'ArrowRight') newDx += 0.01;
    if (event.key === 'ArrowLeft') newDx -= 0.01;

    // 이동 제한 처리
    if (newDx - halfSide < -1) newDx = -1 + halfSide;
    if (newDx + halfSide > 1) newDx = 1 - halfSide;
    if (newDy - halfSide < -1) newDy = -1 + halfSide;
    if (newDy + halfSide > 1) newDy = 1 - halfSide;

    dx = newDx;
    dy = newDy;
  });
}

function setupBuffers() {
  const vertices = new Float32Array([
    -halfSide, -halfSide, 0.0,
     halfSide, -halfSide, 0.0,
     halfSide,  halfSide, 0.0,
    -halfSide,  halfSide, 0.0
  ]);

  vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  shader.setAttribPointer('aPos', 3, gl.FLOAT, false, 0, 0);
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  shader.use();
  shader.setVec2("uTranslation", [dx, dy]);

  gl.bindVertexArray(vao);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

  requestAnimationFrame(render);
}

async function main() {
  try {
    if (!initWebGL()) throw new Error('WebGL init failed');
    await initShader();

    overlayText = setupText(canvas, "Use arrow keys to move the rectangle", 1);

    setupKeyboardEvents();
    setupBuffers();
    render();
    return true;
  } catch (e) {
    console.error('Initialization error:', e);
    alert('Program initialization failed.');
    return false;
  }
}

main();
