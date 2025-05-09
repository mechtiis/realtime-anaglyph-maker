'use client';
import React, { useState, useEffect } from 'react';
import { useWebcamManager } from '../hooks/useWebcamManager'; // Adjust path
import { WebcamControls } from '@/components/WebcamControls';
import { AnaglyphScene } from '@/components/AnaglyphScene';

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
  } = useWebcamManager();

  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  // canvasKey can help force re-initialization of the R3F Canvas if needed.
  const [canvasKey, setCanvasKey] = useState<number>(Date.now());

  const handleStart = async () => {
    await startUserMedia();
    // The effect below will handle UI changes based on streamsStarted
  };

  useEffect(() => {
    if (streamsStarted) {
      setShowInstructions(false);
      // Optionally, update canvasKey if a full Canvas reset is desired upon starting.
      // setCanvasKey(Date.now());
    } else {
        // Ensure instructions are shown if streams stop for any reason other than user clicking stop
        // (e.g. if a device is disconnected).
        // setShowInstructions(true); 
        // This might be too aggressive, consider specific cases.
        // TODO
    }
  }, [streamsStarted]);

  const handleStop = () => {
    stopUserMedia();
    setShowInstructions(true);
    setCanvasKey(Date.now()); // Force re-render of Canvas to clear it
  };

  const startDisabled = !selectedLeftCam || !selectedRightCam;

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

      {/* Hidden video elements for webcam streams, managed by the hook */}
      <video ref={videoLRef} autoPlay playsInline muted style={{ display: 'none' }}></video>
      <video ref={videoRRef} autoPlay playsInline muted style={{ display: 'none' }}></video>

      {/* Always render controls, but their state (disabled/visible buttons) changes */}
      <WebcamControls
          webcams={webcams}
          selectedLeftCam={selectedLeftCam}
          onLeftCamChange={setSelectedLeftCam}
          selectedRightCam={selectedRightCam}
          onRightCamChange={setSelectedRightCam}
          onStartClick={handleStart}
          onStopClick={handleStop} // This will be shown when isStreaming is true from parent
          isStreaming={streamsStarted}
          isLoadingDevices={isLoadingDevices}
          startDisabled={startDisabled}
          onRefreshDevices={getVideoDevices}
      />

      {/* Conditionally render the Anaglyph Scene */}
      {streamsStarted && videoLRef.current && videoRRef.current ? (
        <AnaglyphScene
          videoElementL={videoLRef.current}
          videoElementR={videoRRef.current}
          canvasKey={canvasKey}
        />
      ) : showInstructions ? null : ( // If not showing instructions and not streaming, show a placeholder or message
        <div className="w-full aspect-video bg-base-300 rounded-lg shadow-xl flex items-center justify-center text-base-content/50" style={{ minHeight: '300px' }}>
            <p>Anaglyph display will appear here once streams are started.</p>
        </div>
      )}
    </div>
  );
};

export default AnaglyphViewer;