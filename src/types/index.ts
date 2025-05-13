export interface WebcamDevice {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export type RotationAngle = 0 | 90 | 180 | 270;