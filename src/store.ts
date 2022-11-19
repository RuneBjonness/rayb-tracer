import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface RayTracerStore {
  width: number;
  height: number;

  // raysMaxRecursiveDepth: number;

  // enableAreaLights: boolean;
  // maxAreaLightUvSteps: number;

  // forceZeroAperture: boolean;
  // focalSamplingRate: number;

  setWidth: (width: number) => void
  setHeight: (height: number) => void
}

const useRayTracerStore = create<RayTracerStore>()(
  devtools(
    persist(
      (set) => ({
        width: 800,
        height: 600,
        setWidth: (width: number) => set({ width: width }),
        setHeight: (height: number) => set({ height: height })
      }),
      {
        name: 'rayb-tracer-storage',
      }
    )
  )
)

export default useRayTracerStore;