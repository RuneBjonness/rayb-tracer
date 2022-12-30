import { Camera } from '../lib/camera';
import { CameraConfiguration } from './configuration';
import { RenderConfiguration } from '../renderer/configuration';
import { World } from '../lib/world';
import { CsgRb } from './csg-rb';
import { Dodecahedron } from './dodecahedron';
import { ImageMapping } from './image-mapping';
import { Marbles } from './marbles';
import { Patterns } from './patterns';
import { Skybox } from './skybox';
import { TeaPot } from './teapot';
import { TextureMapping } from './texture-mapping';
import { MarbleMadness } from './marble-madness';
import { MarbleMadness2 } from './marble-madness-2';
import {
  CornellBoxMatteDiffuse,
  CornellBoxTransparency,
} from './cornell-box-scenes';

export interface Scene {
  configureWorld(renderCfg: RenderConfiguration): World;
  cameraCfg: CameraConfiguration;
}

export enum ScenePreset {
  marbles = 'Marbles',
  teapot = 'Teapot [high-res]',
  teapotLow = 'Teapot [low-res]',
  textureMapping = 'Texture mapping',
  skybox = 'Skybox',
  csgRayBTracer = 'Constructive Solid Geometry',
  dodecahedron = 'Dodecahedron',
  imageMapping = 'Image mapping',
  patterns = '3D Patterns',
  marbleMadness = 'Marble madness',
  marbleMadness2 = 'Marble madness 2',
  cornellBoxTransparency = 'Cornell Box: Transparency',
  cornellBoxMatteDiffuse = 'Cornell Box: Matte Diffuse',
}

export function loadScene(preset: ScenePreset): Scene {
  switch (preset) {
    case ScenePreset.csgRayBTracer:
      return new CsgRb();

    case ScenePreset.dodecahedron:
      return new Dodecahedron();

    case ScenePreset.imageMapping:
      return new ImageMapping();

    case ScenePreset.marbles:
      return new Marbles();

    case ScenePreset.patterns:
      return new Patterns();

    case ScenePreset.skybox:
      return new Skybox();

    case ScenePreset.teapot:
      return new TeaPot(true);

    case ScenePreset.teapotLow:
      return new TeaPot(false);

    case ScenePreset.textureMapping:
      return new TextureMapping();

    case ScenePreset.marbleMadness:
      return new MarbleMadness();

    case ScenePreset.marbleMadness2:
      return new MarbleMadness2();

    case ScenePreset.cornellBoxTransparency:
      return new CornellBoxTransparency();

    case ScenePreset.cornellBoxMatteDiffuse:
      return new CornellBoxMatteDiffuse();

    default:
      return new CsgRb();
  }
}

export function createCamera(
  cameraCfg: CameraConfiguration,
  renderCfg: RenderConfiguration
): Camera {
  const camera = new Camera(
    renderCfg.width,
    renderCfg.height,
    cameraCfg.fieldOfView
  );
  camera.aperture = renderCfg.forceZeroAperture ? 0 : cameraCfg.aperture;
  camera.focalLength = cameraCfg.focalLength;
  camera.maxFocalSamples = renderCfg.maxFocalSamples;
  camera.adaptiveSamplingColorSensitivity =
    renderCfg.adaptiveFocalSamplingSensitivity;
  camera.transform = cameraCfg.viewTransform;
  camera.raysMaxRecursiveDepth = renderCfg.raysMaxRecursiveDepth;
  camera.maxIndirectLightSamples = renderCfg.maxIndirectLightSamples;
  return camera;
}
