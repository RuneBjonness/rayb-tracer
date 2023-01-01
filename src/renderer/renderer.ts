import { RenderConfiguration, RenderMode } from '../renderer/configuration';
import { ScenePreset } from '../scenes/scene';
import RenderWorker from './renderer-worker?worker';

type CanvasPart = {
  x: number;
  y: number;
  w: number;
  h: number;
};

function createRenderPartList(
  cfg: RenderConfiguration,
  randomizeOrder: boolean
): CanvasPart[] {
  if (cfg.renderMode === RenderMode.progressivePhotonMapping) {
    return [];
  }

  const chunkHeight = Math.min(
    16,
    Math.floor(cfg.height / cfg.numberOfWorkers)
  );
  const canvasParts: CanvasPart[] = [];
  for (let i = 0; i < cfg.height / chunkHeight; i++) {
    canvasParts.push({
      x: 0,
      y: i * chunkHeight,
      w: cfg.width,
      h: chunkHeight,
    });
  }
  canvasParts[canvasParts.length - 1].h =
    cfg.height - canvasParts[canvasParts.length - 1].y;

  if (randomizeOrder) {
    for (let i = canvasParts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [canvasParts[i], canvasParts[j]] = [canvasParts[j], canvasParts[i]];
    }
  }
  return canvasParts;
}

const render = (
  ctx: CanvasRenderingContext2D,
  scenePreset: ScenePreset | null,
  cfg: RenderConfiguration,
  onProgress: (units: number) => void
) => {
  if (scenePreset == null) {
    ctx!.fillRect(0, 0, cfg.width, cfg.height);
    return;
  } else {
    ctx!.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx!.fillRect(0, 0, cfg.width, cfg.height);
    ctx!.fillStyle = 'black';
  }

  const startTime = performance.now();
  console.log(`renderScene(${cfg.width}X${cfg.height}) started..`);

  const canvasParts = createRenderPartList(cfg, true);
  let remainingPhotonMapperIterations = cfg.iterations;

  for (let i = 0; i < cfg.numberOfWorkers; i++) {
    const worker = new RenderWorker();

    worker.onmessage = function (e) {
      if (e.data.command === 'rtRenderTile') {
        const next = canvasParts.pop();
        if (next) {
          worker.postMessage({ command: 'rtRenderTile', cp: next });
        } else {
          console.log(
            `   --Worker #${i} terminated after ${(
              (performance.now() - startTime) /
              1000
            ).toFixed(3)} s`
          );
          worker.terminate();
        }

        const cp: CanvasPart = e.data.cp;
        ctx!.putImageData(e.data.imageData, cp.x, cp.y);
        onProgress(cp.w * cp.h);
      } else if (e.data.command === 'photonMapperIteration') {
        if (remainingPhotonMapperIterations > 0) {
          remainingPhotonMapperIterations--;
          worker.postMessage({
            command: 'photonMapperIteration',
            photons: cfg.photonsPerIteration,
          });
        } else {
          console.log(
            `   --Worker #${i} terminated after ${(
              (performance.now() - startTime) /
              1000
            ).toFixed(3)} s`
          );
          worker.terminate();
        }

        onProgress(1);
      }
    };

    worker.postMessage({ command: 'init', scenePreset, renderCfg: cfg });

    if (cfg.renderMode === RenderMode.progressivePhotonMapping) {
      if (remainingPhotonMapperIterations > 0) {
        remainingPhotonMapperIterations--;
        worker.postMessage({
          command: 'photonMapperIteration',
          photons: cfg.photonsPerIteration,
        });
      }
    } else {
      const cp = canvasParts.pop();
      if (cp) {
        worker.postMessage({ command: 'rtRenderTile', cp });
      }
    }
  }
};

export default render;
