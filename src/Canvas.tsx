import React, { useRef, useEffect } from 'react'
import { Canvas } from './lib/canvas'
import RenderWorker from './render-worker?worker'

const RtCanvas: React.FC<{}> = () => {
  let width = 800;
  let height = 600;
  let canvasRef = useRef<HTMLCanvasElement | null>(null)
  let canvasCtxRef = React.useRef<CanvasRenderingContext2D | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      canvasCtxRef.current = canvasRef.current.getContext('2d')
      let ctx = canvasCtxRef.current

      const startTime = performance.now()
      console.log(`renderScene(${width}X${height}) started..`)

      type CanvasPart = {
        x: number
        y: number
        w: number
        h: number
      }
      const canvasParts: CanvasPart[] = []
      const chunkWidth = width / 16
      const chunkHeight = height / 12
      for (let x = 0; x < 16; x++) {
        for (let y = 0; y < 12; y++) {
          canvasParts.push({
            x: x * chunkWidth,
            y: y * chunkHeight,
            w: chunkWidth,
            h: chunkHeight,
          })
        }
      }

      let workerChunkStartTime : number[] = []
      for (let i = 0; i < 12; i++) {
        const worker = new RenderWorker()
 
        worker.onmessage = function (e) {
          const cfg: CanvasPart = e.data[0]
          const c = new Canvas(chunkWidth, chunkHeight)
          c.pixels = (e.data[1] as Canvas).pixels
          ctx!.putImageData(c.getImageData(), cfg.x, cfg.y)

          console.log(
              `     --Worker #${i} rendered chunk in ${
                (performance.now() - workerChunkStartTime[i]).toFixed()
              } ms`,
            )

          const cp = canvasParts.pop()
          if (cp) {
            workerChunkStartTime[i] = performance.now()
            worker.postMessage([cp])
          } else {
            worker.terminate()
            console.log(
              `   --Worker #${i} terminated after ${
                ((performance.now() - startTime) / 1000).toFixed(2)
              } s`,
            )
          }
        }

        const cp = canvasParts.pop()
        if (cp) {
          workerChunkStartTime[i] = performance.now()
          worker.postMessage([cp])
        }
      }
    }
  }, [])

  return <canvas ref={canvasRef} width={width} height={height}></canvas>
}

export default RtCanvas
