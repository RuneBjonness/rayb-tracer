import { intersection, Intersection } from '../../intersections-buffer-objects';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { ObjectBufferType, PRIMITIVE_BYTE_SIZE } from '../object-buffers';
import { ShapeType } from '../shape';
import { Intersectable } from './buffer-backed-objects';

export class BufferBackedPrimitive implements Intersectable {
  center: Vector4;
  r2: number;

  shapeType: ShapeType;
  materialIdx: number;
  parentIdx: number;

  readonly listLength: number;
  private _listIndex: number;

  constructor(private buffer: ArrayBufferLike) {
    this._listIndex = 0;
    this.listLength = buffer.byteLength / PRIMITIVE_BYTE_SIZE;

    this.center = point(0, 0, 0);
    this.r2 = 0;

    this.shapeType = ShapeType.PrimitiveSphere;
    this.materialIdx = 0;
    this.parentIdx = 0;
  }

  get listIndex() {
    return this._listIndex;
  }

  set listIndex(index: number) {
    if (index === this._listIndex) {
      return;
    }
    this._listIndex = index;
    const float32View = new Float32Array(
      this.buffer,
      index * PRIMITIVE_BYTE_SIZE,
      PRIMITIVE_BYTE_SIZE / 4
    );
    const int32View = new Int32Array(
      this.buffer,
      index * PRIMITIVE_BYTE_SIZE,
      PRIMITIVE_BYTE_SIZE / 4
    );

    this.center.x = float32View[0];
    this.center.y = float32View[1];
    this.center.z = float32View[2];

    this.r2 = float32View[3];

    this.shapeType = int32View[4];
    this.materialIdx = int32View[5];
    this.parentIdx = int32View[6];
  }

  intersects(r: Ray, accumulatedIntersections: Intersection[]): Intersection[] {
    const l = vector(
      this.center.x - r.origin.x,
      this.center.y - r.origin.y,
      this.center.z - r.origin.z
    );
    const tca = l.dot(r.direction);
    if (tca < 0) {
      return accumulatedIntersections;
    }
    const d2 = l.dot(l) - tca * tca;
    if (d2 > this.r2) {
      return accumulatedIntersections;
    }
    const thc = Math.sqrt(this.r2 - d2);
    let t0 = tca - thc;
    let t1 = tca + thc;
    if (t1 < 0) {
      return accumulatedIntersections;
    }

    accumulatedIntersections.push(
      intersection(
        t0,
        ObjectBufferType.Primitive,
        this._listIndex,
        this.materialIdx
      ),
      intersection(
        t1,
        ObjectBufferType.Primitive,
        this._listIndex,
        this.materialIdx
      )
    );
    return accumulatedIntersections;
  }

  hits(r: Ray, maxDistance: number): boolean {
    const l = vector(
      this.center.x - r.origin.x,
      this.center.y - r.origin.y,
      this.center.z - r.origin.z
    );
    const tca = l.dot(r.direction);
    if (tca < 0) {
      return false;
    }
    const d2 = l.dot(l) - tca * tca;
    if (d2 > this.r2) {
      return false;
    }
    const thc = Math.sqrt(this.r2 - d2);
    let t0 = tca - thc;
    let t1 = tca + thc;
    return (t1 >= 0 && t1 < maxDistance) || (t0 >= 0 && t0 < maxDistance);
  }

  normalAt(p: Vector4): Vector4 {
    return p.clone().subtract(this.center).normalize();
  }
}
