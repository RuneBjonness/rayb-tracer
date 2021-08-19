import each from 'jest-each';
import { material } from './materials';
import { areEqual, identityMatrix, multiply } from './matrices';
import { ray } from './rays';
import { Cone, Cube, Cylinder, glassSphere, Plane, Sphere, TestShape } from './shapes';
import { rotationZ, scaling, translation } from './transformations';
import { point, vector, areEqual as tuplesAreEqual, normalize } from './tuples'

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
        expect(tuplesAreEqual(s.localRayFromBase!.origin, point(0, 0, -2.5))).toBe(true);
        expect(tuplesAreEqual(s.localRayFromBase!.direction, vector(0, 0, 0.5))).toBe(true);
    });
    
    test('intersecting a translated shape with a ray', () => {
        const r = ray(point(0, 0, -5), vector(0, 0, 1));
        const s = new TestShape();
        s.transform = translation(5, 0, 0);
        const xs = s.intersects(r);
    
        expect(s.localRayFromBase).not.toBeNull();
        expect(tuplesAreEqual(s.localRayFromBase!.origin, point(-5, 0, -5))).toBe(true);
        expect(tuplesAreEqual(s.localRayFromBase!.direction, vector(0, 0, 1))).toBe(true);
    });
        
    test('computing the normal on a translated shape', () => {
        const s = new TestShape();
        s.transform = translation(0, 1, 0);
        const n = s.normalAt(point(0, 1.70711, -0.70711));
        expect(tuplesAreEqual(n, vector(0, 0.70711, -0.70711))).toBe(true);
    });
    
    test('computing the normal on a transformed shape', () => {
        const s = new TestShape();
        s.transform = multiply(scaling(1, 0.5, 1), rotationZ(Math.PI/5));
        const n = s.normalAt(point(0, Math.sqrt(2) / 2, -(Math.sqrt(2) / 2)));
        expect(tuplesAreEqual(n, vector(0, 0.97014, -0.24254))).toBe(true);
    });
});

describe('Spheres', () => {
    test('a ray intersects a sphere at two points', () => {
        const r = ray(point(0, 0, -5), vector(0, 0, 1));
        const s = new Sphere();
        const xs = s.intersects(r);
    
        expect(xs.length).toBe(2);
        expect(xs[0].time).toEqual(4.0);
        expect(xs[1].time).toEqual(6.0);
    });
    
    test('a ray intersects a sphere at a tangent', () => {
        const r = ray(point(0, 1, -5), vector(0, 0, 1));
        const s = new Sphere();
        const xs = s.intersects(r);
    
        expect(xs.length).toBe(2);
        expect(xs[0].time).toEqual(5.0);
        expect(xs[1].time).toEqual(5.0);
    });
    
    test('a ray misses a sphere', () => {
        const r = ray(point(0, 2, -5), vector(0, 0, 1));
        const s = new Sphere();
        const xs = s.intersects(r);
    
        expect(xs.length).toBe(0);
    });
    
    test('a ray originates inside a sphere', () => {
        const r = ray(point(0, 0, 0), vector(0, 0, 1));
        const s = new Sphere();
        const xs = s.intersects(r);
    
        expect(xs.length).toBe(2);
        expect(xs[0].time).toEqual(-1.0);
        expect(xs[1].time).toEqual(1.0);
    });
    
    test('a sphere is behind a ray', () => {
        const r = ray(point(0, 0, 5), vector(0, 0, 1));
        const s = new Sphere();
        const xs = s.intersects(r);
    
        expect(xs.length).toBe(2);
        expect(xs[0].time).toEqual(-6.0);
        expect(xs[1].time).toEqual(-4.0);
    });
    
    test('intersect sets the object on the intersection', () => {
        const r = ray(point(0, 0, -5), vector(0, 0, 1));
        const s = new Sphere();
        const xs = s.intersects(r);
    
        expect(xs.length).toBe(2);
        expect(xs[0].object).toBe(s);
        expect(xs[1].object).toBe(s);
    });
    
    
    test('the normal on a sphere at a point on the x axis', () => {
        const s = new Sphere();
        const n = s.normalAt(point(1, 0, 0));
        expect(tuplesAreEqual(n, vector(1, 0, 0))).toBe(true);
    });
    
    test('the normal on a sphere at a point on the y axis', () => {
        const s = new Sphere();
        const n = s.normalAt(point(0, 1, 0));
        expect(tuplesAreEqual(n, vector(0, 1, 0))).toBe(true);
    });
    
    test('the normal on a sphere at a point on the z axis', () => {
        const s = new Sphere();
        const n = s.normalAt(point(0, 0, 1));
        expect(tuplesAreEqual(n, vector(0, 0, 1))).toBe(true);
    });
    
    test('the normal on a sphere at a nonaxial point', () => {
        const a = Math.sqrt(3) / 3;
        const s = new Sphere();
        const n = s.normalAt(point(a, a, a));
        expect(tuplesAreEqual(n, vector(a, a, a))).toBe(true);
    });
    
    test('the normal is a normalized vector', () => {
        const a = Math.sqrt(3) / 3;
        const s = new Sphere();
        const n = s.normalAt(point(a, a, a));
        expect(tuplesAreEqual(n, normalize(n))).toBe(true);
    });
   
    test('a helper for producing a sphere with a glassy material', () => {
        const s = glassSphere();
    
        expect(s.transform).toStrictEqual(identityMatrix());
        expect(s.material.transparancy).toEqual(1.0);
        expect(s.material.refractiveIndex).toEqual(1.5);
    });
});

