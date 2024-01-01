import { Intersection } from '../intersections';
import { Matrix4 } from '../math/matrices';
import { Ray } from '../rays';
import { material, Material } from '../materials';
import { Bounds } from './bounds';
import { Group, SubGroup } from './group';
import { CsgShape } from './csg-shape';
import { Vector4, vector } from '../math/vector4';
import { Cone } from './primitives/cone';
import { Cylinder } from './primitives/cylinder';

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
  | 'bvh-group'
  | 'unknown';

export const SHAPE_BYTE_SIZE = 256;

export interface Shape {
  shapeType: ShapeType;
  transform: Matrix4;

  material: Material;
  materialIdx: number;
  materialDefinitions: Material[];

  parent: Group | SubGroup | CsgShape | null;
  bounds: Bounds;
  transformedBounds: Bounds;

  intersects(r: Ray): Intersection[];
  normalAt(p: Vector4, i: Intersection | null): Vector4;
  worldToObject(p: Vector4): Vector4;
  normalToWorld(n: Vector4): Vector4;
  pointToWorld(p: Vector4): Vector4;
  divide(threshold: number): void;
  isGroup(): this is Group;
  isCsgShape(): this is CsgShape;
  numberOfDescendants(): number;
  copyToArrayBuffer(
    buffer: ArrayBuffer,
    offset: number,
    parentIdx: number
  ): number;
}

export abstract class BaseShape implements Shape {
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

  bounds: Bounds;

  private _transformedBounds: Bounds | null = null;
  public get transformedBounds(): Bounds {
    if (!this._transformedBounds) {
      this._transformedBounds = this.bounds.clone().transform(this.transform);
    }
    return this._transformedBounds;
  }

  private invTransform: Matrix4;
  private invTransformTransposed: Matrix4;

  constructor() {
    this._transform = new Matrix4();
    this.invTransform = new Matrix4();
    this.invTransformTransposed = new Matrix4();
    this.bounds = Bounds.empty();
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

  copyToArrayBuffer(
    buffer: ArrayBuffer,
    offset: number,
    parentIndex = 0
  ): number {
    const u32view = new Uint32Array(buffer, offset, 8);
    const f32view = new Float32Array(buffer, offset, 64);

    u32view[0] = this.shapeTypeId();

    if (this.isConeOrCylinder()) {
      f32view[1] = this.minimum;
      f32view[2] = this.maximum;
      u32view[3] = this.closed ? 1 : 0;
    }

    u32view[4] = this.materialIdx;
    u32view[5] = parentIndex;

    if (this.isGroup()) {
      u32view[6] = (offset + SHAPE_BYTE_SIZE) / SHAPE_BYTE_SIZE;
      u32view[7] =
        (offset + SHAPE_BYTE_SIZE * this.numberOfDescendants()) /
        SHAPE_BYTE_SIZE;
    } else if (this.isCsgShape()) {
      u32view[6] = (offset + SHAPE_BYTE_SIZE) / SHAPE_BYTE_SIZE;
      u32view[7] =
        (offset + SHAPE_BYTE_SIZE * this.numberOfDescendants()) /
        SHAPE_BYTE_SIZE;
    }

    f32view[8] = this.bounds.min.x;
    f32view[9] = this.bounds.min.y;
    f32view[10] = this.bounds.min.z;
    f32view[12] = this.bounds.max.x;
    f32view[13] = this.bounds.max.y;
    f32view[14] = this.bounds.max.z;

    this.transform.copyToArrayBuffer(buffer, offset + 16 * 4);
    this.invTransform.copyToArrayBuffer(buffer, offset + 32 * 4);
    this.invTransformTransposed.copyToArrayBuffer(buffer, offset + 48 * 4);

    let currentOffset = offset + SHAPE_BYTE_SIZE;
    if (this.isGroup()) {
      for (const shape of this.shapes) {
        currentOffset = shape.copyToArrayBuffer(
          buffer,
          currentOffset,
          offset / SHAPE_BYTE_SIZE
        );
      }
    } else if (this.isCsgShape()) {
      currentOffset = this.left.copyToArrayBuffer(
        buffer,
        currentOffset,
        offset / SHAPE_BYTE_SIZE
      );
      currentOffset = this.right.copyToArrayBuffer(
        buffer,
        currentOffset,
        offset / SHAPE_BYTE_SIZE
      );
    }
    return currentOffset;
  }

  isConeOrCylinder(): this is Cone | Cylinder {
    return this.shapeType === 'cone' || this.shapeType === 'cylinder';
  }

  isGroup(): this is Group {
    return this.shapeType === 'group';
  }

  isCsgShape(): this is CsgShape {
    return this.shapeType === 'csg';
  }

  numberOfDescendants(): number {
    let count = 0;
    if (this.isGroup()) {
      for (const shape of this.shapes) {
        if (shape.shapeType !== 'bvh-group') {
          count++;
        }
        count += shape.numberOfDescendants();
      }
    } else if (this.isCsgShape()) {
      count += 2;
      count += this.left.numberOfDescendants();
      count += this.right.numberOfDescendants();
    }
    return count;
  }

  private shapeTypeId(): number {
    switch (this.shapeType) {
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
      case 'bvh-group':
        return 10;
      default:
        return 0;
    }
  }
}

export class TestShape extends BaseShape {
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
