// Global constants
const canvas = document.getElementById('glCanvas'); // 캔버스 요소 가져오기
const gl = canvas.getContext('webgl2'); // WebGL2 컨텍스트 가져오기

if (!gl) {
    console.error('WebGL 2 is not supported by your browser.');
}

// Set canvas size: 500 x 500
canvas.width = 500;
canvas.height = 500;

gl.viewport(0, 0, canvas.width, canvas.height);
gl.clearColor(0.1, 0.2, 0.3, 1.0);

// Start rendering
render();

// Render Loop
function render() {
    const halfWidth = canvas.width / 2;
    const halfHeight = canvas.height / 2;

    // 좌상단 (빨강)
    gl.viewport(0, halfHeight, halfWidth, halfHeight);
    gl.scissor(0, halfHeight, halfWidth, halfHeight);
    gl.enable(gl.SCISSOR_TEST); // Scissor Test 활성화
    gl.clearColor(1.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 우상단 (초록)
    gl.viewport(halfWidth, halfHeight, halfWidth, halfHeight);
    gl.scissor(halfWidth, halfHeight, halfWidth, halfHeight);
    gl.clearColor(0.0, 0.8, 0.3, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 좌하단 (파랑)
    gl.viewport(0, 0, halfWidth, halfHeight);
    gl.scissor(0, 0, halfWidth, halfHeight);
    gl.clearColor(0.0, 0.3, 0.8, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 우하단 (노랑)
    gl.viewport(halfWidth, 0, halfWidth, halfHeight);
    gl.scissor(halfWidth, 0, halfWidth, halfHeight);
    gl.clearColor(1.0, 1.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.disable(gl.SCISSOR_TEST); // Scissor Test 종료
}

// Resize canvas to maintain 1:1 aspect ratio when window size changes
window.addEventListener('resize', () => {
    const size = Math.min(window.innerWidth, window.innerHeight); // 너비와 높이 중 작은 값으로 캔버스 크기 설정
    canvas.width = size;
    canvas.height = size;
    gl.viewport(0, 0, canvas.width, canvas.height);
    render();
});
