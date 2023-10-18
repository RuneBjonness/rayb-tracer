import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { Shape } from '../shape';

export class Cylinder extends Shape {
  minimum: number = Number.NEGATIVE_INFINITY;
  maximum: number = Number.POSITIVE_INFINITY;
  closed: boolean = false;

  constructor() {
    super();
  }

  bounds(): Bounds {
    return [point(-1, this.minimum, -1), point(1, this.maximum, 1)];
  }

  protected localIntersects(r: Ray): Intersection[] {
    const xs: Intersection[] = [];

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

        xs.push(...this.hitWalls(r, t0));
        xs.push(...this.hitWalls(r, t1));
      }
    }

    if (this.closed && Math.abs(r.direction.y) > 0.00001) {
      xs.push(...this.hitCaps(r, (this.minimum - r.origin.y) / r.direction.y));
      xs.push(...this.hitCaps(r, (this.maximum - r.origin.y) / r.direction.y));
    }

    return xs;
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

  private hitWalls(r: Ray, t: number): Intersection[] {
    const y = r.origin.y + t * r.direction.y;
    return this.minimum < y && y < this.maximum ? [intersection(t, this)] : [];
  }

  private hitCaps(r: Ray, t: number): Intersection[] {
    const x = r.origin.x + t * r.direction.x;
    const z = r.origin.z + t * r.direction.z;
    return x ** 2 + z ** 2 <= 1 ? [intersection(t, this)] : [];
  }
}
