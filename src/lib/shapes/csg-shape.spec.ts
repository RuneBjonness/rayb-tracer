import { describe, expect, test } from 'vitest';
import { intersection } from '../intersections';
import { Ray } from '../rays';
import { translation, scaling } from '../math/transformations';
import { CsgShape } from './csg-shape';
import { Group } from './group';
import { Cube } from './primitives/cube';
import { Cylinder } from './primitives/cylinder';
import { TransformableSphere } from './primitives/sphere';
import { TestShape } from './transformable-shape.spec';
import { point, vector } from '../math/vector4';
import { Cone } from './primitives/cone';
import { ShapeType } from './shape';

describe('CSG Shapes', () => {
  test('CSG is created with an operation and two shapes', () => {
    const s = new TransformableSphere();
    const c = new Cube();
    const csg = new CsgShape('union', s, c);

    expect(csg.operation).toEqual('union');
    expect(csg.left).toBe(s);
    expect(csg.right).toBe(c);
    expect(s.parent).toBe(csg);
    expect(c.parent).toBe(csg);
  });

  test.each`
    operation         | leftHit  | inLeft   | inRight  | result
    ${'union'}        | ${true}  | ${true}  | ${true}  | ${false}
    ${'union'}        | ${true}  | ${true}  | ${false} | ${true}
    ${'union'}        | ${true}  | ${false} | ${true}  | ${false}
    ${'union'}        | ${true}  | ${false} | ${false} | ${true}
    ${'union'}        | ${false} | ${true}  | ${true}  | ${false}
    ${'union'}        | ${false} | ${true}  | ${false} | ${false}
    ${'union'}        | ${false} | ${false} | ${true}  | ${true}
    ${'union'}        | ${false} | ${false} | ${false} | ${true}
    ${'intersection'} | ${true}  | ${true}  | ${true}  | ${true}
    ${'intersection'} | ${true}  | ${true}  | ${false} | ${false}
    ${'intersection'} | ${true}  | ${false} | ${true}  | ${true}
    ${'intersection'} | ${true}  | ${false} | ${false} | ${false}
    ${'intersection'} | ${false} | ${true}  | ${true}  | ${true}
    ${'intersection'} | ${false} | ${true}  | ${false} | ${true}
    ${'intersection'} | ${false} | ${false} | ${true}  | ${false}
    ${'intersection'} | ${false} | ${false} | ${false} | ${false}
    ${'difference'}   | ${true}  | ${true}  | ${true}  | ${false}
    ${'difference'}   | ${true}  | ${true}  | ${false} | ${true}
    ${'difference'}   | ${true}  | ${false} | ${true}  | ${false}
    ${'difference'}   | ${true}  | ${false} | ${false} | ${true}
    ${'difference'}   | ${false} | ${true}  | ${true}  | ${true}
    ${'difference'}   | ${false} | ${true}  | ${false} | ${true}
    ${'difference'}   | ${false} | ${false} | ${true}  | ${false}
    ${'difference'}   | ${false} | ${false} | ${false} | ${false}
  `(
    'evaluating the intersections for csg operation $operation',
    ({ operation, leftHit, inLeft, inRight, result }) => {
      const csg = new CsgShape(operation, new TestShape(), new TestShape());

      expect(csg.validIntersection(leftHit, inLeft, inRight)).toBe(result);
    }
  );

  test.each`
    operation         | x0   | x1
    ${'union'}        | ${0} | ${3}
    ${'intersection'} | ${1} | ${2}
    ${'difference'}   | ${0} | ${1}
  `('filtering a list of intersections', ({ operation, x0, x1 }) => {
    const s = new TransformableSphere();
    const c = new Cube();
    const csg = new CsgShape(operation, s, c);
    const xs = [
      intersection(1, s),
      intersection(2, c),
      intersection(3, s),
      intersection(4, c),
    ];

    const result = csg.filterIntersections(xs);

    expect(result.length).toBe(2);
    expect(result[0]).toStrictEqual(xs[x0]);
    expect(result[1]).toStrictEqual(xs[x1]);
  });

  test('a ray misses a csg shape', () => {
    const s = new TransformableSphere();
    const c = new Cube();
    const csg = new CsgShape('union', s, c);

    const r = new Ray(point(0, 2, -5), vector(0, 0, 1));
    const xs = csg.intersects(r);
    const hit = csg.hits(r, 10);

    expect(xs.length).toBe(0);
    expect(hit).toBeFalsy();
  });

  test('a ray hits a csg shape', () => {
    const s1 = new TransformableSphere();
    const s2 = new TransformableSphere();
    s2.transform = translation(0, 0, 0.5);
    const csg = new CsgShape('union', s1, s2);

    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const xs = csg.intersects(r);
    const hit = csg.hits(r, 10);

    expect(xs.length).toBe(2);
    expect(xs[0].time).toEqual(4);
    expect(xs[0].object).toBe(s1);
    expect(xs[1].time).toEqual(6.5);
    expect(xs[1].object).toBe(s2);
    expect(hit).toBeTruthy();
  });

  test('the bounds of a csg contains both operands bounds', () => {
    const s = new TransformableSphere();
    const c = new Cylinder(-5, 5);

    const csg = new CsgShape('union', s, c);

    expect(csg.localBounds.min).toEqual(point(-1, -5, -1));
    expect(csg.localBounds.max).toEqual(point(1, 5, 1));
  });

  test('the bounds of a csg is affected by children transformations', () => {
    const s1 = new TransformableSphere();
    s1.transform = scaling(2, 2, 2);
    const s2 = new TransformableSphere();
    s2.transform = translation(5, 0, 0);

    const csg = new CsgShape('union', s1, s2);

    expect(csg.localBounds.min).toEqual(point(-2, -2, -2));
    expect(csg.localBounds.max).toEqual(point(6, 2, 2));
  });

  test('dividing a csg shape partitions its children', () => {
    const sphere = new TransformableSphere();
    sphere.transform = translation(-1.5, 0, 0);
    const cylinder = new Cylinder(-1, 1);
    cylinder.transform = translation(1.5, 0, 0);
    const g1 = new Group();
    g1.add(sphere);
    g1.add(cylinder);

    const cube = new Cube();
    cube.transform = translation(0, 0, -1.5);
    const cone = new Cone(-1, 1, true);
    cone.transform = translation(0, 0, 1.5);
    const g2 = new Group();
    g2.add(cube);
    g2.add(cone);

    const csg = new CsgShape('difference', g1, g2);
    csg.divide(1);

    expect(g1.bvhNode?.bvhNodes[0].shapes[0].shapeType).toEqual(
      ShapeType.Sphere
    );
    expect(g1.bvhNode?.bvhNodes[1].shapes[0].shapeType).toEqual(
      ShapeType.Cylinder
    );
    expect(g2.bvhNode?.bvhNodes[0].shapes[0].shapeType).toEqual(ShapeType.Cube);
    expect(g2.bvhNode?.bvhNodes[1].shapes[0].shapeType).toEqual(ShapeType.Cone);
  });
});
