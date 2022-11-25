import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { RenderQuality } from './renderer/configuration';

interface RayTracerStore {
  width: number;
  height: number;
  numberOfWorkers: number;

  quality: RenderQuality;

  // raysMaxRecursiveDepth: number;

  // enableAreaLights: boolean;
  // maxAreaLightUvSteps: number;

  // forceZeroAperture: boolean;
  // focalSamplingRate: number;

  renderProgress: number;

  setWidth: (width: number) => void
  setHeight: (height: number) => void
  setNumberOfWorkers: (numberOfWorkers: number) => void
  setQuality: (quality: RenderQuality) => void

  resetRenderProgress: () => void
  incrementRenderProgress: (pixels: number) => void
}

const useRayTracerStore = create<RayTracerStore>()(
  devtools(
    persist(
      (set) => ({
        width: 800,
        height: 600,
        numberOfWorkers: 8,
        quality: RenderQuality.preview,
        renderProgress: 0,
        setWidth: (width: number) => set({ width: width }),
        setHeight: (height: number) => set({ height: height }),
        setNumberOfWorkers: (numberOfWorkers: number) => set({ numberOfWorkers: numberOfWorkers }),
        setQuality: (quality: RenderQuality) => set({ quality: quality }),
        resetRenderProgress: () => set({ renderProgress: 0 }),
        incrementRenderProgress: (pixels: number) => set((state) => ({ renderProgress: state.renderProgress + pixels }))
      }),
      {
        name: 'rayb-tracer-storage',
      }
    )
  )
)

export default useRayTracerStore;