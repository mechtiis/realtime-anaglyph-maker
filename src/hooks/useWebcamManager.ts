import { useState, useEffect, RefObject, Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { WebcamDevice } from '../types'; // Adjust path as needed

export interface UseWebcamManagerOutput {
  videoLRef: RefObject<HTMLVideoElement>;
  videoRRef: RefObject<HTMLVideoElement>;
  webcams: WebcamDevice[];
  selectedLeftCam: string;
  setSelectedLeftCam: Dispatch<SetStateAction<string>>;
  selectedRightCam: string;
  setSelectedRightCam: Dispatch<SetStateAction<string>>;
  startUserMedia: () => Promise<void>;
  stopUserMedia: () => void;
  streamsStarted: boolean;
  error: string | null;
  getVideoDevices: (promptPermissions?: boolean) => Promise<void>; // Added optional param
  isLoadingDevices: boolean;
  permissionGranted: boolean; // New state to track if initial permission was granted
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
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  const fetchDeviceList = useCallback(async () => {
    // This function purely enumerates devices without prompting for permission.
    // It's called after we believe permissions might have been granted.
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        // This error should ideally be caught by getVideoDevices initial check
        console.error('Media devices API not supported on this browser.');
        return;
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices: WebcamDevice[] = devices
      .filter(device => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1} (Permission may be needed for full name)`,
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
  }, [selectedLeftCam, selectedRightCam]);


  const getVideoDevices = useCallback(async (promptPermissions: boolean = false) => {
    setIsLoadingDevices(true);
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setError('Media devices API not supported on this browser.');
      setIsLoadingDevices(false);
      return;
    }

    try {
      if (promptPermissions && !permissionGranted) {
        // Attempt to get a stream to trigger the permission prompt.
        // This helps populate device labels for the first enumerateDevices call.
        console.log("Attempting to prompt for camera permissions to get device labels...");
        try {
            const temporaryStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            temporaryStream.getTracks().forEach(track => track.stop()); // Stop the temporary stream immediately
            setPermissionGranted(true); // Mark that permission has been prompted / granted at a high level
            console.log("Initial permission prompt successful or already granted.");
        } catch (permError: any) {
            // This error means the user denied permission at the prompt.
            // Labels will likely be blank. startUserMedia will handle specific device access errors.
            console.warn("Initial permission prompt was denied or failed:", permError.name, permError.message);
            setError(`Camera permission denied. Please allow camera access in your browser settings. (${permError.name})`);
            // Do not proceed to fetch device list if initial permission is denied here,
            // as startUserMedia will fail anyway.
            setIsLoadingDevices(false);
            setWebcams([]); // Clear webcams if permission is denied
            return;
        }
      }
      // Always fetch/refresh the device list
      await fetchDeviceList();

    } catch (err: any) { // Catch errors from fetchDeviceList or other unexpected issues
      console.error("Error in getVideoDevices:", err);
      setError(`Could not access media devices: ${err.message}.`);
    } finally {
      setIsLoadingDevices(false);
    }
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
  }, []);

  const startUserMedia = async () => {
    if (!selectedLeftCam || !selectedRightCam) {
      setError('Please select webcams for both left and right channels.');
      return;
    }
    setError(null);
    setIsLoadingDevices(true); // Indicate loading while starting streams
    // Stop any existing streams first (already handled by stopUserMedia if called before)
    // but good to ensure state is clean if called directly.
    if(streamsStarted) stopUserMedia();


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

      setPermissionGranted(true); // Explicit permission for these devices was granted
      setStreamsStarted(true);
      // After successfully starting streams, re-fetch devices to ensure labels are accurate.
      await fetchDeviceList();

    } catch (err: any) {
      console.error("Error starting webcams:", err);
      setError(`Error starting webcams: ${err.message}. Ensure permissions are granted and devices are not in use. (${err.name})`);
      stopUserMedia(); // Ensure streams are stopped on error
    } finally {
        setIsLoadingDevices(false);
    }
  };

  // Initial device scan, try to prompt for permissions to get labels
  useEffect(() => {
    getVideoDevices(true); // Prompt for permissions on initial load
  }, [getVideoDevices]); // getVideoDevices is memoized

  // Cleanup streams on hook unmount
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
