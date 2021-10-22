import React, { useRef, useEffect } from 'react';
import './Canvas.css'
import { Canvas } from './lib/canvas';
import RenderWorker from './render-worker?worker'

const RtCanvas: React.FC<{}> = () => {
    let width = 1024;
    let height = 768;

    // let width = 800;
    // let height = 600;

    // let width = 640;
    // let height = 480;

    // let width = 320;
    // let height = 240;

    // let width = 32;
    // let height = 24;

    let canvasRef = useRef<HTMLCanvasElement | null>(null);
    let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            canvasCtxRef.current = canvasRef.current.getContext('2d');
            let ctx = canvasCtxRef.current;
        
            const startTime = Date.now();
            console.log(`renderScene(${ width }X${ height }) started..`);

            type CanvasPart = { fullWidth: number, fullHeight: number, x: number, y: number, w: number, h: number }; 
            const canvasParts: CanvasPart[]= [];
            const chunkWidth = width / 8;
            const chunkHeight = height / 8;
            for(let x=0; x < 8; x++) {
                for(let y=0; y < 8; y++) {
                    canvasParts.push({ fullWidth: width, fullHeight: height, x: x * chunkWidth, y: y * chunkHeight, w: chunkWidth, h: chunkHeight });
                }
            } 

            for(let i=0; i < 12; i++) {
                const worker = new RenderWorker();
                worker.onmessage = function(e) {
                    const cfg: CanvasPart = e.data[0];
                    const c = new Canvas(chunkWidth, chunkHeight);
                    c.pixels = (e.data[1] as Canvas).pixels;
                    ctx!.putImageData(c.getImageData(), cfg.x, cfg.y);

                    const cp = canvasParts.pop();
                    if(cp) {
                        worker.postMessage([cp]);
                    } else {
                        worker.terminate();
                        console.log(`   --Worker #${i} terminated after ${ (Date.now() - startTime) / 1000 } s`);
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
