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

export enum ShapeType {
  Unknown = 0,
  Sphere,
  Plane,
  Cube,
  Cylinder,
  Cone,
  Triangle,
  SmoothTriangle,
  Csg,
  Group,
  GroupBvh,
  PrimitiveSphere,
}
export interface Intersectable {
  intersects(r: Ray, accumulatedIntersections: Intersection[]): Intersection[];
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
