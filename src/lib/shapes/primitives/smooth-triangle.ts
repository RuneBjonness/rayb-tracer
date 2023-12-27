import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { BaseShape } from '../shape';

export class SmoothTriangle extends BaseShape {
  private e1: Vector4;
  private e2: Vector4;

  constructor(
    readonly p1: Vector4,
    readonly p2: Vector4,
    readonly p3: Vector4,
    readonly n1: Vector4,
    readonly n2: Vector4,
    readonly n3: Vector4
  ) {
    super();
    this.shapeType = 'smooth-triangle';
    this.e1 = p2.clone().subtract(p1);
    this.e2 = p3.clone().subtract(p1);

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
