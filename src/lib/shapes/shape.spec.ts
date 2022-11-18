import { material } from '../materials';
import { areEqual, identityMatrix, multiplyMatrices } from '../matrices';
import { ray } from '../rays';
import { rotationY, rotationZ, scaling, translation } from '../transformations';
import { point, vector, areEqual as tuplesAreEqual } from '../tuples';
import { Group } from './group';
import { Sphere } from './primitives/sphere';
import { TestShape } from './shape';

describe('Common shape features', () => {
  test('the default transformation', () => {
    const s = new TestShape();
    expect(areEqual(s.transform, identityMatrix())).toBe(true);
  });

  test('assigning transformation', () => {
    const s = new TestShape();
    const t = translation(2, 3, 4);
    s.transform = t;

    expect(areEqual(s.transform, t)).toBe(true);
  });

  test('the default material', () => {
    const s = new TestShape();
    expect(s.material).toEqual(material());
  });

  test('assigning a material', () => {
    const s = new TestShape();
    const m = material();
    m.ambient = 1;
    s.material = m;

    expect(s.material).toEqual(m);
  });

  test('intersecting a scaled shape with a ray', () => {
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new TestShape();
    s.transform = scaling(2, 2, 2);
    const xs = s.intersects(r);

    expect(s.localRayFromBase).not.toBeNull();
    expect(tuplesAreEqual(s.localRayFromBase!.origin, point(0, 0, -2.5))).toBe(
      true
    );
    expect(
      tuplesAreEqual(s.localRayFromBase!.direction, vector(0, 0, 0.5))
    ).toBe(true);
  });

  test('intersecting a translated shape with a ray', () => {
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new TestShape();
    s.transform = translation(5, 0, 0);
    const xs = s.intersects(r);

    expect(s.localRayFromBase).not.toBeNull();
    expect(tuplesAreEqual(s.localRayFromBase!.origin, point(-5, 0, -5))).toBe(
      true
    );
    expect(tuplesAreEqual(s.localRayFromBase!.direction, vector(0, 0, 1))).toBe(
      true
    );
  });

  test('computing the normal on a translated shape', () => {
    const s = new TestShape();
    s.transform = translation(0, 1, 0);
    const n = s.normalAt(point(0, 1.70711, -0.70711));
    expect(tuplesAreEqual(n, vector(0, 0.70711, -0.70711))).toBe(true);
  });

  test('computing the normal on a transformed shape', () => {
    const s = new TestShape();
    s.transform = multiplyMatrices(scaling(1, 0.5, 1), rotationZ(Math.PI / 5));
    const n = s.normalAt(point(0, Math.sqrt(2) / 2, -(Math.sqrt(2) / 2)));
    expect(tuplesAreEqual(n, vector(0, 0.97014, -0.24254))).toBe(true);
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
    const s = new Sphere();
    s.transform = translation(5, 0, 0);
    g1.add(g2);
    g2.add(s);

    const p = s.worldToObject(point(-2, 0, -10));

    expect(tuplesAreEqual(p, point(0, 0, -1))).toBe(true);
  });

  test('converting a normal from object to world space', () => {
    const g1 = new Group();
    g1.transform = rotationY(Math.PI / 2);
    const g2 = new Group();
    g2.transform = scaling(1, 2, 3);
    const s = new Sphere();
    s.transform = translation(5, 0, 0);
    g1.add(g2);
    g2.add(s);

    const n = s.normalToWorld(
      vector(Math.sqrt(3) / 3, Math.sqrt(3) / 3, Math.sqrt(3) / 3)
    );

    expect(tuplesAreEqual(n, vector(0.28571, 0.42857, -0.85714))).toBe(true);
  });

  test('dividing a primitive does nothing', () => {
    const s = new Sphere();
    s.divide(1);

    expect(s).toStrictEqual(new Sphere());
  });
});
