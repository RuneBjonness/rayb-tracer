import { intersection, Intersection } from '../../intersections-buffer-objects';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { ObjectBufferType, TRIANGLE_BYTE_SIZE } from '../object-buffers';
import { ShapeType } from '../shape';
import { EPSILON, Intersectable } from './buffer-backed-objects';

export class BufferBackedTriangle implements Intersectable {
  p1: Vector4;
  e1: Vector4;
  e2: Vector4;

  n1: Vector4;
  n2: Vector4;
  n3: Vector4;

  shapeType: number;
  materialIdx: number;
  parentIdx: number;

  readonly listLength: number;
  private _listIndex: number;

  constructor(private buffer: ArrayBufferLike) {
    this._listIndex = 0;
    this.listLength = buffer.byteLength / TRIANGLE_BYTE_SIZE;

    this.p1 = point(0, 0, 0);
    this.e1 = vector(0, 0, 0);
    this.e2 = vector(0, 0, 0);

    this.n1 = vector(0, 0, 0);
    this.n2 = vector(0, 0, 0);
    this.n3 = vector(0, 0, 0);

    this.shapeType = 0;
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
      index * TRIANGLE_BYTE_SIZE,
      TRIANGLE_BYTE_SIZE / 4
    );
    const int32View = new Int32Array(
      this.buffer,
      index * TRIANGLE_BYTE_SIZE,
      TRIANGLE_BYTE_SIZE / 4
    );

    this.p1.x = float32View[0];
    this.p1.y = float32View[1];
    this.p1.z = float32View[2];

    this.e1.x = float32View[4];
    this.e1.y = float32View[5];
    this.e1.z = float32View[6];

    this.e2.x = float32View[8];
    this.e2.y = float32View[9];
    this.e2.z = float32View[10];

    this.n1.x = float32View[12];
    this.n1.y = float32View[13];
    this.n1.z = float32View[14];

    this.n2.x = float32View[16];
    this.n2.y = float32View[17];
    this.n2.z = float32View[18];

    this.n3.x = float32View[20];
    this.n3.y = float32View[21];
    this.n3.z = float32View[22];

    this.shapeType = int32View[15];
    this.materialIdx = int32View[19];
    this.parentIdx = int32View[23];
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
        this._listIndex,
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
