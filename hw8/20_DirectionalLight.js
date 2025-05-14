import { resizeAspectRatio, setupText, updateText, Axes } from '../util/util.js';
import { Shader, readShaderFile } from '../util/shader.js';
import { Arcball } from '../util/arcball.js';
import { Cylinder } from '../util/cylinder.js';
import { loadTexture } from '../util/texture.js';

const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');
let shader;
let overlayMode, overlayShading, overlayToon;
let isInitialized = false;

let viewMatrix = mat4.create();
let projMatrix = mat4.create();
let modelMatrix = mat4.create();
let arcBallMode = 'CAMERA';
let shadingMode = 'SMOOTH';
let toonLevels = 3;

const cylinder = new Cylinder(gl, 32);
const axes = new Axes(gl, 1.5);
const texture = loadTexture(gl, true, '../images/textures/sunrise.jpg');

const cameraPos = vec3.fromValues(0, 0, 3);
const lightDir = vec3.fromValues(-1.0, -0.25, -0.5);
const shininess = 32.0;
const arcball = new Arcball(canvas, 5.0, { rotation: 2.0, zoom: 0.0005 });

document.addEventListener('keydown', onKeyDown);

document.addEventListener('DOMContentLoaded', () => {
    if (isInitialized) return;
    main().then(ok => { isInitialized = ok; });
});

function onKeyDown(event) {
    const key = event.key;
    if (key === 'a') {
        arcBallMode = arcBallMode === 'CAMERA' ? 'MODEL' : 'CAMERA';
        updateText(overlayMode, 'arcball mode: ' + arcBallMode);
    } else if (key === 'r') {
        arcball.reset();
        modelMatrix = mat4.create();
        arcBallMode = 'CAMERA';
        updateText(overlayMode, 'arcball mode: ' + arcBallMode);
    } else if (key >= '1' && key <= '5') {
        toonLevels = parseInt(key);
        updateText(overlayToon, 'toon levels: ' + toonLevels);
        shader.use();
        shader.setInt('u_toonLevels', toonLevels);
        render();
    }
}


function initWebGL() {
    if (!gl) { console.error('WebGL2 not supported'); return false; }
    canvas.width = canvas.height = 700;
    resizeAspectRatio(gl, canvas);
    gl.viewport(0, 0, 700, 700);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    return true;
}

async function initShader() {
    const vs = await readShaderFile('shVert.glsl');
    const fs = await readShaderFile('shFrag.glsl');
    shader = new Shader(gl, vs, fs);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    if (arcBallMode === 'CAMERA') {
        viewMatrix = arcball.getViewMatrix();
    } else {
        modelMatrix = arcball.getModelRotMatrix();
        viewMatrix = arcball.getViewCamDistanceMatrix();
    }

    shader.use();
    shader.setMat4('u_model', modelMatrix);
    shader.setMat4('u_view', viewMatrix);
    shader.setMat4('u_projection', projMatrix);
    shader.setVec3('u_viewPos', cameraPos);

    // lighting uniforms
    shader.setVec3('u_lightDirection', lightDir);
    shader.setVec3('u_lightAmbient', vec3.fromValues(0.2, 0.2, 0.2));
    shader.setVec3('u_lightDiffuse', vec3.fromValues(0.7, 0.7, 0.7));
    shader.setVec3('u_lightSpecular', vec3.fromValues(1.0, 1.0, 1.0));

    // material uniforms
    shader.setInt('u_materialDiffuse', 0);
    shader.setVec3('u_materialSpecular', vec3.fromValues(0.8, 0.8, 0.8));
    shader.setFloat('u_materialShininess', shininess);

    // toon shading level
    shader.setInt('u_toonLevels', toonLevels);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    cylinder.draw(shader);
    axes.draw(viewMatrix, projMatrix);
    requestAnimationFrame(render);
}

async function main() {
    if (!initWebGL()) throw 'GL init failed';
    mat4.lookAt(viewMatrix, cameraPos, [0, 0, 0], [0, 1, 0]);
    mat4.perspective(projMatrix, glMatrix.toRadian(60), 1.0, 0.1, 100);
    await initShader();

    // always smooth shading 설정
    cylinder.copyVertexNormalsToNormals();
    cylinder.updateNormals();

    setupText(canvas, 'TOON SHADING', 1);
    overlayMode    = setupText(canvas, 'arcball mode: ' + arcBallMode, 2);
    overlayToon    = setupText(canvas, 'toon levels: ' + toonLevels, 3);
    setupText(canvas, 'press a/r to change/reset arcball mode', 4);
    setupText(canvas, 'press 1 - 5: toa change toon shading levels', 5);

    requestAnimationFrame(render);
    return true;
}
