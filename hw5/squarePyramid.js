export class SquarePyramid {
    constructor(gl) {
        this.gl = gl;

        const colorPink   = [1.0, 0.0, 1.0, 1.0]; // 핑크
        const colorRed    = [1.0, 0.0, 0.0, 1.0]; // 빨강
        const colorCyan   = [0.0, 1.0, 1.0, 1.0]; // 하늘색
        const colorYellow = [1.0, 1.0, 0.0, 1.0]; // 노랑

        // 바닥: (±0.5,0,±0.5), 꼭대기: (0,1,0)
        // 삼각형 6개를 모두 풀어서 작성
        let data = [];

        function pushVertex(x, y, z, r, g, b, a) {
            data.push(x, y, z, r, g, b, a);
        }

        // [1] 바닥 tri #1
        pushVertex(-0.5, 0, -0.5, ...colorPink);
        pushVertex( 0.5, 0, -0.5, ...colorPink);
        pushVertex( 0.5, 0,  0.5, ...colorPink);

        // [2] 바닥 tri #2
        pushVertex(-0.5, 0, -0.5, ...colorPink);
        pushVertex( 0.5, 0,  0.5, ...colorPink);
        pushVertex(-0.5, 0,  0.5, ...colorPink);


        // [3] side #1: (v0, v1, top) => 하늘
        pushVertex(-0.5, 0, 0.5, ...colorCyan);
        pushVertex(-0.5, 0, -0.5, ...colorCyan);
        pushVertex( 0.0, 1.0,  0.0, ...colorCyan);

        // [4] side #2: (v1, v2, top) => 빨강
        pushVertex( 0.5, 0, 0.5, ...colorRed);
        pushVertex( -0.5, 0,  0.5, ...colorRed);
        pushVertex( 0.0, 1.0,  0.0, ...colorRed);

        // [5] side #3: (v2, v3, top) => 노랑
        pushVertex( 0.5, 0, -0.5, ...colorYellow);
        pushVertex( 0.5, 0,  0.5, ...colorYellow);
        pushVertex( 0.0, 1.0,  0.0, ...colorYellow);

        // [6] side #4: (v3, v0, top) => 핑크
        pushVertex(-0.5, 0, -0.5, ...colorPink);
        pushVertex(0.5, 0, -0.5, ...colorPink);
        pushVertex( 0.0, 1.0,  0.0, ...colorPink);

        this.numVertices = 18; // 6 faces x 3 vertices each
        const floatPerVertex = 7; // (x,y,z)+(r,g,b,a)
        const stride = floatPerVertex * 4;

        // GPU 버퍼
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

        // 속성stride/offset
        this.strideBytes = stride;
        this.offsetColorBytes = 3 * 4; // xyz=3 floats => 12 bytes
    }

    draw(shader) {
        const gl = this.gl;

        // a_position=layout(0)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.vertexAttribPointer(
            0,  // loc=0
            3,  // vec3
            gl.FLOAT,
            false,
            this.strideBytes,
            0
        );
        gl.enableVertexAttribArray(0);

        // a_normal=layout(1) => 사용 X
        gl.disableVertexAttribArray(1);

        // a_color=layout(2)
        gl.vertexAttribPointer(
            2,
            4, // vec4
            gl.FLOAT,
            false,
            this.strideBytes,
            this.offsetColorBytes
        );
        gl.enableVertexAttribArray(2);

        // a_texCoord=layout(3) => 사용 X
        gl.disableVertexAttribArray(3);

        // drawArrays
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    }
}
