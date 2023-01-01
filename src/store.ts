import create from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { RenderMode } from './renderer/configuration';
import { ScenePreset } from './scenes/scene';

interface RayTracerStore {
  scenePreset: ScenePreset;

  width: number;
  height: number;
  numberOfWorkers: number;

  renderMode: RenderMode;

  renderProgress: number;

  setScenePreset: (scenePreset: ScenePreset) => void;

  setWidth: (width: number) => void;
  setHeight: (height: number) => void;
  setNumberOfWorkers: (numberOfWorkers: number) => void;
  setRenderMode: (renderMode: RenderMode) => void;

  resetRenderProgress: () => void;
  incrementRenderProgress: (pixels: number) => void;
}

const useRayTracerStore = create<RayTracerStore>()(
  devtools(
    persist(
      (set) => ({
        scenePreset: ScenePreset.csgRayBTracer,
        width: 800,
        height: 600,
        numberOfWorkers: 8,
        renderMode: RenderMode.preview,
        renderProgress: 0,
        setScenePreset: (scenePreset: ScenePreset) =>
          set({ scenePreset: scenePreset }),
        setWidth: (width: number) => set({ width: width }),
        setHeight: (height: number) => set({ height: height }),
        setNumberOfWorkers: (numberOfWorkers: number) =>
          set({ numberOfWorkers: numberOfWorkers }),
        setRenderMode: (renderMode: RenderMode) =>
          set({ renderMode: renderMode }),
        resetRenderProgress: () => set({ renderProgress: 0 }),
        incrementRenderProgress: (pixels: number) =>
          set((state) => ({ renderProgress: state.renderProgress + pixels })),
      }),
      {
        name: 'rayb-tracer-storage',
      }
    )
  )
);

export default useRayTracerStore;
