import { Color } from '../math/color';
import { Matrix4, MatrixOrder } from '../math/matrices';
import { Vector4 } from '../math/vector4';
import { Shape } from '../shapes/shape';
import { PATTERN_BYTE_SIZE } from './patterns-buffer';

export enum PatternType {
  Solid = 0,
  Stripe = 1,
  Checkers3d = 2,
  Gradient = 3,
  Ring = 4,
  RadialGradient = 5,
  Blended = 6,
  TextureMapCheckers = 7,
  TextureMapImage = 8,
  CubeMap = 9,
}
export abstract class Pattern {
  protected type = PatternType.Solid;

  private _transform: Matrix4;
  public get transform() {
    return this._transform;
  }
  public set transform(m: Matrix4) {
    this._transform = m;
    this.invTransform = m.clone().inverse();
  }

  private invTransform: Matrix4;

  constructor() {
    this._transform = new Matrix4();
    this.invTransform = new Matrix4();
  }

  colorAt(shape: Shape, p: Vector4): Color {
    const objectPoint = shape.worldToObject(p);
    const patternPoint = objectPoint.applyMatrix(this.invTransform);
    return this.localColorAt(patternPoint);
  }
  protected abstract localColorAt(p: Vector4): Color;

  copyToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number,
    order: MatrixOrder
  ): number {
    const u32view = new Uint32Array(buffer, offset, 2);
    u32view[0] = this.type;
    u32view[1] = 0;
    this.invTransform.copyToArrayBuffer(buffer, offset + 48, order);
    return this.copyCustomToArrayBuffer(buffer, offset, order);
  }
  protected abstract copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number,
    order: MatrixOrder
  ): number;

  arrayBufferByteLength(): number {
    return PATTERN_BYTE_SIZE;
  }
}

export class StripePattern extends Pattern {
  constructor(
    public a: Color,
    public b: Color
  ) {
    super();
    this.type = PatternType.Stripe;
  }

  protected localColorAt(p: Vector4): Color {
    return Math.floor(p.x) % 2 === 0 ? this.a.clone() : this.b.clone();
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const f32view = new Float32Array(buffer, offset, 12);
    f32view[4] = this.a.r;
    f32view[5] = this.a.g;
    f32view[6] = this.a.b;

    f32view[8] = this.b.r;
    f32view[9] = this.b.g;
    f32view[10] = this.b.b;

    return offset + PATTERN_BYTE_SIZE;
  }
}

export class GradientPattern extends Pattern {
  distance: Color;
  constructor(
    public a: Color,
    public b: Color
  ) {
    super();
    this.type = PatternType.Gradient;
    this.distance = this.b.clone().subtract(this.a);
  }

  protected localColorAt(p: Vector4): Color {
    const fraction = p.x - Math.floor(p.x);
    return this.a.clone().add(this.distance.clone().multiplyByScalar(fraction));
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const f32view = new Float32Array(buffer, offset, 12);
    f32view[4] = this.a.r;
    f32view[5] = this.a.g;
    f32view[6] = this.a.b;

    f32view[8] = this.distance.r;
    f32view[9] = this.distance.g;
    f32view[10] = this.distance.b;

    return offset + PATTERN_BYTE_SIZE;
  }
}

export class RingPattern extends Pattern {
  constructor(
    public a: Color,
    public b: Color
  ) {
    super();
    this.type = PatternType.Ring;
  }

  protected localColorAt(p: Vector4): Color {
    return Math.floor(Math.sqrt(p.x * p.x + p.z * p.z)) % 2 === 0
      ? this.a.clone()
      : this.b.clone();
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const f32view = new Float32Array(buffer, offset, 12);
    f32view[4] = this.a.r;
    f32view[5] = this.a.g;
    f32view[6] = this.a.b;

    f32view[8] = this.b.r;
    f32view[9] = this.b.g;
    f32view[10] = this.b.b;

    return offset + PATTERN_BYTE_SIZE;
  }
}

export class Checkers3dPattern extends Pattern {
  constructor(
    public a: Color,
    public b: Color
  ) {
    super();
    this.type = PatternType.Checkers3d;
  }

  protected localColorAt(p: Vector4): Color {
    return (Math.floor(p.x) + Math.floor(p.y) + Math.floor(p.z)) % 2 === 0
      ? this.a.clone()
      : this.b.clone();
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const f32view = new Float32Array(buffer, offset, 12);
    f32view[4] = this.a.r;
    f32view[5] = this.a.g;
    f32view[6] = this.a.b;

    f32view[8] = this.b.r;
    f32view[9] = this.b.g;
    f32view[10] = this.b.b;

    return offset + PATTERN_BYTE_SIZE;
  }
}

export class RadialGradientPattern extends Pattern {
  distance: Color;
  constructor(
    public a: Color,
    public b: Color
  ) {
    super();
    this.type = PatternType.RadialGradient;
    this.distance = this.b.clone().subtract(this.a);
  }

  protected localColorAt(p: Vector4): Color {
    const r = Math.sqrt(p.x * p.x + p.z * p.z);
    const fraction = r - Math.floor(r);
    return this.a.clone().add(this.distance.clone().multiplyByScalar(fraction));
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const f32view = new Float32Array(buffer, offset, 12);
    f32view[4] = this.a.r;
    f32view[5] = this.a.g;
    f32view[6] = this.a.b;

    f32view[8] = this.distance.r;
    f32view[9] = this.distance.g;
    f32view[10] = this.distance.b;

    return offset + PATTERN_BYTE_SIZE;
  }
}

export class SolidPattern extends Pattern {
  constructor(public c: Color) {
    super();
    this.type = PatternType.Solid;
  }

  protected localColorAt(_p: Vector4): Color {
    return this.c.clone();
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number
  ): number {
    const f32view = new Float32Array(buffer, offset, 12);
    f32view[4] = this.c.r;
    f32view[5] = this.c.g;
    f32view[6] = this.c.b;

    return offset + PATTERN_BYTE_SIZE;
  }
}

export class BlendedPatterns extends Pattern {
  constructor(
    public a: Pattern,
    public b: Pattern
  ) {
    super();
    this.type = PatternType.Blended;
  }

  colorAt(shape: Shape, p: Vector4): Color {
    return this.a.colorAt(shape, p).add(this.b.colorAt(shape, p));
  }
  protected localColorAt(_p: Vector4): Color {
    // Not used in overriden colorAt()
    return new Color(0, 0, 0);
  }

  protected copyCustomToArrayBuffer(
    buffer: ArrayBufferLike,
    offset: number,
    order: MatrixOrder
  ): number {
    var nextOffset = offset + PATTERN_BYTE_SIZE;
    const u32view = new Uint32Array(buffer, offset, 4);
    u32view[2] = nextOffset / PATTERN_BYTE_SIZE;
    nextOffset = this.a.copyToArrayBuffer(buffer, nextOffset, order);
    u32view[3] = nextOffset / PATTERN_BYTE_SIZE;
    nextOffset = this.b.copyToArrayBuffer(buffer, nextOffset, order);

    return nextOffset;
  }

  arrayBufferByteLength(): number {
    return (
      PATTERN_BYTE_SIZE +
      this.a.arrayBufferByteLength() +
      this.b.arrayBufferByteLength()
    );
  }
}
