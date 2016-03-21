// vertex shader

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    // just add some noise to the normal
    vNormal = normal;

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);

    // store the world position as varying for lighting
    vWorldPosition = worldPosition.xyz;

    gl_Position = projectionMatrix * viewMatrix * worldPosition;

}