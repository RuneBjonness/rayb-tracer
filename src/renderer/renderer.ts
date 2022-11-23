import { Canvas } from '../lib/canvas';
import { RenderConfiguration } from '../renderer/configuration';
import RenderWorker from './renderer-worker?worker';

const render = (ctx: CanvasRenderingContext2D, cfg: RenderConfiguration, onProgress: (pixels: number) => void) => {
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

  for (let i = 0; i < 12; i++) {
    const worker = new RenderWorker();
    worker.postMessage([
      'init', cfg
    ]);

    worker.onmessage = function (e) {
      const cp: CanvasPart = e.data[0];
      const c = new Canvas(cp.w, 1);
      c.pixels = (e.data[1] as Canvas).pixels;
      ctx!.putImageData(c.getImageData(), cp.x, cp.y);
      onProgress(cp.w);

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
    };

    const cp = canvasParts.pop();
    if (cp) {
      worker.postMessage(['render', cp]);
    }
  }
};

export default render;
