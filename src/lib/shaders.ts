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
  varying vec2 vUv;

  void main() {
    vec4 colorL = texture2D(leftChannelTexture, vUv);
    vec4 colorR = texture2D(rightChannelTexture, vUv);
    gl_FragColor = vec4(colorL.r, colorR.g, colorR.b, 1.0);
  }
`;

export { vertexShader, fragmentShader };
