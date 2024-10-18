import { Vector4 } from './math/vector4';
import { ObjectBufferType } from './shapes/object-buffers';

export type Intersection = {
  time: number;
  u: number;
  v: number;
  bufferType: ObjectBufferType;
  bufferIndex: number;
  materialIndex: number;
};

export type IntersectionComputations = {
  t: number;
  bufferType: ObjectBufferType;
  bufferIndex: number;
  materialIndex: number;
  point: Vector4;
  overPoint: Vector4;
  underPoint: Vector4;
  eyev: Vector4;
  normalv: Vector4;
  inside: boolean;
  reflectv: Vector4;
  n1: number;
  n2: number;
};

export function intersection(
  time: number,
  bufferType: ObjectBufferType,
  bufferIndex: number,
  materialIndex: number,
  u: number = 0,
  v: number = 0
): Intersection {
  return { time, u, v, bufferType, bufferIndex, materialIndex };
}

export function hitSorted(intersections: Intersection[]): Intersection | null {
  for (const i of intersections) {
    if (i.time >= 0) {
      return i;
    }
  }
  return null;
}
