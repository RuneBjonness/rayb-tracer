import { equals } from './common';
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
    return (
      equals(this.x, v.x) &&
      equals(this.y, v.y) &&
      equals(this.z, v.z) &&
      equals(this.w, v.w)
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
    return Math.sqrt(
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  public normalize(): Vector4 {
    const m = 1 / this.magnitude();
    return this.scale(m);
  }

  public dot(v: Vector4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  public cross(v: Vector4): Vector4 {
    const x = this.x;
    const y = this.y;

    this.x = y * v.z - this.z * v.y;
    this.y = this.z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;
    this.w = 0;
    return this;
  }

  public reflect(normal: Vector4): Vector4 {
    const n = normal.clone();
    return this.subtract(n.scale(2 * this.dot(n)));
  }

  // prettier-ignore
  public applyMatrix(m: Matrix4): Vector4 {
    const x = this.x;
    const y = this.y;

    this.x = m.elements[0] * x + m.elements[1] * y + m.elements[2] * this.z + m.elements[3] * this.w;
    this.y = m.elements[4] * x + m.elements[5] * y + m.elements[6] * this.z + m.elements[7] * this.w;
    this.z = m.elements[8] * x + m.elements[9] * y + m.elements[10] * this.z + m.elements[11] * this.w;
    return this;
  }

  public applyMatrixBuffer(m: Float32Array): Vector4 {
    const x = this.x;
    const y = this.y;

    this.x = m[0] * x + m[1] * y + m[2] * this.z + m[3] * this.w;
    this.y = m[4] * x + m[5] * y + m[6] * this.z + m[7] * this.w;
    this.z = m[8] * x + m[9] * y + m[10] * this.z + m[11] * this.w;
    return this;
  }
}

export function point(x: number, y: number, z: number): Vector4 {
  return new Vector4(x, y, z, 1);
}

export function vector(x: number, y: number, z: number): Vector4 {
  return new Vector4(x, y, z, 0);
}

export function pointFromF32Array(f32view: Float32Array): Vector4 {
  return new Vector4(f32view[0], f32view[1], f32view[2], 1);
}

export function vectorFromF32Array(f32view: Float32Array): Vector4 {
  return new Vector4(f32view[0], f32view[1], f32view[2], 0);
}
