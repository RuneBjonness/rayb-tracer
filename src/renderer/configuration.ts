export type RenderConfiguration = {
  width: number;
  height: number;

  raysMaxRecursiveDepth: number;

  enableAreaLights: boolean;
  maxAreaLightUvSteps: number;

  forceZeroAperture: boolean;
  focalSamplingRate: number;
};

export enum RenderQuality {
  preview = 'preview',
  low = 'low',
  standard = 'standard',
  high = 'high',
  ultra = 'ultra'
};

export function getRenderConfiguration(
  width: number,
  height: number,
  quality: RenderQuality
): RenderConfiguration {
  if (quality === RenderQuality.preview) {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 2,
      enableAreaLights: false,
      maxAreaLightUvSteps: 0,
      forceZeroAperture: true,
      focalSamplingRate: 0,
    };
  } else if (quality === RenderQuality.low) {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 3,
      enableAreaLights: true,
      maxAreaLightUvSteps: 2,
      forceZeroAperture: true,
      focalSamplingRate: 0,
    };
  } else if (quality === RenderQuality.standard) {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 4,
      enableAreaLights: true,
      maxAreaLightUvSteps: 2,
      forceZeroAperture: false,
      focalSamplingRate: 2,
    };
  } else if (quality === RenderQuality.high) {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 4,
      enableAreaLights: true,
      maxAreaLightUvSteps: 3,
      forceZeroAperture: false,
      focalSamplingRate: 4,
    };
  } else {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 6,
      enableAreaLights: true,
      maxAreaLightUvSteps: 4,
      forceZeroAperture: false,
      focalSamplingRate: 8,
    };
  }
}
