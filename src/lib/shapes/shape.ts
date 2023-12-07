import { Intersection } from '../intersections';
import { Matrix4 } from '../math/matrices';
import { Ray } from '../rays';
import { material, Material } from '../materials';
import { Bounds } from './bounds';
import { Group, SubGroup } from './group';
import { CsgShape } from './csg-shape';
import { Vector4, point, vector } from '../math/vector4';

export interface Shape {
  transform: Matrix4;
  material: Material;
  parent: Group | SubGroup | CsgShape | null;
  bounds: Bounds;
  transformedBounds: Bounds;

  intersects(r: Ray): Intersection[];
  normalAt(p: Vector4, i: Intersection | null): Vector4;
  worldToObject(p: Vector4): Vector4;
  normalToWorld(n: Vector4): Vector4;
  pointToWorld(p: Vector4): Vector4;
  divide(threshold: number): void;
}

export abstract class BaseShape implements Shape {
  private _transform: Matrix4;
  public get transform() {
    return this._transform;
  }
  public set transform(m: Matrix4) {
    this._transform = m;
    this.invTransform = m.clone().inverse();
    this.invTransformTransposed = this.invTransform.clone().transpose();
  }

  material: Material;
  parent: Group | CsgShape | null = null;

  bounds: Bounds;

  private _transformedBounds: Bounds | null = null;
  public get transformedBounds(): Bounds {
    if (!this._transformedBounds) {
      this._transformedBounds = this.bounds.clone().transform(this.transform);
    }
    return this._transformedBounds;
  }

  private invTransform: Matrix4;
  private invTransformTransposed: Matrix4;

  constructor() {
    this._transform = new Matrix4();
    this.invTransform = new Matrix4();
    this.invTransformTransposed = new Matrix4();
    this.material = material();
    this.bounds = Bounds.empty();
  }

  intersects(r: Ray): Intersection[] {
    return this.localIntersects(r.clone().transform(this.invTransform));
  }
  protected abstract localIntersects(r: Ray): Intersection[];

  normalAt(p: Vector4, i: Intersection | null = null): Vector4 {
    return this.normalToWorld(this.localNormalAt(this.worldToObject(p), i));
  }
  protected abstract localNormalAt(p: Vector4, i: Intersection | null): Vector4;

  worldToObject(p: Vector4): Vector4 {
    const point = this.parent ? this.parent.worldToObject(p) : p.clone();
    return point.applyMatrix(this.invTransform);
  }

  normalToWorld(n: Vector4): Vector4 {
    let normal = n.clone().applyMatrix(this.invTransformTransposed);
    normal.w = 0;
    normal.normalize();
    return this.parent ? this.parent.normalToWorld(normal) : normal;
  }

  pointToWorld(p: Vector4): Vector4 {
    let point = p.clone().applyMatrix(this.transform);
    return this.parent ? this.parent.pointToWorld(point) : point;
  }

  divide(threshold: number): void {
    return;
  }
}

export class TestShape extends BaseShape {
  localRayFromBase: Ray | null = null;

  constructor() {
    super();
  }

  protected localIntersects(r: Ray): Intersection[] {
    this.localRayFromBase = r;
    return [];
  }

  protected localNormalAt(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }
}
