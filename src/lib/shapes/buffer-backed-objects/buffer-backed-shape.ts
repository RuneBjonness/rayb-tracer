import { intersection, Intersection } from '../../intersections-buffer-objects';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { intersectsBounds } from '../bounds';
import { ObjectBufferType, SHAPE_BYTE_SIZE } from '../object-buffers';
import { ShapeType } from '../shape';
import { EPSILON, Intersectable } from './buffer-backed-objects';

export class BufferBackedShape implements Intersectable {
  readonly listLength: number;
  listIndex: number;
  float32View: Float32Array;
  int32View: Int32Array;

  constructor(private buffer: ArrayBufferLike) {
    this.listIndex = 0;
    this.listLength = buffer.byteLength / SHAPE_BYTE_SIZE;
    this.float32View = new Float32Array(this.buffer);
    this.int32View = new Int32Array(this.buffer);
  }

  get shapeType() {
    return this.int32View[this.listIndex * 64 + 0];
  }

  get min() {
    return this.float32View[this.listIndex * 64 + 1];
  }

  get max() {
    return this.float32View[this.listIndex * 64 + 2];
  }

  get closed() {
    return this.int32View[this.listIndex * 64 + 3] === 1;
  }

  get materialIdx() {
    return this.int32View[this.listIndex * 64 + 4];
  }

  get parentIdx() {
    return this.int32View[this.listIndex * 64 + 5];
  }

  get childIdxStart() {
    return this.int32View[this.listIndex * 64 + 6];
  }

  get childIdxEnd() {
    return this.int32View[this.listIndex * 64 + 7];
  }

  get boundMin() {
    return point(
      this.float32View[this.listIndex * 64 + 8],
      this.float32View[this.listIndex * 64 + 9],
      this.float32View[this.listIndex * 64 + 10]
    );
  }

  get boundMax() {
    return point(
      this.float32View[this.listIndex * 64 + 12],
      this.float32View[this.listIndex * 64 + 13],
      this.float32View[this.listIndex * 64 + 14]
    );
  }

  get transform() {
    return this.float32View.subarray(
      this.listIndex * 64 + 16,
      this.listIndex * 64 + 32
    );
  }

  get inverseTransform() {
    return this.float32View.subarray(
      this.listIndex * 64 + 32,
      this.listIndex * 64 + 48
    );
  }

  get inverseTransformTransposed() {
    return this.float32View.subarray(
      this.listIndex * 64 + 48,
      this.listIndex * 64 + 64
    );
  }

  intersects(
    localRay: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    switch (this.shapeType) {
      case ShapeType.Sphere:
        return this.localIntersectsSphere(localRay, accumulatedIntersections);
      case ShapeType.Plane:
        return this.localIntersectsPlane(localRay, accumulatedIntersections);
      case ShapeType.Cube:
        return this.localIntersectsCube(localRay, accumulatedIntersections);
      case ShapeType.Cylinder:
        return this.localIntersectsCylinder(localRay, accumulatedIntersections);
      case ShapeType.Cone:
        return this.localIntersectsCone(localRay, accumulatedIntersections);
    }
    return accumulatedIntersections;
  }

  hits(localRay: Ray, maxDistance: number): boolean {
    switch (this.shapeType) {
      case ShapeType.Sphere:
        return this.localHitsSphere(localRay, maxDistance);
      case ShapeType.Plane:
        return this.localHitsPlane(localRay, maxDistance);
      case ShapeType.Cube:
        return this.localHitsCube(localRay, maxDistance);
      case ShapeType.Cylinder:
        return this.localHitsCylinder(localRay, maxDistance);
      case ShapeType.Cone:
        return this.localHitsCone(localRay, maxDistance);
    }
    return false;
  }

  intersectsBounds(r: Ray): boolean {
    return intersectsBounds(r, this.boundMin, this.boundMax);
  }

