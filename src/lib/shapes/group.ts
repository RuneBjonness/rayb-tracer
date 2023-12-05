import { Intersection } from '../intersections';
import { Material } from '../materials';
import { Matrix4 } from '../math/matrices';
import { Vector4 } from '../math/vector4';
import { Ray } from '../rays';
import {
  Bounds,
  boundsContainsBounds,
  boundsCorners,
  intersectsBounds,
  splitBounds,
  transformBounds,
  transformGroupBounds,
} from './bounds';
import { CsgShape } from './csg-shape';
import { BaseShape, Shape } from './shape';

export class Group extends BaseShape {
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
    divideGroup(this, threshold);
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

export class SubGroup implements Shape {
  private groupBounds: Bounds | null = null;
  shapes: Shape[] = [];

  transform: Matrix4;
  material: Material;
  parent: Group | SubGroup | CsgShape | null;

  private _transformedBoundsCorners: Vector4[] | null = null;
  public get transformedBoundsCorners(): Vector4[] {
    if (!this._transformedBoundsCorners) {
      this._transformedBoundsCorners = boundsCorners(this.bounds());
    }
    return this._transformedBoundsCorners;
  }

  constructor(parent: Group | SubGroup) {
    this.transform = parent.transform;
    this.material = parent.material;
    this.parent = parent;
  }

  add(child: Shape) {
    this.shapes.push(child);
  }

  bounds(): Bounds {
    if (!this.groupBounds) {
      this.groupBounds = transformGroupBounds(this.shapes);
    }
    return this.groupBounds;
  }
  intersects(r: Ray): Intersection[] {
    if (intersectsBounds(this.bounds(), r)) {
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
  if (group.shapes.length >= threshold) {
    const g1 = new SubGroup(group);
    const g2 = new SubGroup(group);
    const overlappingShapes: Shape[] = [];
    const [b1, b2] = splitBounds(group.bounds());

    for (const s of group.shapes) {
      const transformedShapeBounds = transformBounds(s);
      if (boundsContainsBounds(b1, transformedShapeBounds)) {
        g1.add(s);
      } else if (boundsContainsBounds(b2, transformedShapeBounds)) {
        g2.add(s);
      } else {
        overlappingShapes.push(s);
      }
    }

    group.shapes = overlappingShapes;
    if (g1.shapes.length > 0) {
      group.add(g1);
    }
    if (g2.shapes.length > 0) {
      group.add(g2);
    }
  }

  for (const s of group.shapes) {
    s.divide(threshold);
  }
}
