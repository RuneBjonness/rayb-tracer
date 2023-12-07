import { Intersection, intersection } from '../../intersections';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { BaseShape } from '../shape';
import { Vector4, point } from '../../math/vector4';

export class Triangle extends BaseShape {
  readonly e1: Vector4;
  readonly e2: Vector4;
  readonly normal: Vector4;

  constructor(
    readonly p1: Vector4,
    readonly p2: Vector4,
    readonly p3: Vector4
  ) {
    super();
    this.e1 = p2.clone().subtract(p1);
    this.e2 = p3.clone().subtract(p1);
    this.normal = this.e2.clone().cross(this.e1).normalize();

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
