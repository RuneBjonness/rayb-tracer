import {
  Matrix4,
  identityMatrix,
  inverse,
  multiplyMatrixByTuple,
} from '../math/matrices';
import {
  color,
  Color,
  Tuple,
  multiplyColorByScalar,
  subtractColors,
  addColors,
} from '../math/tuples';
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

  colorAt(shape: Shape, p: Tuple): Color {
    const objectPoint = shape.worldToObject(p);
    const patternPoint = multiplyMatrixByTuple(this.invTransform, objectPoint);
    return this.localColorAt(patternPoint);
  }
  protected abstract localColorAt(p: Tuple): Color;
}

export class TestPattern extends Pattern {
  constructor() {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    return color(p[0], p[1], p[2]);
  }
}

export class StripePattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    return Math.floor(p[0]) % 2 === 0 ? this.a : this.b;
  }
}

export class GradientPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    const distance = subtractColors(this.b, this.a);
    const fraction = p[0] - Math.floor(p[0]);
    return addColors(this.a, multiplyColorByScalar(distance, fraction));
  }
}

export class RingPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    return Math.floor(Math.sqrt(p[0] ** 2 + p[2] ** 2)) % 2 === 0
      ? this.a
      : this.b;
  }
}

export class Checkers3dPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    return (Math.floor(p[0]) + Math.floor(p[1]) + Math.floor(p[2])) % 2 === 0
      ? this.a
      : this.b;
  }
}

export class RadialGradientPattern extends Pattern {
  constructor(public a: Color, public b: Color) {
    super();
  }

  protected localColorAt(p: Tuple): Color {
    const distance = subtractColors(this.b, this.a);
    const r = Math.sqrt(p[0] ** 2 + p[2] ** 2);
    const fraction = r - Math.floor(r);
    return addColors(this.a, multiplyColorByScalar(distance, fraction));
  }
}

export class SolidPattern extends Pattern {
  constructor(public c: Color) {
    super();
  }

  protected localColorAt(_p: Tuple): Color {
    return this.c;
  }
}

export class BlendedPatterns extends Pattern {
  constructor(public a: Pattern, public b: Pattern) {
    super();
  }

  colorAt(shape: Shape, p: Tuple): Color {
    return addColors(this.a.colorAt(shape, p), this.b.colorAt(shape, p));
  }
  protected localColorAt(p: Tuple): Color {
    // Not used in overriden colorAt()
    return [0, 0, 0];
  }
}
