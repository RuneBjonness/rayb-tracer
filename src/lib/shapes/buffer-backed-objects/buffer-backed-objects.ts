import { Intersection } from '../../intersections-buffer-objects';
import { Ray } from '../../rays';

export const EPSILON = 0.0001;

export interface Intersectable {
  intersects(r: Ray, accumulatedIntersections: Intersection[]): Intersection[];
  hits(r: Ray, maxDistance: number): boolean;
}
