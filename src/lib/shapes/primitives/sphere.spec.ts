import { describe, expect, test } from 'vitest';
import { point, vector } from '../../math/vector4';
import { Ray } from '../../rays';
import { TransformableSphere } from './sphere';

describe('Spheres', () => {
  test('a ray intersects a sphere at two points', () => {
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new TransformableSphere();
    const xs = s.intersects(r);
    const hit = s.hits(r, 10);

    expect(xs.length).toBe(2);
    expect(xs[0].time).toEqual(4.0);
    expect(xs[1].time).toEqual(6.0);
    expect(hit).toBeTruthy();
  });

  test('a ray intersects a sphere at a tangent', () => {
    const r = new Ray(point(0, 1, -5), vector(0, 0, 1));
    const s = new TransformableSphere();
    const xs = s.intersects(r);
    const hit = s.hits(r, 10);

    expect(xs.length).toBe(2);
    expect(xs[0].time).toEqual(5.0);
    expect(xs[1].time).toEqual(5.0);
    expect(hit).toBeTruthy();
  });

  test('a ray misses a sphere', () => {
    const r = new Ray(point(0, 2, -5), vector(0, 0, 1));
    const s = new TransformableSphere();
    const xs = s.intersects(r);
    const hit = s.hits(r, 10);

    expect(xs.length).toBe(0);
    expect(hit).toBeFalsy();
  });

  test('a ray originates inside a sphere', () => {
    const r = new Ray(point(0, 0, 0), vector(0, 0, 1));
    const s = new TransformableSphere();
    const xs = s.intersects(r);
    const hit = s.hits(r, 10);

    expect(xs.length).toBe(2);
    expect(xs[0].time).toEqual(-1.0);
    expect(xs[1].time).toEqual(1.0);
    expect(hit).toBeTruthy();
  });

  test('a sphere is behind a ray', () => {
    const r = new Ray(point(0, 0, 5), vector(0, 0, 1));
    const s = new TransformableSphere();
    const xs = s.intersects(r);
    const hit = s.hits(r, 10);

    expect(xs.length).toBe(2);
    expect(xs[0].time).toEqual(-6.0);
    expect(xs[1].time).toEqual(-4.0);
    expect(hit).toBeFalsy();
  });

  test('intersect sets the object on the intersection', () => {
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new TransformableSphere();
    const xs = s.intersects(r);

    expect(xs.length).toBe(2);
    expect(xs[0].object).toBe(s);
    expect(xs[1].object).toBe(s);
  });

  test('the normal on a sphere at a point on the x axis', () => {
    const s = new TransformableSphere();
    const n = s.normalAt(point(1, 0, 0));
    expect(n.equals(vector(1, 0, 0))).toBe(true);
  });

  test('the normal on a sphere at a point on the y axis', () => {
    const s = new TransformableSphere();
    const n = s.normalAt(point(0, 1, 0));
    expect(n.equals(vector(0, 1, 0))).toBe(true);
  });

  test('the normal on a sphere at a point on the z axis', () => {
    const s = new TransformableSphere();
    const n = s.normalAt(point(0, 0, 1));
    expect(n.equals(vector(0, 0, 1))).toBe(true);
  });

  test('the normal on a sphere at a nonaxial point', () => {
    const a = Math.sqrt(3) / 3;
    const s = new TransformableSphere();
    const n = s.normalAt(point(a, a, a));
    expect(n.equals(vector(a, a, a))).toBe(true);
  });

  test('the normal is a normalized vector', () => {
    const a = Math.sqrt(3) / 3;
    const s = new TransformableSphere();
    const n = s.normalAt(point(a, a, a));
    expect(n.equals(n.clone().normalize())).toBe(true);
  });

  test('the bounds of a sphere', () => {
    const s = new TransformableSphere();

    expect(s.localBounds?.min).toEqual(point(-1, -1, -1));
    expect(s.localBounds?.max).toEqual(point(1, 1, 1));
  });
});
