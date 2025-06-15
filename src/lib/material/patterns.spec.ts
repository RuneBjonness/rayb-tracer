import { describe, expect, test } from 'vitest';
import {
  Checkers3dPattern,
  GradientPattern,
  Pattern,
  RadialGradientPattern,
  RingPattern,
  SolidPattern,
  StripePattern,
} from './patterns';
import { TransformableSphere } from '../shapes/primitives/sphere';
import { scaling, translation } from '../math/transformations';
import { Color } from '../math/color';
import { Vector4, point } from '../math/vector4';
import { Matrix4 } from '../math/matrices';

export class TestPattern extends Pattern {
  constructor() {
    super();
  }

  protected localColorAt(p: Vector4): Color {
    return new Color(p.x, p.y, p.z);
  }

  protected copyCustomToArrayBuffer(
    _buffer: ArrayBufferLike,
    _offset: number
  ): number {
    throw new Error('Method not implemented.');
  }
}

describe('Common pattern features', () => {
  test('the default transformation', () => {
    const p = new TestPattern();
    expect(p.transform.equals(new Matrix4())).toEqual(true);
  });

  test('assigning transformation', () => {
    const p = new TestPattern();
    const t = translation(1, 2, 3);
    p.transform = t;

    expect(p.transform.equals(t)).toEqual(true);
  });

  test('a pattern with an object transformation', () => {
    const s = new TransformableSphere();
    s.transform = scaling(2, 2, 2);
    const p = new TestPattern();
    const c = p.colorAt(s, point(2, 3, 4));

    expect(c.equals(new Color(1, 1.5, 2))).toEqual(true);
  });

  test('a pattern with a pattern transformation', () => {
    const s = new TransformableSphere();
    const p = new TestPattern();
    p.transform = scaling(2, 2, 2);
    const c = p.colorAt(s, point(2, 3, 4));

    expect(c.equals(new Color(1, 1.5, 2))).toEqual(true);
  });

  test('a pattern with both an object and a pattern transformation', () => {
    const s = new TransformableSphere();
    s.transform = scaling(2, 2, 2);
    const p = new TestPattern();
    p.transform = translation(0.5, 1, 1.5);
    const c = p.colorAt(s, point(2.5, 3, 3.5));

    expect(c.equals(new Color(0.75, 0.5, 0.25))).toEqual(true);
  });
});

describe('Stripe pattern', () => {
  const black = new Color(0, 0, 0);
  const white = new Color(1, 1, 1);
  const s = new TransformableSphere();
  const p = new StripePattern(white, black);

  test('creating a stripe pattern', () => {
    expect(p.a).toEqual(white);
    expect(p.b).toEqual(black);
  });

  test('a stripe pattern is contant in y', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0, 1, 0))).toEqual(white);
    expect(p.colorAt(s, point(0, 2, 0))).toEqual(white);
  });

  test('a stripe pattern is contant in z', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0, 0, 1))).toEqual(white);
    expect(p.colorAt(s, point(0, 0, 2))).toEqual(white);
  });

  test('a stripe pattern alternates in x', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0.9, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(1, 0, 0))).toEqual(black);
    expect(p.colorAt(s, point(-0.1, 0, 0))).toEqual(black);
    expect(p.colorAt(s, point(-1, 0, 0))).toEqual(black);
    expect(p.colorAt(s, point(-1.1, 0, 0))).toEqual(white);
  });
});

describe('Gradient pattern', () => {
  const black = new Color(0, 0, 0);
  const white = new Color(1, 1, 1);
  const s = new TransformableSphere();
  const p = new GradientPattern(white, black);

  test('a gradient linearly interpolates between colors', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0.25, 0, 0))).toEqual(
      new Color(0.75, 0.75, 0.75)
    );
    expect(p.colorAt(s, point(0.5, 0, 0))).toEqual(new Color(0.5, 0.5, 0.5));
    expect(p.colorAt(s, point(0.75, 0, 0))).toEqual(
      new Color(0.25, 0.25, 0.25)
    );
  });
});

describe('Ring pattern', () => {
  const black = new Color(0, 0, 0);
  const white = new Color(1, 1, 1);
  const p = new RingPattern(white, black);
  const s = new TransformableSphere();

  test('a ring should extend in both x and z', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(1, 0, 0))).toEqual(black);
    expect(p.colorAt(s, point(0, 0, 1))).toEqual(black);
    expect(p.colorAt(s, point(0.708, 0, 0.708))).toEqual(black);
  });
});

describe('Checkers 3D pattern', () => {
  const black = new Color(0, 0, 0);
  const white = new Color(1, 1, 1);
  const p = new Checkers3dPattern(white, black);
  const s = new TransformableSphere();

  test('should repeat in x', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0.99, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(1.01, 0, 0))).toEqual(black);
  });

  test('should repeat in y', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0, 0.99, 0))).toEqual(white);
    expect(p.colorAt(s, point(0, 1.01, 0))).toEqual(black);
  });

  test('should repeat in z', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0, 0, 0.99))).toEqual(white);
    expect(p.colorAt(s, point(0, 0, 1.01))).toEqual(black);
  });
});

describe('Radial Gradient pattern', () => {
  const black = new Color(0, 0, 0);
  const white = new Color(1, 1, 1);
  const s = new TransformableSphere();
  const p = new RadialGradientPattern(white, black);

  test('a radial gradient linearly interpolates between colors in both x and z', () => {
    expect(p.colorAt(s, point(0, 0, 0))).toEqual(white);
    expect(p.colorAt(s, point(0.25, 0, 0))).toEqual(
      new Color(0.75, 0.75, 0.75)
    );
    expect(p.colorAt(s, point(0, 0, 0.5))).toEqual(new Color(0.5, 0.5, 0.5));
    expect(p.colorAt(s, point(0.75, 0, 0))).toEqual(
      new Color(0.25, 0.25, 0.25)
    );
    expect(p.colorAt(s, point(0.707107, 0, 0.707107)).equals(white)).toBe(true);
  });
});

describe('Solid pattern', () => {
  const white = new Color(1, 1, 1);
  const p = new SolidPattern(white);
  const s = new TransformableSphere();

  test('any point should return the specified color', () => {
    expect(p.colorAt(s, point(0, 0, 0)).equals(white));
    expect(p.colorAt(s, point(-0.7, 10, 0.33)).equals(white));
  });
});
