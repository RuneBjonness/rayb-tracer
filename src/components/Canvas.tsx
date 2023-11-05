import React, { useRef, useEffect } from 'react';
import { RenderConfiguration } from '../renderer/configuration';
import render from '../renderer/renderer';
import { ScenePreset } from '../scenes/scene-preset';
import useRayTracerStore from '../store';
import { SceneMode } from '../scenes/scene';

type RtCanvasProps = {
  cfg: RenderConfiguration;
  sceneMode: SceneMode;
  scene: ScenePreset | string | null;
};

const RtCanvas = ({ cfg, sceneMode, scene }: RtCanvasProps) => {
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
      render(
        canvasCtxRef.current!,
        cfg,
        sceneMode,
        scene,
        incrementRenderProgress
      );
    }
  }, [scene, cfg]);

  return (
    <canvas ref={canvasRef} width={cfg.width} height={cfg.height}></canvas>
  );
};

export default RtCanvas;