  normalAt(p: Vector4): Vector4 {
    switch (this.shapeType) {
      case ShapeType.Sphere:
        return this.localNormalAtSphere(p);
      case ShapeType.Plane:
        return this.localNormalAtPlane();
      case ShapeType.Cube:
        return this.localNormalAtCube(p);
      case ShapeType.Cylinder:
        return this.localNormalAtCylinder(p);
      case ShapeType.Cone:
        return this.localNormalAtCone(p);
    }
    return vector(0, 0, 0);
  }

  private localIntersectsSphere(
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
      intersection(
        (-b - sqrtDiscriminant) / (2 * a),
        ObjectBufferType.Shape,
        this.listIndex,
        this.materialIdx
      ),
      intersection(
        (-b + sqrtDiscriminant) / (2 * a),
        ObjectBufferType.Shape,
        this.listIndex,
        this.materialIdx
      )
    );
    return accumulatedIntersections;
  }

  private localHitsSphere(r: Ray, maxDistance: number): boolean {
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

  private localNormalAtSphere(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }

  private localIntersectsPlane(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    if (Math.abs(r.direction.y) < EPSILON) {
      return accumulatedIntersections;
    }
    accumulatedIntersections.push(
      intersection(
        -r.origin.y / r.direction.y,
        ObjectBufferType.Shape,
        this.listIndex,
        this.materialIdx
      )
    );
    return accumulatedIntersections;
  }

  private localHitsPlane(r: Ray, maxDistance: number): boolean {
    if (Math.abs(r.direction.y) < EPSILON) {
      return false;
    }
    const t = -r.origin.y / r.direction.y;
    return t >= 0 && t < maxDistance;
  }

  private localNormalAtPlane(): Vector4 {
    return vector(0, 1, 0);
  }

  private localIntersectsCube(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    const [xtmin, xtmax] = this.checkAxisCube(r.origin.x, r.direction.x);
    const [ytmin, ytmax] = this.checkAxisCube(r.origin.y, r.direction.y);
    const [ztmin, ztmax] = this.checkAxisCube(r.origin.z, r.direction.z);

    const tmin = Math.max(xtmin, ytmin, ztmin);
    const tmax = Math.min(xtmax, ytmax, ztmax);

    if (tmin > tmax) {
      return accumulatedIntersections;
    }

    accumulatedIntersections.push(
      intersection(
        tmin,
        ObjectBufferType.Shape,
        this.listIndex,
        this.materialIdx
      ),
      intersection(
        tmax,
        ObjectBufferType.Shape,
        this.listIndex,
        this.materialIdx
      )
    );
    return accumulatedIntersections;
  }

  private localHitsCube(r: Ray, maxDistance: number): boolean {
    const [xtmin, xtmax] = this.checkAxisCube(r.origin.x, r.direction.x);
    const [ytmin, ytmax] = this.checkAxisCube(r.origin.y, r.direction.y);
    const [ztmin, ztmax] = this.checkAxisCube(r.origin.z, r.direction.z);

    const tmin = Math.max(xtmin, ytmin, ztmin);
    const tmax = Math.min(xtmax, ytmax, ztmax);

    return tmin <= tmax && tmin <= maxDistance && tmax >= 0;
  }

  private localNormalAtCube(p: Vector4): Vector4 {
    const maxc = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));

    if (maxc == Math.abs(p.x)) {
      return vector(p.x, 0, 0);
    } else if (maxc == Math.abs(p.y)) {
      return vector(0, p.y, 0);
    }

    return vector(0, 0, p.z);
  }

  private checkAxisCube(origin: number, direction: number): [number, number] {
    const tMinNumerator = -1 - origin;
    const tMaxNumerator = 1 - origin;

    let tmin, tmax: number;

    if (Math.abs(direction) >= EPSILON) {
      tmin = tMinNumerator / direction;
      tmax = tMaxNumerator / direction;
    } else {
      tmin = tMinNumerator * Number.POSITIVE_INFINITY;
      tmax = tMaxNumerator * Number.POSITIVE_INFINITY;
    }
    return tmin < tmax ? [tmin, tmax] : [tmax, tmin];
  }

  private localIntersectsCylinder(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    const a = r.direction.x ** 2 + r.direction.z ** 2;

    if (Math.abs(a) > EPSILON) {
      const b = 2 * r.origin.x * r.direction.x + 2 * r.origin.z * r.direction.z;
      const c = r.origin.x ** 2 + r.origin.z ** 2 - 1;
      const discriminant = b ** 2 - 4 * a * c;

      if (discriminant >= 0) {
        let t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
        let t1 = (-b + Math.sqrt(discriminant)) / (2 * a);

        if (t0 > t1) {
          [t0, t1] = [t1, t0];
        }

        this.hitConeOrCylinderWalls(r, t0, accumulatedIntersections);
        this.hitConeOrCylinderWalls(r, t1, accumulatedIntersections);
      }
    }

    if (this.closed && Math.abs(r.direction.y) > EPSILON) {
      this.hitCylinderCaps(
        r,
        (this.min - r.origin.y) / r.direction.y,
        accumulatedIntersections
      );
      this.hitCylinderCaps(
        r,
        (this.max - r.origin.y) / r.direction.y,
        accumulatedIntersections
      );
    }

    return accumulatedIntersections;
  }

  private localHitsCylinder(r: Ray, maxDistance: number): boolean {
    const a = r.direction.x ** 2 + r.direction.z ** 2;

    if (Math.abs(a) > EPSILON) {
      const b = 2 * r.origin.x * r.direction.x + 2 * r.origin.z * r.direction.z;
      const c = r.origin.x ** 2 + r.origin.z ** 2 - 1;
      const discriminant = b ** 2 - 4 * a * c;

      if (discriminant >= 0) {
        const t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
        if (
          t0 >= 0 &&
          t0 < maxDistance &&
          this.hitConeOrCylinderWalls(r, t0).length > 0
        ) {
          return true;
        }
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        if (
          t1 >= 0 &&
          t1 < maxDistance &&
          this.hitConeOrCylinderWalls(r, t1).length > 0
        ) {
          return true;
        }
      }
    }
    if (this.closed && Math.abs(r.direction.y) > EPSILON) {
      const t0 = (this.min - r.origin.y) / r.direction.y;
      if (
        t0 >= 0 &&
        t0 < maxDistance &&
        this.hitConeOrCylinderWalls(r, t0).length > 0
      ) {
        return true;
      }
      const t1 = (this.max - r.origin.y) / r.direction.y;
      if (
        t1 >= 0 &&
        t1 < maxDistance &&
        this.hitConeOrCylinderWalls(r, t1).length > 0
      ) {
        return true;
      }
    }
    return false;
  }

  private localNormalAtCylinder(p: Vector4): Vector4 {
    const dist = p.x ** 2 + p.z ** 2;
    if (dist < 1 && p.y >= this.max - EPSILON) {
      return vector(0, 1, 0);
    }

    if (dist < 1 && p.y <= this.min + EPSILON) {
      return vector(0, -1, 0);
    }

    return vector(p.x, 0, p.z);
  }

  private hitConeOrCylinderWalls(
    r: Ray,
    t: number,
    accumulatedIntersections: Intersection[] = []
  ): Intersection[] {
    const y = r.origin.y + t * r.direction.y;
    if (this.min < y && y < this.max) {
      accumulatedIntersections.push(
        intersection(
          t,
          ObjectBufferType.Shape,
          this.listIndex,
          this.materialIdx
        )
      );
    }
    return accumulatedIntersections;
  }

  private hitCylinderCaps(
    r: Ray,
    t: number,
    accumulatedIntersections: Intersection[] = []
  ): Intersection[] {
    const x = r.origin.x + t * r.direction.x;
    const z = r.origin.z + t * r.direction.z;
    if (x ** 2 + z ** 2 <= 1) {
      accumulatedIntersections.push(
        intersection(
          t,
          ObjectBufferType.Shape,
          this.listIndex,
          this.materialIdx
        )
      );
    }
    return accumulatedIntersections;
  }

  protected localIntersectsCone(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    const a = r.direction.x ** 2 - r.direction.y ** 2 + r.direction.z ** 2;
    const b =
      2 * r.origin.x * r.direction.x -
      2 * r.origin.y * r.direction.y +
      2 * r.origin.z * r.direction.z;
    const c = r.origin.x ** 2 - r.origin.y ** 2 + r.origin.z ** 2;

    if (Math.abs(a) > EPSILON) {
      const discriminant = b ** 2 - 4 * a * c;

      if (discriminant >= 0) {
        let t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
        let t1 = (-b + Math.sqrt(discriminant)) / (2 * a);

        if (t0 > t1) {
          [t0, t1] = [t1, t0];
        }

        this.hitConeOrCylinderWalls(r, t0, accumulatedIntersections);
        this.hitConeOrCylinderWalls(r, t1, accumulatedIntersections);
      }
    } else if (Math.abs(b) > EPSILON) {
      this.hitConeOrCylinderWalls(r, -c / (2 * b), accumulatedIntersections);
    }

    if (this.closed && Math.abs(r.direction.y) > EPSILON) {
      this.hitConeCaps(r, this.min, accumulatedIntersections);
      this.hitConeCaps(r, this.max, accumulatedIntersections);
    }

    return accumulatedIntersections;
  }

  protected localHitsCone(r: Ray, maxDistance: number): boolean {
    const a = r.direction.x ** 2 - r.direction.y ** 2 + r.direction.z ** 2;
    const b =
      2 * r.origin.x * r.direction.x -
      2 * r.origin.y * r.direction.y +
      2 * r.origin.z * r.direction.z;
    const c = r.origin.x ** 2 - r.origin.y ** 2 + r.origin.z ** 2;

    if (Math.abs(a) > EPSILON) {
      const discriminant = b ** 2 - 4 * a * c;

      if (discriminant >= 0) {
        const t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
        if (
          t0 >= 0 &&
          t0 < maxDistance &&
          this.hitConeOrCylinderWalls(r, t0).length > 0
        ) {
          return true;
        }
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        if (
          t1 >= 0 &&
          t1 < maxDistance &&
          this.hitConeOrCylinderWalls(r, t1).length > 0
        ) {
          return true;
        }
      }
    } else if (Math.abs(b) > EPSILON) {
      const t = -c / (2 * b);
      if (
        t >= 0 &&
        t < maxDistance &&
        this.hitConeOrCylinderWalls(r, t).length > 0
      ) {
        return true;
      }
    }

    if (this.closed && Math.abs(r.direction.y) > EPSILON) {
      if (this.min >= maxDistance && this.hitConeCaps(r, this.min).length > 0) {
        return true;
      }
      if (this.max >= maxDistance && this.hitConeCaps(r, this.max).length > 0) {
        return true;
      }
    }
    return false;
  }

  private localNormalAtCone(p: Vector4): Vector4 {
    const dist = p.x ** 2 + p.z ** 2;
    if (dist < 1 && p.y >= this.max - EPSILON) {
      return vector(0, 1, 0);
    }

    if (dist < 1 && p.y <= this.min + EPSILON) {
      return vector(0, -1, 0);
    }

    let y = Math.sqrt(dist);
    return vector(p.x, p.y > 0 ? -y : y, p.z);
  }

  private hitConeCaps(
    r: Ray,
    y: number,
    accumulatedIntersections: Intersection[] = []
  ): Intersection[] {
    const t = (y - r.origin.y) / r.direction.y;
    const x = r.origin.x + t * r.direction.x;
    const z = r.origin.z + t * r.direction.z;
    if (x ** 2 + z ** 2 <= Math.abs(y)) {
      accumulatedIntersections.push(
        intersection(
          t,
          ObjectBufferType.Shape,
          this.listIndex,
          this.materialIdx
        )
      );
    }
    return accumulatedIntersections;
  }
}
