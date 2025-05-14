#version 300 es
precision mediump float;

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoord;

uniform vec3 u_viewPos;
uniform vec3 u_lightDirection;
uniform vec3 u_lightAmbient;
uniform vec3 u_lightDiffuse;
uniform vec3 u_lightSpecular;

uniform sampler2D u_materialDiffuse;
uniform vec3 u_materialSpecular;
uniform float u_materialShininess;

uniform int u_toonLevels;

out vec4 fragColor;

float quantize(float val, int levels) {
    if (levels <= 1) {
        return 0.0;
    }
    float step = 1.0 / float(levels - 1);
    return step * floor(val / step + 0.5);
}

void main() {
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(-u_lightDirection);
    vec3 viewDir = normalize(u_viewPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);

    // Toon Diffuse
    float diff = max(dot(norm, lightDir), 0.0);
    diff = quantize(diff, u_toonLevels);

    // Toon Specular
    float spec = 0.0;
    if (diff > 0.0) {
        spec = pow(max(dot(viewDir, reflectDir), 0.0), u_materialShininess);
        spec = quantize(spec, u_toonLevels);
    }

    vec3 texColor = texture(u_materialDiffuse, TexCoord).rgb;
    vec3 ambient = u_lightAmbient * texColor;
    vec3 diffuse = u_lightDiffuse * diff * texColor;
    vec3 specular = u_lightSpecular * spec * u_materialSpecular;

    vec3 result = ambient + diffuse + specular;
    fragColor = vec4(result, 1.0);
}
