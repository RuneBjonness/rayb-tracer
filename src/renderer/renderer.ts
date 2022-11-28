import { Canvas } from '../lib/canvas';
import { RenderConfiguration } from '../renderer/configuration';
import { ScenePreset } from '../scenes/scene';
import RenderWorker from './renderer-worker?worker';

const render = (ctx: CanvasRenderingContext2D, scenePreset: ScenePreset | null, cfg: RenderConfiguration, onProgress: (pixels: number) => void) => {
  if (scenePreset == null) {
    ctx!.clearRect(0, 0, cfg.width, cfg.height);
    return;
  }

  const startTime = performance.now();
  console.log(`renderScene(${cfg.width}X${cfg.height}) started..`);

  type CanvasPart = {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  const canvasParts: CanvasPart[] = [];
  for (let i = 0; i < cfg.height; i++) {
    canvasParts.push({
      x: 0,
      y: i,
      w: cfg.width,
      h: 1,
    });
  }

  for (let i = canvasParts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [canvasParts[i], canvasParts[j]] = [canvasParts[j], canvasParts[i]];
  }

  for (let i = 0; i < cfg.numberOfWorkers; i++) {
    const worker = new RenderWorker();
    worker.postMessage([
      'init', scenePreset, cfg
    ]);

    worker.onmessage = function (e) {
      const next = canvasParts.pop();
      if (next) {
        worker.postMessage(['render', next]);
      } else {
        worker.terminate();
        console.log(
          `   --Worker #${i} terminated after ${(
            (performance.now() - startTime) /
            1000
          ).toFixed(2)} s`
        );
      }

      const cp: CanvasPart = e.data[0];
      const c = new Canvas(cp.w, cp.h);
      c.pixels = (e.data[1] as Canvas).pixels;
      ctx!.putImageData(c.getImageData(), cp.x, cp.y);
      onProgress(cp.w);
    };

    const cp = canvasParts.pop();
    if (cp) {
      worker.postMessage(['render', cp]);
    }
  }
};

export default render;
