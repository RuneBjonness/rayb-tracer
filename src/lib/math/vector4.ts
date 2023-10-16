import { Matrix4 } from './matrices';

export class Vector4 {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w: number
  ) {}

  public clone(): Vector4 {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  public equals(v: Vector4): boolean {
    const eq = function (a: number, b: number): boolean {
      return Math.abs(a - b) < 0.00001 || (Number.isNaN(a) && Number.isNaN(b));
    };

    return (
      eq(this.x, v.x) && eq(this.y, v.y) && eq(this.z, v.z) && eq(this.w, v.w)
    );
  }

  public add(v: Vector4): Vector4 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  }

  public subtract(v: Vector4): Vector4 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  }

  public negate(): Vector4 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;
    return this;
  }

  public scale(scalar: number): Vector4 {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    this.w *= scalar;
    return this;
  }

  public divide(scalar: number): Vector4 {
    return this.scale(1 / scalar);
  }

  public multiply(v: Vector4): Vector4 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;
    this.w *= v.w;
    return this;
  }

  public magnitude(): number {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2 + this.w ** 2);
  }

  public normalize(): Vector4 {
    const m = 1 / this.magnitude();
    return this.scale(m);
  }

  public dot(v: Vector4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  public cross(v: Vector4): Vector4 {
    const [x, y, z] = [this.x, this.y, this.z];
    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    this.w = 0;
    return this;
  }

  public reflect(normal: Vector4): Vector4 {
    const n = normal.clone();
    return this.subtract(n.scale(2 * this.dot(n)));
  }

  public applyMatrix(m: Matrix4): Vector4 {
    const [x, y, z] = [this.x, this.y, this.z];
    this.x = m[0] * x + m[1] * y + m[2] * z + m[3] * this.w;
    this.y = m[4] * x + m[5] * y + m[6] * z + m[7] * this.w;
    this.z = m[8] * x + m[9] * y + m[10] * z + m[11] * this.w;
    return this;
  }
}

export function point(x: number, y: number, z: number): Vector4 {
  return new Vector4(x, y, z, 1);
}

export function vector(x: number, y: number, z: number): Vector4 {
  return new Vector4(x, y, z, 0);
}
