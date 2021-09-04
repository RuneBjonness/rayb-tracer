import each from 'jest-each';
import { intersection, prepareComputations } from './intersections';
import { material } from './materials';
import { areEqual, identityMatrix, multiply } from './matrices';
import { ray } from './rays';
import { Cone, CsgShape, Cube, Cylinder, glassSphere, Group, Plane, SmoothTriangle, Sphere, TestShape, Triangle } from './shapes';
import { rotationY, rotationZ, scaling, translation } from './transformations';
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

    test('the default parent is null', () => {
        const s = new TestShape();
        expect(s.parent).toBeNull();
    });

    test('converting a point from world to object space', () => {
        const g1 = new Group();
        g1.transform = rotationY(Math.PI/2);
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
        g1.transform = rotationY(Math.PI/2);
        const g2 = new Group();
        g2.transform = scaling(1, 2, 3);
        const s = new Sphere();
        s.transform = translation(5, 0, 0);
        g1.add(g2);
        g2.add(s);
        
        const n = s.normalToWorld(vector(Math.sqrt(3)/3, Math.sqrt(3)/3, Math.sqrt(3)/3));
    
        expect(tuplesAreEqual(n, vector(0.28571, 0.42857, -0.85714))).toBe(true);
    });

    test('finding normal on a child object', () => {
        const g1 = new Group();
        g1.transform = rotationY(Math.PI/2);
        const g2 = new Group();
        g2.transform = scaling(1, 2, 3);
        const s = new Sphere();
        s.transform = translation(5, 0, 0);
        g1.add(g2);
        g2.add(s);
        
        const n = s.normalAt(point(1.7321, 1.1547, -5.5774));
        
        expect(tuplesAreEqual(n, vector(0.2857, 0.42854, -0.85716))).toBe(true);
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

    test('the bounds of a sphere', () => {
        const s = new Sphere();
        const [min, max] = s.bounds();
    
        expect(min).toEqual(point(-1, -1, -1));
        expect(max).toEqual(point(1, 1, 1));
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

    test('the bounds of a plane', () => {
        const p = new Plane();
        const [min, max] = p.bounds();
    
        expect(min).toEqual(point(Number.NEGATIVE_INFINITY, 0, Number.NEGATIVE_INFINITY));
        expect(max).toEqual(point(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY));
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

    test('the bounds of a cube', () => {
        const c = new Cube();
        const [min, max] = c.bounds();
    
        expect(min).toEqual(point(-1, -1, -1));
        expect(max).toEqual(point(1, 1, 1));
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

        expect(tuplesAreEqual(n, normal)).toBe(true);
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

    test('the bounds of a unbounded cone', () => {
        const c = new Cone();
        const [min, max] = c.bounds();
    
        expect(min).toEqual(point(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY));
        expect(max).toEqual(point(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY));
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

describe('Triangles', () => {
    test('constructing a triangle', () => {
        const p1 = point(0, 1, 0);
        const p2 = point(-1, 0, 0);
        const p3 = point(1, 0, 0);
        const t = new Triangle(p1, p2, p3);

        expect(t.p1).toEqual(p1);
        expect(t.p2).toEqual(p2);
        expect(t.p3).toEqual(p3);

        expect(tuplesAreEqual(t.e1, vector(-1, -1, 0))).toBe(true);
        expect(tuplesAreEqual(t.e2, vector(1, -1, 0))).toBe(true);
        expect(tuplesAreEqual(t.normal, vector(0, 0, -1))).toBe(true);
    });

    test('the normal of a triangle is constant everywhere', () => {
        const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));

        const n1 = t.normalAt(point(0, 0, 0));
        const n2 = t.normalAt(point(10, 0, -10));
        const n3 = t.normalAt(point(-5, 0, 150));

        expect(tuplesAreEqual(n1, t.normal)).toBe(true);
        expect(tuplesAreEqual(n2, t.normal)).toBe(true);
        expect(tuplesAreEqual(n3, t.normal)).toBe(true);
    });

    test('a ray parallel with the triangle will not intersect', () => {
        const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
        const r = ray(point(0, -1, -2), vector(0, 1, 0));
        const xs = t.intersects(r);
    
        expect(xs.length).toBe(0);
    });

    test('a ray misses the p1-p3 edge', () => {
        const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
        const r = ray(point(1, 1, -2), vector(0, 0, 1));
        const xs = t.intersects(r);
    
        expect(xs.length).toBe(0);
    });

    test('a ray misses the p1-p2 edge', () => {
        const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
        const r = ray(point(-1, 1, -2), vector(0, 0, 1));
        const xs = t.intersects(r);
    
        expect(xs.length).toBe(0);
    });

    test('a ray misses the p2-p3 edge', () => {
        const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
        const r = ray(point(0, -1, -2), vector(0, 0, 1));
        const xs = t.intersects(r);
    
        expect(xs.length).toBe(0);
    });

    test('a ray strikes a triangle', () => {
        const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
        const r = ray(point(0, 0.5, -2), vector(0, 0, 1));
        const xs = t.intersects(r);
    
        expect(xs.length).toBe(1);
        expect(xs[0].time).toEqual(2);
    });

    test('the bounds of a triangle', () => {
        const t = new Triangle(point(0, 1, 0), point(-1, 0, 0), point(1, 0, 0));
        const [min, max] = t.bounds();
    
        expect(min).toEqual(point(-1, 0, 0));
        expect(max).toEqual(point(1, 1, 0));
    });
});

describe('Smooth Triangles', () => {
    const p1 = point(0, 1, 0);
    const p2 = point(-1, 0, 0);
    const p3 = point(1, 0, 0);
    const n1 = vector(0, 1, 0);
    const n2 = vector(-1, 0, 0);
    const n3 = vector(1, 0, 0);
    const tri = new SmoothTriangle(p1, p2, p3, n1, n2, n3);


    test('constructing a smooth triangle', () => {
        expect(tri.p1).toEqual(p1);
        expect(tri.p2).toEqual(p2);
        expect(tri.p3).toEqual(p3);
        expect(tri.n1).toEqual(n1);
        expect(tri.n2).toEqual(n2);
        expect(tri.n3).toEqual(n3);
    });

    test('the bounds of a smooth triangle', () => {
        const [min, max] = tri.bounds();
    
        expect(min).toEqual(point(-1, 0, 0));
        expect(max).toEqual(point(1, 1, 0));
    });

    test('an intersection with a smooth triangle stores u/v', () => {
        const r = ray(point(-0.2, 0.3, -2), vector(0, 0, 1));
        const xs = tri.intersects(r);
    
        expect(xs[0].u).toBeCloseTo(0.45);
        expect(xs[0].v).toBeCloseTo(0.25);
    });

    test('a smooth triangle uses u/v to interpolate the normal', () => {
        const i = intersection(1, tri, 0.45, 0.25);
        const n = tri.normalAt(point(0,0,0), i);
    
        expect(tuplesAreEqual(n, vector(-0.5547, 0.83205, 0))).toBe(true);
    });

    test('preparing the normal on a smooth triangle', () => {
        const i = intersection(1, tri, 0.45, 0.25);
        const r = ray(point(-0.2, 0.3, -2), vector(0, 0, 1));
        const comps = prepareComputations(i, r);
    
        expect(tuplesAreEqual(comps.normalv, vector(-0.5547, 0.83205, 0))).toBe(true);
    });
});

describe('Groups', () => {

    test('creating a new group', () => {
        const g = new Group();

        expect(areEqual(g.transform, identityMatrix())).toBe(true);
        expect(g.shapes.length).toBe(0);
    });

    test('adding a child to a group', () => {
        const g = new Group();
        const s = new TestShape()

        g.add(s);

        expect(g.shapes.indexOf(s)).toBeGreaterThanOrEqual(0);
        expect(s.parent).toBe(g);
    });
    
    test('intersecting a ray with an empty group', () => {
        const g = new Group();
        const xs = g.intersects(ray(point(0, 0, 0), vector(0, 0, 1)));
    
        expect(xs.length).toBe(0);
    });

    test('intersecting a ray with a nonempty group', () => {
        const g = new Group();
        const s1 = new Sphere();
        const s2 = new Sphere();
        s2.transform = translation(0, 0, -3);
        const s3 = new Sphere();
        s3.transform = translation(5, 0, 0);

        g.add(s1);
        g.add(s2);
        g.add(s3);
        
        const xs = g.intersects(ray(point(0, 0, -5), vector(0, 0, 1)));
    
        expect(xs.length).toBe(4);
        expect(xs[0].object).toBe(s2);
        expect(xs[1].object).toBe(s2);
        expect(xs[2].object).toBe(s1);
        expect(xs[3].object).toBe(s1);
    });

    test('intersecting a transformed group', () => {
        const g = new Group();
        g.transform = scaling(2, 2, 2);
        const s = new Sphere();
        s.transform = translation(5, 0, 0);
        g.add(s);
        
        const xs = g.intersects(ray(point(10, 0, -10), vector(0, 0, 1)));
    
        expect(xs.length).toBe(2);
    });

    test('the bounds of a group contains all children bounds', () => {
        const s = new Sphere();
        const c = new Cylinder();
        c.minimum = -5;
        c.maximum = 5;

        const g = new Group();
        g.add(s);
        g.add(c);
        
        const [min, max] = g.bounds();
    
        expect(min).toEqual(point(-1, -5, -1));
        expect(max).toEqual(point(1, 5, 1));
    });

    test('the bounds of a group is affected by children transformations', () => {
        const s1 = new Sphere();
        s1.transform = scaling(2, 2, 2);
        const s2 = new Sphere();
        s2.transform = translation(5, 0, 0);

        const g = new Group();
        g.add(s1);
        g.add(s2);
        
        const [min, max] = g.bounds();
    
        expect(min).toEqual(point(-2, -2, -2));
        expect(max).toEqual(point(6, 2, 2));
    });
});

describe('CSG Shapes', () => {

    test('CSG is created with an operation and two shapes', () => {
        const s = new Sphere();
        const c = new Cube();
        const csg = new CsgShape('union', s, c);

        expect(csg.operation).toEqual('union');
        expect(csg.left).toBe(s);
        expect(csg.right).toBe(c);
        expect(s.parent).toBe(csg);
        expect(c.parent).toBe(csg);
    });

    each`
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
    `.test('evaluating the intersections for csg operation $operation', ({operation, leftHit, inLeft, inRight, result}) => {
        const csg = new CsgShape(operation, new TestShape(), new TestShape());

        expect(csg.validIntersection(leftHit, inLeft, inRight)).toBe(result);
    });

    each`
        operation         | x0   | x1
        ${'union'}        | ${0} | ${3}
        ${'intersection'} | ${1} | ${2}
        ${'difference'}   | ${0} | ${1}
    `.test('filtering a list of intersections', ({operation, x0, x1}) => {
        const s = new Sphere();
        const c = new Cube();
        const csg = new CsgShape(operation, s, c);
        const xs = [intersection(1, s), intersection(2, c), intersection(3, s), intersection(4, c)];
        
        const result = csg.filterIntersections(xs);

        expect(result.length).toBe(2);
        expect(result[0]).toStrictEqual(xs[x0]);
        expect(result[1]).toStrictEqual(xs[x1]);
    });

    test('a ray misses a csg shape', () => {
        const s = new Sphere();
        const c = new Cube();
        const csg = new CsgShape('union', s, c);
        
        const r = ray(point(0, 2, -5), vector(0, 0, 1));
        const xs = csg.intersects(r);
    
        expect(xs.length).toBe(0);
    });

    test('a ray hits a csg shape', () => {
        const s1 = new Sphere();
        const s2 = new Sphere();
        s2.transform = translation(0, 0, 0.5);
        const csg = new CsgShape('union', s1, s2);
        
        const r = ray(point(0, 0, -5), vector(0, 0, 1));
        const xs = csg.intersects(r);
    
        expect(xs.length).toBe(2);
        expect(xs[0].time).toEqual(4);
        expect(xs[0].object).toBe(s1);
        expect(xs[1].time).toEqual(6.5);
        expect(xs[1].object).toBe(s2);
    });

    test('the bounds of a csg contains both operands bounds', () => {
        const s = new Sphere();
        const c = new Cylinder();
        c.minimum = -5;
        c.maximum = 5;

        const csg = new CsgShape('union', s, c);
        const [min, max] = csg.bounds();
    
        expect(min).toEqual(point(-1, -5, -1));
        expect(max).toEqual(point(1, 5, 1));
    });

    test('the bounds of a csg is affected by children transformations', () => {
        const s1 = new Sphere();
        s1.transform = scaling(2, 2, 2);
        const s2 = new Sphere();
        s2.transform = translation(5, 0, 0);

        const csg = new CsgShape('union', s1, s2);
        const [min, max] = csg.bounds();
    
        expect(min).toEqual(point(-2, -2, -2));
        expect(max).toEqual(point(6, 2, 2));
    });
});
