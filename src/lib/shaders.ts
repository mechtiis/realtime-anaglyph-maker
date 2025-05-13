/* This shader code is used to create an anaglyph effect by combining the red channel 
  from the left image and the green and blue channels from the right image. 
  The vertex shader passes the texture coordinates to the fragment shader, 
  which samples the two textures and combines them to create the final color output.
*/
export const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D leftChannelTexture;
  uniform sampler2D rightChannelTexture;
  uniform float leftRotation; // Rotation in degrees (0, 90, 180, 270)
  uniform float rightRotation; // Rotation in degrees

  varying vec2 vUv;

  const float PI = 3.14159265359;

  // Function to rotate UV coordinates around the center (0.5, 0.5)
  vec2 rotateUV(vec2 uv, float rotationDegrees) {
    float rotationRadians = rotationDegrees * PI / 180.0;
    mat2 rotationMatrix = mat2(cos(rotationRadians), -sin(rotationRadians),
                          sin(rotationRadians),  cos(rotationRadians));
    vec2 center = vec2(0.5, 0.5);
    return rotationMatrix * (uv - center) + center;
  }

  void main() {
    // Flip UVs vertically to correct common upside-down texture issue in WebGL
    vec2 flippedUv = vec2(vUv.x, 1.0 - vUv.y);

    vec2 leftUv = rotateUV(flippedUv, leftRotation);
    vec2 rightUv = rotateUV(flippedUv, rightRotation);

    // Clamp UVs to prevent sampling outside the texture after rotation
    leftUv = clamp(leftUv, 0.0, 1.0);
    rightUv = clamp(rightUv, 0.0, 1.0);

    vec4 colorL = texture2D(leftChannelTexture, leftUv);
    vec4 colorR = texture2D(rightChannelTexture, rightUv);

    gl_FragColor = vec4(colorL.r, colorR.g, colorR.b, 1.0);
  }
`;
