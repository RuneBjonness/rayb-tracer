import { Material } from './materials';

export const MATERIAL_BYTE_SIZE = 48;
export const PATTERN_BYTE_SIZE = 128;

export enum MaterialBufferType {
  Material = 0,
  Pattern = 1,
  ImageData = 2,
}

export function copyMaterialToArrayBuffer(
  m: Material,
  buffer: ArrayBuffer,
  offset: number
): void {
  const f32view = new Float32Array(buffer, offset, 10);
  const u32view = new Uint32Array(buffer, offset, 10);
  f32view[0] = m.color.r;
  f32view[1] = m.color.g;
  f32view[2] = m.color.b;
  u32view[3] = m.patternIdx;
  f32view[4] = m.ambient;
  f32view[5] = m.diffuse;
  f32view[6] = m.specular;
  f32view[7] = m.shininess;
  f32view[8] = m.reflective;
  f32view[9] = m.transparency;
  f32view[10] = m.refractiveIndex;
}
