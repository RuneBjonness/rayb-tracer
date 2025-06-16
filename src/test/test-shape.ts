import { Intersection } from '../lib/intersections';
import { Vector4, vector } from '../lib/math/vector4';
import { Ray } from '../lib/rays';
import { TransformableShape } from '../lib/shapes/transformable-shape';

export class TestShape extends TransformableShape {
  localRayFromBase: Ray | null = null;

  protected localIntersects(r: Ray): Intersection[] {
    this.localRayFromBase = r;
    return [];
  }

  protected localHits(r: Ray, _maxDistance: number): boolean {
    this.localRayFromBase = r;
    return false;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }
}
