import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { BaseShape } from '../shape';

export class SmoothTriangle extends BaseShape {
  e1: Vector4;
  e2: Vector4;

  private calculatedBounds: Bounds | null = null;

  constructor(
    public p1: Vector4,
    public p2: Vector4,
    public p3: Vector4,
    public n1: Vector4,
    public n2: Vector4,
    public n3: Vector4
  ) {
    super();
    this.e1 = p2.clone().subtract(p1);
    this.e2 = p3.clone().subtract(p1);
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

    p1ToOrigin.cross(this.e1);
    const v = f * r.direction.dot(p1ToOrigin);

    if (v < 0 || u + v > 1) {
      return [];
    }

    const t = f * this.e2.dot(p1ToOrigin);
    return [intersection(t, this, u, v)];
  }

  protected localNormalAt(_p: Vector4, i: Intersection | null): Vector4 {
    if (i == null) {
      return vector(0, 0, 0);
    }

    return this.n2
      .clone()
      .scale(i.u)
      .add(this.n3.clone().scale(i.v))
      .add(this.n1.clone().scale(1 - i.u - i.v));
  }
}
