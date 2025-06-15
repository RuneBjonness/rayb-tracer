import { describe, expect, test } from 'vitest';
import { material } from '../material/materials';
import { Ray } from '../rays';
import {
  rotationY,
  rotationZ,
  scaling,
  translation,
} from '../math/transformations';
import { Group } from './group';
import { TransformableSphere } from './primitives/sphere';
import { Vector4, point, vector } from '../math/vector4';
import { Matrix4 } from '../math/matrices';
import { Intersection } from '../intersections';
import { TransformableShape } from './transformable-shape';

export class TestShape extends TransformableShape {
  localRayFromBase: Ray | null = null;

  constructor() {
    super();
  }

  protected localIntersects(r: Ray): Intersection[] {
    this.localRayFromBase = r;
    return [];
  }

  protected localHits(r: Ray, maxDistance: number): boolean {
    this.localRayFromBase = r;
    return false;
  }

  protected localNormalAt(p: Vector4): Vector4 {
    return vector(p.x, p.y, p.z);
  }
}

describe('Common shape features', () => {
  test('the default transformation', () => {
    const s = new TestShape();
    expect(s.transform.equals(new Matrix4())).toBe(true);
  });

  test('assigning transformation', () => {
    const s = new TestShape();
    const t = translation(2, 3, 4);
    s.transform = t;

    expect(s.transform.equals(t)).toBe(true);
  });

  test('the default material', () => {
    const s = new TestShape();
    expect(s.material).toEqual(material());
  });

  test('assigning a material by index', () => {
    const s = new TestShape();
    const m = material();
    m.ambient = 1;

    s.materialDefinitions = [m];
    s.materialIdx = 0;

    expect(s.material).toEqual(m);
    expect(s.materialIdx).toEqual(0);
  });

  test('assigning a material by material', () => {
    const s = new TestShape();
    const m = material();
    m.ambient = 1;

    s.materialDefinitions = [m];
    s.material = m;

    expect(s.material).toEqual(m);
    expect(s.materialIdx).toEqual(0);
  });

  test('intersecting a scaled shape with a ray', () => {
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new TestShape();
    s.transform = scaling(2, 2, 2);
    const xs = s.intersects(r);

    expect(s.localRayFromBase).not.toBeNull();
    expect(s.localRayFromBase!.origin.equals(point(0, 0, -2.5))).toBe(true);
    expect(s.localRayFromBase!.direction.equals(vector(0, 0, 0.5))).toBe(true);
  });

  test('intersecting a translated shape with a ray', () => {
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new TestShape();
    s.transform = translation(5, 0, 0);
    const xs = s.intersects(r);

    expect(s.localRayFromBase).not.toBeNull();
    expect(s.localRayFromBase!.origin.equals(point(-5, 0, -5))).toBe(true);
    expect(s.localRayFromBase!.direction.equals(vector(0, 0, 1))).toBe(true);
  });

  test('computing the normal on a translated shape', () => {
    const s = new TestShape();
    s.transform = translation(0, 1, 0);
    const n = s.normalAt(point(0, 1.70711, -0.70711));
    expect(n.equals(vector(0, 0.70711, -0.70711))).toBe(true);
  });

  test('computing the normal on a transformed shape', () => {
    const s = new TestShape();
    s.transform = scaling(1, 0.5, 1).multiply(rotationZ(Math.PI / 5));
    const n = s.normalAt(point(0, Math.sqrt(2) / 2, -(Math.sqrt(2) / 2)));
    expect(n.equals(vector(0, 0.97014, -0.24254))).toBe(true);
  });

  test('the default parent is null', () => {
    const s = new TestShape();
    expect(s.parent).toBeNull();
  });

  test('converting a point from world to object space', () => {
    const g1 = new Group();
    g1.transform = rotationY(Math.PI / 2);
    const g2 = new Group();
    g2.transform = scaling(2, 2, 2);
    const s = new TransformableSphere();
    s.transform = translation(5, 0, 0);
    g1.add(g2);
    g2.add(s);

    const p = s.worldToObject(point(-2, 0, -10));

    expect(p.equals(point(0, 0, -1))).toBe(true);
  });

  test('converting a normal from object to world space', () => {
    const g1 = new Group();
    g1.transform = rotationY(Math.PI / 2);
    const g2 = new Group();
    g2.transform = scaling(1, 2, 3);
    const s = new TransformableSphere();
    s.transform = translation(5, 0, 0);
    g1.add(g2);
    g2.add(s);

    const n = s.normalToWorld(
      vector(Math.sqrt(3) / 3, Math.sqrt(3) / 3, Math.sqrt(3) / 3)
    );

    expect(n.equals(vector(0.28571, 0.42857, -0.85714))).toBe(true);
  });

  test('dividing a primitive does nothing', () => {
    const s = new TransformableSphere();
    s.divide(1);

    expect(s).toStrictEqual(new TransformableSphere());
  });
});
