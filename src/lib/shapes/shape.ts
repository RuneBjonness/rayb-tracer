import { Intersection } from '../intersections';
import { Matrix4 } from '../math/matrices';
import { Ray } from '../rays';
import { material, Material } from '../materials';
import { Bounds } from './bounds';
import { Group } from './group';
import { CsgShape } from './csg-shape';
import { Vector4, vector } from '../math/vector4';
import { Cone } from './primitives/cone';
import { Cylinder } from './primitives/cylinder';
import {
  BVH_NODE_BYTE_SIZE,
  numberOfObjects,
  ObjectBuffers,
  SHAPE_BYTE_SIZE,
} from './object-buffers';

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
    default:
      return 0;
  }
}

export interface Intersectable {
  intersects(r: Ray): Intersection[];
}

export interface Shape extends Intersectable {
  shapeType: ShapeType;

  material: Material;
  materialIdx: number;
  materialDefinitions: Material[];

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
  copyToArrayBuffers(buffers: ObjectBuffers, parentIndex: number): void;
}

export abstract class TransformableShape implements Shape {
  private _transform: Matrix4;
  public get transform() {
    return this._transform;
  }
  public set transform(m: Matrix4) {
    this._transform = m;
    this.invTransform = m.clone().inverse();
    this.invTransformTransposed = this.invTransform.clone().transpose();
  }

  shapeType: ShapeType = 'unknown';

  get material(): Material {
    if (
      this.materialIdx < 0 ||
      this.materialIdx >= this.materialDefinitions.length
    ) {
      return material();
    }
    return this.materialDefinitions[this.materialIdx];
  }
  set material(m: Material) {
    this.materialIdx = this.materialDefinitions.indexOf(m);
  }
  materialIdx: number = -1;
  materialDefinitions: Material[] = [];

  parent: Group | CsgShape | null = null;

  localBounds: Bounds;

  private _bounds: Bounds | null = null;
  public get bounds(): Bounds {
    if (!this._bounds) {
      this._bounds = this.localBounds.clone().transform(this.transform);
    }
    return this._bounds;
  }

  private invTransform: Matrix4;
  private invTransformTransposed: Matrix4;

  constructor() {
    this._transform = new Matrix4();
    this.invTransform = new Matrix4();
    this.invTransformTransposed = new Matrix4();
    this.localBounds = Bounds.empty();
  }

  intersects(r: Ray): Intersection[] {
    return this.localIntersects(r.clone().transform(this.invTransform));
  }
  protected abstract localIntersects(r: Ray): Intersection[];

  normalAt(p: Vector4, i: Intersection | null = null): Vector4 {
    return this.normalToWorld(this.localNormalAt(this.worldToObject(p), i));
  }
  protected abstract localNormalAt(p: Vector4, i: Intersection | null): Vector4;

  worldToObject(p: Vector4): Vector4 {
    const point = this.parent ? this.parent.worldToObject(p) : p.clone();
    return point.applyMatrix(this.invTransform);
  }

  normalToWorld(n: Vector4): Vector4 {
    let normal = n.clone().applyMatrix(this.invTransformTransposed);
    normal.w = 0;
    normal.normalize();
    return this.parent ? this.parent.normalToWorld(normal) : normal;
  }

  pointToWorld(p: Vector4): Vector4 {
    let point = p.clone().applyMatrix(this.transform);
    return this.parent ? this.parent.pointToWorld(point) : point;
  }

  divide(threshold: number): void {
    return;
  }

  copyToArrayBuffers(buffers: ObjectBuffers, parentIndex: number): void {
    const shapeIndex = buffers.shapeBufferOffset / SHAPE_BYTE_SIZE;

    const u32view = new Uint32Array(
      buffers.shapesArrayBuffer,
      buffers.shapeBufferOffset,
      8
    );
    const f32view = new Float32Array(
      buffers.shapesArrayBuffer,
      buffers.shapeBufferOffset,
      64
    );

    u32view[0] = shapeTypeId(this.shapeType);

    if (this.isConeOrCylinder()) {
      f32view[1] = this.minimum;
      f32view[2] = this.maximum;
      u32view[3] = this.closed ? 1 : 0;
    }

    u32view[4] = this.materialIdx;
    u32view[5] = parentIndex;

    if (this.isGroup() && this.bvhNode) {
      const bvhIndex = buffers.bvhBufferOffset / BVH_NODE_BYTE_SIZE;
      u32view[6] = bvhIndex;
      u32view[7] =
        bvhIndex + numberOfObjects([], this.bvhNode.bvhNodes).bvhNodes;
    } else if (this.isGroup()) {
      u32view[6] = shapeIndex + 1;
      u32view[7] = shapeIndex + numberOfObjects(this.shapes).shapes;
    } else if (this.isCsgShape()) {
      u32view[6] = shapeIndex + 1;
      u32view[7] = shapeIndex + numberOfObjects([this.left, this.right]).shapes;
    }

    f32view[8] = this.localBounds.min.x;
    f32view[9] = this.localBounds.min.y;
    f32view[10] = this.localBounds.min.z;
    f32view[12] = this.localBounds.max.x;
    f32view[13] = this.localBounds.max.y;
    f32view[14] = this.localBounds.max.z;

    this.transform.copyToArrayBuffer(
      buffers.shapesArrayBuffer,
      buffers.shapeBufferOffset + 16 * 4
    );
    this.invTransform.copyToArrayBuffer(
      buffers.shapesArrayBuffer,
      buffers.shapeBufferOffset + 32 * 4
    );
    this.invTransformTransposed.copyToArrayBuffer(
      buffers.shapesArrayBuffer,
      buffers.shapeBufferOffset + 48 * 4
    );

    buffers.shapeBufferOffset += SHAPE_BYTE_SIZE;
    if (this.isGroup()) {
      for (const shape of this.shapes) {
        shape.copyToArrayBuffers(buffers, shapeIndex);
      }
      if (this.bvhNode) {
        this.bvhNode.copyToArrayBuffers(buffers, shapeIndex);
      }
    } else if (this.isCsgShape()) {
      this.left.copyToArrayBuffers(buffers, shapeIndex);
      this.right.copyToArrayBuffers(buffers, shapeIndex);
    }
  }

  isConeOrCylinder(): this is Cone | Cylinder {
    return this.shapeType === 'cone' || this.shapeType === 'cylinder';
  }

  isTransformable(): this is TransformableShape {
    return true;
  }

  isGroup(): this is Group {
    return this.shapeType === 'group' || this.shapeType === 'group-bvh';
  }

  isCsgShape(): this is CsgShape {
    return this.shapeType === 'csg';
  }
}

export class TestShape extends TransformableShape {
  localRayFromBase: Ray | null = null;

  constructor() {
    super();
  }

  protected localIntersects(r: Ray): Intersection[] {
    this.localRayFromBase = r;
    return [];
  }

  protected localNormalAt(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }
}
