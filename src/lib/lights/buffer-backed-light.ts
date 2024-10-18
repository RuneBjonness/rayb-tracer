import { Color } from '../math/color';
import { point, Vector4 } from '../math/vector4';
import { BufferBackedWorld } from '../world/buffer-backed-world';
import { LIGHTS_BYTE_SIZE } from './lights-buffer';

export class BufferBackedLight {
  constructor(
    public intensity: Color,
    public position: Vector4
  ) {}

  intensityAt(p: Vector4, w: BufferBackedWorld): number {
    return w.isShadowed(p, this.position) ? 0.0 : 1.0;
  }
}

export function bufferBackedLightArray(
  buffer: ArrayBufferLike
): BufferBackedLight[] {
  const lights = new Array<BufferBackedLight>();
  const float32View = new Float32Array(buffer);
  for (let i = 0; i < float32View.length; i += LIGHTS_BYTE_SIZE / 4) {
    const intensity = new Color(
      float32View[i],
      float32View[i + 1],
      float32View[i + 2]
    );
    const position = point(
      float32View[i + 4],
      float32View[i + 5],
      float32View[i + 6]
    );
    if (intensity.r + intensity.g + intensity.b < 0.01) {
      continue;
    }
    lights.push(new BufferBackedLight(intensity, position));
  }
  return lights;
}
