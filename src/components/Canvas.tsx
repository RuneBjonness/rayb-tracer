import React, { useRef, useEffect } from 'react';
import { RenderConfiguration } from '../renderer/configuration';
import render from '../renderer/renderer';

type RtCanvasProps = {
  cfg: RenderConfiguration;
};

const RtCanvas = ({ cfg }: RtCanvasProps) => {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
      render(canvasCtxRef.current!, cfg);
    }
  }, [cfg]);

  return (
    <canvas ref={canvasRef} width={cfg.width} height={cfg.height}></canvas>
  );
};

export default RtCanvas;
