const sceneDefinition: SceneDefinition = {
  name: 'Default Scene',
  camera: {
    fieldOfView: 60,
    viewTransform: {
      from: [0, 2, -5],
      to: [0, 0, 0],
      up: [0, 1, 0],
    },
    aperture: 0.01,
    focalDistance: 5,
  },
};

export type SceneDefinition = {
  name: string;
  camera: CameraConfiguration;
};

export type CameraConfiguration = {
  fieldOfView: number;
  viewTransform: ViewTransform;
  aperture: number;
  focalDistance: number;
};

export type ViewTransform = {
  from: Vec3;
  to: Vec3;
  up: Vec3;
};

export type Vec3 = [number, number, number];
