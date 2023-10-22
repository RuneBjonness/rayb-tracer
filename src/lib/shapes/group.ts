import { Intersection } from '../intersections';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import {
  Bounds,
  boundsContainsBounds,
  intersectsBounds,
  splitBounds,
  transformGroupBounds,
} from './bounds';
import { Shape } from './shape';

export class Group extends Shape {
  shapes: Shape[] = [];

  private groupBounds: Bounds | null = null;

  constructor() {
    super();
  }

  bounds(): Bounds {
    if (!this.groupBounds) {
      this.groupBounds = transformGroupBounds(this.shapes);
    }
    return this.groupBounds;
  }

  add(child: Shape) {
    child.parent = this;
    this.shapes.push(child);
  }

  override divide(threshold: number): void {
    if (this.shapes.length >= threshold) {
      const g1 = new Group();
      const g2 = new Group();
      const overlappingShapes: Shape[] = [];
      const [b1, b2] = splitBounds(this.bounds());

      for (const s of this.shapes) {
        const transformedShapeBounds = transformGroupBounds([s]);
        if (boundsContainsBounds(b1, transformedShapeBounds)) {
          g1.add(s);
        } else if (boundsContainsBounds(b2, transformedShapeBounds)) {
          g2.add(s);
        } else {
          overlappingShapes.push(s);
        }
      }

      this.shapes = overlappingShapes;
      if (g1.shapes.length > 0) {
        this.add(g1);
      }
      if (g2.shapes.length > 0) {
        this.add(g2);
      }
    }

    for (const s of this.shapes) {
      s.divide(threshold);
    }
  }

  protected localIntersects(r: Ray): Intersection[] {
    if (intersectsBounds(this.bounds(), r)) {
      const intersections: Intersection[] = [];
      for (const shape of this.shapes) {
        intersections.push(...shape.intersects(r));
      }
      return intersections.sort((a, b) => a.time - b.time);
    }
    return [];
  }

  protected localNormalAt(p: Vector4): Vector4 {
    throw new Error(
      "Groups don't have normal vectors, and if this is called we have done something wrong somewhere.."
    );
  }
}
