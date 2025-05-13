/* This shader code is used to create an anaglyph effect by combining the red channel 
  from the left image and the green and blue channels from the right image. 
  The vertex shader passes the texture coordinates to the fragment shader, 
  which samples the two textures and combines them to create the final color output.
*/
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D leftChannelTexture;
  uniform sampler2D rightChannelTexture;
  uniform float leftRotation;
  uniform float rightRotation;

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
    vec2 leftUv = rotateUV(vUv, leftRotation);
    vec2 rightUv = rotateUV(vUv, rightRotation);

    // Clamp UVs to prevent sampling outside the texture after rotation,
    // or set wrap mode on textures to CLAMP_TO_EDGE if available and preferred.
    // Simple clamp:
    leftUv = clamp(leftUv, 0.0, 1.0);
    rightUv = clamp(rightUv, 0.0, 1.0);

    vec4 colorL = texture2D(leftChannelTexture, leftUv);
    vec4 colorR = texture2D(rightChannelTexture, rightUv);

    // If rotated UVs go out of bounds, the edge pixel will be stretched by default (REPEAT wrap mode).
    // Or, if clamped, it might show a solid color if the texture doesn't have valid data there.
    // For a cleaner look with rotation, ensure texture wrap modes are set to ClampToEdgeWrapping
    // on the THREE.VideoTexture objects if edge artifacts appear.

    gl_FragColor = vec4(colorL.r, colorR.g, colorR.b, 1.0);
  }
`
export { vertexShader, fragmentShader };
