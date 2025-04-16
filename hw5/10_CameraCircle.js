import { SquarePyramid } from './squarePyramid.js'; 
import { Axes } from './util/util.js';         
import { Shader, readShaderFile } from './util/shader.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

let shader;
let pyramid = null;
let axes = null;
   
// 행렬
let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();

let startTime = 0;
let lastTime = 0;

// 카메라 파라미터
const radiusXZ = 5.0;
const speedXZDeg = 90.0; // XZ 평면에서 회전 속도(도/초)

// Y축 이동 (0..10)
const speedYDeg = 45.0; // 45도/초 => sin 주기 8초
const yAmp = 5.0;       // 중심5 + 진폭5 => 0..10

async function main() {
    if (!initWebGL()) {
        console.error('WebGL initialization failed');
        return;
    }

    await initShader();

    // projection
    mat4.perspective(
        projMatrix,
        glMatrix.toRadian(60),     // fov=60도
        canvas.width / canvas.height,
        0.1,
        100.0
    );

    // 정사각뿔 & 축 생성
    pyramid = new SquarePyramid(gl);
    axes = new Axes(gl, 2.0);

    // 시간 초기화
    startTime = lastTime = Date.now();

    requestAnimationFrame(render);
}

function initWebGL() {
    if (!gl) {
        alert('WebGL 2 not supported');
        return false;
    }
    canvas.width = 700;
    canvas.height = 700;
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 배경색
    gl.clearColor(0.1, 0.15, 0.25, 1.0);
    return true;
}

async function initShader() {
    const vertSrc = await readShaderFile('shVert.glsl');
    const fragSrc = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vertSrc, fragSrc);
}

function render() {
    const now = Date.now();
    const deltaTime = (now - lastTime) / 1000.0;
    const elapsed = (now - startTime) / 1000.0;
    lastTime = now;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // --- 카메라 위치 계산 ---
    // 1) xz 회전 (radius=5)
    const angleXZ = glMatrix.toRadian(speedXZDeg * elapsed);
    const camX = radiusXZ * Math.sin(angleXZ);
    const camZ = radiusXZ * Math.cos(angleXZ);

    // 2) y좌표 (0..10) 사이클
    const angleY = glMatrix.toRadian(speedYDeg * elapsed);
    const camY = yAmp + yAmp * Math.sin(angleY); // 5 + 5*sin() => 0..10

    // lookAt(카메라 위치, 바라보는 점=원점, up=(0,1,0))
    mat4.lookAt(viewMatrix,
        vec3.fromValues(camX, camY, camZ),
        vec3.fromValues(0,0,0),
        vec3.fromValues(0,1,0)
    );

    // 쉐이더 사용
    shader.use();

    // uniform 전송
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);

    // 사각뿔 모델 행렬
    mat4.identity(modelMatrix);
    shader.setMat4('u_model', modelMatrix);

    // 도형 그리기
    pyramid.draw(shader);

    // 축 그리기
    axes.draw(viewMatrix, projMatrix);

    requestAnimationFrame(render);
}

document.addEventListener('DOMContentLoaded', main);
