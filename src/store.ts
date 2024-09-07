import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { RenderMode } from './renderer/configuration';
import { ScenePreset } from './scenes/scene-preset';
import { SceneMode } from './scenes/scene';

interface RayTracerStore {
  sceneMode: SceneMode;
  scenePreset: ScenePreset;
  sceneDefinition: string;

  width: number;
  height: number;
  numberOfWorkers: number;
  renderMode: RenderMode;

  renderProgress: number;

  setSceneMode: (sceneMode: SceneMode) => void;
  setScenePreset: (scenePreset: ScenePreset) => void;
  setSceneDefinition: (sceneDefinition: string) => void;

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
        sceneMode: 'sceneDefinition',
        scenePreset: ScenePreset.teapot,
        sceneDefinition: '',
        width: 800,
        height: 600,
        numberOfWorkers: 8,
        renderMode: RenderMode.preview,
        renderProgress: 0,
        setSceneMode(sceneMode) {
          set({ sceneMode: sceneMode });
        },
        setScenePreset: (scenePreset: ScenePreset) =>
          set({ scenePreset: scenePreset }),
        setSceneDefinition: (sceneDefinition: string) =>
          set({ sceneDefinition: sceneDefinition }),
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
