import each from 'jest-each';
import { Ray } from '../../rays';
import { Cube } from './cube';
import { point, vector } from '../../math/vector4';

describe('Cubes', () => {
  each`
        case        | origin               | direction           | t1    | t2
        ${'+x'}     | ${point(5, 0.5, 0)}  | ${vector(-1, 0, 0)} | ${4}  | ${6}
        ${'-x'}     | ${point(-5, 0.5, 0)} | ${vector(1, 0, 0)}  | ${4}  | ${6}
        ${'+y'}     | ${point(0.5, 5, 0)}  | ${vector(0, -1, 0)} | ${4}  | ${6}
        ${'-y'}     | ${point(0.5, -5, 0)} | ${vector(0, 1, 0)}  | ${4}  | ${6}
        ${'+z'}     | ${point(0.5, 0, 5)}  | ${vector(0, 0, -1)} | ${4}  | ${6}
        ${'-z'}     | ${point(0.5, 0, -5)} | ${vector(0, 0, 1)}  | ${4}  | ${6}
        ${'inside'} | ${point(0, 0.5, 0)}  | ${vector(0, 0, 1)}  | ${-1} | ${1}
    `.test(
    'a ray intersects a cube from $case',
    ({ origin, direction, t1, t2 }) => {
      const c = new Cube();
      const xs = c.intersects(new Ray(origin, direction));

      expect(xs.length).toEqual(2);
      expect(xs[0].time).toEqual(t1);
      expect(xs[1].time).toEqual(t2);
    }
  );

  each`
        origin             | direction                          
        ${point(-2, 0, 0)} | ${vector(0.2673, 0.5345, 0.8018)}
        ${point(0, -2, 0)} | ${vector(0.8018, 0.2673, 0.5345)} 
        ${point(0, 0, -2)} | ${vector(0.5345, 0.8018, 0.2673)}
        ${point(2, 0, 2)}  | ${vector(0, 0, -1)} 
        ${point(0, 2, 2)}  | ${vector(0, -1, 0)}
        ${point(2, 2, 0)}  | ${vector(-1, 0, 0)} 
    `.test('a ray misses a cube', ({ origin, direction }) => {
    const c = new Cube();
    const xs = c.intersects(new Ray(origin, direction));

    expect(xs.length).toEqual(0);
  });

  each`
        point                   | normal          
        ${point(1, 0.5, -0.8)}  | ${vector(1, 0, 0)}
        ${point(-1, -0.2, 0.9)} | ${vector(-1, 0, 0)} 
        ${point(-0.4, 1, -0.1)} | ${vector(0, 1, 0)}
        ${point(0.3, -1, -0.7)} | ${vector(0, -1, 0)} 
        ${point(-0.6, 0.3, 1)}  | ${vector(0, 0, 1)}
        ${point(0.4, 0.4, -1)}  | ${vector(0, 0, -1)} 
        ${point(1, 1, 1)}       | ${vector(1, 0, 0)} 
        ${point(-1, -1, -1)}    | ${vector(-1, 0, 0)} 
    `.test('the normal on a surface of a cube', ({ point, normal }) => {
    const c = new Cube();
    const n = c.normalAt(point);

    expect(n.equals(normal)).toBe(true);
  });

  test('the bounds of a cube', () => {
    const c = new Cube();
    const [min, max] = c.bounds();

    expect(min).toEqual(point(-1, -1, -1));
    expect(max).toEqual(point(1, 1, 1));
  });
});
