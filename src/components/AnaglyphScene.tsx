import React, { useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../lib/shaders'; // Adjust path

interface AnaglyphPlaneProps {
  videoElementL: HTMLVideoElement | null;
  videoElementR: HTMLVideoElement | null;
}

const AnaglyphPlane = ({ videoElementL, videoElementR }: AnaglyphPlaneProps) => {
  const { viewport, gl } = useThree(); // gl for pixel ratio

  const textureL = useMemo(() => {
    if (!videoElementL) return null;
    const tex = new THREE.VideoTexture(videoElementL);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [videoElementL]);

  const textureR = useMemo(() => {
    if (!videoElementR) return null;
    const tex = new THREE.VideoTexture(videoElementR);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [videoElementR]);

  const shaderArgs = useMemo(() => ({
    uniforms: {
      leftChannelTexture: { value: textureL },
      rightChannelTexture: { value: textureR },
    },
    vertexShader,
    fragmentShader,
  }), [textureL, textureR]);

  useFrame(() => {
    if (textureL && videoElementL && videoElementL.readyState >= videoElementL.HAVE_ENOUGH_DATA) {
      textureL.needsUpdate = true;
    }
    if (textureR && videoElementR && videoElementR.readyState >= videoElementR.HAVE_ENOUGH_DATA) {
      textureR.needsUpdate = true;
    }
  });

  // Explicitly dispose textures on unmount or when video elements change
  useEffect(() => {
    return () => {
      textureL?.dispose();
      textureR?.dispose();
    };
  }, [textureL, textureR]);

  if (!textureL || !textureR) return null;

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      {/* Using a unique key for shaderMaterial can help if uniforms need deep updates,
          though for texture value changes, it's usually not necessary.
          THREE.ShaderMaterial.key is not a standard property.
          If re-compilation is needed, changing the `key` prop on the <shaderMaterial> itself is better.
      */}
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
};

interface AnaglyphSceneProps {
  videoElementL: HTMLVideoElement | null;
  videoElementR: HTMLVideoElement | null;
  canvasKey?: number; // Optional key for forcing Canvas re-render
}

export const AnaglyphScene = ({ videoElementL, videoElementR, canvasKey }: AnaglyphSceneProps) => {
  if (!videoElementL || !videoElementR) {
    return (
        <div className="w-full aspect-video bg-base-300 rounded-lg shadow-xl flex items-center justify-center text-base-content/50" style={{ minHeight: '300px' }}>
            <p>Waiting for video streams...</p>
        </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-black rounded-lg shadow-xl overflow-hidden" style={{ minHeight: '300px' }}>
      <Canvas key={canvasKey} orthographic camera={{ position: [0, 0, 5], zoom: 1, near: 0.1, far: 1000 }}>
        {/* Lighting is not strictly necessary for an unlit shader material, but good practice if you add other objects */}
        {/* <ambientLight intensity={0.5} /> */}
        {/* <pointLight position={[10, 10, 10]} /> */}
        <AnaglyphPlane videoElementL={videoElementL} videoElementR={videoElementR} />
      </Canvas>
    </div>
  );
};