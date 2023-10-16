import { intersection, Intersection } from '../../intersections';
import { Ray } from '../../rays';
import { point, Tuple, vector } from '../../math/tuples';
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

    const a = r.direction[0] ** 2 + r.direction[2] ** 2;

    if (Math.abs(a) > 0.00001) {
      const b =
        2 * r.origin[0] * r.direction[0] + 2 * r.origin[2] * r.direction[2];
      const c = r.origin[0] ** 2 + r.origin[2] ** 2 - 1;
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

    if (this.closed && Math.abs(r.direction[1]) > 0.00001) {
      xs.push(
        ...this.hitCaps(r, (this.minimum - r.origin[1]) / r.direction[1])
      );
      xs.push(
        ...this.hitCaps(r, (this.maximum - r.origin[1]) / r.direction[1])
      );
    }

    return xs;
  }

  protected localNormalAt(p: Tuple): Tuple {
    const dist = p[0] ** 2 + p[2] ** 2;
    if (dist < 1 && p[1] >= this.maximum - 0.00001) {
      return vector(0, 1, 0);
    }

    if (dist < 1 && p[1] <= this.minimum + 0.00001) {
      return vector(0, -1, 0);
    }

    return vector(p[0], 0, p[2]);
  }

  private hitWalls(r: Ray, t: number): Intersection[] {
    const y = r.origin[1] + t * r.direction[1];
    return this.minimum < y && y < this.maximum ? [intersection(t, this)] : [];
  }

  private hitCaps(r: Ray, t: number): Intersection[] {
    const x = r.origin[0] + t * r.direction[0];
    const z = r.origin[2] + t * r.direction[2];
    return x ** 2 + z ** 2 <= 1 ? [intersection(t, this)] : [];
  }
}
