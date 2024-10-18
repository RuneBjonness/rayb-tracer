import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { ShapeType } from '../shape';
import { TransformableShape } from '../transformable-shape';

export class Cube extends TransformableShape {
  constructor() {
    super();
    this.shapeType = ShapeType.Cube;
    this.localBounds = new Bounds(point(-1, -1, -1), point(1, 1, 1));
  }

  protected localIntersects(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    const [xtmin, xtmax] = this.checkAxis(r.origin.x, r.direction.x);
    const [ytmin, ytmax] = this.checkAxis(r.origin.y, r.direction.y);
    const [ztmin, ztmax] = this.checkAxis(r.origin.z, r.direction.z);

    const tmin = Math.max(xtmin, ytmin, ztmin);
    const tmax = Math.min(xtmax, ytmax, ztmax);

    if (tmin > tmax) {
      return accumulatedIntersections;
    }

    accumulatedIntersections.push(
      intersection(tmin, this),
      intersection(tmax, this)
    );
    return accumulatedIntersections;
  }

  protected localHits(r: Ray, maxDistance: number): boolean {
    const [xtmin, xtmax] = this.checkAxis(r.origin.x, r.direction.x);
    const [ytmin, ytmax] = this.checkAxis(r.origin.y, r.direction.y);
    const [ztmin, ztmax] = this.checkAxis(r.origin.z, r.direction.z);

    const tmin = Math.max(xtmin, ytmin, ztmin);
    const tmax = Math.min(xtmax, ytmax, ztmax);

    return tmin <= tmax && tmin <= maxDistance && tmax >= 0;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    const maxc = Math.max(Math.abs(p.x), Math.abs(p.y), Math.abs(p.z));

    if (maxc == Math.abs(p.x)) {
      return vector(p.x, 0, 0);
    } else if (maxc == Math.abs(p.y)) {
      return vector(0, p.y, 0);
    }

    return vector(0, 0, p.z);
  }

  private checkAxis(origin: number, direction: number): [number, number] {
    const tMinNumerator = -1 - origin;
    const tMaxNumerator = 1 - origin;

    let tmin, tmax: number;

    if (Math.abs(direction) >= 0.00001) {
      tmin = tMinNumerator / direction;
      tmax = tMaxNumerator / direction;
    } else {
      tmin = tMinNumerator * Number.POSITIVE_INFINITY;
      tmax = tMaxNumerator * Number.POSITIVE_INFINITY;
    }
    return tmin < tmax ? [tmin, tmax] : [tmax, tmin];
  }
}
