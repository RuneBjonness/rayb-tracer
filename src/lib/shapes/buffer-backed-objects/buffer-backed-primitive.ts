import { intersection, Intersection } from '../../intersections-buffer-objects';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { ObjectBufferType, PRIMITIVE_BYTE_SIZE } from '../object-buffers';
import { ShapeType } from '../shape';
import { Intersectable } from './buffer-backed-objects';

export class BufferBackedPrimitive implements Intersectable {
  readonly listLength: number;
  listIndex: number;
  float32View: Float32Array;
  int32View: Int32Array;

  constructor(private buffer: ArrayBufferLike) {
    this.listIndex = 0;
    this.listLength = buffer.byteLength / PRIMITIVE_BYTE_SIZE;
    this.float32View = new Float32Array(this.buffer);
    this.int32View = new Int32Array(this.buffer);
  }

  get center() {
    return point(
      this.float32View[this.listIndex * 8 + 0],
      this.float32View[this.listIndex * 8 + 1],
      this.float32View[this.listIndex * 8 + 2]
    );
  }
  get r2() {
    return this.float32View[this.listIndex * 8 + 3];
  }
  get shapeType() {
    return this.int32View[this.listIndex * 8 + 4];
  }

  get materialIdx() {
    return this.int32View[this.listIndex * 8 + 5];
  }
  get parentIdx() {
    return this.int32View[this.listIndex * 8 + 6];
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
        this.listIndex,
        this.materialIdx
      ),
      intersection(
        t1,
        ObjectBufferType.Primitive,
        this.listIndex,
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
