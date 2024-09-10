import { Intersection } from '../intersections';
import { Ray } from '../rays';
import { Material } from '../material/materials';
import { Bounds } from './bounds';
import { Group } from './group';
import { CsgShape } from './csg-shape';
import { Vector4 } from '../math/vector4';
import { ObjectBuffers } from './object-buffers';
import { Pattern } from '../material/patterns';
import { TransformableShape } from './transformable-shape';
import { MatrixOrder } from '../math/matrices';

export type ShapeType =
  | 'sphere'
  | 'plane'
  | 'cube'
  | 'cylinder'
  | 'cone'
  | 'triangle'
  | 'smooth-triangle'
  | 'csg'
  | 'group'
  | 'group-bvh'
  | 'primitive-sphere'
  | 'unknown';

export function shapeTypeId(shapeType: ShapeType): number {
  switch (shapeType) {
    case 'sphere':
      return 1;
    case 'plane':
      return 2;
    case 'cube':
      return 3;
    case 'cylinder':
      return 4;
    case 'cone':
      return 5;
    case 'triangle':
      return 6;
    case 'smooth-triangle':
      return 7;
    case 'csg':
      return 8;
    case 'group':
      return 9;
    case 'group-bvh':
      return 10;
    case 'primitive-sphere':
      return 11;
    default:
      return 0;
  }
}

export interface Intersectable {
  intersects(r: Ray): Intersection[];
  hits(r: Ray, maxDistance: number): boolean;
}

export interface Shape extends Intersectable {
  shapeType: ShapeType;

  material: Material;
  materialIdx: number;
  materialDefinitions: Material[];
  patternDefinitions: Pattern[];

  parent: Group | CsgShape | null;
  bounds: Bounds;

  normalAt(p: Vector4, i: Intersection | null): Vector4;
  worldToObject(p: Vector4): Vector4;
  normalToWorld(n: Vector4): Vector4;
  pointToWorld(p: Vector4): Vector4;
  divide(threshold: number): void;
  isTransformable(): this is TransformableShape;
  isGroup(): this is Group;
  isCsgShape(): this is CsgShape;
  copyToArrayBuffers(
    buffers: ObjectBuffers,
    parentIndex: number,
    matrixOrder: MatrixOrder
  ): void;
}
