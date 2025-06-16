import { PointLight } from '../lib/lights/lights';
import { toLightsArrayBuffer } from '../lib/lights/lights-buffer';
import { Material } from '../lib/material/materials';
import { toMaterialsArrayBuffer } from '../lib/material/materials-buffer';
import { Color } from '../lib/math/color';
import { MatrixOrder } from '../lib/math/matrices';
import { scaling } from '../lib/math/transformations';
import { Vector4, point } from '../lib/math/vector4';
import { toObjectBuffers } from '../lib/shapes/object-buffers';
import { TransformableSphere } from '../lib/shapes/primitives/sphere';
import { BufferBackedWorld } from '../lib/world/buffer-backed-world';
import { World } from '../lib/world/world';
import { defaultWorldMaterials } from './test-world';

export function defaultBufferBackedWorld(
  lightPosition?: Vector4
): BufferBackedWorld {
  const w = new World();
  w.lights.push(
    new PointLight(lightPosition ?? point(-10, 10, -10), new Color(1, 1, 1))
  );

  const mats = defaultWorldMaterials();

  const s1 = new TransformableSphere();
  s1.materialDefinitions = mats;
  s1.materialIdx = 1;
  w.objects.push(s1);

  const s2 = new TransformableSphere();
  s2.materialDefinitions = mats;
  s2.materialIdx = 0;
  s2.transform = scaling(0.5, 0.5, 0.5);
  w.objects.push(s2);

  const objectBuffers = toObjectBuffers(w.objects, true, MatrixOrder.RowMajor);
  const lightsBuffer = toLightsArrayBuffer(w.lights, true);
  const materialsBuffer = toMaterialsArrayBuffer(mats, true);

  const bufferBackedWorld = new BufferBackedWorld(
    lightsBuffer,
    objectBuffers,
    materialsBuffer,
    new ArrayBuffer(0),
    new ArrayBuffer(0)
  );

  return bufferBackedWorld;
}

export function customBufferBackedWorld(
  w: World,
  mats: Material[]
): BufferBackedWorld {
  const objectBuffers = toObjectBuffers(w.objects, true, MatrixOrder.RowMajor);
  const lightsBuffer = toLightsArrayBuffer(w.lights, true);
  const materialsBuffer = toMaterialsArrayBuffer(mats, true);

  const bufferBackedWorld = new BufferBackedWorld(
    lightsBuffer,
    objectBuffers,
    materialsBuffer,
    new ArrayBuffer(0),
    new ArrayBuffer(0)
  );

  return bufferBackedWorld;
}
