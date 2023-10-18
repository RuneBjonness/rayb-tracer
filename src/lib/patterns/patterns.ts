import { Matrix4, identityMatrix, inverse } from '../math/matrices';
import {
  color,
  Color,
  multiplyColorByScalar,
  subtractColors,
  addColors,
} from '../math/tuples';
import { Vector4 } from '../math/vector4';
import { Shape } from '../shapes/shape';

export abstract class Pattern {
  private _transform: Matrix4;
  public get transform() {
    return this._transform;
  }
  public set transform(m: Matrix4) {
    this._transform = m;
    this.invTransform = inverse(m);
  }

  private invTransform: Matrix4;

  constructor() {
    this._transform = identityMatrix();
    this.invTransform = inverse(this._transform);
  }

  colorAt(shape: Shape, p: Vector4): Color {
    const objectPoint = shape.worldToObject(p);
    const patternPoint = objectPoint.applyMatrix(this.invTransform);
    return this.localColorAt(patternPoint);
  }
  protected abstract localColorAt(p: Vector4): Color;
}

export class TestPattern extends Pattern {
  constructor() {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return color(p.x, p.y, p.z);
  }
}

export class StripePattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return Math.floor(p.x) % 2 === 0 ? this.a : this.b;
  }
}

export class GradientPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    const distance = subtractColors(this.b, this.a);
    const fraction = p.x - Math.floor(p.x);
    return addColors(this.a, multiplyColorByScalar(distance, fraction));
  }
}

export class RingPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return Math.floor(Math.sqrt(p.x ** 2 + p.z ** 2)) % 2 === 0
      ? this.a
      : this.b;
  }
}

export class Checkers3dPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return (Math.floor(p.x) + Math.floor(p.y) + Math.floor(p.z)) % 2 === 0
      ? this.a
      : this.b;
  }
}

export class RadialGradientPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    const distance = subtractColors(this.b, this.a);
    const r = Math.sqrt(p.x ** 2 + p.z ** 2);
    const fraction = r - Math.floor(r);
    return addColors(this.a, multiplyColorByScalar(distance, fraction));
  }
}

export class SolidPattern extends Pattern {
  constructor(public c: Color) {
    super();
  }

  protected localColorAt(_p: Vector4): Color {
    return this.c;
  }
}

export class BlendedPatterns extends Pattern {
  constructor(public a: Pattern, public b: Pattern) {
    super();
  }

  colorAt(shape: Shape, p: Vector4): Color {
    return addColors(this.a.colorAt(shape, p), this.b.colorAt(shape, p));
  }
  protected localColorAt(p: Vector4): Color {
    // Not used in overriden colorAt()
    return [0, 0, 0];
  }
}
