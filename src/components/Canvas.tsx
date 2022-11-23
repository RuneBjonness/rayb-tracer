import React, { useRef, useEffect } from 'react';
import { RenderConfiguration } from '../renderer/configuration';
import render from '../renderer/renderer';
import useRayTracerStore from '../store';

type RtCanvasProps = {
  cfg: RenderConfiguration;
};

const RtCanvas = ({ cfg }: RtCanvasProps) => {
  let canvasRef = useRef<HTMLCanvasElement | null>(null);
  let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const resetRenderProgress = useRayTracerStore(
    (state) => state.resetRenderProgress
  );
  const incrementRenderProgress = useRayTracerStore(
    (state) => state.incrementRenderProgress
  );

  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d');
      resetRenderProgress();
      render(canvasCtxRef.current!, cfg, incrementRenderProgress);
    }
  }, [cfg]);

  return (
    <canvas ref={canvasRef} width={cfg.width} height={cfg.height}></canvas>
  );
};

export default RtCanvas;
