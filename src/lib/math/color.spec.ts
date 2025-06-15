import { expect, test } from 'vitest';
import { Color, colorFromHex, colorFromRgbUint8 } from './color';

test('colors are (red, green, blue) tuples', () => {
  const { r, g, b } = new Color(-0.5, 0.4, 1.7);

  expect(r).toBe(-0.5);
  expect(g).toBe(0.4);
  expect(b).toBe(1.7);
});

test('two colors are equal if no values have a difference greater than 0.00001 ', () => {
  const c1: Color = new Color(1, 0.00001, 0);
  const c2: Color = new Color(1, 0.000019, 0);

  expect(c1.equals(c2)).toBe(true);
});

test('two tuples are not equal if any value has a difference greater than 0.00001 ', () => {
  const c1: Color = new Color(1, 0.00001, 0);
  const c2: Color = new Color(1, 0.00003, 0);

  expect(c1.equals(c2)).toBe(false);
});

test('adding colors', () => {
  const c = new Color(0.9, 0.6, 0.75).add(new Color(0.7, 0.1, 0.25));

  expect(c.equals(new Color(1.6, 0.7, 1))).toBe(true);
});

test('subtracting colors', () => {
  const c = new Color(0.9, 0.6, 0.75).subtract(new Color(0.7, 0.1, 0.25));

  expect(c.equals(new Color(0.2, 0.5, 0.5))).toBe(true);
});

test('multiplying a color by a scalar', () => {
  const c = new Color(0.2, 0.3, 0.4).multiplyByScalar(2);

  expect(c.equals(new Color(0.4, 0.6, 0.8))).toBe(true);
});

test('multiplying colors', () => {
  const c = new Color(1, 0.2, 0.4).multiply(new Color(0.9, 1, 0.1));

  expect(c.equals(new Color(0.9, 0.2, 0.04))).toBe(true);
});

test('constructing a color from rgb uint8 values', () => {
  const c = colorFromRgbUint8(255, 0, 153);

  expect(c.equals(new Color(1, 0, 0.6))).toBe(true);
});

test('constructing a color from a hex string', () => {
  const c = colorFromHex('#FF0099');

  expect(c.equals(new Color(1, 0, 0.6))).toBe(true);
});