describe('Planes', () => {
    test('the normal of a plane is constant everywhere', () => {
        const p = new Plane();
        const n1 = p.normalAt(point(0, 0, 0));
        const n2 = p.normalAt(point(10, 0, -10));
        const n3 = p.normalAt(point(-5, 0, 150));

        expect(tuplesAreEqual(n1, vector(0, 1, 0))).toBe(true);
        expect(tuplesAreEqual(n2, vector(0, 1, 0))).toBe(true);
        expect(tuplesAreEqual(n3, vector(0, 1, 0))).toBe(true);
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

});

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
    `.test('a ray intersects a cube from $case', ({origin, direction, t1, t2}) => {
        const c = new Cube();
        const xs = c.intersects(ray(origin, direction));

        expect(xs.length).toEqual(2);
        expect(xs[0].time).toEqual(t1);
        expect(xs[1].time).toEqual(t2);
    });

    each`
        origin             | direction                          
        ${point(-2, 0, 0)} | ${vector(0.2673, 0.5345, 0.8018)}
        ${point(0, -2, 0)} | ${vector(0.8018, 0.2673, 0.5345)} 
        ${point(0, 0, -2)} | ${vector(0.5345, 0.8018, 0.2673)}
        ${point(2, 0, 2)}  | ${vector(0, 0, -1)} 
        ${point(0, 2, 2)}  | ${vector(0, -1, 0)}
        ${point(2, 2, 0)}  | ${vector(-1, 0, 0)} 
    `.test('a ray misses a cube', ({origin, direction}) => {
        const c = new Cube();
        const xs = c.intersects(ray(origin, direction));

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
    `.test('the normal on a surface of a cube', ({point, normal}) => {
        const c = new Cube();
        const n = c.normalAt(point);

        expect(tuplesAreEqual(n, normal)).toBe(true);
    });
});


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

        expect(tuplesAreEqual(n, normal)).toBe(true);
    });

    each`
        origin               | direction            | count
        ${point(0, 1.5, 0)}  | ${vector(0.1, 1, 0)} | ${0}
        ${point(0, 3, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 0, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 2, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 1, -5)}   | ${vector(0, 0, 1)}   | ${0}
        ${point(0, 1.5, -2)} | ${vector(0, 0, 1)}   | ${2}
    `.test('a ray strikes a cylinder', ({origin, direction, count}) => {
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

        expect(tuplesAreEqual(n, normal)).toBe(true);
    });

});


describe('Cones', () => {

    each`
        origin             | direction              | t0         | t1
        ${point(0, 0, -5)} | ${vector(0, 0, 1)}     | ${5}       | ${5}
        ${point(0, 0, -5)} | ${vector(1, 1, 1)}     | ${8.66025} | ${8.66025}
        ${point(1, 1, -5)} | ${vector(-0.5, -1, 1)} | ${4.55006} | ${49.44994}
    `.test('intersecting a cone with a ray', ({origin, direction, t0, t1}) => {
        const c = new Cone();
        const xs = c.intersects(ray(origin, normalize(direction)));

        expect(xs.length).toEqual(2);
        expect(xs[0].time).toBeCloseTo(t0);
        expect(xs[1].time).toBeCloseTo(t1);
    });

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
    `.test('intersecting the caps of a closed cone', ({origin, direction, count}) => {
        const c = new Cone();
        c.minimum = -0.5;
        c.maximum = 0.5;
        c.closed = true;
        const xs = c.intersects(ray(origin, normalize(direction)));

        expect(xs.length).toEqual(count);
    });

    each`
        point               | normal          
        ${point(0, 0, 0)}   | ${normalize(vector(0, 0, 0))}
        ${point(1, 1, 1)}   | ${normalize(vector(1, -Math.sqrt(2), 1))}
        ${point(-1, -1, 0)} | ${normalize(vector(-1, 1, 0))} 
    `.test('the normal on a cone', ({point, normal}) => {
        const c = new Cone();
        const n = c.normalAt(point);

        expect(tuplesAreEqual(n, normal)).toBe(true);
    });

});
