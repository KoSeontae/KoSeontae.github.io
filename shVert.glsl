#version 300 es
in vec3 aPos;
uniform vec2 uTranslation;
void main() {
  // 기본 좌표에 uTranslation을 더함
  vec3 pos = aPos;
  pos.xy += uTranslation;
  gl_Position = vec4(pos, 1.0);
}
