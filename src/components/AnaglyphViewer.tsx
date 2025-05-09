'use client';
import React, { useState, useEffect } from 'react';
import { useWebcamManager } from '../hooks/useWebcamManager'; // Adjust path
import { WebcamControls } from './WebcamControls';         // Adjust path
import { AnaglyphScene } from './AnaglyphScene';           // Adjust path

export const AnaglyphViewer = () => {
  const {
    videoLRef,
    videoRRef,
    webcams,
    selectedLeftCam,
    setSelectedLeftCam,
    selectedRightCam,
    setSelectedRightCam,
    startUserMedia,
    stopUserMedia,
    streamsStarted,
    error: webcamError,
    getVideoDevices,
    isLoadingDevices,
    permissionGranted
  } = useWebcamManager();

  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [canvasKey, setCanvasKey] = useState<number>(Date.now());

  const handleStart = async () => {
    await startUserMedia();
  };

  useEffect(() => {
    if (streamsStarted) {
      setShowInstructions(false);
    }
  }, [streamsStarted]);

  const handleStop = () => {
    stopUserMedia();
    setShowInstructions(true);
    setCanvasKey(Date.now());
  };

  const startDisabled = !selectedLeftCam || !selectedRightCam || !permissionGranted; // Also disable if permission not granted

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-base-200 rounded-box shadow-lg flex flex-col gap-6 items-center w-full">
      {webcamError && (
        <div role="alert" className="alert alert-error w-full max-w-xl">
          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
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
          onStartClick={handleStart}
          onStopClick={handleStop}
          isStreaming={streamsStarted}
          isLoadingDevices={isLoadingDevices}
          startDisabled={startDisabled}
          onRefreshDevices={() => getVideoDevices(true)} // Pass true to re-prompt if needed
          permissionGranted={permissionGranted}
      />

      {streamsStarted && videoLRef.current && videoRRef.current ? (
        <AnaglyphScene
          videoElementL={videoLRef.current}
          videoElementR={videoRRef.current}
          canvasKey={canvasKey}
        />
      ) : showInstructions ? null : (
        <div className="w-full aspect-video bg-base-300 rounded-lg shadow-xl flex items-center justify-center text-base-content/50" style={{ minHeight: '300px' }}>
            <p>Anaglyph display will appear here once streams are started.</p>
            {!permissionGranted && !isLoadingDevices && (
              <p className="mt-2 text-xs">Please grant camera permissions to start.</p>
            )}
        </div>
      )}
    </div>
  );
};
export default AnaglyphViewer;