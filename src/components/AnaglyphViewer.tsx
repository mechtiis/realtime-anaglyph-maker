'use client';
import React, { useState, useEffect, CSSProperties } from 'react';
import { useWebcamManager } from '../hooks/useWebcamManager';
import { WebcamControls } from './WebcamControls';
import { AnaglyphScene } from './AnaglyphScene';
import { RotationAngle } from '../types';

export const AnaglyphViewer = () => {
  const {
    videoLRef, videoRRef, webcams, selectedLeftCam, setSelectedLeftCam,
    selectedRightCam, setSelectedRightCam, startUserMedia, stopUserMedia,
    streamsStarted, error: webcamError, getVideoDevices, isLoadingDevices, permissionGranted
  } = useWebcamManager();

  const [viewMode, setViewMode] = useState<'preview' | 'anaglyph'>('preview');
  const [leftRotation, setLeftRotation] = useState<RotationAngle>(0);
  const [rightRotation, setRightRotation] = useState<RotationAngle>(0);
  const [canvasKey, setCanvasKey] = useState<number>(Date.now());

  const handleStartStreamsForPreview = async () => {
    const success = await startUserMedia();
    if (success) {
      setViewMode('preview'); // Explicitly stay/go to preview mode
    }
  };

  const handleStartAnaglyph = () => {
    if (streamsStarted) { // Ensure streams are already started from preview
      setViewMode('anaglyph');
      setCanvasKey(Date.now()); // Force re-render of Canvas for anaglyph
    } else {
        // This case should ideally be handled by disabling the button
        alert("Please start previews first.");
    }
  };

  const handleStopStreams = () => {
    stopUserMedia();
    setViewMode('preview'); // Revert to preview setup on stop
  };

  const videoStyle = (rotation: RotationAngle): CSSProperties => ({
    transform: `rotate(${rotation}deg)`,
    width: '100%',
    height: '100%',
    objectFit: 'contain', 
    backgroundColor: '#333',
    borderRadius: '0.5rem',
  });

  const startAnaglyphDisabled = !selectedLeftCam || !selectedRightCam || !permissionGranted || !streamsStarted;

  return (
    <div className="p-2 sm:p-4 md:p-6 bg-base-200 rounded-box shadow-lg flex flex-col gap-4 sm:gap-6 items-center w-full">
      {webcamError && (
        <div role="alert" className="alert alert-error w-full max-w-xl text-xs sm:text-sm">
          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="stroke-current shrink-0 h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error! {webcamError}</span>
        </div>
      )}

      <video ref={videoLRef} autoPlay playsInline muted style={{ display: 'none' }}></video>
      <video ref={videoRRef} autoPlay playsInline muted style={{ display: 'none' }}></video>

      <WebcamControls
          webcams={webcams}
          selectedLeftCam={selectedLeftCam}
          onLeftCamChange={setSelectedLeftCam}
          selectedRightCam={selectedRightCam}
          onRightCamChange={setSelectedRightCam}
          onStartStreamsForPreviewClick={handleStartStreamsForPreview}
          onStartAnaglyphClick={handleStartAnaglyph}
          onStopClick={handleStopStreams}
          isStreaming={streamsStarted}
          isLoadingDevices={isLoadingDevices}
          startAnaglyphDisabled={startAnaglyphDisabled}
          onRefreshDevices={() => getVideoDevices(true)}
          permissionGranted={permissionGranted}
          leftRotation={leftRotation}
          onLeftRotate={setLeftRotation}
          rightRotation={rightRotation}
          onRightRotate={setRightRotation}
          viewMode={viewMode}
      />

      {streamsStarted && viewMode === 'preview' && (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 p-2 bg-base-300 rounded-lg">
          <div>
            <h3 className="text-center text-sm font-semibold mb-1">Left Camera Preview</h3>
            <div className="aspect-video overflow-hidden rounded-md">
                <video
                    autoPlay
                    playsInline
                    muted
                    ref={videoLRef} 
                    style={videoStyle(leftRotation)}
                    className="transform transition-transform duration-300 ease-in-out"
                />
            </div>
          </div>
          <div>
            <h3 className="text-center text-sm font-semibold mb-1">Right Camera Preview</h3>
             <div className="aspect-video overflow-hidden rounded-md">
                <video
                    autoPlay
                    playsInline
                    muted
                    ref={videoRRef} 
                    style={videoStyle(rightRotation)}
                    className="transform transition-transform duration-300 ease-in-out"
                />
            </div>
          </div>
        </div>
      )}

      {streamsStarted && viewMode === 'anaglyph' && videoLRef.current && videoRRef.current && (
        <AnaglyphScene
          videoElementL={videoLRef.current} 
          videoElementR={videoRRef.current}
          leftRotation={leftRotation}   
          rightRotation={rightRotation} 
          canvasKey={canvasKey}
        />
      )}

      {!streamsStarted && (
        <div className="w-full max-w-3xl aspect-video bg-base-300 rounded-lg shadow-xl flex items-center justify-center text-base-content/50" style={{ minHeight: '200px', maxHeight: '400px' }}>
          <p className="text-center">
              {isLoadingDevices ? "Loading cameras..." : "Streams stopped or not yet started."} <br />
              {!permissionGranted && !isLoadingDevices && "Please grant camera permissions."}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnaglyphViewer;