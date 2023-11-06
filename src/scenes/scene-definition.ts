export type SceneDefinition = {
  name: string;
  camera: CameraConfiguration;
  lights?: LightConfiguration[];
  objects?: ShapeDefinition[];
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

export type Transform =
  | ['translate', number, number, number]
  | ['scale', number, number, number]
  | ['rotateX', number]
  | ['rotateY', number]
  | ['rotateZ', number]
  | ['shear', number, number, number, number, number, number];

export type LightConfiguration =
  | {
      type: 'point';
      intensity: Vec3;
      position: Vec3;
    }
  | {
      type: 'area';
      intensity: Vec3;
      transform: Transform[];
      includeGeometry?: boolean;
    };

export type ShapeDefinition = {
  type:
    | 'sphere'
    | 'plane'
    | 'cube'
    | 'cylinder'
    | 'cone'
    | 'triangle'
    | 'smooth-triangle'
    | 'group'
    | 'csg';
  transform?: Transform[];
  material?: MaterialDefinition;
};

export type MaterialDefinition = {
  color?: Vec3;
  ambient?: number;
  diffuse?: number;
  specular?: number;
  shininess?: number;
  reflective?: number;
  transparency?: number;
  refractiveIndex?: number;
  pattern?: PatternDefinition;
};

export type PatternDefinition =
  | {
      type: 'solid';
      color1: Vec3;
      transform: Transform[];
    }
  | {
      type: 'stripe' | 'gradient' | 'ring' | 'radial-gradient' | 'checkers';
      color1: Vec3;
      color2: Vec3;
      transform: Transform[];
    }
  | {
      type: 'blended';
      pattern1: PatternDefinition;
      pattern2: PatternDefinition;
      transform: Transform[];
    };
