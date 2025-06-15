import { Matrix4 } from '../math/matrices';
import { Vector4, point } from '../math/vector4';
import { Ray } from '../rays';

export class Bounds {
  static empty(): Bounds {
    return new Bounds(
      point(Infinity, Infinity, Infinity),
      point(-Infinity, -Infinity, -Infinity)
    );
  }

  static fromPoints(points: Vector4[]): Bounds {
    const xComponents = points.map((p) => p.x);
    const yComponents = points.map((p) => p.y);
    const zComponents = points.map((p) => p.z);

    return new Bounds(
      point(
        Math.min(...xComponents),
        Math.min(...yComponents),
        Math.min(...zComponents)
      ),
      point(
        Math.max(...xComponents),
        Math.max(...yComponents),
        Math.max(...zComponents)
      )
    );
  }

  constructor(
    public min: Vector4,
    public max: Vector4
  ) {}

  clone(): Bounds {
    return new Bounds(this.min.clone(), this.max.clone());
  }

  private corners(): Vector4[] {
    return [
      point(this.min.x, this.min.y, this.min.z),
      point(this.min.x, this.min.y, this.max.z),
      point(this.min.x, this.max.y, this.max.z),
      point(this.min.x, this.max.y, this.min.z),
      point(this.max.x, this.min.y, this.min.z),
      point(this.max.x, this.min.y, this.max.z),
      point(this.max.x, this.max.y, this.max.z),
      point(this.max.x, this.max.y, this.min.z),
    ];
  }

  public containsPoint(p: Vector4): boolean {
    return (
      p.x >= this.min.x &&
      p.x <= this.max.x &&
      p.y >= this.min.y &&
      p.y <= this.max.y &&
      p.z >= this.min.z &&
      p.z <= this.max.z
    );
  }

  public containsBounds(b: Bounds): boolean {
    return this.containsPoint(b.min) && this.containsPoint(b.max);
  }

  public split(): [Bounds, Bounds] {
    let x0 = this.min.x;
    let y0 = this.min.y;
    let z0 = this.min.z;
    let x1 = this.max.x;
    let y1 = this.max.y;
    let z1 = this.max.z;

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dz = z1 - z0;

    const greatestAxis = Math.max(dx, dy, dz);

    if (greatestAxis === dx) {
      x0 = x1 = x0 + dx / 2.0;
    } else if (greatestAxis === dy) {
      y0 = y1 = y0 + dy / 2.0;
    } else {
      z0 = z1 = z0 + dz / 2.0;
    }

    return [
      new Bounds(this.min, point(x1, y1, z1)),
      new Bounds(point(x0, y0, z0), this.max),
    ];
  }

  public transform(m: Matrix4): Bounds {
    const corners = this.corners().map((c) => c.applyMatrix(m));
    const transformed = Bounds.fromPoints(corners);
    this.min = transformed.min;
    this.max = transformed.max;
    return this;
  }

  public merge(b: Bounds): Bounds {
    this.min = point(
      Math.min(this.min.x, b.min.x),
      Math.min(this.min.y, b.min.y),
      Math.min(this.min.z, b.min.z)
    );
    this.max = point(
      Math.max(this.max.x, b.max.x),
      Math.max(this.max.y, b.max.y),
      Math.max(this.max.z, b.max.z)
    );
    return this;
  }

  public intersects(r: Ray): boolean {
    return intersectsBounds(r, this.min, this.max);
  }
}

export function intersectsBounds(
  r: Ray,
  boundMin: Vector4,
  boundMax: Vector4
): boolean {
  const tx1 = (boundMin.x - r.origin.x) / r.direction.x;
  const tx2 = (boundMax.x - r.origin.x) / r.direction.x;
  const ty1 = (boundMin.y - r.origin.y) / r.direction.y;
  const ty2 = (boundMax.y - r.origin.y) / r.direction.y;
  const tz1 = (boundMin.z - r.origin.z) / r.direction.z;
  const tz2 = (boundMax.z - r.origin.z) / r.direction.z;

  const tmin = Math.max(
    Math.min(tx1, tx2),
    Math.min(ty1, ty2),
    Math.min(tz1, tz2),
    0
  );
  const tmax = Math.min(
    Math.max(tx1, tx2),
    Math.max(ty1, ty2),
    Math.max(tz1, tz2)
  );

  return tmin <= tmax;
}
