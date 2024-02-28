import {
  CameraConfiguration,
  LightConfiguration,
  ShapeDefinition,
  SceneDefinition,
  ColorDefinition,
  MaterialDefinition,
} from '../scene-definition';
import { MATERIAL_DIAMOND, MATERIAL_GLASS } from './helpers/materials';
import { primitiveSphere } from './helpers/shapes';

const cornellBoxCameraConfiguration: CameraConfiguration = {
  fieldOfView: 60,
  viewTransform: {
    from: [0, 2.56, -10],
    to: [0, 2.56, 0],
    up: [0, 1, 0],
  },
  aperture: 0.005,
  focalDistance: 2,
};

const cornellBoxLampLight: LightConfiguration = {
  type: 'area',
  intensity: 'white',
  transform: [['translate', 0, 5, 0]],
  includeGeometry: true,
};

const emptyCornellBox: ShapeDefinition[] = [
  {
    type: { type: 'plane' },
    material: ['matte', 'white'],
    transform: [['translate', 0, -0.001, 0]],
  },
  {
    type: { type: 'plane' },
    material: ['matte', 'white'],
    transform: [['translate', 0, 5, 0]],
  },
  {
    type: { type: 'plane' },
    material: ['matte', 'white'],
    transform: [
      ['rotateX', 90],
      ['translate', 0, 0, 5],
    ],
  },
  {
    type: { type: 'plane' },
    material: ['matte', 'red'],
    transform: [
      ['rotateX', 90],
      ['rotateY', 90],
      ['translate', -4.55, 0, 0],
    ],
  },
  {
    type: { type: 'plane' },
    material: ['matte', 'green'],
    transform: [
      ['rotateX', 90],
      ['rotateY', 90],
      ['translate', 4.55, 0, 0],
    ],
  },
];

const cornellBoxColorDefs: Record<string, ColorDefinition> = {
  white: [1, 1, 1],
  red: [1, 0, 0],
  green: [0, 1, 0],
};

const cornellBoxMaterialDefs: Record<string, MaterialDefinition> = {
  matte: {
    diffuse: 0.8,
    specular: 0.2,
    shininess: 1,
  },
};

export const cornellBoxTransparencyScene: SceneDefinition = {
  name: 'Cornell Box: Transparency',
  camera: cornellBoxCameraConfiguration,
  world: {
    ambientLight: 0.025,
    lights: [cornellBoxLampLight],
    objects: [
      ...emptyCornellBox,
      {
        type: { type: 'cube' },
        material: ['diamond', [0.1, 0, 0.2]],
        transform: [
          ['rotateY', 30],
          ['scale', 1, 1.8, 1],
          ['translate', -1.1, 1.8, 1.4],
        ],
      },
      primitiveSphere(1.4, 0, 1.1, ['glass', [0.1, 0, 0.2]]),
    ],
  },
  colors: cornellBoxColorDefs,
  materials: {
    ...cornellBoxMaterialDefs,
    glass: MATERIAL_GLASS,
    diamond: MATERIAL_DIAMOND,
  },
};

export const cornellBoxMatteDiffuseScene: SceneDefinition = {
  name: 'Cornell Box: Matte Diffuse',
  camera: cornellBoxCameraConfiguration,
  world: {
    ambientLight: 0.025,
    lights: [cornellBoxLampLight],
    objects: [
      ...emptyCornellBox,
      primitiveSphere(-2.5, 2.5, 1.1, ['matte', 'white']),
      primitiveSphere(0, 2.5, 1.1, ['matte', 'blue']),
      primitiveSphere(2.5, 2.5, 1.1, ['matte', 'white']),
    ],
  },
  colors: {
    ...cornellBoxColorDefs,
    blue: [0.2, 0.2, 1],
  },
  materials: cornellBoxMaterialDefs,
};
