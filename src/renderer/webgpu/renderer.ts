import { Scene, SceneMode } from '../../scenes/scene';
import { ScenePreset, loadScene } from '../../scenes/scene-preset';
import { RenderConfiguration } from '../configuration';
import mainWgsl from './main.wgsl?raw';
import intersectionsWgsl from './intersections.wgsl?raw';
import previewRendererWgsl from './preview-renderer.wgsl?raw';
import {
  MATERIAL_BYTE_SIZE,
  copyMaterialToArrayBuffer,
} from '../../lib/materials';
import { SHAPE_BYTE_SIZE } from '../../lib/shapes/shape';
import { LIGHTS_BYTE_SIZE } from '../../lib/lights';
import { BVH_NODE_BYTE_SIZE } from '../../lib/shapes/bvh-node';

async function init(scene: Scene, ctx: CanvasRenderingContext2D) {
  if (!navigator.gpu) {
    throw Error('WebGPU not supported.');
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('No appropriate GPUAdapter found.');
  }

  const canUse512MBStorageBuffers =
    adapter?.limits.maxStorageBufferBindingSize >= 512 * 1024 * 1024;
  if (!canUse512MBStorageBuffers) {
    throw new Error(
      `GPUAdapter does not support 512MB storage buffers. Max: ${adapter?.limits.maxStorageBufferBindingSize}`
    );
  }

  const device = await adapter.requestDevice({
    requiredLimits: { maxStorageBufferBindingSize: 512 * 1024 * 1024 },
  });

  const module = device.createShaderModule({
    code: mainWgsl + intersectionsWgsl + previewRendererWgsl,
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
          type: 'read-only-storage',
        },
      },
      {
        binding: 3,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 4,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {
          type: 'read-only-storage',
        },
      },
      {
        binding: 5,
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
    (scene.world.numberOfShapes() + 1) * SHAPE_BYTE_SIZE
  );
  let shapesOffset = SHAPE_BYTE_SIZE;

  const bvhArrayBuffer = new ArrayBuffer(
    (scene.world.numberOfBvhNodes() + 1) * BVH_NODE_BYTE_SIZE
  );
  let bvhOffset = BVH_NODE_BYTE_SIZE;
  for (let i = 0; i < scene.world.objects.length; i++) {
    [shapesOffset, bvhOffset] = scene.world.objects[i].copyToArrayBuffers(
      shapesArrayBuffer,
      shapesOffset,
      bvhArrayBuffer,
      bvhOffset,
      0
    );
  }
  const shapesStorageBuffer = device.createBuffer({
    size: Math.ceil(shapesArrayBuffer.byteLength / 16) * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(shapesStorageBuffer, 0, shapesArrayBuffer);

  const bvhStorageBuffer = device.createBuffer({
    size: Math.ceil(bvhArrayBuffer.byteLength / 16) * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(bvhStorageBuffer, 0, bvhArrayBuffer);

  const lightsArrayBuffer = new ArrayBuffer(
    scene.world.lights.length * LIGHTS_BYTE_SIZE
  );
  for (let i = 0; i < scene.world.lights.length; i++) {
    scene.world.lights[i].copyLightToArrayBuffer(
      lightsArrayBuffer,
      i * LIGHTS_BYTE_SIZE
    );
  }
  const lightsStorageBuffer = device.createBuffer({
    size: Math.ceil(lightsArrayBuffer.byteLength / 16) * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(lightsStorageBuffer, 0, lightsArrayBuffer);

  const materialsArrayBuffer = new ArrayBuffer(
    scene.materials.length * MATERIAL_BYTE_SIZE
  );
  for (let i = 0; i < scene.materials.length; i++) {
    copyMaterialToArrayBuffer(
      scene.materials[i],
      materialsArrayBuffer,
      i * MATERIAL_BYTE_SIZE
    );
  }
  const materialsStorageBuffer = device.createBuffer({
    size: Math.ceil(materialsArrayBuffer.byteLength / 16) * 16,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(materialsStorageBuffer, 0, materialsArrayBuffer);

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
          buffer: bvhStorageBuffer,
        },
      },
      {
        binding: 3,
        resource: {
          buffer: lightsStorageBuffer,
        },
      },
      {
        binding: 4,
        resource: {
          buffer: materialsStorageBuffer,
        },
      },
      {
        binding: 5,
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

const renderWebGpu = async (
  ctx: CanvasRenderingContext2D,
  cfg: RenderConfiguration,
  sceneMode: SceneMode,
  sceneDefinition: ScenePreset | string | null,
  onProgress: (units: number) => void
) => {
  console.log(`renderWebGpu(${cfg.width}X${cfg.height}) started..`);

  performance.clearMarks();
  performance.mark('render-start');

  let scene: Scene;
  if (sceneMode === 'scenePreset') {
    scene = await loadScene(sceneDefinition as ScenePreset, cfg);
  } else {
    scene = new Scene(JSON.parse(sceneDefinition as string), cfg);
  }

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
};

export default renderWebGpu;
