import { intersection, Intersection } from '../../intersections-buffer-objects';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { ObjectBufferType, TRIANGLE_BYTE_SIZE } from '../object-buffers';
import { ShapeType } from '../shape';
import { EPSILON, Intersectable } from './buffer-backed-objects';

export class BufferBackedTriangle implements Intersectable {
  readonly listLength: number;
  listIndex: number;
  float32View: Float32Array;
  int32View: Int32Array;

  constructor(private buffer: ArrayBufferLike) {
    this.listIndex = 0;
    this.listLength = buffer.byteLength / TRIANGLE_BYTE_SIZE;
    this.float32View = new Float32Array(this.buffer);
    this.int32View = new Int32Array(this.buffer);
  }

  get p1() {
    return point(
      this.float32View[this.listIndex * 24 + 0],
      this.float32View[this.listIndex * 24 + 1],
      this.float32View[this.listIndex * 24 + 2]
    );
  }

  get e1() {
    return vector(
      this.float32View[this.listIndex * 24 + 4],
      this.float32View[this.listIndex * 24 + 5],
      this.float32View[this.listIndex * 24 + 6]
    );
  }

  get e2() {
    return vector(
      this.float32View[this.listIndex * 24 + 8],
      this.float32View[this.listIndex * 24 + 9],
      this.float32View[this.listIndex * 24 + 10]
    );
  }

  get n1() {
    return vector(
      this.float32View[this.listIndex * 24 + 12],
      this.float32View[this.listIndex * 24 + 13],
      this.float32View[this.listIndex * 24 + 14]
    );
  }

  get n2() {
    return vector(
      this.float32View[this.listIndex * 24 + 16],
      this.float32View[this.listIndex * 24 + 17],
      this.float32View[this.listIndex * 24 + 18]
    );
  }

  get n3() {
    return vector(
      this.float32View[this.listIndex * 24 + 20],
      this.float32View[this.listIndex * 24 + 21],
      this.float32View[this.listIndex * 24 + 22]
    );
  }

  get shapeType() {
    return this.int32View[this.listIndex * 24 + 15];
  }

  get materialIdx() {
    return this.int32View[this.listIndex * 24 + 19];
  }

  get parentIdx() {
    return this.int32View[this.listIndex * 24 + 23];
  }

  intersects(r: Ray, accumulatedIntersections: Intersection[]): Intersection[] {
    const dirCrossE2 = r.direction.clone().cross(this.e2);
    const det = this.e1.dot(dirCrossE2);

    if (Math.abs(det) < EPSILON) {
      return accumulatedIntersections;
    }

    const f = 1 / det;
    const p1ToOrigin = r.origin.clone().subtract(this.p1);
    const u = f * p1ToOrigin.dot(dirCrossE2);

    if (u < 0 || u > 1) {
      return accumulatedIntersections;
    }

    p1ToOrigin.cross(this.e1);
    const v = f * r.direction.dot(p1ToOrigin);

    if (v < 0 || u + v > 1) {
      return accumulatedIntersections;
    }

    const t = f * this.e2.dot(p1ToOrigin);
    accumulatedIntersections.push(
      intersection(
        t,
        ObjectBufferType.Triangle,
        this.listIndex,
        this.materialIdx,
        u,
        v
      )
    );
    return accumulatedIntersections;
  }

  hits(r: Ray, maxDistance: number): boolean {
    const dirCrossE2 = r.direction.clone().cross(this.e2);
    const det = this.e1.dot(dirCrossE2);

    if (Math.abs(det) < EPSILON) {
      return false;
    }

    const f = 1 / det;
    const p1ToOrigin = r.origin.clone().subtract(this.p1);
    const u = f * p1ToOrigin.dot(dirCrossE2);

    if (u < 0 || u > 1) {
      return false;
    }

    p1ToOrigin.cross(this.e1);
    const v = f * r.direction.dot(p1ToOrigin);

    if (v < 0 || u + v > 1) {
      return false;
    }

    const t = f * this.e2.dot(p1ToOrigin);
    return t >= 0 && t <= maxDistance;
  }

  normalAt(i: Intersection | null): Vector4 {
    if (this.shapeType === ShapeType.Triangle) {
      return this.n1.clone();
    }

    if (i == null) {
      return vector(0, 0, 0);
    }

    return this.n2
      .clone()
      .scale(i.u)
      .add(this.n3.clone().scale(i.v))
      .add(this.n1.clone().scale(1 - i.u - i.v))
      .normalize();
  }
}
