export type RenderConfiguration = {
  width: number;
  height: number;

  numberOfWorkers: number;

  numberOfPhotons: number;

  raysMaxRecursiveDepth: number;

  maxIndirectLightSamples: number;

  maxLightSamples: number;
  adaptiveLightSamplingSensitivity: number;

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
  extreme = 'extreme',
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
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 2,
      maxIndirectLightSamples: 0,
      maxLightSamples: 1,
      adaptiveLightSamplingSensitivity: 1,
      forceZeroAperture: true,
      maxFocalSamples: 1,
      adaptiveFocalSamplingSensitivity: 1,
    };
  } else if (quality === RenderQuality.low) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 3,
      maxIndirectLightSamples: 2,
      maxLightSamples: 5,
      adaptiveLightSamplingSensitivity: 1,
      forceZeroAperture: false,
      maxFocalSamples: 5,
      adaptiveFocalSamplingSensitivity: 1,
    };
  } else if (quality === RenderQuality.standard) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 4,
      maxIndirectLightSamples: 4,
      maxLightSamples: 17,
      adaptiveLightSamplingSensitivity: 0.05,
      forceZeroAperture: false,
      maxFocalSamples: 21,
      adaptiveFocalSamplingSensitivity: 0.01,
    };
  } else if (quality === RenderQuality.high) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 6,
      maxIndirectLightSamples: 6,
      maxLightSamples: 29,
      adaptiveLightSamplingSensitivity: 0.02,
      forceZeroAperture: false,
      maxFocalSamples: 41,
      adaptiveFocalSamplingSensitivity: 0.01,
    };
  } else if (quality === RenderQuality.ultra) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 8,
      maxIndirectLightSamples: 10,
      maxLightSamples: 41,
      adaptiveLightSamplingSensitivity: 0.001,
      forceZeroAperture: false,
      maxFocalSamples: 73,
      adaptiveFocalSamplingSensitivity: 0.001,
    };
  } else {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 10,
      maxIndirectLightSamples: 16,
      maxLightSamples: 49,
      adaptiveLightSamplingSensitivity: -1,
      forceZeroAperture: false,
      maxFocalSamples: 81,
      adaptiveFocalSamplingSensitivity: -1,
    };
  }
}
