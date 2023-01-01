export type RenderConfiguration = {
  width: number;
  height: number;

  renderMode: RenderMode;

  numberOfWorkers: number;
  maxDepth: number;

  maxIndirectLightSamples: number;

  maxLightSamples: number;
  adaptiveLightSamplingSensitivity: number;

  forceZeroAperture: boolean;
  maxFocalSamples: number;
  adaptiveFocalSamplingSensitivity: number;

  iterations: number;
  photonsPerIteration: number;
};

export enum RenderMode {
  preview = 'Scene preview',
  dynamicSamplingPreview = 'Dynamic Sampling (preview)',
  dynamicSampling = 'Dynamic Sampling',
  fixedSampling = 'Fixed sampling',
  progressivePhotonMapping = 'Progressive photon mapping',
}

function renderConfiguration(
  width: number,
  height: number,
  numberOfWorkers: number,
  mode: RenderMode
): RenderConfiguration {
  return {
    width: width,
    height: height,
    renderMode: mode,
    numberOfWorkers: numberOfWorkers,
    maxDepth: 3,
    maxIndirectLightSamples: 0,
    maxLightSamples: 49,
    adaptiveLightSamplingSensitivity: 1,
    forceZeroAperture: false,
    maxFocalSamples: 81,
    adaptiveFocalSamplingSensitivity: 1,
    iterations: 0,
    photonsPerIteration: 0,
  };
}

export function getRenderConfiguration(
  width: number,
  height: number,
  numberOfWorkers: number,
  mode: RenderMode
): RenderConfiguration {
  const cfg = renderConfiguration(width, height, numberOfWorkers, mode);
  if (mode === RenderMode.preview) {
    cfg.forceZeroAperture = true;
    cfg.maxLightSamples = 1;
    cfg.maxFocalSamples = 1;
  } else if (mode === RenderMode.dynamicSamplingPreview) {
    cfg.maxIndirectLightSamples = 1;
  } else if (mode === RenderMode.dynamicSampling) {
    cfg.maxDepth = 8;
    cfg.maxIndirectLightSamples = 10;
    cfg.adaptiveLightSamplingSensitivity = 0.001;
    cfg.adaptiveFocalSamplingSensitivity = 0.001;
  } else if (mode === RenderMode.fixedSampling) {
    cfg.maxDepth = 10;
    cfg.maxIndirectLightSamples = 16;
    cfg.adaptiveLightSamplingSensitivity = -1;
    cfg.adaptiveFocalSamplingSensitivity = -1;
  } else if (mode === RenderMode.progressivePhotonMapping) {
    cfg.iterations = numberOfWorkers * 8;
    cfg.photonsPerIteration = width * height;
  }
  return cfg;
}
