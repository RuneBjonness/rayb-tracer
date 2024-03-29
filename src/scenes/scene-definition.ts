export type SceneDefinition = {
  name: string;
  camera: CameraConfiguration;
  world: WorldDefinition;
  colors?: Record<string, ColorDefinition>;
  patterns?: Record<string, PatternDefinition>;
  materials?: Record<string, MaterialDefinition>;
  shapes?: Record<string, ShapeTypeDefinition>;
};

export type WorldDefinition = {
  ambientLight?: number;
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

export type TransformableShapePrimitiveDefinition =
  | { type: 'sphere' | 'plane' | 'cube' }
  | {
      type: 'cylinder' | 'cone';
      minimum?: number;
      maximum?: number;
      closed?: boolean;
    }
  | {
      type: 'group';
      shapes: ShapeDefinition[];
    }
  | {
      type: 'csg';
      operation: 'union' | 'intersection' | 'difference';
      left: ShapeDefinition;
      right: ShapeDefinition;
    };

export type ShapePrimitiveDefinition =
  | {
      type: 'primitive-sphere';
      center: Vec3;
      radius: number;
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
    };

export type ShapeTypeDefinition =
  | TransformableShapePrimitiveDefinition
  | ShapePrimitiveDefinition
  | string;

export type BasicShapeDefinition = {
  type: ShapePrimitiveDefinition | string;
  material?: MaterialDefinition | string | [string, ColorDefinition | string];
};
export type TransformableShapeDefinition = {
  type: TransformableShapePrimitiveDefinition | string;
  transform?: Transform[];
  material?: MaterialDefinition | string | [string, ColorDefinition | string];
};

export type ShapeDefinition =
  | BasicShapeDefinition
  | TransformableShapeDefinition;

export const isTransformableShapeDefinition = (
  def: ShapeDefinition
): def is TransformableShapeDefinition => {
  return (def as TransformableShapeDefinition).transform !== undefined;
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

export type UvPatternDefinition = {
  type: 'uv-checkers';
  width: number;
  height: number;
  color1: ColorDefinition | string;
  color2: ColorDefinition | string;
};

export type UvMapperDefinition =
  | 'planar'
  | 'cylindrical'
  | 'spherical'
  | 'cube-front'
  | 'cube-back'
  | 'cube-left'
  | 'cube-right'
  | 'cube-top'
  | 'cube-bottom';

export type CubeFacePatterns = {
  left: UvPatternDefinition;
  front: UvPatternDefinition;
  right: UvPatternDefinition;
  back: UvPatternDefinition;
  top: UvPatternDefinition;
  bottom: UvPatternDefinition;
};

export type PatternDefinition = (
  | {
      type: 'solid';
      color1?: ColorDefinition | string;
    }
  | {
      type: 'stripe' | 'gradient' | 'ring' | 'radial-gradient' | 'checkers';
      color1?: ColorDefinition | string;
      color2?: ColorDefinition | string;
    }
  | {
      type: 'blended';
      pattern1?: PatternDefinition | string;
      pattern2?: PatternDefinition | string;
    }
  | {
      type: 'texture-map';
      uvPattern: UvPatternDefinition;
      mapper: UvMapperDefinition;
    }
  | {
      type: 'cube-map';
      uvPattern: UvPatternDefinition | CubeFacePatterns;
    }
) & {
  transform?: Transform[];
};
