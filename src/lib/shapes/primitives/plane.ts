import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { TransformableShape } from '../transformable-shape';

export class Plane extends TransformableShape {
  constructor() {
    super();
    this.shapeType = 'plane';
    this.localBounds = new Bounds(
      point(Number.NEGATIVE_INFINITY, 0, Number.NEGATIVE_INFINITY),
      point(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY)
    );
  }

  protected localIntersects(
    r: Ray,
    accumulatedIntersections: Intersection[]
  ): Intersection[] {
    if (Math.abs(r.direction.y) < 0.00001) {
      return accumulatedIntersections;
    }
    accumulatedIntersections.push(
      intersection(-r.origin.y / r.direction.y, this)
    );
    return accumulatedIntersections;
  }

  protected localHits(r: Ray, maxDistance: number): boolean {
    if (Math.abs(r.direction.y) < 0.00001) {
      return false;
    }
    const t = -r.origin.y / r.direction.y;
    return t >= 0 && t < maxDistance;
  }

  protected localNormalAt(_p: Vector4): Vector4 {
    return vector(0, 1, 0);
  }
}
