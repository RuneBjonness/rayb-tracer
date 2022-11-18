import { ray } from '../../rays';
import { areEqual, point, vector } from '../../tuples';
import { Plane } from './plane';

describe('Planes', () => {
  test('the normal of a plane is constant everywhere', () => {
    const p = new Plane();
    const n1 = p.normalAt(point(0, 0, 0));
    const n2 = p.normalAt(point(10, 0, -10));
    const n3 = p.normalAt(point(-5, 0, 150));

    expect(areEqual(n1, vector(0, 1, 0))).toBe(true);
    expect(areEqual(n2, vector(0, 1, 0))).toBe(true);
    expect(areEqual(n3, vector(0, 1, 0))).toBe(true);
  });

  test('a ray parallel with the plane will not intersect', () => {
    const p = new Plane();
    const r = ray(point(0, 10, 0), vector(0, 0, 1));
    const xs = p.intersects(r);

    expect(xs.length).toBe(0);
  });

  test('a coplanar ray will not intersect', () => {
    const p = new Plane();
    const r = ray(point(0, 0, 0), vector(0, 0, 1));
    const xs = p.intersects(r);

    expect(xs.length).toBe(0);
  });

  test('a ray intersecting the plane from above', () => {
    const p = new Plane();
    const r = ray(point(0, 1, 0), vector(0, -1, 0));
    const xs = p.intersects(r);

    expect(xs.length).toBe(1);
    expect(xs[0].time).toEqual(1);
    expect(xs[0].object).toBe(p);
  });

  test('a ray intersecting the plane from below', () => {
    const p = new Plane();
    const r = ray(point(0, -1, 0), vector(0, 1, 0));
    const xs = p.intersects(r);

    expect(xs.length).toBe(1);
    expect(xs[0].time).toEqual(1);
    expect(xs[0].object).toBe(p);
  });

  test('the bounds of a plane', () => {
    const p = new Plane();
    const [min, max] = p.bounds();

    expect(min).toEqual(
      point(Number.NEGATIVE_INFINITY, 0, Number.NEGATIVE_INFINITY)
    );
    expect(max).toEqual(
      point(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY)
    );
  });
});
