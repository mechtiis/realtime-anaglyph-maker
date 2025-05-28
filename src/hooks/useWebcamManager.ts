import { useState, useEffect, RefObject, Dispatch, SetStateAction, useCallback, useRef } from 'react';
import { WebcamDevice } from '@/types';

export interface UseWebcamManagerOutput {
  videoLRef: RefObject<HTMLVideoElement | null>;
  videoRRef: RefObject<HTMLVideoElement | null>;
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
  streamL: MediaStream | null; 
  streamR: MediaStream | null; 
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
  const [streamL, setStreamL] = useState<MediaStream | null>(null); 
  const [streamR, setStreamR] = useState<MediaStream | null>(null); 


  const fetchDeviceList = useCallback(async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.error('Media devices API not supported on this browser.');
      setError('Media devices API not supported.');
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
    } catch (err) { 
        console.error("Error fetching device list:", err);
        if (err instanceof Error) {
             setError(`Error fetching device list: ${err.message}`);
        } else {
             setError("An unknown error occurred while fetching device list.");
        }
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
      } catch (permError) { 
        console.warn("Initial permission prompt was denied or failed:", permError);
        if (permError instanceof Error) {
            setError(`Camera permission denied. Please allow camera access. (${permError.name}: ${permError.message})`);
        } else {
            setError("Camera permission denied. Please allow camera access.");
        }
        setWebcams([]);
        setIsLoadingDevices(false);
        return;
      }
    }

    if(granted) {
        await fetchDeviceList();
    } else if (!promptPermissions) {
        await fetchDeviceList();
    }
    setIsLoadingDevices(false);
  }, [permissionGranted, fetchDeviceList]);

  const stopUserMedia = useCallback(() => {
    if (streamLRef.current) {
      streamLRef.current.getTracks().forEach(track => track.stop());
      streamLRef.current = null;
      setStreamL(null);
    }
    if (videoLRef.current) videoLRef.current.srcObject = null;

    if (streamRRef.current) {
      streamRRef.current.getTracks().forEach(track => track.stop());
      streamRRef.current = null;
      setStreamR(null);
    }
    if (videoRRef.current) videoRRef.current.srcObject = null;
    setStreamsStarted(false);
  }, []);

  const startUserMedia = async (): Promise<boolean> => {
    if (!selectedLeftCam || !selectedRightCam) {
      setError('Please select webcams for both left and right channels.');
      return false;
    }
    if (!permissionGranted) {
        setError('Camera permissions are required to start streams.');
        await getVideoDevices(true); 
        if(!permissionGranted) return false; 
    }

    setError(null);
    setIsLoadingDevices(true);
    if(streamsStarted) stopUserMedia();


    try {
      const newStreamL = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedLeftCam } },
      });
      if (videoLRef.current) {
        videoLRef.current.srcObject = newStreamL;
        videoLRef.current.play().catch(e => console.error("Hidden Left Video Play Error:", e)); 
      }
      streamLRef.current = newStreamL;
      setStreamL(newStreamL);

      const newStreamR = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedRightCam } },
      });
      if (videoRRef.current) {
        videoRRef.current.srcObject = newStreamR;
        videoRRef.current.play().catch(e => console.error("Hidden Right Video Play Error:", e)); 
      }
      streamRRef.current = newStreamR;
      setStreamR(newStreamR);

      setStreamsStarted(true);
      await fetchDeviceList(); 
      setIsLoadingDevices(false);
      return true;

    } catch (err) { 
      console.error("Error starting webcams:", err);
        if (err instanceof Error) {
            setError(`Error starting webcams: ${err.message}. (${err.name})`);
        } else {
            setError("An unknown error occurred while starting webcams.");
        }
      stopUserMedia();
      setIsLoadingDevices(false);
      return false;
    }
  };

  useEffect(() => {
    getVideoDevices(true);
  }, [getVideoDevices]);

  useEffect(() => {
    return () => {
      stopUserMedia();
    };
  }, [stopUserMedia]);

  return {
    videoLRef, videoRRef, webcams, selectedLeftCam, setSelectedLeftCam,
    selectedRightCam, setSelectedRightCam, startUserMedia, stopUserMedia,
    streamsStarted, error, getVideoDevices, isLoadingDevices, permissionGranted,
    streamL, streamR 
  };
};