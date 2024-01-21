import { Material } from './materials';
import { Pattern } from './patterns';

export const MATERIAL_BYTE_SIZE = 48;
export const PATTERN_BYTE_SIZE = 112;

export function copyMaterialToArrayBuffer(
  m: Material,
  buffer: ArrayBuffer,
  offset: number
): void {
  const f32view = new Float32Array(buffer, offset, 12);
  const u32view = new Uint32Array(buffer, offset, 12);
  f32view[0] = m.color.r;
  f32view[1] = m.color.g;
  f32view[2] = m.color.b;
  u32view[3] = m.patternBufferIdx;
  f32view[4] = m.ambient;
  f32view[5] = m.diffuse;
  f32view[6] = m.specular;
  f32view[7] = m.shininess;
  f32view[8] = m.reflective;
  f32view[9] = m.transparency;
  f32view[10] = m.refractiveIndex;
}

export function patternsArrayBufferByteLength(patterns: Pattern[]): number {
  return patterns.reduce(
    (acc, p) => acc + p.arrayBufferByteLength(),
    PATTERN_BYTE_SIZE
  );
}

export function patternsArrayBufferLength(patterns: Pattern[]): number {
  return patternsArrayBufferByteLength(patterns) / PATTERN_BYTE_SIZE;
}
