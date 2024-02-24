import { intersection, Intersection } from '../../intersections';
import { point, vector, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { Bounds } from '../bounds';
import { TransformableShape } from '../transformable-shape';

export class Sphere extends TransformableShape {
  constructor() {
    super();
    this.shapeType = 'sphere';
    this.localBounds = new Bounds(point(-1, -1, -1), point(1, 1, 1));
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

  protected localHits(r: Ray, maxDistance: number): boolean {
    const spehereToRay = vector(r.origin.x, r.origin.y, r.origin.z);
    const a = r.direction.dot(r.direction);
    const b = 2 * r.direction.dot(spehereToRay);
    const c = spehereToRay.dot(spehereToRay) - 1;
    const discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return false;
    }
    const sqrtDiscriminant = Math.sqrt(discriminant);
    const t1 = (-b - sqrtDiscriminant) / (2 * a);
    if (t1 >= 0 && t1 < maxDistance) {
      return true;
    }
    const t2 = (-b + sqrtDiscriminant) / (2 * a);
    return t2 >= 0 && t2 < maxDistance;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }
}
