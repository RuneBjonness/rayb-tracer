import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { RenderQuality } from './renderer/configuration';

interface RayTracerStore {
  width: number;
  height: number;
  quality: RenderQuality

  // raysMaxRecursiveDepth: number;

  // enableAreaLights: boolean;
  // maxAreaLightUvSteps: number;

  // forceZeroAperture: boolean;
  // focalSamplingRate: number;

  setWidth: (width: number) => void
  setHeight: (height: number) => void
  setQuality: (quality: RenderQuality) => void
}

const useRayTracerStore = create<RayTracerStore>()(
  devtools(
    persist(
      (set) => ({
        width: 800,
        height: 600,
        quality: RenderQuality.preview,
        setWidth: (width: number) => set({ width: width }),
        setHeight: (height: number) => set({ height: height }),
        setQuality: (quality: RenderQuality) => set({ quality: quality })
      }),
      {
        name: 'rayb-tracer-storage',
      }
    )
  )
)

export default useRayTracerStore;