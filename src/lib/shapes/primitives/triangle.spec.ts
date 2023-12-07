import { point, vector } from '../../math/vector4';
import { Ray } from '../../rays';
import { Triangle } from './triangle';

describe('Triangles', () => {
  test('constructing a triangle', () => {
    const p1 = point(0, 1, 0);
    const p2 = point(-1, 0, 0);
    const p3 = point(1, 0, 0);
    const t = new Triangle(p1, p2, p3);

    expect(t.p1).toEqual(p1);
    expect(t.p2).toEqual(p2);
    expect(t.p3).toEqual(p3);

    expect(t.e1.equals(vector(-1, -1, 0))).toBe(true);
    expect(t.e2.equals(vector(1, -1, 0))).toBe(true);
    expect(t.normal.equals(vector(0, 0, -1))).toBe(true);
  });

  test('the normal of a triangle is constant everywhere', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));

    const n1 = t.normalAt(point(0, 0, 0));
    const n2 = t.normalAt(point(10, 0, -10));
    const n3 = t.normalAt(point(-5, 0, 150));

    expect(n1.equals(t.normal)).toBe(true);
    expect(n2.equals(t.normal)).toBe(true);
    expect(n3.equals(t.normal)).toBe(true);
  });

  test('a ray parallel with the triangle will not intersect', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(0, -1, -2), vector(0, 1, 0));
    const xs = t.intersects(r);

    expect(xs.length).toBe(0);
  });

  test('a ray misses the p1-p3 edge', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(1, 1, -2), vector(0, 0, 1));
    const xs = t.intersects(r);

    expect(xs.length).toBe(0);
  });

  test('a ray misses the p1-p2 edge', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(-1, 1, -2), vector(0, 0, 1));
    const xs = t.intersects(r);

    expect(xs.length).toBe(0);
  });

  test('a ray misses the p2-p3 edge', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(0, -1, -2), vector(0, 0, 1));
    const xs = t.intersects(r);

    expect(xs.length).toBe(0);
  });

  test('a ray strikes a triangle', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(0, 0.5, -2), vector(0, 0, 1));
    const xs = t.intersects(r);

    expect(xs.length).toBe(1);
    expect(xs[0].time).toEqual(2);
  });

  test('the bounds of a triangle', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));

    expect(t.bounds?.min).toEqual(point(-1, 0, 0));
    expect(t.bounds?.max).toEqual(point(1, 1, 0));
  });
});
