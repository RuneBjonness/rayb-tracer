import { material } from './materials';
import { areEqual, identityMatrix, multiply } from './matrices';
import { ray } from './rays';
import { glassSphere, Plane, Sphere, TestShape } from './shapes';
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