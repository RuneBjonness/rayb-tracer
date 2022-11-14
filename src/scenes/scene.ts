import { Camera } from '../lib/camera';
import { CameraConfiguration, RenderConfiguration } from '../lib/configuration';
import { World } from '../lib/world';

export interface Scene {
    configureWorld(renderCfg: RenderConfiguration): World;
    cameraCfg: CameraConfiguration;
}

export function createCamera(cameraCfg: CameraConfiguration, renderCfg: RenderConfiguration): Camera {
    const camera = new Camera(renderCfg.width, renderCfg.height, Math.PI / 3);
    camera.aperture = renderCfg.forceZeroAperture ? 0 : cameraCfg.aperture;
    camera.focalLength = cameraCfg.focalLength;
    camera.focalSamplingRate = renderCfg.focalSamplingRate;
    camera.transform = cameraCfg.viewTransform;
    camera.raysMaxRecursiveDepth = renderCfg.raysMaxRecursiveDepth;
    return camera;
}