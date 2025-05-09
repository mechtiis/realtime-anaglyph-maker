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
  startUserMedia: () => Promise<void>;
  stopUserMedia: () => void;
  streamsStarted: boolean;
  error: string | null;
  getVideoDevices: () => Promise<void>;
  isLoadingDevices: boolean;
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

  const getVideoDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    setError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      setError('Media devices API not supported on this browser.');
      setIsLoadingDevices(false);
      return;
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices: WebcamDevice[] = devices
        .filter(device => device.kind === 'videoinput')
        .map((device, index) => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${index + 1}`,
          kind: device.kind,
        }));

      setWebcams(videoDevices);
      if (videoDevices.length > 0) {
        // Preserve selection if possible, otherwise default
        if (!videoDevices.find(d => d.deviceId === selectedLeftCam)) {
            setSelectedLeftCam(videoDevices[0].deviceId);
        }
        if (!videoDevices.find(d => d.deviceId === selectedRightCam)) {
            setSelectedRightCam(videoDevices.length > 1 ? videoDevices[1].deviceId : videoDevices[0].deviceId);
        }
      } else {
        setError('No webcams found. Please connect a webcam.');
      }
    } catch (err: any) {
      console.error("Error enumerating devices:", err);
      setError(`Could not access media devices: ${err.message}. Please check permissions.`);
    } finally {
      setIsLoadingDevices(false);
    }
  }, [selectedLeftCam, selectedRightCam]); // Add dependencies if we want to re-evaluate defaults based on them

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
    stopUserMedia(); // Stop any existing streams first

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
    } catch (err: any) {
      console.error("Error starting webcams:", err);
      setError(`Error starting webcams: ${err.message}. Ensure permissions are granted and devices are not in use.`);
      stopUserMedia(); // Ensure streams are stopped on error
    }
  };
  
  // Initial device scan
  useEffect(() => {
    getVideoDevices();
  }, [getVideoDevices]); // getVideoDevices is memoized, so this runs once on mount

  // Cleanup streams on hook unmount (though parent component might also call stopUserMedia)
  useEffect(() => {
    return () => {
      stopUserMedia();
    };
  }, [stopUserMedia]);

  return {
    videoLRef, videoRRef, webcams, selectedLeftCam, setSelectedLeftCam,
    selectedRightCam, setSelectedRightCam, startUserMedia, stopUserMedia,
    streamsStarted, error, getVideoDevices, isLoadingDevices,
  };
};
