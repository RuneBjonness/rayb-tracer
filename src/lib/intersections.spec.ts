import each from 'jest-each';
import { hit, intersection, prepareComputations, reflectance } from './intersections';
import { ray } from './rays';
import { glassSphere, Plane, Sphere } from './shapes';
import { scaling, translation } from './transformations';
import { areEqual, point, vector } from './tuples';

test('an intersection encapsulates time and object', () => {
    const s = new Sphere();
    const i = intersection(3.5, s);

    expect(i.time).toEqual(3.5);
    expect(i.object).toBe(s);
});

test('aggregating intersections', () => {
    const s = new Sphere();
    const i1 = intersection(1, s);
    const i2 = intersection(2, s);

    const xs = [i1, i2];

    expect(xs[0].object).toBe(s);
    expect(xs[0].time).toEqual(1);
    
    expect(xs[1].object).toBe(s);
    expect(xs[1].time).toEqual(2);
});

test('the hit, when all intersections have positive time', () => {
    const s = new Sphere();
    const i1 = intersection(1, s);
    const i2 = intersection(2, s);
    const xs = [i2, i1];

    const i = hit(xs);

    expect(i).toBe(i1);
});

test('the hit, when some intersections have negative time', () => {
    const s = new Sphere();
    const i1 = intersection(-1, s);
    const i2 = intersection(1, s);
    const xs = [i2, i1];

    const i = hit(xs);

    expect(i).toBe(i2);
});

test('the hit, when all intersections have negative time', () => {
    const s = new Sphere();
    const i1 = intersection(-2, s);
    const i2 = intersection(-1, s);
    const xs = [i2, i1];

    const i = hit(xs);

    expect(i).toBeNull();
});

test('the hit is always the lowest nonnegative intersection', () => {
    const s = new Sphere();
    const i1 = intersection(5, s);
    const i2 = intersection(7, s);
    const i3 = intersection(-3, s);
    const i4 = intersection(2, s);
    const xs = [i1, i2, i3, i4];

    const i = hit(xs);

    expect(i).toBe(i4);
});

test('precomputing the state of an intersection', () => {
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new Sphere();
    const i = intersection(4, s);

    const comps = prepareComputations(i, r);

    expect(comps.t).toEqual(i.time);
    expect(comps.object).toEqual(i.object);
    expect(areEqual(comps.point, point(0, 0, -1))).toBe(true);
    expect(areEqual(comps.eyev, vector(0, 0, -1))).toBe(true);
    expect(areEqual(comps.normalv, vector(0, 0, -1))).toBe(true);
});

test('the hit, when an intersection occurs on the outside', () => {
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new Sphere();
    const i = intersection(4, s);
    const comps = prepareComputations(i, r);

    expect(comps.inside).toEqual(false);
});

test('the hit, when an intersection occurs on the inside', () => {
    const r = ray(point(0, 0, 0), vector(0, 0, 1));
    const s = new Sphere();
    const i = intersection(1, s);
    const comps = prepareComputations(i, r);

    expect(areEqual(comps.point, point(0, 0, 1))).toBe(true);
    expect(areEqual(comps.eyev, vector(0, 0, -1))).toBe(true);
    expect(comps.inside).toEqual(true);
    expect(areEqual(comps.normalv, vector(0, 0, -1))).toBe(true);
});

test('the hit should offset the point', () => {
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const s = new Sphere();
    s.transform = translation(0, 0, 1);
    const i = intersection(5, s);

    const comps = prepareComputations(i, r);

    expect(comps.overPoint[2]).toBeLessThan(-0.00001/2);
    expect(comps.point[2]).toBeGreaterThan(comps.overPoint[2]);
});

test('precompuiting the reflection vector', () => {
    const shape = new Plane();
    const r = ray(point(0, 1, -1), vector(0, -Math.sqrt(2)/2, Math.sqrt(2)/2));
    const i = intersection(Math.sqrt(2), shape);
    const comps = prepareComputations(i, r);

    expect(areEqual(comps.reflectv, vector(0, Math.sqrt(2)/2, Math.sqrt(2)/2))).toBe(true);
});

describe('finding n1 and n2 at various intersections', () => {
    const a = glassSphere();
    a.transform = scaling(2, 2, 2);
    const b = glassSphere();
    b.transform = translation(0, 0, -0.25);
    b.material.refractiveIndex = 2.0;
    const c = glassSphere();
    c.transform = translation(0, 0, 0.25);
    c.material.refractiveIndex = 2.5;

    const r = ray(point(0, 0, -4), vector(0, 0, 1));
    each`
        index | n1     | n2
        ${0}  | ${1.0} | ${1.5}
        ${1}  | ${1.5} | ${2.0}
        ${2}  | ${2.0} | ${2.5}
        ${3}  | ${2.5} | ${2.5}
        ${4}  | ${2.5} | ${1.5}
        ${5}  | ${1.5} | ${1.0}
    `.test('at index $index', ({index, n1, n2}) => {
        const xs = [
            intersection(2, a),
            intersection(2.75, b),
            intersection(3.25, c),
            intersection(4.75, b),
            intersection(5.25, c),
            intersection(6, a)
        ];

        const comps = prepareComputations(xs[index], r, xs);

        expect(comps.n1).toEqual(n1);
        expect(comps.n2).toEqual(n2);
    });
});

test('the underPoint is offset below the surface', () => {
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const s = glassSphere();
    s.transform = translation(0, 0, 1);
    const i = intersection(5, s);

    const comps = prepareComputations(i, r);

    expect(comps.underPoint[2]).toBeGreaterThan(-0.00001/2);
    expect(comps.point[2]).toBeLessThan(comps.underPoint[2]);
});

test('the Schlick approximation under total internal reflection', () => {
    const s = glassSphere();
    const r = ray(point(0, 0, Math.sqrt(2)/2), vector(0, 1, 0));
    const xs = [intersection(-Math.sqrt(2)/2, s), intersection(Math.sqrt(2)/2, s)];

    const comps = prepareComputations(xs[1], r, xs);

    expect(reflectance(comps)).toEqual(1.0);
});

test('the Schlick approximation with a perpendicular viewing angle', () => {
    const s = glassSphere();
    const r = ray(point(0, 0, 0), vector(0, 1, 0));
    const xs = [intersection(-1, s), intersection(1, s)];

    const comps = prepareComputations(xs[1], r, xs);

    expect(reflectance(comps)).toBeCloseTo(0.04);
});

test('the Schlick approximation with a small angle and n2 > n1', () => {
    const s = glassSphere();
    const r = ray(point(0, 0.99, -2), vector(0, 0, 1));
    const i = intersection(1.8589, s);

    const comps = prepareComputations(i, r);

    expect(reflectance(comps)).toBeCloseTo(0.48873);
});
