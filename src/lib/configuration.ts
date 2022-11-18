export type CameraConfiguration = {
  fieldOfView: number;
  viewTransform: number[][];
  aperture: number;
  focalLength: number;
};

export type RenderConfiguration = {
  width: number;
  height: number;

  raysMaxRecursiveDepth: number;

  enableAreaLights: boolean;
  maxAreaLightUvSteps: number;

  forceZeroAperture: boolean;
  focalSamplingRate: number;
};

export function getRenderConfiguration(
  width: number,
  height: number,
  quality: 'preview' | 'low' | 'standard' | 'high' | 'ultra'
): RenderConfiguration {
  if (quality === 'preview') {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 2,
      enableAreaLights: false,
      maxAreaLightUvSteps: 0,
      forceZeroAperture: true,
      focalSamplingRate: 0,
    };
  } else if (quality === 'low') {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 3,
      enableAreaLights: true,
      maxAreaLightUvSteps: 2,
      forceZeroAperture: true,
      focalSamplingRate: 0,
    };
  } else if (quality === 'standard') {
    return {
      width: width,
      height: height,
      raysMaxRecursiveDepth: 4,
      enableAreaLights: true,
      maxAreaLightUvSteps: 2,
      forceZeroAperture: false,
      focalSamplingRate: 2,
    };
  } else if (quality === 'high') {
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
