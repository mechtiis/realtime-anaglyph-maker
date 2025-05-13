import React from 'react';
import { WebcamDevice, RotationAngle } from '../types'; // Adjust path as needed

interface WebcamControlsProps {
  webcams: WebcamDevice[];
  selectedLeftCam: string;
  onLeftCamChange: (deviceId: string) => void;
  selectedRightCam: string;
  onRightCamChange: (deviceId: string) => void;
  onStartAnaglyphClick: () => void; 
  onStopClick: () => void;
  isStreaming: boolean; 
  isLoadingDevices: boolean;
  startAnaglyphDisabled: boolean; 
  onRefreshDevices: () => void;
  permissionGranted: boolean;
  leftRotation: RotationAngle;
  onLeftRotate: (angle: RotationAngle) => void;
  rightRotation: RotationAngle;
  onRightRotate: (angle: RotationAngle) => void;
  viewMode: 'preview' | 'anaglyph';
  onStartStreamsForPreviewClick: () => void;
  horizontalOffset: number; // For slider value, e.g., -100 to 100
  onHorizontalOffsetChange: (value: number) => void;
}

const rotationOptions: RotationAngle[] = [0, 90, 180, 270];

export const WebcamControls = ({
  webcams, selectedLeftCam, onLeftCamChange, selectedRightCam, onRightCamChange,
  onStartAnaglyphClick, onStopClick, isStreaming, isLoadingDevices, startAnaglyphDisabled,
  onRefreshDevices, permissionGranted, leftRotation, onLeftRotate, rightRotation, onRightRotate,
  viewMode, onStartStreamsForPreviewClick, horizontalOffset, onHorizontalOffsetChange
}: WebcamControlsProps) => {

  const getNextRotation = (current: RotationAngle): RotationAngle => {
    const currentIndex = rotationOptions.indexOf(current);
    return rotationOptions[(currentIndex + 1) % rotationOptions.length];
  };

  return (
    <div className="card bg-base-100 shadow-xl p-4 sm:p-6 w-full max-w-lg"> 
      <div className="flex justify-between items-center mb-4">
        <h2 className="card-title text-xl sm:text-2xl">Camera Controls</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onRefreshDevices()}
          disabled={isLoadingDevices || isStreaming}
          title="Refresh camera list"
        >
          {isLoadingDevices ? <span className="loading loading-spinner loading-xs"></span> : 'Refresh Cams'}
        </button>
      </div>

      {!permissionGranted && !isLoadingDevices && webcams.length === 0 && (
        <p className="mb-2 text-xs text-warning-content bg-warning/20 p-2 rounded-md">
          Camera labels might be generic. Grant camera access and refresh if names are unclear.
          If you've denied permissions, please enable them in your browser settings.
        </p>
      )}
      <p className="mb-4 text-xs sm:text-sm text-base-content/80">
        Select webcams, adjust rotation for previews, then start anaglyph.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="form-control w-full">
          <label className="label"><span className="label-text">Left Webcam</span></label>
          <select
            className="select select-bordered w-full select-sm sm:select-md"
            value={selectedLeftCam}
            onChange={(e) => onLeftCamChange(e.target.value)}
            disabled={isStreaming || isLoadingDevices || webcams.length === 0}
          >
            <option value="" disabled>{isLoadingDevices ? "Loading..." : (webcams.length === 0 ? "No cameras" : "Select Left")}</option>
            {webcams.map(cam => (<option key={`left-${cam.deviceId}`} value={cam.deviceId}>{cam.label}</option>))}
          </select>
        </div>
        <div className="form-control w-full">
          <label className="label"><span className="label-text">Right Webcam</span></label>
          <select
            className="select select-bordered w-full select-sm sm:select-md"
            value={selectedRightCam}
            onChange={(e) => onRightCamChange(e.target.value)}
            disabled={isStreaming || isLoadingDevices || webcams.length === 0}
          >
            <option value="" disabled>{isLoadingDevices ? "Loading..." : (webcams.length === 0 ? "No cameras" : "Select Right")}</option>
            {webcams.map(cam => (<option key={`right-${cam.deviceId}`} value={cam.deviceId}>{cam.label}</option>))}
          </select>
        </div>
      </div>

      {(isStreaming) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-control w-full">
              <label className="label"><span className="label-text">Rotate Left</span></label>
              <button
                className="btn btn-outline btn-sm sm:btn-md w-full justify-start px-3" // Ensure button is wide enough
                onClick={() => onLeftRotate(getNextRotation(leftRotation))}
                disabled={!isStreaming}
              >
                <span className="mr-2"> {leftRotation}°</span> 🔄 
              </button>
            </div>
            <div className="form-control w-full">
              <label className="label"><span className="label-text">Rotate Right</span></label>
              <button
                className="btn btn-outline btn-sm sm:btn-md w-full justify-start px-3" // Ensure button is wide enough
                onClick={() => onRightRotate(getNextRotation(rightRotation))}
                disabled={!isStreaming}
              >
                 <span className="mr-2">{rightRotation}°</span> 🔄
              </button>
            </div>
          </div>
          {viewMode === 'anaglyph' && (
            <div className="form-control w-full mb-4">
              <label className="label" htmlFor="horizontalOffsetSlider">
                <span className="label-text">Anaglyph Parallax (Depth)</span>
                <span className="label-text-alt">{horizontalOffset}</span>
              </label>
              <input
                id="horizontalOffsetSlider"
                type="range"
                min="-100" 
                max="100"  
                value={horizontalOffset}
                onChange={(e) => onHorizontalOffsetChange(parseInt(e.target.value, 10))}
                className="range range-primary range-sm"
                disabled={!isStreaming}
              />
            </div>
          )}
        </>
      )}

      <div className="card-actions justify-end mt-2">
        {!isStreaming && viewMode === 'preview' && (
             <button
                className="btn btn-accent"
                onClick={onStartStreamsForPreviewClick}
                disabled={isLoadingDevices || webcams.length === 0 || !permissionGranted || (!selectedLeftCam || !selectedRightCam)}
              >
                {isLoadingDevices ? <span className="loading loading-spinner loading-xs"></span> : 'Start Previews'}
              </button>
        )}
        {isStreaming && viewMode === 'preview' && (
          <button
            className="btn btn-primary"
            onClick={onStartAnaglyphClick}
            disabled={startAnaglyphDisabled || isLoadingDevices || webcams.length === 0}
          >
            Show Anaglyph
          </button>
        )}
        {isStreaming && (
          <button className="btn btn-warning" onClick={onStopClick}>
            Stop All Streams
          </button>
        )}
      </div>
    </div>
  );
};