import { World } from '../lib/world';

export interface Scene {
    configureWorld(): World;
    cameraCfg: CamerConfiguration;
}

export type CamerConfiguration = {
    fieldOfView: number;
    viewTransform: number[][];
    aperture: number;
    focalLength: number;
    focalSamplingRate: number;
};
