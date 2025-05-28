'use client';
import React, { useState, useEffect, CSSProperties, useRef } from 'react'; 
import { useWebcamManager } from '../hooks/useWebcamManager';
import { WebcamControls } from './WebcamControls';
import { AnaglyphScene } from './AnaglyphScene';
import { RotationAngle } from '../types';
import { AppIntro } from './AppIntro';

const PARALLAX_SLIDER_SCALE = 20000; 

export const AnaglyphViewer = () => { 
  const {
    videoLRef: hiddenVideoLRef, 
    videoRRef: hiddenVideoRRef, 
    webcams, selectedLeftCam, setSelectedLeftCam,
    selectedRightCam, setSelectedRightCam, startUserMedia, stopUserMedia,
    streamsStarted, error: webcamError, getVideoDevices, isLoadingDevices, permissionGranted,
    streamL, streamR 
  } = useWebcamManager();

  const [viewMode, setViewMode] = useState<'preview' | 'anaglyph'>('preview');
  const [leftRotation, setLeftRotation] = useState<RotationAngle>(0);
  const [rightRotation, setRightRotation] = useState<RotationAngle>(0);
  const [canvasKey, setCanvasKey] = useState<number>(Date.now());
  const [horizontalOffsetSlider, setHorizontalOffsetSlider] = useState<number>(0); 
  const [isMaximized, setIsMaximized] = useState<boolean>(false); 
  const [showIntro, setShowIntro] = useState<boolean>(false);

  const previewVideoLRef = useRef<HTMLVideoElement>(null);
  const previewVideoRRef = useRef<HTMLVideoElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const introSeen = localStorage.getItem('introScreenSeen');
    if (introSeen !== 'true') {
      setShowIntro(true);
    }
  }, []);

  const handleDismissIntro = () => {
    setShowIntro(false);
    localStorage.setItem('introScreenSeen', 'true');
  };

  const handleStartStreamsForPreview = async () => {
    const success = await startUserMedia();
    if (success) {
      setViewMode('preview');
    }
  };

  const handleStartAnaglyph = () => {
    if (streamsStarted) {
      setViewMode('anaglyph');
      setCanvasKey(Date.now());
    } else {
      alert("Please start previews first.");
    }
  };

  const handleStopStreams = () => {
    stopUserMedia();
    setViewMode('preview');
    if (isMaximized) { 
      setIsMaximized(false);
      document.body.style.overflow = '';
    }
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMaximized]);

  useEffect(() => {
    if (streamsStarted && viewMode === 'preview') {
      if (previewVideoLRef.current && streamL) {
        if (previewVideoLRef.current.srcObject !== streamL) {
            previewVideoLRef.current.srcObject = streamL;
        }
        if (previewVideoLRef.current.paused) {
          previewVideoLRef.current.play().catch(err => console.warn("Preview L play attempt failed:", err));
        }
      }
      if (previewVideoRRef.current && streamR) {
        if (previewVideoRRef.current.srcObject !== streamR) {
          previewVideoRRef.current.srcObject = streamR;
        }
        if (previewVideoRRef.current.paused) {
          previewVideoRRef.current.play().catch(err => console.warn("Preview R play attempt failed:", err));
        }
      }
    } else {
      if (previewVideoLRef.current) previewVideoLRef.current.srcObject = null;
      if (previewVideoRRef.current) previewVideoRRef.current.srcObject = null;
    }
  }, [streamsStarted, viewMode, streamL, streamR]);


  const videoStyle = (rotation: RotationAngle): CSSProperties => ({
    transform: `rotate(${rotation}deg)`,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    backgroundColor: '#000000', 
    borderRadius: '0.5rem',
  });

  const startAnaglyphDisabled = !selectedLeftCam || !selectedRightCam || !permissionGranted || !streamsStarted;
  const shaderHorizontalOffset = horizontalOffsetSlider / PARALLAX_SLIDER_SCALE;

  const containerClasses = isMaximized && viewMode === 'anaglyph'
    ? "fixed inset-0 w-screen h-screen bg-base-300 z-[1000] p-4 flex flex-col items-center justify-center overflow-auto"
    : "p-2 sm:p-4 md:p-6 bg-base-200 rounded-box shadow-lg flex flex-col gap-4 sm:gap-6 items-center w-full";

  if (showIntro) {
    return <AppIntro onDismiss={handleDismissIntro} />;
  }

  return (
    <div ref={mainContainerRef} className={containerClasses}>
      {webcamError && (
        <div role="alert" className={`alert alert-error w-full text-xs sm:text-sm ${isMaximized ? 'max-w-xl mt-4' : 'max-w-xl'}`}>
          <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" className="stroke-current shrink-0 h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error! {webcamError}</span>
        </div>
      )}

      <video ref={hiddenVideoLRef} autoPlay playsInline muted style={{ display: 'none' }}></video>
      <video ref={hiddenVideoRRef} autoPlay playsInline muted style={{ display: 'none' }}></video>

      <div className={isMaximized && viewMode === 'anaglyph' ? 'w-full max-w-md mb-4' : 'w-full'}>
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
            horizontalOffset={horizontalOffsetSlider}
            onHorizontalOffsetChange={setHorizontalOffsetSlider}
        />
      </div>

      {streamsStarted && viewMode === 'preview' && !isMaximized && (
        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 p-2 bg-base-300 rounded-lg">
          <div>
            <h3 className="text-center text-sm font-semibold mb-1">Left Camera Preview</h3>
            <div className="aspect-video overflow-hidden rounded-md bg-black">
                <video
                    ref={previewVideoLRef} 
                    key={`preview-left-${streamL ? streamL.id : 'no-stream-l'}`}
                    autoPlay
                    playsInline
                    muted
                    style={videoStyle(leftRotation)}
                    className="transform transition-transform duration-300 ease-in-out"
                    onLoadedMetadata={(e) => e.currentTarget.play().catch(err => console.warn("Preview L onLoadedMetadata play failed:", err))}
                />
            </div>
          </div>
          <div>
            <h3 className="text-center text-sm font-semibold mb-1">Right Camera Preview</h3>
              <div className="aspect-video overflow-hidden rounded-md bg-black">
                <video
                    ref={previewVideoRRef} 
                    key={`preview-right-${streamR ? streamR.id : 'no-stream-r'}`}
                    autoPlay
                    playsInline
                    muted
                    style={videoStyle(rightRotation)}
                    className="transform transition-transform duration-300 ease-in-out"
                    onLoadedMetadata={(e) => e.currentTarget.play().catch(err => console.warn("Preview R onLoadedMetadata play failed:", err))}
                />
            </div>
          </div>
        </div>
      )}

      {streamsStarted && viewMode === 'anaglyph' && hiddenVideoLRef.current && hiddenVideoRRef.current && (
        <div className={`relative ${isMaximized ? 'flex-grow w-full h-auto' : 'w-full max-w-3xl'}`}>
            <AnaglyphScene
              videoElementL={hiddenVideoLRef.current} 
              videoElementR={hiddenVideoRRef.current}
              leftRotation={leftRotation}   
              rightRotation={rightRotation} 
              horizontalOffset={shaderHorizontalOffset} 
              canvasKey={canvasKey}
            />
            <button 
                onClick={toggleMaximize} 
                className="btn btn-sm btn-ghost absolute top-2 right-2 z-20 bg-black bg-opacity-50 hover:bg-opacity-75 text-white"
                title={isMaximized ? "Minimize View" : "Maximize View"}
            >
                {isMaximized ? (
                    <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5M15 15l5.25 5.25" /></svg>
                ) : (
                    <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                )}
            </button>
        </div>
      )}

      {!streamsStarted && !isMaximized && ( 
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