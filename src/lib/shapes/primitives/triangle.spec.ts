import { intersection, prepareComputations } from '../../intersections';
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
    expect(t.n1.equals(vector(0, 0, -1))).toBe(true);
  });

  test('the normal of a triangle is constant everywhere', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));

    const n1 = t.normalAt(point(0, 0, 0), null);
    const n2 = t.normalAt(point(10, 0, -10), null);
    const n3 = t.normalAt(point(-5, 0, 150), null);

    expect(n1.equals(t.n1)).toBe(true);
    expect(n2.equals(t.n1)).toBe(true);
    expect(n3.equals(t.n1)).toBe(true);
  });

  test('a ray parallel with the triangle will not intersect', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(0, -1, -2), vector(0, 1, 0));
    const xs = t.intersects(r);
    const hit = t.hits(r, 10);

    expect(xs.length).toBe(0);
    expect(hit).toBeFalsy();
  });

  test('a ray misses the p1-p3 edge', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(1, 1, -2), vector(0, 0, 1));
    const xs = t.intersects(r);
    const hit = t.hits(r, 10);

    expect(xs.length).toBe(0);
    expect(hit).toBeFalsy();
  });

  test('a ray misses the p1-p2 edge', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(-1, 1, -2), vector(0, 0, 1));
    const xs = t.intersects(r);
    const hit = t.hits(r, 10);

    expect(xs.length).toBe(0);
    expect(hit).toBeFalsy();
  });

  test('a ray misses the p2-p3 edge', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(0, -1, -2), vector(0, 0, 1));
    const xs = t.intersects(r);
    const hit = t.hits(r, 10);

    expect(xs.length).toBe(0);
    expect(hit).toBeFalsy();
  });

  test('a ray strikes a triangle', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
    const r = new Ray(point(0, 0.5, -2), vector(0, 0, 1));
    const xs = t.intersects(r);
    const hit = t.hits(r, 10);

    expect(xs.length).toBe(1);
    expect(xs[0].time).toEqual(2);
    expect(hit).toBeTruthy();
  });

  test('the bounds of a triangle', () => {
    const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));

    expect(t.bounds?.min).toEqual(point(-1, 0, 0));
    expect(t.bounds?.max).toEqual(point(1, 1, 0));
  });
});

describe('Smooth Triangles', () => {
  const p1 = point(0, 1, 0);
  const p2 = point(-1, 0, 0);
  const p3 = point(1, 0, 0);
  const n1 = vector(0, 1, 0);
  const n2 = vector(-1, 0, 0);
  const n3 = vector(1, 0, 0);
  const tri = new Triangle(p1, p2, p3, n1, n2, n3);

  test('constructing a smooth triangle', () => {
    expect(tri.p1).toEqual(p1);
    expect(tri.p2).toEqual(p2);
    expect(tri.p3).toEqual(p3);
    expect(tri.n1).toEqual(n1);
    expect(tri.n2).toEqual(n2);
    expect(tri.n3).toEqual(n3);
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
