import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { BaseShape } from '../shape';

export class Plane extends BaseShape {
  constructor() {
    super();
    this.shapeType = 'plane';
    this.localBounds = new Bounds(
      point(Number.NEGATIVE_INFINITY, 0, Number.NEGATIVE_INFINITY),
      point(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY)
    );
  }

  protected localIntersects(r: Ray): Intersection[] {
    if (Math.abs(r.direction.y) < 0.00001) {
      return [];
    }
    return [intersection(-r.origin.y / r.direction.y, this)];
  }

  protected localNormalAt(_p: Vector4): Vector4 {
    return vector(0, 1, 0);
  }
}
