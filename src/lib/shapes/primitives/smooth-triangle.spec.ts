import { intersection, prepareComputations } from '../../intersections';
import { point, vector } from '../../math/vector4';
import { Ray } from '../../rays';
import { SmoothTriangle } from './smooth-triangle';

describe('Smooth Triangles', () => {
  const p1 = point(0, 1, 0);
  const p2 = point(-1, 0, 0);
  const p3 = point(1, 0, 0);
  const n1 = vector(0, 1, 0);
  const n2 = vector(-1, 0, 0);
  const n3 = vector(1, 0, 0);
  const tri = new SmoothTriangle(p1, p2, p3, n1, n2, n3);

  test('constructing a smooth triangle', () => {
    expect(tri.p1).toEqual(p1);
    expect(tri.p2).toEqual(p2);
    expect(tri.p3).toEqual(p3);
    expect(tri.n1).toEqual(n1);
    expect(tri.n2).toEqual(n2);
    expect(tri.n3).toEqual(n3);
  });

  test('the bounds of a smooth triangle', () => {
    expect(tri.localBounds?.min).toEqual(point(-1, 0, 0));
    expect(tri.localBounds?.max).toEqual(point(1, 1, 0));
  });

  test('an intersection with a smooth triangle stores u/v', () => {
    const r = new Ray(point(-0.2, 0.3, -2), vector(0, 0, 1));
    const xs = tri.intersects(r);

    expect(xs[0].u).toBeCloseTo(0.45);
    expect(xs[0].v).toBeCloseTo(0.25);
  });

  test('a smooth triangle uses u/v to interpolate the normal', () => {
    const i = intersection(1, tri, 0.45, 0.25);
    const n = tri.normalAt(point(0, 0, 0), i);

    expect(n.equals(vector(-0.5547, 0.83205, 0))).toBe(true);
  });

  test('preparing the normal on a smooth triangle', () => {
    const i = intersection(1, tri, 0.45, 0.25);
    const r = new Ray(point(-0.2, 0.3, -2), vector(0, 0, 1));
    const comps = prepareComputations(i, r);

    expect(comps.normalv.equals(vector(-0.5547, 0.83205, 0))).toBe(true);
  });
});
