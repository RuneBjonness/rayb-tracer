import { Intersection } from '../intersections';
import {
  Matrix4,
  identityMatrix,
  inverse,
  multiplyMatrixByTuple,
  transpose,
} from '../matrices';
import { Ray, transform } from '../rays';
import { normalize, point, Tuple, vector } from '../tuples';
import { material, Material } from '../materials';
import { Bounds } from './bounds';
import { Group } from './group';
import { CsgShape } from './csg-shape';

export abstract class Shape {
  private _transform: Matrix4;
  public get transform() {
    return this._transform;
  }
  public set transform(m: Matrix4) {
    this._transform = m;
    this.invTransform = inverse(m);
    this.invTransformTransposed = transpose(this.invTransform);
  }

  material: Material;
  parent: Group | CsgShape | null = null;

  private invTransform: Matrix4;
  private invTransformTransposed: Matrix4;

  constructor() {
    this._transform = identityMatrix();
    this.invTransform = inverse(this._transform);
    this.invTransformTransposed = transpose(this.invTransform);
    this.material = material();
  }

  abstract bounds(): Bounds;

  intersects(r: Ray): Intersection[] {
    return this.localIntersects(transform(r, this.invTransform));
  }
  protected abstract localIntersects(r: Ray): Intersection[];

  normalAt(p: Tuple, i: Intersection | null = null): Tuple {
    return this.normalToWorld(this.localNormalAt(this.worldToObject(p), i));
  }
  protected abstract localNormalAt(p: Tuple, i: Intersection | null): Tuple;

  worldToObject(p: Tuple): Tuple {
    return multiplyMatrixByTuple(
      this.invTransform,
      this.parent ? this.parent.worldToObject(p) : p
    );
  }

  normalToWorld(n: Tuple): Tuple {
    let normal = multiplyMatrixByTuple(this.invTransformTransposed, n);
    normal[3] = 0;
    normal = normalize(normal);
    return this.parent ? this.parent.normalToWorld(normal) : normal;
  }

  pointToWorld(p: Tuple): Tuple {
    let point = multiplyMatrixByTuple(this.transform, p);
    return this.parent ? this.parent.pointToWorld(point) : point;
  }

  divide(threshold: number): void {
    return;
  }
}

export class TestShape extends Shape {
  localRayFromBase: Ray | null = null;

  constructor() {
    super();
  }

  bounds(): Bounds {
    return [point(-1, -1, -1), point(1, 1, 1)];
  }

  protected localIntersects(r: Ray): Intersection[] {
    this.localRayFromBase = r;
    return [];
  }

  protected localNormalAt(p: Tuple): Tuple {
    return vector(p[0], p[1], p[2]);
  }
}
