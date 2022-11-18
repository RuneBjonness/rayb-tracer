import each from 'jest-each';
import { ray } from '../../rays';
import { point, vector, normalize, areEqual } from '../../tuples';
import { Cone } from './cone';

describe('Cones', () => {
  each`
        origin             | direction              | t0         | t1
        ${point(0, 0, -5)} | ${vector(0, 0, 1)}     | ${5}       | ${5}
        ${point(0, 0, -5)} | ${vector(1, 1, 1)}     | ${8.66025} | ${8.66025}
        ${point(1, 1, -5)} | ${vector(-0.5, -1, 1)} | ${4.55006} | ${49.44994}
    `.test(
    'intersecting a cone with a ray',
    ({ origin, direction, t0, t1 }) => {
      const c = new Cone();
      const xs = c.intersects(ray(origin, normalize(direction)));

      expect(xs.length).toEqual(2);
      expect(xs[0].time).toBeCloseTo(t0);
      expect(xs[1].time).toBeCloseTo(t1);
    }
  );

  test('intersecting a cone with a ray parallel to one of its halves', () => {
    const c = new Cone();
    const xs = c.intersects(ray(point(0, 0, -1), normalize(vector(0, 1, 1))));

    expect(xs.length).toEqual(1);
    expect(xs[0].time).toBeCloseTo(0.35355);
  });

  each`
        origin                | direction           | count
        ${point(0, 0, -5)}    | ${vector(0, 1, 0)} | ${0}
        ${point(0, 0, -0.25)} | ${vector(0, 1, 1)} | ${2}
        ${point(0, 0, -0.25)} | ${vector(0, 1, 0)} | ${4}
    `.test(
    'intersecting the caps of a closed cone',
    ({ origin, direction, count }) => {
      const c = new Cone();
      c.minimum = -0.5;
      c.maximum = 0.5;
      c.closed = true;
      const xs = c.intersects(ray(origin, normalize(direction)));

      expect(xs.length).toEqual(count);
    }
  );

  each`
        point               | normal          
        ${point(0, 0, 0)}   | ${normalize(vector(0, 0, 0))}
        ${point(1, 1, 1)}   | ${normalize(vector(1, -Math.sqrt(2), 1))}
        ${point(-1, -1, 0)} | ${normalize(vector(-1, 1, 0))} 
    `.test('the normal on a cone', ({ point, normal }) => {
    const c = new Cone();
    const n = c.normalAt(point);

    expect(areEqual(n, normal)).toBe(true);
  });

  test('the bounds of a unbounded cone', () => {
    const c = new Cone();
    const [min, max] = c.bounds();

    expect(min).toEqual(
      point(
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY
      )
    );
    expect(max).toEqual(
      point(
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY
      )
    );
  });

  test('the bounds of a cone', () => {
    const c = new Cone();
    c.minimum = -5;
    c.maximum = 3;
    const [min, max] = c.bounds();

    expect(min).toEqual(point(-5, -5, -5));
    expect(max).toEqual(point(5, 3, 5));
  });
});
