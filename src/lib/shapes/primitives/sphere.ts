import { intersection, Intersection } from '../../intersections';
import { material, Material } from '../../material/materials';
import { Pattern } from '../../material/patterns';
import { MatrixOrder } from '../../math/matrices';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { CsgShape } from '../csg-shape';
import { Group } from '../group';
import { ObjectBuffers, PRIMITIVE_BYTE_SIZE } from '../object-buffers';
import { Shape, ShapeType } from '../shape';
import { TransformableShape } from '../transformable-shape';

export class TransformableSphere extends TransformableShape {
  constructor() {
    super();
    this.shapeType = ShapeType.Sphere;
    this.localBounds = new Bounds(point(-1, -1, -1), point(1, 1, 1));
  }

  protected localIntersects(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    const spehereToRay = vector(r.origin.x, r.origin.y, r.origin.z);
    const a = r.direction.dot(r.direction);
    const b = 2 * r.direction.dot(spehereToRay);
    const c = spehereToRay.dot(spehereToRay) - 1;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return accumulatedIntersections;
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    accumulatedIntersections.push(
      intersection((-b - sqrtDiscriminant) / (2 * a), this),
      intersection((-b + sqrtDiscriminant) / (2 * a), this)
    );
    return accumulatedIntersections;
  }

  protected localHits(r: Ray, maxDistance: number): boolean {
    const spehereToRay = vector(r.origin.x, r.origin.y, r.origin.z);
    const a = r.direction.dot(r.direction);
    const b = 2 * r.direction.dot(spehereToRay);
    const c = spehereToRay.dot(spehereToRay) - 1;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return false;
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDiscriminant) / (2 * a);
    if (t1 >= 0 && t1 < maxDistance) {
      return true;
    }
    const t2 = (-b + sqrtDiscriminant) / (2 * a);
    return t2 >= 0 && t2 < maxDistance;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }
}

export class Sphere implements Shape {
  constructor(
    readonly center: Vector4,
    readonly radius: number
  ) {
    this.bounds = new Bounds(
      point(center.x - radius, center.y - radius, center.z - radius),
      point(center.x + radius, center.y + radius, center.z + radius)
    );
    this.r2 = radius * radius;
  }

  readonly r2: number;
  shapeType = ShapeType.PrimitiveSphere;
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
      intersection(t0, this),
      intersection(t1, this)
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

  normalAt(p: Vector4, i: Intersection | null): Vector4 {
    const n = vector(p.x, p.y, p.z).subtract(this.center);
    n.w = 0;
    n.normalize();
    return this.normalToWorld(n);
  }

  worldToObject(p: Vector4): Vector4 {
    return this.parent ? this.parent.worldToObject(p) : p.clone();
  }

  normalToWorld(n: Vector4): Vector4 {
    return this.parent ? this.parent.normalToWorld(n) : n;
  }

  pointToWorld(p: Vector4): Vector4 {
    return this.parent ? this.parent.pointToWorld(p) : p.clone();
  }

  divide(threshold: number): void {
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
    matrixOrder: MatrixOrder
  ): void {
    const u32view = new Uint32Array(
      buffers.primitivesArrayBuffer,
      buffers.primitiveBufferOffset,
      8
    );
    const f32view = new Float32Array(
      buffers.primitivesArrayBuffer,
      buffers.primitiveBufferOffset,
      8
    );

    f32view[0] = this.center.x;
    f32view[1] = this.center.y;
    f32view[2] = this.center.z;
    f32view[3] = this.r2;

    u32view[4] = this.shapeType;
    u32view[5] = this.materialIdx;
    u32view[6] = parentIndex;

    buffers.primitiveBufferOffset += PRIMITIVE_BYTE_SIZE;
  }
}
