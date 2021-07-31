import { areEqual, identityMatrix } from './matrices';
import { Checkers3dPattern, GradientPattern, RadialGradientPattern, RingPattern, SolidPattern, StripePattern, TestPattern } from './patterns';
import { Sphere } from './shapes';
import { scaling, translation } from './transformations';
import { point, areEqual as tuplesAreEqual, color } from './tuples'


describe('Common pattern features', () => {

    test('the default transformation', () => {
        const p = new TestPattern();
        expect(areEqual(p.transform, identityMatrix())).toBe(true);
    });
    
    test('assigning transformation', () => {
        const p = new TestPattern();
        const t = translation(1, 2, 3);
        p.transform = t;
    
        expect(areEqual(p.transform, t)).toBe(true);
    });

    test('a pattern with an object transformation', () => {
        const s = new Sphere();
        s.transform = scaling(2, 2, 2);
        const p = new TestPattern();
        const c = p.colorAt(s, point(2, 3, 4));
        
        expect(tuplesAreEqual(c, color(1, 1.5, 2))).toBe(true);
    });

    test('a pattern with a pattern transformation', () => {
        const s = new Sphere();
        const p = new TestPattern();
        p.transform = scaling(2, 2, 2);
        const c = p.colorAt(s, point(2, 3, 4));
        
        expect(tuplesAreEqual(c, color(1, 1.5, 2))).toBe(true);
    });
    
    test('a pattern with both an object and a pattern transformation', () => {
        const s = new Sphere();
        s.transform = scaling(2, 2, 2);
        const p = new TestPattern();
        p.transform = translation(0.5, 1, 1.5);
        const c = p.colorAt(s, point(2.5, 3, 3.5));

        expect(tuplesAreEqual(c, color(0.75, 0.5, 0.25))).toBe(true);
    });
});

describe('Stripe pattern', () => {
    const black = color(0, 0, 0);
    const white = color(1, 1, 1);
    const s = new Sphere();
    const p = new StripePattern(white, black);
   
    test('creating a stripe pattern', () => {
        expect(p.a).toBe(white);
        expect(p.b).toBe(black);
    });

    test('a stripe pattern is contant in y', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(0, 1, 0))).toBe(white);
        expect(p.colorAt(s, point(0, 2, 0))).toBe(white);
    });

    test('a stripe pattern is contant in z', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(0, 0, 1))).toBe(white);
        expect(p.colorAt(s, point(0, 0, 2))).toBe(white);
    });

    test('a stripe pattern alternates in x', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(0.9, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(1, 0, 0))).toBe(black);
        expect(p.colorAt(s, point(-0.1, 0, 0))).toBe(black);
        expect(p.colorAt(s, point(-1, 0, 0))).toBe(black);
        expect(p.colorAt(s, point(-1.1, 0, 0))).toBe(white);
    });
});

describe('Gradient pattern', () => {
    const black = color(0, 0, 0);
    const white = color(1, 1, 1);
    const s = new Sphere();
    const p = new GradientPattern(white, black);

    test('a gradient linearly interpolates between colors', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toStrictEqual(white);
        expect(p.colorAt(s, point(0.25, 0, 0))).toStrictEqual(color(0.75, 0.75, 0.75));
        expect(p.colorAt(s, point(0.5, 0, 0))).toStrictEqual(color(0.5, 0.5, 0.5));
        expect(p.colorAt(s, point(0.75, 0, 0))).toStrictEqual(color(0.25, 0.25, 0.25));
    });
});

describe('Ring pattern', () => {
    const black = color(0, 0, 0);
    const white = color(1, 1, 1);
    const p = new RingPattern(white, black);
    const s = new Sphere();

    test('a ring should extend in both x and z', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toStrictEqual(white);
        expect(p.colorAt(s, point(1, 0, 0))).toStrictEqual(black);
        expect(p.colorAt(s, point(0, 0, 1))).toStrictEqual(black);
        expect(p.colorAt(s, point(0.708, 0, 0.708))).toStrictEqual(black);
    });
});

describe('Checkers 3D pattern', () => {
    const black = color(0, 0, 0);
    const white = color(1, 1, 1);
    const p = new Checkers3dPattern(white, black);
    const s = new Sphere();

    test('should repeat in x', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(0.99, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(1.01, 0, 0))).toBe(black);
    });

    test('should repeat in y', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(0, 0.99, 0))).toBe(white);
        expect(p.colorAt(s, point(0, 1.01, 0))).toBe(black);
    });

    test('should repeat in z', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toBe(white);
        expect(p.colorAt(s, point(0, 0, 0.99))).toBe(white);
        expect(p.colorAt(s, point(0, 0, 1.01))).toBe(black);
    });
});

describe('Radial Gradient pattern', () => {
    const black = color(0, 0, 0);
    const white = color(1, 1, 1);
    const s = new Sphere();
    const p = new RadialGradientPattern(white, black);

    test('a radial gradient linearly interpolates between colors in both x and z', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toStrictEqual(white);
        expect(p.colorAt(s, point(0.25, 0, 0))).toStrictEqual(color(0.75, 0.75, 0.75));
        expect(p.colorAt(s, point(0, 0, 0.5))).toStrictEqual(color(0.5, 0.5, 0.5));
        expect(p.colorAt(s, point(0.75, 0, 0))).toStrictEqual(color(0.25, 0.25, 0.25));
        expect(tuplesAreEqual(p.colorAt(s, point(0.707107, 0, 0.707107)), white)).toBe(true);
    });
});

describe('Solid pattern', () => {
    const white = color(1, 1, 1);
    const p = new SolidPattern(white);
    const s = new Sphere();

    test('any point should return the specified color', () => {
        expect(p.colorAt(s, point(0, 0, 0))).toStrictEqual(white);
        expect(p.colorAt(s, point(-0.7, 10, 0.33))).toStrictEqual(white);
    });
});
