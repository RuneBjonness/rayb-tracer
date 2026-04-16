import { Intersection, intersection } from '../../intersections';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { Shape, ShapeType } from '../shape';
import { TransformableShape } from '../transformable-shape';
import { Vector4, point, vector } from '../../math/vector4';
import { Material, material } from '../../material/materials';
import { CsgShape } from '../csg-shape';
import { Group } from '../group';
import { ObjectBuffers, TRIANGLE_BYTE_SIZE } from '../object-buffers';
import { Pattern } from '../../material/patterns';
import { MatrixOrder } from '../../math/matrices';

const _dirCrossE2 = new Vector4(0, 0, 0, 0);
const _p1ToOrigin = new Vector4(0, 0, 0, 0);

export class Triangle implements Shape {
  readonly e1: Vector4;
  readonly e2: Vector4;
  readonly n1: Vector4;
  readonly n2: Vector4;
  readonly n3: Vector4;

  constructor(
    readonly p1: Vector4,
    readonly p2: Vector4,
    readonly p3: Vector4,
    n1?: Vector4,
    n2?: Vector4,
    n3?: Vector4
  ) {
    this.e1 = p2.clone().subtract(p1);
    this.e2 = p3.clone().subtract(p1);

    if (n1 && n2 && n3) {
      this.shapeType = ShapeType.SmoothTriangle;
      this.n1 = n1;
      this.n2 = n2;
      this.n3 = n3;
    } else {
      this.shapeType = ShapeType.Triangle;
      this.n1 = this.e2.clone().cross(this.e1).normalize();
      this.n2 = this.n1;
      this.n3 = this.n1;
    }

    this.bounds = new Bounds(
      point(
        Math.min(p1.x, p2.x, p3.x),
        Math.min(p1.y, p2.y, p3.y),
        Math.min(p1.z, p2.z, p3.z)
      ),
      point(
        Math.max(p1.x, p2.x, p3.x),
        Math.max(p1.y, p2.y, p3.y),
        Math.max(p1.z, p2.z, p3.z)
      )
    );
  }
  shapeType: ShapeType;
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
  bounds: Bounds;

  intersects(
    r: Ray,
    accumulatedIntersections: Intersection[] = []
  ): Intersection[] {
    _dirCrossE2.setFrom(r.direction).cross(this.e2);
    const det = this.e1.dot(_dirCrossE2);

    if (Math.abs(det) < 0.00001) {
      return accumulatedIntersections;
    }

    const f = 1 / det;
    _p1ToOrigin.setFrom(r.origin).subtract(this.p1);
    const u = f * _p1ToOrigin.dot(_dirCrossE2);

    if (u < 0 || u > 1) {
      return accumulatedIntersections;
    }

    _p1ToOrigin.cross(this.e1);
    const v = f * r.direction.dot(_p1ToOrigin);

    if (v < 0 || u + v > 1) {
      return accumulatedIntersections;
    }

    const t = f * this.e2.dot(_p1ToOrigin);
    accumulatedIntersections.push(intersection(t, this, u, v));
    return accumulatedIntersections;
  }

  hits(r: Ray, maxDistance: number): boolean {
    _dirCrossE2.setFrom(r.direction).cross(this.e2);
    const det = this.e1.dot(_dirCrossE2);

    if (Math.abs(det) < 0.00001) {
      return false;
    }

    const f = 1 / det;
    _p1ToOrigin.setFrom(r.origin).subtract(this.p1);
    const u = f * _p1ToOrigin.dot(_dirCrossE2);

    if (u < 0 || u > 1) {
      return false;
    }

    _p1ToOrigin.cross(this.e1);
    const v = f * r.direction.dot(_p1ToOrigin);

    if (v < 0 || u + v > 1) {
      return false;
    }

    const t = f * this.e2.dot(_p1ToOrigin);
    return t >= 0 && t <= maxDistance;
  }

  normalAt(p: Vector4, i: Intersection | null): Vector4 {
    if (this.shapeType === ShapeType.Triangle) {
      return this.normalToWorld(this.n1);
    }

    if (i == null) {
      return vector(0, 0, 0);
    }

    const w = 1 - i.u - i.v;
    const localNormal = new Vector4(
      this.n2.x * i.u + this.n3.x * i.v + this.n1.x * w,
      this.n2.y * i.u + this.n3.y * i.v + this.n1.y * w,
      this.n2.z * i.u + this.n3.z * i.v + this.n1.z * w,
      0
    ).normalize();

    return this.normalToWorld(localNormal);
  }

  worldToObject(p: Vector4): Vector4 {
    return this.parent ? this.parent.worldToObject(p) : p.clone();
  }

  normalToWorld(n: Vector4): Vector4 {
    return this.parent ? this.parent.normalToWorld(n) : n.clone();
  }

  pointToWorld(p: Vector4): Vector4 {
    return this.parent ? this.parent.pointToWorld(p) : p.clone();
  }

  divide(_threshold: number): void {
    return;
  }

  isTransformable(): this is TransformableShape {
    return false;
  }

  isGroup(): this is Group {
    return false;
  }

  isCsgShape(): this is CsgShape {
    return false;
  }

  copyToArrayBuffers(
    buffers: ObjectBuffers,
    parentIndex: number,
    _matrixOrder: MatrixOrder
  ): void {
    const u32view = new Uint32Array(
      buffers.trianglesArrayBuffer,
      buffers.triangleBufferOffset,
      24
    );
    const f32view = new Float32Array(
      buffers.trianglesArrayBuffer,
      buffers.triangleBufferOffset,
      24
    );

    f32view[0] = this.p1.x;
    f32view[1] = this.p1.y;
    f32view[2] = this.p1.z;

    f32view[4] = this.e1.x;
    f32view[5] = this.e1.y;
    f32view[6] = this.e1.z;

    f32view[8] = this.e2.x;
    f32view[9] = this.e2.y;
    f32view[10] = this.e2.z;

    f32view[12] = this.n1.x;
    f32view[13] = this.n1.y;
    f32view[14] = this.n1.z;
    u32view[15] = this.shapeType;

    f32view[16] = this.n2.x;
    f32view[17] = this.n2.y;
    f32view[18] = this.n2.z;
    u32view[19] = this.materialIdx;

    f32view[20] = this.n3.x;
    f32view[21] = this.n3.y;
    f32view[22] = this.n3.z;
    u32view[23] = parentIndex;

    buffers.triangleBufferOffset += TRIANGLE_BYTE_SIZE;
  }
}
