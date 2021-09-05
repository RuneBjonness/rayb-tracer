import React, { useRef, useEffect } from 'react';
import './Canvas.css'
import { renderScene } from './lib/playground';

const RtCanvas: React.FC<{}> = () => {
    let width = 400;
    let height = 300;

    let canvasRef = useRef<HTMLCanvasElement | null>(null);
    let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            canvasCtxRef.current = canvasRef.current.getContext('2d');
            let ctx = canvasCtxRef.current;
            const imageData = renderScene(width, height);
            
            ctx!.putImageData(imageData, 0, 0);
        }
    }, []);

    return <canvas ref={canvasRef} width={width} height={height}></canvas>;
};

export default RtCanvas;
