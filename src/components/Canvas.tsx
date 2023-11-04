import React, { useRef, useEffect } from 'react';
import { RenderConfiguration } from '../renderer/configuration';
import render from '../renderer/renderer';
import { ScenePreset } from '../scenes/scene-preset';
import useRayTracerStore from '../store';

type RtCanvasProps = {
  scene: ScenePreset | null;
  cfg: RenderConfiguration;
};

const RtCanvas = ({ scene, cfg }: RtCanvasProps) => {
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
      render(canvasCtxRef.current!, scene, cfg, incrementRenderProgress);
    }
  }, [scene, cfg]);

  return (
    <canvas ref={canvasRef} width={cfg.width} height={cfg.height}></canvas>
  );
};

export default RtCanvas;
