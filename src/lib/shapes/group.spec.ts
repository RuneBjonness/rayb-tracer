import { Ray } from '../rays';
import { translation, scaling, rotationY } from '../math/transformations';
import { Group } from './group';
import { Cylinder } from './primitives/cylinder';
import { TransformableSphere } from './primitives/sphere';
import { TestShape } from './transformable-shape.spec';
import { point, vector } from '../math/vector4';
import { Matrix4 } from '../math/matrices';
import { Cube } from './primitives/cube';

describe('Groups', () => {
  test('creating a new group', () => {
    const g = new Group();

    expect(g.transform.equals(new Matrix4())).toBe(true);
    expect(g.shapes.length).toBe(0);
  });

  test('adding a child to a group', () => {
    const g = new Group();
    const s = new TestShape();

    g.add(s);

    expect(g.shapes.indexOf(s)).toBeGreaterThanOrEqual(0);
    expect(s.parent).toBe(g);
  });

  test('intersecting a ray with an empty group', () => {
    const g = new Group();
    const r = new Ray(point(0, 0, 0), vector(0, 0, 1));
    const xs = g.intersects(r);
    const hit = g.hits(r, 10);

    expect(xs.length).toBe(0);
    expect(hit).toBeFalsy();
  });

  test('intersecting a ray with a nonempty group', () => {
    const g = new Group();
    const s1 = new TransformableSphere();
    const s2 = new TransformableSphere();
    s2.transform = translation(0, 0, -3);
    const s3 = new TransformableSphere();
    s3.transform = translation(5, 0, 0);

    g.add(s1);
    g.add(s2);
    g.add(s3);

    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const xs = g.intersects(r);
    const hit = g.hits(r, 10);

    expect(xs.length).toBe(4);
    expect(xs[0].object).toBe(s2);
    expect(xs[1].object).toBe(s2);
    expect(xs[2].object).toBe(s1);
    expect(xs[3].object).toBe(s1);
    expect(hit).toBeTruthy();
  });

  test('intersecting a transformed group', () => {
    const g = new Group();
    g.transform = scaling(2, 2, 2);
    const s = new TransformableSphere();
    s.transform = translation(5, 0, 0);
    g.add(s);

    const r = new Ray(point(10, 0, -10), vector(0, 0, 1));
    const xs = g.intersects(r);
    const hit = g.hits(r, 10);

    expect(xs.length).toBe(2);
    expect(hit).toBeTruthy();
  });

  test('finding normal on a child object', () => {
    const g1 = new Group();
    g1.transform = rotationY(Math.PI / 2);
    const g2 = new Group();
    g2.transform = scaling(1, 2, 3);
    const s = new TransformableSphere();
    s.transform = translation(5, 0, 0);
    g1.add(g2);
    g2.add(s);

    const n = s.normalAt(point(1.7321, 1.1547, -5.5774));

    expect(n.equals(vector(0.2857, 0.42854, -0.85716))).toBe(true);
  });

  test('the bounds of a group contains all children bounds', () => {
    const s = new TransformableSphere();
    const c = new Cylinder(-5, 5);

    const g = new Group();
    g.add(s);
    g.add(c);

    expect(g.localBounds.min).toEqual(point(-1, -5, -1));
    expect(g.localBounds.max).toEqual(point(1, 5, 1));
  });

  test('the bounds of a group is affected by children transformations', () => {
    const s1 = new TransformableSphere();
    s1.transform = scaling(2, 2, 2);
    const s2 = new TransformableSphere();
    s2.transform = translation(5, 0, 0);

    const g = new Group();
    g.add(s1);
    g.add(s2);

    expect(g.localBounds.min).toEqual(point(-2, -2, -2));
    expect(g.localBounds.max).toEqual(point(6, 2, 2));
  });

  test('dividing a group partitions its children', () => {
    const sphere = new TransformableSphere();
    sphere.transform = translation(-2, -2, 0);
    const cyl = new Cylinder(-1, 1);
    cyl.transform = translation(-2, 2, 0);
    const cube = new Cube();
    cube.transform = scaling(4, 4, 4);

    const g = new Group();
    g.add(sphere);
    g.add(cyl);
    g.add(cube);
    g.divide(1);

    expect(g.shapes.length).toBe(0);
    expect(g.bvhNode?.bvhNodes.length).toBe(2);
    expect(g.bvhNode?.shapes.length).toBe(0);
    expect(g.bvhNode?.bvhNodes[0].bvhNodes[0].shapes[0].shapeType).toEqual(
      'sphere'
    );
    expect(g.bvhNode?.bvhNodes[0].bvhNodes[1].shapes[0].shapeType).toEqual(
      'cylinder'
    );
    expect(g.bvhNode?.bvhNodes[1].shapes[0].shapeType).toEqual('cube');
  });
});
