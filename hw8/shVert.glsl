#version 300 es
precision highp float;

layout(location = 0) in vec3 a_position;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 a_texcoord;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 FragPos;
out vec3 Normal;
out vec2 TexCoord;

void main() {
    FragPos  = vec3(u_model * vec4(a_position, 1.0));
    Normal   = normalize(mat3(transpose(inverse(u_model))) * a_normal);
    TexCoord = a_texcoord;
    gl_Position = u_projection * u_view * vec4(FragPos, 1.0);
}