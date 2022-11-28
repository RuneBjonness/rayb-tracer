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
  dodecahedron = "Dodecahedron",
  imageMapping = "Image mapping",
  patterns = "3D Patterns"
};


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

    default:
      return new CsgRb();
  }

}

export function createCamera(
  cameraCfg: CameraConfiguration,
  renderCfg: RenderConfiguration
): Camera {
  const camera = new Camera(renderCfg.width, renderCfg.height, cameraCfg.fieldOfView);
  camera.aperture = renderCfg.forceZeroAperture ? 0 : cameraCfg.aperture;
  camera.focalLength = cameraCfg.focalLength;
  camera.focalSamplingRate = renderCfg.focalSamplingRate;
  camera.transform = cameraCfg.viewTransform;
  camera.raysMaxRecursiveDepth = renderCfg.raysMaxRecursiveDepth;
  return camera;
}
