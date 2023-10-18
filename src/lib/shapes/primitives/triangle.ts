import { Intersection, intersection } from '../../intersections';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { Shape } from '../shape';
import { Vector4, point } from '../../math/vector4';

export class Triangle extends Shape {
  e1: Vector4;
  e2: Vector4;
  normal: Vector4;

  private calculatedBounds: Bounds | null = null;

  constructor(public p1: Vector4, public p2: Vector4, public p3: Vector4) {
    super();
    this.e1 = p2.clone().subtract(p1);
    this.e2 = p3.clone().subtract(p1);
    this.normal = this.e2.clone().cross(this.e1).normalize();
  }

  bounds(): Bounds {
    if (this.calculatedBounds) {
      return this.calculatedBounds;
    }

    this.calculatedBounds = [
      point(
        Math.min(this.p1.x, this.p2.x, this.p3.x),
        Math.min(this.p1.y, this.p2.y, this.p3.y),
        Math.min(this.p1.z, this.p2.z, this.p3.z)
      ),
      point(
        Math.max(this.p1.x, this.p2.x, this.p3.x),
        Math.max(this.p1.y, this.p2.y, this.p3.y),
        Math.max(this.p1.z, this.p2.z, this.p3.z)
      ),
    ];
    return this.calculatedBounds;
  }

  protected localIntersects(r: Ray): Intersection[] {
    const dirCrossE2 = r.direction.clone().cross(this.e2);
    const det = this.e1.dot(dirCrossE2);

    if (Math.abs(det) < 0.00001) {
      return [];
    }

    const f = 1 / det;
    const p1ToOrigin = r.origin.clone().subtract(this.p1);
    const u = f * p1ToOrigin.dot(dirCrossE2);

    if (u < 0 || u > 1) {
      return [];
    }

    const originCrossE1 = p1ToOrigin.cross(this.e1);
    const v = f * r.direction.dot(originCrossE1);

    if (v < 0 || u + v > 1) {
      return [];
    }

    const t = f * this.e2.dot(originCrossE1);
    return [intersection(t, this)];
  }

  protected localNormalAt(_p: Vector4): Vector4 {
    return this.normal;
  }
}
