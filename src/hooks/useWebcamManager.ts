'use client';
import { useState, useEffect, RefObject, Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { WebcamDevice } from '@/types';

export interface UseWebcamManagerOutput {
  videoLRef: RefObject<HTMLVideoElement>;
  videoRRef: RefObject<HTMLVideoElement>;
  webcams: WebcamDevice[];
  selectedLeftCam: string;
  setSelectedLeftCam: Dispatch<SetStateAction<string>>;
  selectedRightCam: string;
  setSelectedRightCam: Dispatch<SetStateAction<string>>;
  startUserMedia: () => Promise<boolean>;
  stopUserMedia: () => void;
  streamsStarted: boolean;
  error: string | null;
  getVideoDevices: (promptPermissions?: boolean) => Promise<void>;
  isLoadingDevices: boolean;
  permissionGranted: boolean;
}

export const useWebcamManager = (): UseWebcamManagerOutput => {
  const videoLRef = useRef<HTMLVideoElement>(null);
  const videoRRef = useRef<HTMLVideoElement>(null);
  const streamLRef = useRef<MediaStream | null>(null);
  const streamRRef = useRef<MediaStream | null>(null);

  const [webcams, setWebcams] = useState<WebcamDevice[]>([]);
  const [selectedLeftCam, setSelectedLeftCam] = useState<string>('');
  const [selectedRightCam, setSelectedRightCam] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [streamsStarted, setStreamsStarted] = useState<boolean>(false);
  const [isLoadingDevices, setIsLoadingDevices] = useState<boolean>(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false); // Tracks if we've successfully prompted

  const fetchDeviceList = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error('Media devices API not supported on this browser.');
      setError('Media devices API not supported.'); // Set error for UI
      return;
    }
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices: WebcamDevice[] = devices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${index + 1}`, // Provide a fallback label
            kind: device.kind,
        }));

        setWebcams(videoDevices);
        if (videoDevices.length > 0) {
            const currentLeftCamExists = videoDevices.some(d => d.deviceId === selectedLeftCam);
            const currentRightCamExists = videoDevices.some(d => d.deviceId === selectedRightCam);

            if (!currentLeftCamExists || selectedLeftCam === '') {
            setSelectedLeftCam(videoDevices[0].deviceId);
            }
            if (!currentRightCamExists || selectedRightCam === '') {
            setSelectedRightCam(videoDevices.length > 1 ? videoDevices[1].deviceId : videoDevices[0].deviceId);
            }
        } else {
            setError('No webcams found. Please connect a webcam.');
        }
    } catch (listErr: any) {
        console.error("Error fetching device list:", listErr);
        setError(`Error fetching device list: ${listErr.message}`);
    }
  }, [selectedLeftCam, selectedRightCam]);


  const getVideoDevices = useCallback(async (promptPermissions: boolean = false) => {
    setIsLoadingDevices(true);
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setError('Media devices API not supported on this browser.');
      setIsLoadingDevices(false);
      return;
    }

    let granted = permissionGranted;
    if (promptPermissions && !granted) {
      console.log("Attempting to prompt for camera permissions...");
      try {
        const temporaryStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        temporaryStream.getTracks().forEach(track => track.stop());
        setPermissionGranted(true);
        granted = true;
        console.log("Initial permission prompt successful or permission already granted.");
      } catch (permError: any) {
        console.warn("Initial permission prompt was denied or failed:", permError.name, permError.message);
        setError(`Camera permission denied. Please allow camera access. (${permError.name})`);
        setWebcams([]);
        setIsLoadingDevices(false);
        return; // Stop if initial permission is denied
      }
    }

    // If permission was granted (or already true), fetch the list.
    if(granted) {
        await fetchDeviceList();
    } else if (!promptPermissions) {
        // If not prompting and permission not yet granted, still try to fetch, labels might be generic
        await fetchDeviceList();
    }
    // If promptPermissions was true but failed, we already returned.

    setIsLoadingDevices(false);
  }, [permissionGranted, fetchDeviceList]);

  const stopUserMedia = useCallback(() => {
    if (streamLRef.current) {
      streamLRef.current.getTracks().forEach(track => track.stop());
      streamLRef.current = null;
    }
    if (videoLRef.current) videoLRef.current.srcObject = null;

    if (streamRRef.current) {
      streamRRef.current.getTracks().forEach(track => track.stop());
      streamRRef.current = null;
    }
    if (videoRRef.current) videoRRef.current.srcObject = null;
    setStreamsStarted(false);
    // Don't reset permissionGranted here, as it tracks the general browser permission
  }, []);

  const startUserMedia = async (): Promise<boolean> => {
    if (!selectedLeftCam || !selectedRightCam) {
      setError('Please select webcams for both left and right channels.');
      return false;
    }
    if (!permissionGranted) { // Double check, though UI should prevent this
        setError('Camera permissions are required to start streams.');
        await getVideoDevices(true); // Re-trigger permission prompt
        if(!permissionGranted) return false; // If still not granted after re-prompt
    }

    setError(null);
    setIsLoadingDevices(true);
    if(streamsStarted) stopUserMedia(); // Stop existing if any


    try {
      const streamL = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedLeftCam } },
      });
      if (videoLRef.current) videoLRef.current.srcObject = streamL;
      streamLRef.current = streamL;

      const streamR = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedRightCam } },
      });
      if (videoRRef.current) videoRRef.current.srcObject = streamR;
      streamRRef.current = streamR;

      setStreamsStarted(true);
      // Re-fetch device list to ensure labels are accurate after successful stream start
      // This is useful if labels were generic before explicit device selection.
      await fetchDeviceList();
      setIsLoadingDevices(false);
      return true;

    } catch (err: any) {
      console.error("Error starting webcams:", err);
      setError(`Error starting webcams: ${err.message}. (${err.name})`);
      stopUserMedia();
      setIsLoadingDevices(false);
      return false;
    }
  };

  useEffect(() => {
    getVideoDevices(true); // Prompt for permissions on initial load
  }, [getVideoDevices]);

  useEffect(() => {
    return () => {
      stopUserMedia();
    };
  }, [stopUserMedia]);

  return {
    videoLRef, videoRRef, webcams, selectedLeftCam, setSelectedLeftCam,
    selectedRightCam, setSelectedRightCam, startUserMedia, stopUserMedia,
    streamsStarted, error, getVideoDevices, isLoadingDevices, permissionGranted
  };
};