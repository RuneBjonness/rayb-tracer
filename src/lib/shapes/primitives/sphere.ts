import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { Shape } from '../shape';

export class Sphere extends Shape {
  constructor() {
    super();
  }

  bounds(): Bounds {
    return [point(-1, -1, -1), point(1, 1, 1)];
  }

  protected localIntersects(r: Ray): Intersection[] {
    const spehereToRay = vector(r.origin.x, r.origin.y, r.origin.z);
    const a = r.direction.dot(r.direction);
    const b = 2 * r.direction.dot(spehereToRay);
    const c = spehereToRay.dot(spehereToRay) - 1;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return [];
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    return [
      intersection((-b - sqrtDiscriminant) / (2 * a), this),
      intersection((-b + sqrtDiscriminant) / (2 * a), this),
    ];
  }

  protected localNormalAt(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }
}

export function glassSphere(): Sphere {
  const s = new Sphere();
  s.material.transparancy = 1.0;
  s.material.refractiveIndex = 1.5;
  return s;
}
