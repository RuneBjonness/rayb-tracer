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

export enum RenderMode {
  preview = 'Scene preview',
  dynamicSamplingPreview = 'Dynamic Sampling (preview)',
  dynamicSampling = 'Dynamic Sampling',
  fixedSampling = 'Fixed sampling',
}

export function getRenderConfiguration(
  width: number,
  height: number,
  numberOfWorkers: number,
  mode: RenderMode
): RenderConfiguration {
  if (mode === RenderMode.preview) {
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
  } else if (mode === RenderMode.dynamicSamplingPreview) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 3,
      maxIndirectLightSamples: 1,
      maxLightSamples: 49,
      adaptiveLightSamplingSensitivity: 1,
      forceZeroAperture: false,
      maxFocalSamples: 81,
      adaptiveFocalSamplingSensitivity: 1,
    };
  } else if (mode === RenderMode.dynamicSampling) {
    return {
      width: width,
      height: height,
      numberOfWorkers: numberOfWorkers,
      numberOfPhotons: 0,
      raysMaxRecursiveDepth: 8,
      maxIndirectLightSamples: 10,
      maxLightSamples: 49,
      adaptiveLightSamplingSensitivity: 0.001,
      forceZeroAperture: false,
      maxFocalSamples: 81,
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
