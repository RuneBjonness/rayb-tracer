import { expect, test } from 'vitest';
import { scaling, translation } from './math/transformations';
import { point, vector } from './math/vector4';
import { Ray } from './rays';

test('creating and accessing a ray', () => {
  const origin = point(1, 2, 3);
  const direction = vector(4, 5, 6);
  const r = new Ray(origin, direction);

  expect(r.origin.equals(origin)).toBe(true);
  expect(r.direction.equals(direction)).toBe(true);
});

test('computing a point from a distance', () => {
  const r = new Ray(point(2, 3, 4), vector(1, 0, 0));

  expect(r.position(0).equals(point(2, 3, 4))).toBe(true);
  expect(r.position(1).equals(point(3, 3, 4))).toBe(true);
  expect(r.position(-1).equals(point(1, 3, 4))).toBe(true);
  expect(r.position(2.5).equals(point(4.5, 3, 4))).toBe(true);
});

test('translating a ray', () => {
  const r = new Ray(point(1, 2, 3), vector(0, 1, 0));
  const m = translation(3, 4, 5);

  r.transform(m);

  expect(r.origin.equals(point(4, 6, 8))).toBe(true);
  expect(r.direction.equals(vector(0, 1, 0))).toBe(true);
});

test('scaling a ray', () => {
  const r = new Ray(point(1, 2, 3), vector(0, 1, 0));
  const m = scaling(2, 3, 4);

  r.transform(m);

  expect(r.origin.equals(point(2, 6, 12))).toBe(true);
  expect(r.direction.equals(vector(0, 3, 0))).toBe(true);
});
