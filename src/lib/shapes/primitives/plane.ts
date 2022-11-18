import { intersection, Intersection } from '../../intersections';
import { Ray } from '../../rays';
import { point, Tuple, vector } from '../../tuples';
import { Bounds } from '../bounds';
import { Shape } from '../shape';

export class Plane extends Shape {
  constructor() {
    super();
  }

  bounds(): Bounds {
    return [
      point(Number.NEGATIVE_INFINITY, 0, Number.NEGATIVE_INFINITY),
      point(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY),
    ];
  }

  protected localIntersects(r: Ray): Intersection[] {
    if (Math.abs(r.direction[1]) < 0.00001) {
      return [];
    }
    return [intersection(-r.origin[1] / r.direction[1], this)];
  }

  protected localNormalAt(_p: Tuple): Tuple {
    return vector(0, 1, 0);
  }
}
