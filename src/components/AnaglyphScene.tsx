'use client';
import React, { useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../lib/shaders'; // Adjust path

interface AnaglyphPlaneProps {
  videoElementL: HTMLVideoElement | null;
  videoElementR: HTMLVideoElement | null;
}

const AnaglyphPlane = ({ videoElementL, videoElementR }: AnaglyphPlaneProps) => {
  const { viewport } = useThree();

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
      <shaderMaterial args={[shaderArgs]} />
    </mesh>
  );
};

interface AnaglyphSceneProps {
  videoElementL: HTMLVideoElement | null;
  videoElementR: HTMLVideoElement | null;
  canvasKey?: number;
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
        <AnaglyphPlane videoElementL={videoElementL} videoElementR={videoElementR} />
      </Canvas>
    </div>
  );
};