import { RenderConfiguration } from '../renderer/configuration';
import { ScenePreset } from '../scenes/scene';
import RenderWorker from './renderer-worker?worker';

const render = (
  ctx: CanvasRenderingContext2D,
  scenePreset: ScenePreset | null,
  cfg: RenderConfiguration,
  onProgress: (pixels: number) => void
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

  type CanvasPart = {
    x: number;
    y: number;
    w: number;
    h: number;
  };
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

  for (let i = canvasParts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [canvasParts[i], canvasParts[j]] = [canvasParts[j], canvasParts[i]];
  }

  for (let i = 0; i < cfg.numberOfWorkers; i++) {
    const worker = new RenderWorker();
    worker.postMessage({ command: 'init', scenePreset, renderCfg: cfg });

    worker.onmessage = function (e) {
      const next = canvasParts.pop();
      if (next) {
        worker.postMessage({ command: 'render', cp: next });
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
    };

    const cp = canvasParts.pop();
    if (cp) {
      worker.postMessage({ command: 'render', cp });
    }
  }
};

export default render;
