import React, { useRef, useEffect } from 'react';
import './Canvas.css'
import { Camera } from './lib/camera';
import { Canvas } from './lib/canvas';
import { viewTransform } from './lib/transformations';
import { point, vector } from './lib/tuples';
import { configureWorld, renderScene } from './playground';
import RenderWorker from './render-worker?worker'


const RtCanvas: React.FC<{}> = () => {
    let width = 1024;
    let height = 768;
    //let width = 1024 / 4;
    //let height = 768 / 3;

    let canvasRef = useRef<HTMLCanvasElement | null>(null);
    let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            canvasCtxRef.current = canvasRef.current.getContext('2d');
            let ctx = canvasCtxRef.current;
            // const world = configureWorld();
            // const imageData = renderScene(world, width, height);
            // ctx!.putImageData(imageData, 0, 0);

            // const camera = new Camera(width, height, Math.PI / 3);
            // camera.transform = viewTransform(point(0, 1.5, -5), point(0, 1, 0), vector(0, 1, 0));
        
            const startTime = Date.now();
            console.log(`renderScene(${ width }X${ height }) started..`);

            type CanvasPart = { fullWidth: number, fullHeight: number, x: number, y: number, w: number, h: number }; 
            const canvasParts: CanvasPart[]= [];
            const chunkWidth = width / 8;
            const chunkHeight = height / 16;
            for(let x=0; x < 8; x++) {
                for(let y=0; y < 16; y++) {
                    canvasParts.push({ fullWidth: width, fullHeight: height, x: x * chunkWidth, y: y * chunkHeight, w: chunkWidth, h: chunkHeight });
                }
            } 

            for(let i=0; i < 8; i++) {
                const worker = new RenderWorker();
                worker.onmessage = function(e) {
                    const cfg: CanvasPart = e.data[0];
                    const c = new Canvas(chunkWidth, chunkHeight);
                    c.pixels = (e.data[1] as Canvas).pixels;
                    ctx!.putImageData(c.getImageData(), cfg.x, cfg.y);
                    console.log(`   --Worker #${i} done rendering Part[${cfg.x}, ${cfg.y}] at ${ (Date.now() - startTime) / 1000 } s`);

                    const cp = canvasParts.pop();
                    if(cp) {
                        worker.postMessage([cp]);
                    } else {
                        worker.terminate();
                    }
                }

                const cp = canvasParts.pop();
                if(cp) {
                    worker.postMessage([cp]);
                }

            } 
        }
    }, []);

    return <canvas ref={canvasRef} width={width} height={height}></canvas>;
};

export default RtCanvas;
