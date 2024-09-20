import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { TransformableShape } from '../transformable-shape';

export class Cylinder extends TransformableShape {
  readonly minimum: number;
  readonly maximum: number;
  readonly closed: boolean;

  constructor(minimum?: number, maximum?: number, closed?: boolean) {
    super();
    this.shapeType = 'cylinder';
    this.minimum = minimum ?? Number.NEGATIVE_INFINITY;
    this.maximum = maximum ?? Number.POSITIVE_INFINITY;
    this.closed = closed ?? false;

    this.localBounds = new Bounds(
      point(-1, this.minimum, -1),
      point(1, this.maximum, 1)
    );
  }

  protected localIntersects(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    const a = r.direction.x ** 2 + r.direction.z ** 2;

    if (Math.abs(a) > 0.00001) {
      const b = 2 * r.origin.x * r.direction.x + 2 * r.origin.z * r.direction.z;
      const c = r.origin.x ** 2 + r.origin.z ** 2 - 1;
      const discriminant = b ** 2 - 4 * a * c;

      if (discriminant >= 0) {
        let t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
        let t1 = (-b + Math.sqrt(discriminant)) / (2 * a);

        if (t0 > t1) {
          [t0, t1] = [t1, t0];
        }

        this.hitWalls(r, t0, accumulatedIntersections);
        this.hitWalls(r, t1, accumulatedIntersections);
      }
    }

    if (this.closed && Math.abs(r.direction.y) > 0.00001) {
      this.hitCaps(
        r,
        (this.minimum - r.origin.y) / r.direction.y,
        accumulatedIntersections
      );
      this.hitCaps(
        r,
        (this.maximum - r.origin.y) / r.direction.y,
        accumulatedIntersections
      );
    }

    return accumulatedIntersections;
  }

  protected localHits(r: Ray, maxDistance: number): boolean {
    const a = r.direction.x ** 2 + r.direction.z ** 2;

    if (Math.abs(a) > 0.00001) {
      const b = 2 * r.origin.x * r.direction.x + 2 * r.origin.z * r.direction.z;
      const c = r.origin.x ** 2 + r.origin.z ** 2 - 1;
      const discriminant = b ** 2 - 4 * a * c;

      if (discriminant >= 0) {
        const t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
        if (t0 >= 0 && t0 < maxDistance && this.hitWalls(r, t0).length > 0) {
          return true;
        }
        const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        if (t1 >= 0 && t1 < maxDistance && this.hitWalls(r, t1).length > 0) {
          return true;
        }
      }
    }
    if (this.closed && Math.abs(r.direction.y) > 0.00001) {
      const t0 = (this.minimum - r.origin.y) / r.direction.y;
      if (t0 >= 0 && t0 < maxDistance && this.hitCaps(r, t0).length > 0) {
        return true;
      }
      const t1 = (this.maximum - r.origin.y) / r.direction.y;
      if (t1 >= 0 && t1 < maxDistance && this.hitCaps(r, t1).length > 0) {
        return true;
      }
    }
    return false;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    const dist = p.x ** 2 + p.z ** 2;
    if (dist < 1 && p.y >= this.maximum - 0.00001) {
      return vector(0, 1, 0);
    }

    if (dist < 1 && p.y <= this.minimum + 0.00001) {
      return vector(0, -1, 0);
    }

    return vector(p.x, 0, p.z);
  }

  private hitWalls(
    r: Ray,
    t: number,
    accumulatedIntersections: Intersection[] = []
  ): Intersection[] {
    const y = r.origin.y + t * r.direction.y;
    if (this.minimum < y && y < this.maximum) {
      accumulatedIntersections.push(intersection(t, this));
    }
    return accumulatedIntersections;
  }

  private hitCaps(
    r: Ray,
    t: number,
    accumulatedIntersections: Intersection[] = []
  ): Intersection[] {
    const x = r.origin.x + t * r.direction.x;
    const z = r.origin.z + t * r.direction.z;
    if (x ** 2 + z ** 2 <= 1) {
      accumulatedIntersections.push(intersection(t, this));
    }
    return accumulatedIntersections;
  }
}
