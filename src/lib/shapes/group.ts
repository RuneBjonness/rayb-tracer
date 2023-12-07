import { Intersection } from '../intersections';
import { Material } from '../materials';
import { Matrix4 } from '../math/matrices';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import { Bounds } from './bounds';
import { CsgShape } from './csg-shape';
import { BaseShape, Shape } from './shape';

export class Group extends BaseShape {
  shapes: Shape[] = [];

  constructor() {
    super();
  }

  add(child: Shape) {
    child.parent = this;
    this.shapes.push(child);
    this.bounds.merge(child.transformedBounds);
  }

  override divide(threshold: number): void {
    divideGroup(this, threshold);
  }

  protected localIntersects(r: Ray): Intersection[] {
    if (this.bounds.intersects(r)) {
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

export class SubGroup implements Shape {
  shapes: Shape[] = [];

  transform: Matrix4;
  material: Material;
  parent: Group | SubGroup | CsgShape | null;

  bounds: Bounds;
  transformedBounds: Bounds;

  constructor(parent: Group | SubGroup) {
    this.transform = parent.transform;
    this.material = parent.material;
    this.parent = parent;
    this.bounds = Bounds.empty();
    this.transformedBounds = this.bounds;
  }

  add(child: Shape) {
    this.shapes.push(child);
    this.bounds.merge(child.transformedBounds);
  }

  intersects(r: Ray): Intersection[] {
    if (this.bounds.intersects(r)) {
      const intersections: Intersection[] = [];
      for (const shape of this.shapes) {
        intersections.push(...shape.intersects(r));
      }
      return intersections.sort((a, b) => a.time - b.time);
    }
    return [];
  }
  normalAt(p: Vector4, i: Intersection | null): Vector4 {
    throw new Error('Method not implemented.');
  }
  worldToObject(p: Vector4): Vector4 {
    return p;
  }
  normalToWorld(n: Vector4): Vector4 {
    return n;
  }
  pointToWorld(p: Vector4): Vector4 {
    return p;
  }
  divide(threshold: number): void {
    divideGroup(this, threshold);
  }
}

function divideGroup(group: Group | SubGroup, threshold: number): void {
  if (group.shapes.length > threshold) {
    const g1 = new SubGroup(group);
    const g2 = new SubGroup(group);

    const overlappingShapes: Shape[] = [];
    const [b1, b2] = group.bounds.split();

    for (const s of group.shapes) {
      if (b1.containsBounds(s.transformedBounds)) {
        g1.add(s);
      } else if (b2.containsBounds(s.transformedBounds)) {
        g2.add(s);
      } else {
        overlappingShapes.push(s);
      }
    }

    if (g1.shapes.length > 0 || g2.shapes.length > 0) {
      group.shapes = [];
      if (g1.shapes.length > 0) {
        group.shapes.push(g1);
      }
      if (g2.shapes.length > 0) {
        group.shapes.push(g2);
      }

      if (overlappingShapes.length > threshold) {
        const g3 = new SubGroup(group);
        for (const s of overlappingShapes) {
          g3.add(s);
        }
        group.shapes.push(g3);
      } else {
        group.shapes.push(...overlappingShapes);
      }
    }
  }
  for (const s of group.shapes) {
    s.divide(threshold);
  }
}
