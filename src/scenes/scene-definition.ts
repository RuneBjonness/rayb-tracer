export type SceneDefinition = {
  name: string;
  camera: CameraConfiguration;
  lights?: LightConfiguration[];
  objects?: ShapeDefinition[];
  colors?: Record<string, ColorDefinition>;
  patterns?: Record<string, PatternDefinition>;
  materials?: Record<string, MaterialDefinition>;
  shapes?: Record<string, ShapeDefinition>;
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

export type ColorHexDefinition = `#${string}`;
export type ColorDefinition = Vec3 | ColorHexDefinition;

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
      intensity: ColorDefinition | string;
      position: Vec3;
    }
  | {
      type: 'area';
      intensity: ColorDefinition | string;
      transform: Transform[];
      includeGeometry?: boolean;
    };

export type ShapeDefinition = (
  | { type: 'sphere' | 'plane' | 'cube' | 'csg' }
  | {
      type: 'cylinder' | 'cone';
      minimum?: number;
      maximum?: number;
      closed?: boolean;
    }
  | {
      type: 'triangle';
      p1: Vec3;
      p2: Vec3;
      p3: Vec3;
    }
  | {
      type: 'smooth-triangle';
      p1: Vec3;
      p2: Vec3;
      p3: Vec3;
      n1: Vec3[];
      n2: Vec3[];
      n3: Vec3[];
    }
  | {
      type: 'group';
      shapes: ShapeDefinition[];
    }
) & {
  transform?: Transform[];
  material?: MaterialDefinition | string;
};

export type MaterialDefinition = {
  color?: ColorDefinition | string;
  ambient?: number;
  diffuse?: number;
  specular?: number;
  shininess?: number;
  reflective?: number;
  transparency?: number;
  refractiveIndex?: number;
  pattern?: PatternDefinition | string;
};

export type PatternDefinition =
  | {
      type: 'solid';
      color1?: ColorDefinition | string;
      transform?: Transform[];
    }
  | {
      type: 'stripe' | 'gradient' | 'ring' | 'radial-gradient' | 'checkers';
      color1?: ColorDefinition | string;
      color2?: ColorDefinition | string;
      transform?: Transform[];
    }
  | {
      type: 'blended';
      pattern1?: PatternDefinition | string;
      pattern2?: PatternDefinition | string;
      transform?: Transform[];
    };
