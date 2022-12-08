export type RenderConfiguration = {
  width: number;
  height: number;

  numberOfWorkers: number;

  raysMaxRecursiveDepth: number;

  enableAreaLights: boolean;
  maxAreaLightUvSteps: number;

  forceZeroAperture: boolean;
  maxFocalSamples: number;
  adaptiveFocalSamplingSensitivity: number;
};

export enum RenderQuality {
  preview = 'preview',
  low = 'low',
  standard = 'standard',
  high = 'high',
  ultra = 'ultra',
}

export function getRenderConfiguration(
  width: number,
  height: number,
  numberOfWorkers: number,
  quality: RenderQuality
): RenderConfiguration {
  if (quality === RenderQuality.preview) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      raysMaxRecursiveDepth: 2,
      enableAreaLights: false,
      maxAreaLightUvSteps: 0,
      forceZeroAperture: true,
      maxFocalSamples: 1,
      adaptiveFocalSamplingSensitivity: 1,
    };
  } else if (quality === RenderQuality.low) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      raysMaxRecursiveDepth: 3,
      enableAreaLights: true,
      maxAreaLightUvSteps: 2,
      forceZeroAperture: false,
      maxFocalSamples: 4,
      adaptiveFocalSamplingSensitivity: 1,
    };
  } else if (quality === RenderQuality.standard) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      raysMaxRecursiveDepth: 4,
      enableAreaLights: true,
      maxAreaLightUvSteps: 2,
      forceZeroAperture: false,
      maxFocalSamples: 21,
      adaptiveFocalSamplingSensitivity: 0.01,
    };
  } else if (quality === RenderQuality.high) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      raysMaxRecursiveDepth: 4,
      enableAreaLights: true,
      maxAreaLightUvSteps: 3,
      forceZeroAperture: false,
      maxFocalSamples: 41,
      adaptiveFocalSamplingSensitivity: 0.01,
    };
  } else {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      raysMaxRecursiveDepth: 6,
      enableAreaLights: true,
      maxAreaLightUvSteps: 4,
      forceZeroAperture: false,
      maxFocalSamples: 64,
      adaptiveFocalSamplingSensitivity: 0.001,
    };
  }
}
