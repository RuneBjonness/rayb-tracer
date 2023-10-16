import { Matrix4 } from '../lib/math/matrices';

export type CameraConfiguration = {
  fieldOfView: number;
  viewTransform: Matrix4;
  aperture: number;
  focalLength: number;
};
