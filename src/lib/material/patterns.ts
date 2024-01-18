import { Color } from '../math/color';
import { Matrix4 } from '../math/matrices';
import { Vector4 } from '../math/vector4';
import { Shape } from '../shapes/shape';

export abstract class Pattern {
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
}

export class StripePattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return Math.floor(p.x) % 2 === 0 ? this.a.clone() : this.b.clone();
  }
}

export class GradientPattern extends Pattern {
  distance: Color;
  constructor(public a: Color, public b: Color) {
    super();
    this.distance = this.b.clone().subtract(this.a);
  }

  protected localColorAt(p: Vector4): Color {
    const fraction = p.x - Math.floor(p.x);
    return this.a.clone().add(this.distance.clone().multiplyByScalar(fraction));
  }
}

export class RingPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return Math.floor(Math.sqrt(p.x * p.x + p.z * p.z)) % 2 === 0
      ? this.a.clone()
      : this.b.clone();
  }
}

export class Checkers3dPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return (Math.floor(p.x) + Math.floor(p.y) + Math.floor(p.z)) % 2 === 0
      ? this.a.clone()
      : this.b.clone();
  }
}

export class RadialGradientPattern extends Pattern {
  distance: Color;
  constructor(public a: Color, public b: Color) {
    super();
    this.distance = this.b.clone().subtract(this.a);
  }

  protected localColorAt(p: Vector4): Color {
    const r = Math.sqrt(p.x * p.x + p.z * p.z);
    const fraction = r - Math.floor(r);
    return this.a.clone().add(this.distance.clone().multiplyByScalar(fraction));
  }
}

export class SolidPattern extends Pattern {
  constructor(public c: Color) {
    super();
  }

  protected localColorAt(_p: Vector4): Color {
    return this.c.clone();
  }
}

export class BlendedPatterns extends Pattern {
  constructor(public a: Pattern, public b: Pattern) {
    super();
  }

  colorAt(shape: Shape, p: Vector4): Color {
    return this.a.colorAt(shape, p).add(this.b.colorAt(shape, p));
  }
  protected localColorAt(p: Vector4): Color {
    // Not used in overriden colorAt()
    return new Color(0, 0, 0);
  }
}
