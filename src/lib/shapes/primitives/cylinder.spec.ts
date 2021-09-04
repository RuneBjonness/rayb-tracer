import each from "jest-each";
import { ray } from "../../rays";
import { point, vector, normalize, areEqual } from "../../tuples";
import { Cylinder } from "./cylinder";

describe('Cylinders', () => {

    test('the default properties for a cylinder', () => {
        const cyl = new Cylinder();
    
        expect(cyl.minimum).toEqual(Number.NEGATIVE_INFINITY);
        expect(cyl.maximum).toEqual(Number.POSITIVE_INFINITY);
        expect(cyl.closed).toBe(false);
    });

    each`
        origin             | direction          
        ${point(1, 0, 0)}  | ${vector(0, 1, 0)}
        ${point(0, 0, 0)}  | ${vector(0, 1, 0)} 
        ${point(0, 0, -5)} | ${vector(1, 1, 1)}
    `.test('a ray misses a cylinder', ({origin, direction}) => {
        const c = new Cylinder();
        const xs = c.intersects(ray(origin, normalize(direction)));

        expect(xs.length).toEqual(0);
    });

    each`
        origin               | direction            | t0         | t1
        ${point(1, 0, -5)}   | ${vector(0, 0, 1)}   | ${5}       | ${5}
        ${point(0, 0, -5)}   | ${vector(0, 0, 1)}   | ${4}       | ${6}
        ${point(0.5, 0, -5)} | ${vector(0.1, 1, 1)} | ${6.80798} | ${7.08872}
    `.test('a ray strikes a cylinder', ({origin, direction, t0, t1}) => {
        const c = new Cylinder();
        const xs = c.intersects(ray(origin, normalize(direction)));

        expect(xs.length).toEqual(2);
        expect(xs[0].time).toBeCloseTo(t0);
        expect(xs[1].time).toBeCloseTo(t1);
    });

    each`
        point              | normal          
        ${point(1, 0, 0)}  | ${vector(1, 0, 0)}
        ${point(0, 5, -1)} | ${vector(0, 0, -1)} 
        ${point(0, -2, 1)} | ${vector(0, 0, 1)}
        ${point(-1, 1, 0)} | ${vector(-1, 0, 0)} 
    `.test('the normal on a cylinder', ({point, normal}) => {
        const c = new Cylinder();
        const n = c.normalAt(point);

        expect(areEqual(n, normal)).toBe(true);
    });

    each`
        origin               | direction            | count
        ${point(0, 1.5, 0)}  | ${vector(0.1, 1, 0)} | ${0}
        ${point(0, 3, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 0, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 2, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 1, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 1.5, -2)} | ${vector(0, 0, 1)}   | ${2}
    `.test('a ray strikes a truncated cylinder', ({origin, direction, count}) => {
        const c = new Cylinder();
        c.minimum = 1;
        c.maximum = 2;
        const xs = c.intersects(ray(origin, normalize(direction)));

        expect(xs.length).toEqual(count);
    });

    each`
        origin              | direction           | count
        ${point(0, 3, 0)}   | ${vector(0, -1, 0)} | ${2}
        ${point(0, 3, -2)}  | ${vector(0, -1, 2)} | ${2}
        ${point(0, 4, -2)}  | ${vector(0, -1, 1)} | ${2}
        ${point(0, 0, -2)}  | ${vector(0, 1, 2)}  | ${2}
        ${point(0, -1, -2)} | ${vector(0, 1, 1)}  | ${2}
    `.test('intersecting the caps of a closed cylinder', ({origin, direction, count}) => {
        const c = new Cylinder();
        c.minimum = 1;
        c.maximum = 2;
        c.closed = true;
        const xs = c.intersects(ray(origin, normalize(direction)));

        expect(xs.length).toEqual(count);
    });

    each`
        point               | normal
        ${point(0, 1, 0)}   | ${vector(0, -1, 0)}
        ${point(0.5, 1, 0)} | ${vector(0, -1, 0)} 
        ${point(0, 1, 0.5)} | ${vector(0, -1, 0)}
        ${point(0, 2, 0)}   | ${vector(0, 1, 0)} 
        ${point(0.5, 2, 0)} | ${vector(0, 1, 0)} 
        ${point(0, 2, 0.5)} | ${vector(0, 1, 0)} 
    `.test('the normal vector on a cylinder\'s end caps ', ({point, normal}) => {
        const c = new Cylinder();
        c.minimum = 1;
        c.maximum = 2;
        c.closed = true;
        const n = c.normalAt(point);

        expect(areEqual(n, normal)).toBe(true);
    });

    test('the default bounds of a cylinder', () => {
        const c = new Cylinder();
        const [min, max] = c.bounds();
    
        expect(min).toEqual(point(-1, Number.NEGATIVE_INFINITY, -1));
        expect(max).toEqual(point(1, Number.POSITIVE_INFINITY, 1));
    });

    test('the bounds of a truncated cylinder', () => {
        const c = new Cylinder();
        c.minimum = -5;
        c.maximum = 5;
        const [min, max] = c.bounds();
    
        expect(min).toEqual(point(-1, -5, -1));
        expect(max).toEqual(point(1, 5, 1));
    });
});
