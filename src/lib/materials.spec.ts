import { PointLight } from './lights';
import { lighting, material } from './materials';
import { StripePattern } from './patterns';
import { Sphere } from './shapes/primitives/sphere';
import { areEqual, color, point, Tuple, vector } from './tuples'
import { defaultWorld } from './world';

test('the default material', () => {
    const m = material();

    expect(areEqual(m.color, color(1, 1, 1))).toBe(true);
    expect(m.ambient).toEqual(0.1);
    expect(m.diffuse).toEqual(0.9);
    expect(m.specular).toEqual(0.9);
    expect(m.shininess).toEqual(200);
    expect(m.reflective).toEqual(0.0);
    expect(m.transparancy).toEqual(0.0);
    expect(m.refractiveIndex).toEqual(1.0);
});

describe('lighting features', () => {
    const shape = new Sphere();
    const position = point(0, 0, 0);
    const normalv = vector(0, 0, -1);

    test('lighting with the eye between the light and the surface', () => {
        const eyev = vector(0, 0, -1);
        const light = new PointLight(point(0, 0, -10), color(1, 1, 1));

        const result = lighting(shape, light, position, eyev, normalv, 1);

        expect(areEqual(result, color(1.9, 1.9, 1.9))).toBe(true);
    });
    
    test('lighting with the eye between the light and the surface, eye offset 45deg', () => {
        const eyev = vector(0, Math.sqrt(2) / 2, -(Math.sqrt(2) / 2));
        const light = new PointLight(point(0, 0, -10), color(1, 1, 1));

        const result = lighting(shape, light, position, eyev, normalv, 1);

        expect(areEqual(result, color(1.0, 1.0, 1.0))).toBe(true);
    });

    test('lighting with the eye opposite surface, light offset 45deg', () => {
        const eyev = vector(0, 0, -1);
        const light = new PointLight(point(0, 10, -10), color(1, 1, 1));

        const result = lighting(shape, light, position, eyev, normalv, 1);

        expect(areEqual(result, color(0.7364, 0.7364, 0.7364))).toBe(true);
    });

    test('lighting with the eye in the path of the reflection vector', () => {
        const eyev = vector(0, -(Math.sqrt(2) / 2), -(Math.sqrt(2) / 2));
        const light = new PointLight(point(0, 10, -10), color(1, 1, 1));

        const result = lighting(shape, light, position, eyev, normalv, 1);

        expect(areEqual(result, color(1.6364, 1.6364, 1.6364))).toBe(true);
    });

    test('lighting with the light behind the surface', () => {
        const eyev = vector(0, 0, -1);
        const light = new PointLight(point(0, 0, 10), color(1, 1, 1));

        const result = lighting(shape, light, position, eyev, normalv, 1);

        expect(areEqual(result, color(0.1, 0.1, 0.1))).toBe(true);
    });

    test('lighting() uses light intensity to attenuate color', () => {
        const w = defaultWorld();
        w.lights[0] = new PointLight(point(0, 0, -10), color(1, 1, 1));
        w.objects[0].material.ambient = 0.1;
        w.objects[0].material.diffuse = 0.9;
        w.objects[0].material.specular = 0;
        w.objects[0].material.color = color(1, 1, 1);

        const pt = point(0, 0, -1);
        const eyev = vector(0, 0, -1);

        expect(areEqual(lighting(w.objects[0], w.lights[0], pt, eyev, normalv, 1.0), color(1, 1, 1))).toBe(true);
        expect(areEqual(lighting(w.objects[0], w.lights[0], pt, eyev, normalv, 0.5), color(0.55, 0.55, 0.55))).toBe(true);
        expect(areEqual(lighting(w.objects[0], w.lights[0], pt, eyev, normalv, 0.0), color(0.1, 0.1, 0.1))).toBe(true);
    });

    test('lighting with a pattern applied', () => {
        const c1 = color(1, 1, 1);
        const c2 = color(0, 0, 0);
        const shape = new Sphere();
        shape.material.pattern = new StripePattern(c1, c2);
        shape.material.ambient = 1;
        shape.material.diffuse = 0;
        shape.material.specular = 0;

        const eyev = vector(0, 0, -1);
        const light = new PointLight(point(0, 0, -10), color(1, 1, 1));

        const a = lighting(shape, light, point(0.9, 0, 0), eyev, normalv, 0);
        const b = lighting(shape, light, point(1.1, 0, 0), eyev, normalv, 0);

        expect(areEqual(a, c1)).toBe(true);
        expect(areEqual(b, c2)).toBe(true);
    });
});
