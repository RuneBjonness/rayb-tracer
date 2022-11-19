import React, { useRef, useEffect } from 'react';
import { Canvas } from '../lib/canvas';
import { getRenderConfiguration } from '../lib/configuration';
import RenderWorker from '../render-worker?worker';

type RtCanvasProps = {
  width: number;
  height: number;
};

const RtCanvas = ({ width, height }: RtCanvasProps) => {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
      let ctx = canvasCtxRef.current;

      const startTime = performance.now();
      console.log(`renderScene(${width}X${height}) started..`);

      type CanvasPart = {
        x: number;
        y: number;
        w: number;
        h: number;
      };
      const canvasParts: CanvasPart[] = [];
      for (let i = 0; i < height; i++) {
        canvasParts.push({
          x: 0,
          y: i,
          w: width,
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
          'init',
          getRenderConfiguration(width, height, 'preview'),
        ]);

        worker.onmessage = function (e) {
          const cfg: CanvasPart = e.data[0];
          const c = new Canvas(width, 1);
          c.pixels = (e.data[1] as Canvas).pixels;
          ctx!.putImageData(c.getImageData(), cfg.x, cfg.y);

          const cp = canvasParts.pop();
          if (cp) {
            worker.postMessage(['render', cp]);
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
    }
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height}></canvas>;
};

export default RtCanvas;
