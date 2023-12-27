import { Scene, SceneMode } from '../../scenes/scene';
import { ScenePreset } from '../../scenes/scene-preset';
import { RenderConfiguration } from '../configuration';
import mainWgsl from './main.wgsl?raw';
import intersectionsWgsl from './intersections.wgsl?raw';

async function init(scene: Scene, ctx: CanvasRenderingContext2D) {
  if (!navigator.gpu) {
    throw Error('WebGPU not supported.');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No appropriate GPUAdapter found.');
  }

  const device = await adapter.requestDevice();

  const module = device.createShaderModule({
    code: mainWgsl + intersectionsWgsl,
  });

  const bindGroupLayout = device.createBindGroupLayout({
    entries: [
      {
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'uniform',
        },
      },
      {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'storage',
        },
      },
    ],
  });

  const pipeline = device.createComputePipeline({
    layout: device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout],
    }),
    compute: {
      module,
      entryPoint: 'main',
    },
  });

  const cameraArrayBuffer = scene.camera.toArrayBuffer();
  const cameraUniformBuffer = device.createBuffer({
    size: Math.ceil(cameraArrayBuffer.byteLength / 16) * 16,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(cameraUniformBuffer, 0, cameraArrayBuffer);

  const shapesArrayBuffer = new ArrayBuffer(
    scene.world.objects.length * (52 * 4)
  );
  for (let i = 0; i < scene.world.objects.length; i++) {
    scene.world.objects[i].copyToArrayBuffer(shapesArrayBuffer, i * (52 * 4));
  }
  const shapesStorageBuffer = device.createBuffer({
    size: Math.ceil(shapesArrayBuffer.byteLength / 16) * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(shapesStorageBuffer, 0, shapesArrayBuffer);

  const OUTPUT_BUFFER_SIZE = scene.camera.width * scene.camera.height * 4;
  const output = device.createBuffer({
    size: OUTPUT_BUFFER_SIZE,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
  });

  const stagingBuffer = device.createBuffer({
    size: OUTPUT_BUFFER_SIZE,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    layout: bindGroupLayout,
    entries: [
      {
        binding: 0,
        resource: {
          buffer: cameraUniformBuffer,
        },
      },
      {
        binding: 1,
        resource: {
          buffer: shapesStorageBuffer,
        },
      },
      {
        binding: 2,
        resource: {
          buffer: output,
        },
      },
    ],
  });

  const commandEncoder = device.createCommandEncoder();
  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(
    Math.ceil(scene.camera.width / 8),
    Math.ceil(scene.camera.height / 8)
  );
  passEncoder.end();
  commandEncoder.copyBufferToBuffer(
    output,
    0,
    stagingBuffer,
    0,
    OUTPUT_BUFFER_SIZE
  );
  const commands = commandEncoder.finish();

  performance.mark('compute-pipeline-created');
  device.queue.submit([commands]);

  await stagingBuffer.mapAsync(GPUMapMode.READ, 0, OUTPUT_BUFFER_SIZE);
  const copyArrayBuffer = stagingBuffer.getMappedRange(0, OUTPUT_BUFFER_SIZE);
  const data = copyArrayBuffer.slice(0);
  stagingBuffer.unmap();

  performance.mark('webgpu-render-pass-end');

  const arr = new Uint8ClampedArray(data);
  // console.log(arr);
  const imageData = new ImageData(arr, scene.camera.width);
  ctx!.putImageData(imageData, 0, 0);

  performance.mark('result-drawn-to-screen');
}

const renderWebGpu = (
  ctx: CanvasRenderingContext2D,
  cfg: RenderConfiguration,
  sceneMode: SceneMode,
  sceneDefinition: ScenePreset | string | null,
  onProgress: (units: number) => void
) => {
  console.log(`renderWebGpu(${cfg.width}X${cfg.height}) started..`);

  performance.clearMarks();
  performance.mark('render-start');
  if (sceneDefinition && typeof sceneDefinition === 'string') {
    const scene = new Scene(JSON.parse(sceneDefinition), cfg);
    performance.mark('scene-created');

    init(scene, ctx).then(() => {
      performance.mark('render-end');

      console.log(
        ` building scene: ${performance
          .measure('scene', 'render-start', 'scene-created')
          .duration.toFixed(1)} ms\n`,
        `building compute pipeline: ${performance
          .measure('pipeline', 'scene-created', 'compute-pipeline-created')
          .duration.toFixed(1)} ms\n`,
        `render pass: ${performance
          .measure(
            'render-pass',
            'compute-pipeline-created',
            'webgpu-render-pass-end'
          )
          .duration.toFixed(1)} ms\n`,
        `draw to screen: ${performance
          .measure(
            'draw-to-screen',
            'webgpu-render-pass-end',
            'result-drawn-to-screen'
          )
          .duration.toFixed(1)} ms\n`,
        `total time: ${performance
          .measure('total', 'render-start', 'render-end')
          .duration.toFixed(1)} ms\n`
      );
    });
  }
};

export default renderWebGpu;
