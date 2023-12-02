import { RenderConfiguration, RenderMode } from '../renderer/configuration';
import { SceneMode } from '../scenes/scene';
import { ScenePreset } from '../scenes/scene-preset';
import RenderWorker from './renderer-worker?worker';

type CanvasPart = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const workerPool: Worker[] = [];

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
  cfg: RenderConfiguration,
  sceneMode: SceneMode,
  scene: ScenePreset | string | null,
  onProgress: (units: number) => void
) => {
  if (scene == null) {
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
    if (workerPool.length <= i) {
      workerPool.push(new RenderWorker());
    }
    const worker = workerPool[i];

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
        }

        onProgress(1);
      }
    };
    if (sceneMode === 'scenePreset') {
      worker.postMessage({
        command: 'initPreset',
        scenePreset: scene,
        renderCfg: cfg,
      });
    } else {
      worker.postMessage({
        command: 'init',
        definition: scene,
        renderCfg: cfg,
      });
    }

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
