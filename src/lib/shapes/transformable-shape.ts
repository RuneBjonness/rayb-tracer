import { Intersection } from '../intersections';
import { Matrix4, MatrixOrder } from '../math/matrices';
import { Ray } from '../rays';
import { material, Material } from '../material/materials';
import { Bounds } from './bounds';
import { Group } from './group';
import { CsgShape } from './csg-shape';
import { Vector4 } from '../math/vector4';
import { Cone } from './primitives/cone';
import { Cylinder } from './primitives/cylinder';
import {
  BVH_NODE_BYTE_SIZE,
  numberOfObjects,
  ObjectBuffers,
  SHAPE_BYTE_SIZE,
} from './object-buffers';
import { Pattern } from '../material/patterns';
import { Shape, ShapeType } from './shape';

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

  shapeType = ShapeType.Unknown;

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
  patternDefinitions: Pattern[] = [];

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

  intersects(
    r: Ray,
    accumulatedIntersections: Intersection[] = []
  ): Intersection[] {
    return this.localIntersects(
      r.clone().transform(this.invTransform),
      accumulatedIntersections
    );
  }
  protected abstract localIntersects(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[];

  hits(r: Ray, maxDistance: number): boolean {
    return this.localHits(r.clone().transform(this.invTransform), maxDistance);
  }
  protected abstract localHits(r: Ray, maxDistance: number): boolean;

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

  copyToArrayBuffers(
    buffers: ObjectBuffers,
    parentIndex: number,
    matrixOrder: MatrixOrder
  ): void {
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

    u32view[0] = this.shapeType;

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
      buffers.shapeBufferOffset + 16 * 4,
      matrixOrder
    );
    this.invTransform.copyToArrayBuffer(
      buffers.shapesArrayBuffer,
      buffers.shapeBufferOffset + 32 * 4,
      matrixOrder
    );
    this.invTransformTransposed.copyToArrayBuffer(
      buffers.shapesArrayBuffer,
      buffers.shapeBufferOffset + 48 * 4,
      matrixOrder
    );

    buffers.shapeBufferOffset += SHAPE_BYTE_SIZE;
    if (this.isGroup()) {
      for (const shape of this.shapes) {
        shape.copyToArrayBuffers(buffers, shapeIndex, matrixOrder);
      }
      if (this.bvhNode) {
        this.bvhNode.copyToArrayBuffers(buffers, shapeIndex, matrixOrder);
      }
    } else if (this.isCsgShape()) {
      this.left.copyToArrayBuffers(buffers, shapeIndex, matrixOrder);
      this.right.copyToArrayBuffers(buffers, shapeIndex, matrixOrder);
    }
  }

  isConeOrCylinder(): this is Cone | Cylinder {
    return (
      this.shapeType === ShapeType.Cone || this.shapeType === ShapeType.Cylinder
    );
  }

  isTransformable(): this is TransformableShape {
    return true;
  }

  isGroup(): this is Group {
    return (
      this.shapeType === ShapeType.Group ||
      this.shapeType === ShapeType.GroupBvh
    );
  }

  isCsgShape(): this is CsgShape {
    return this.shapeType === ShapeType.Csg;
  }
}
