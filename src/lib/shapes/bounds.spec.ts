import { describe, expect, test } from 'vitest';
import { Bounds } from './bounds';
import { point } from '../math/vector4';

describe('Bounds', () => {
  test.each`
    p                  | result
    ${point(5, -2, 0)} | ${true}
    ${point(11, 4, 7)} | ${true}
    ${point(8, 1, 3)}  | ${true}
    ${point(3, 0, 3)}  | ${false}
    ${point(8, -4, 3)} | ${false}
    ${point(8, 1, -1)} | ${false}
    ${point(13, 1, 3)} | ${false}
    ${point(8, 5, 3)}  | ${false}
    ${point(8, 1, 8)}  | ${false}
  `('checking to see if a box contains a given point', ({ p, result }) => {
    const b = new Bounds(point(5, -2, 0), point(11, 4, 7));

    expect(b.containsPoint(p)).toEqual(result);
  });

  test.each`
    min                 | max                | result
    ${point(5, -2, 0)}  | ${point(11, 4, 7)} | ${true}
    ${point(6, -1, 1)}  | ${point(10, 3, 6)} | ${true}
    ${point(4, -3, -1)} | ${point(10, 3, 6)} | ${false}
    ${point(6, -1, 1)}  | ${point(12, 5, 8)} | ${false}
  `(
    'checking to see if a box contains a given point',
    ({ min, max, result }) => {
      const b1 = new Bounds(point(5, -2, 0), point(11, 4, 7));
      const b2 = new Bounds(min, max);

      expect(b1.containsBounds(b2)).toEqual(result);
    }
  );

  test('splitting an x-wide bounding box', () => {
    const b = new Bounds(point(-1, -2, -3), point(9, 5.5, 3));
    const [left, right] = b.split();

    expect(left.min).toEqual(point(-1, -2, -3));
    expect(left.max).toEqual(point(4, 5.5, 3));
    expect(right.min).toEqual(point(4, -2, -3));
    expect(right.max).toEqual(point(9, 5.5, 3));
  });

  test('splitting an y-wide bounding box', () => {
    const b = new Bounds(point(-1, -2, -3), point(5, 8, 3));
    const [left, right] = b.split();

    expect(left.min).toEqual(point(-1, -2, -3));
    expect(left.max).toEqual(point(5, 3, 3));
    expect(right.min).toEqual(point(-1, 3, -3));
    expect(right.max).toEqual(point(5, 8, 3));
  });

  test('splitting an z-wide bounding box', () => {
    const b = new Bounds(point(-1, -2, -3), point(5, 3, 7));
    const [left, right] = b.split();

    expect(left.min).toEqual(point(-1, -2, -3));
    expect(left.max).toEqual(point(5, 3, 2));
    expect(right.min).toEqual(point(-1, -2, 2));
    expect(right.max).toEqual(point(5, 3, 7));
  });
});
