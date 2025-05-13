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
  uniform float horizontalOffset; // Parallax adjustment, e.g., -0.02 to 0.02

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

    // Apply horizontal offset for parallax adjustment BEFORE rotation
    // This ensures the offset is always along the original horizontal axis of the texture
    vec2 offsetLeftUvBase = vec2(flippedUv.x - horizontalOffset, flippedUv.y);
    vec2 offsetRightUvBase = vec2(flippedUv.x + horizontalOffset, flippedUv.y);

    // Rotate the (now offset) UV coordinates
    vec2 finalLeftUv = rotateUV(offsetLeftUvBase, leftRotation);
    vec2 finalRightUv = rotateUV(offsetRightUvBase, rightRotation);

    // Clamp UVs to prevent sampling outside the texture
    finalLeftUv = clamp(finalLeftUv, 0.0, 1.0);
    finalRightUv = clamp(finalRightUv, 0.0, 1.0);

    vec4 colorL = texture2D(leftChannelTexture, finalLeftUv);
    vec4 colorR = texture2D(rightChannelTexture, finalRightUv);

    gl_FragColor = vec4(colorL.r, colorR.g, colorR.b, 1.0);
  }
`;