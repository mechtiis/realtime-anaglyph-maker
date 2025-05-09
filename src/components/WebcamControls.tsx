import React from 'react';
import { WebcamDevice } from '../types'; // Adjust path as needed

interface WebcamControlsProps {
  webcams: WebcamDevice[];
  selectedLeftCam: string;
  onLeftCamChange: (deviceId: string) => void;
  selectedRightCam: string;
  onRightCamChange: (deviceId: string) => void;
  onStartClick: () => void;
  onStopClick: () => void;
  isStreaming: boolean;
  isLoadingDevices: boolean;
  startDisabled: boolean;
  onRefreshDevices: () => void;
  permissionGranted: boolean; // New prop
}

export const WebcamControls = ({
  webcams,
  selectedLeftCam,
  onLeftCamChange,
  selectedRightCam,
  onRightCamChange,
  onStartClick,
  onStopClick,
  isStreaming,
  isLoadingDevices,
  startDisabled,
  onRefreshDevices,
  permissionGranted
}: WebcamControlsProps) => {
  return (
    <div className="card bg-base-100 shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="card-title text-2xl">Setup Anaglyph Viewer</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onRefreshDevices()} // Removed promptPermissions argument, let hook decide
          disabled={isLoadingDevices || isStreaming}
        >
          {isLoadingDevices ? (
            <span className="loading loading-spinner loading-xs"></span>
          ) : (
            'Refresh Cams'
          )}
        </button>
      </div>
      {!permissionGranted && !isLoadingDevices && webcams.length === 0 && (
        <p className="mb-2 text-xs text-warning-content bg-warning/20 p-2 rounded-md">
          Camera labels might be generic. Grant camera access and refresh if names are unclear.
          If you've denied permissions, please enable them in your browser settings.
        </p>
      )}
      <p className="mb-4 text-sm text-base-content/80">
        Select webcams for left/right views. For best 3D, use two webcams positioned a few inches apart.
      </p>

      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text">Left Webcam</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={selectedLeftCam}
          onChange={(e) => onLeftCamChange(e.target.value)}
          disabled={isStreaming || isLoadingDevices || webcams.length === 0}
        >
          <option value="" disabled>
            {isLoadingDevices ? "Loading..." : (webcams.length === 0 ? "No cameras found" : "Select Left Webcam")}
          </option>
          {webcams.map(cam => (
            <option key={`left-${cam.deviceId}`} value={cam.deviceId}>
              {cam.label} {/* Now using the label which should be more accurate */}
            </option>
          ))}
        </select>
      </div>

      <div className="form-control w-full mb-6">
        <label className="label">
          <span className="label-text">Right Webcam</span>
        </label>
        <select
          className="select select-bordered w-full"
          value={selectedRightCam}
          onChange={(e) => onRightCamChange(e.target.value)}
          disabled={isStreaming || isLoadingDevices || webcams.length === 0}
        >
          <option value="" disabled>
            {isLoadingDevices ? "Loading..." : (webcams.length === 0 ? "No cameras found" : "Select Right Webcam")}
          </option>
          {webcams.map(cam => (
            <option key={`right-${cam.deviceId}`} value={cam.deviceId}>
              {cam.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card-actions justify-end">
        {isStreaming ? (
          <button className="btn btn-warning" onClick={onStopClick}>
            Stop & Change Settings
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onStartClick}
            disabled={startDisabled || isLoadingDevices || webcams.length === 0}
          >
            {isLoadingDevices ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Start Anaglyph'
            )}
          </button>
        )}
      </div>
    </div>
  );
};
