import { World, defaultWorld } from './world';
import { pointLight } from './lights';
import { areEqual, color, point, vector } from './tuples'
import { scaling, translation } from './transformations';
import { ray } from './rays';
import { intersection, prepareComputations } from './intersections';
import { TestPattern } from './patterns';
import { Plane } from './shapes/primitives/plane';
import { Sphere } from './shapes/primitives/sphere';

test('creating a world', () => {
    const w = new World();

    expect(w.lights.length).toBe(0);
    expect(w.objects.length).toBe(0);
});

test('the default world', () => {
    const light = pointLight(point(-10, 10, -10), color(1, 1, 1));

    const s1 = new Sphere();
    s1.material.color = color(0.8, 1.0, 0.6)
    s1.material.diffuse = 0.7;
    s1.material.specular = 0.2;

    const s2 = new Sphere();
    s2.transform = scaling(0.5, 0.5, 0.5);

    const w = defaultWorld();

    expect(w.lights[0]).toStrictEqual(light);
    expect(w.objects[0]).toStrictEqual(s1);
    expect(w.objects[1]).toStrictEqual(s2);
});

test('creating a world', () => {
    const w = defaultWorld();
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const xs = w.intersects(r);

    expect(xs.length).toBe(4);
    expect(xs[0].time).toEqual(4);
    expect(xs[1].time).toEqual(4.5);
    expect(xs[2].time).toEqual(5.5);
    expect(xs[3].time).toEqual(6);
});

test('shading an intersection', () => {
    const w = defaultWorld();
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const shape = w.objects[0];
    const i = intersection(4, shape);

    const c = w.shadeHit(prepareComputations(i, r));

    expect(areEqual(c, color(0.38066, 0.47583, 0.2855))).toBe(true);
});

test('shading an intersection from the inside', () => {
    const w = defaultWorld();
    w.lights[0] = pointLight(point(0, 0.25, 0), color(1, 1, 1));
    const r = ray(point(0, 0, 0), vector(0, 0, 1));
    const shape = w.objects[1];
    const i = intersection(0.5, shape);

    const c = w.shadeHit(prepareComputations(i, r));

    expect(areEqual(c, color(0.90498, 0.90498, 0.90498))).toBe(true);
});

test('the color when a ray misses', () => {
    const w = defaultWorld();
    const r = ray(point(0, 0, -5), vector(0, 1, 0));
    const c = w.colorAt(r);

    expect(areEqual(c, color(0.0, 0.0, 0.0))).toBe(true);
});

test('the color when a ray hits', () => {
    const w = defaultWorld();
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const c = w.colorAt(r);

    expect(areEqual(c, color(0.38066, 0.47583, 0.2855))).toBe(true);
});

test('the color with an intersection behind the ray', () => {
    const w = defaultWorld();
    const outer = w.objects[0];
    outer.material.ambient = 1;

    const inner = w.objects[1];
    inner.material.ambient = 1;

    const r = ray(point(0, 0, 0.75), vector(0, 0, -1));
    const c = w.colorAt(r);

    expect(areEqual(c, inner.material.color)).toBe(true);
});

test('there is no shadow when nothing is collinear with point and light', () => {
    const w = defaultWorld();
    const p = point(0, 10, 0);

    expect(w.isShadowed(p, w.lights[0])).toBe(false);
});

test('the shadow when an object is between the point and the light', () => {
    const w = defaultWorld();
    const p = point(10, -10, 10);

    expect(w.isShadowed(p, w.lights[0])).toBe(true);
});

test('there is no shadow when an object is behind the light', () => {
    const w = defaultWorld();
    const p = point(-20, 20, -20);

    expect(w.isShadowed(p, w.lights[0])).toBe(false);
});

test('there is no shadow when an object is behind the point', () => {
    const w = defaultWorld();
    const p = point(-2, 2, -2);

    expect(w.isShadowed(p, w.lights[0])).toBe(false);
});

test('shading an intersection in shadow', () => {
    const w = new World();
    w.lights.push(pointLight(point(0, 0, -10), color(1, 1, 1)));
    const s = new Sphere();
    s.transform = translation(0, 0, 10);
    w.objects.push(new Sphere(), s);
    
    const r = ray(point(0, 0, 5), vector(0, 0, 1));
    const i = intersection(4, s);

    const c = w.shadeHit(prepareComputations(i, r));

    expect(areEqual(c, color(0.1, 0.1, 0.1))).toBe(true);
});

test('the reflected color for a nonreflective material', () => {
    const w = defaultWorld();
    const r = ray(point(0, 0, 0), vector(0, 0, 1));
    w.objects[1].material.ambient = 1;
    const i = intersection(1, w.objects[1]);

    const comps = prepareComputations(i, r);
    const c = w.reflectedColor(comps);

    expect(areEqual(c, color(0, 0, 0))).toBe(true);
});

test('the reflected color for a reflective material', () => {
    const w = defaultWorld();
    const shape = new Plane();
    shape.material.reflective = 0.5;
    shape.transform = translation(0, -1, 0);
    w.objects.push(shape);

    const r = ray(point(0, 0, -3), vector(0, -Math.sqrt(2)/2, Math.sqrt(2)/2));
    const i = intersection(Math.sqrt(2), shape);

    const comps = prepareComputations(i, r);
    const c = w.reflectedColor(comps);

    expect(areEqual(c, color(0.19035, 0.23793, 0.14276))).toBe(true);
});

test('shadeHit() with a reflective material', () => {
    const w = defaultWorld();
    const shape = new Plane();
    shape.material.reflective = 0.5;
    shape.transform = translation(0, -1, 0);
    w.objects.push(shape);

    const r = ray(point(0, 0, -3), vector(0, -Math.sqrt(2)/2, Math.sqrt(2)/2));
    const i = intersection(Math.sqrt(2), shape);

    const comps = prepareComputations(i, r);
    const c = w.shadeHit(comps);

    expect(areEqual(c, color(0.87677, 0.92436, 0.82918))).toBe(true);
});

test('colorAt() with mutually reflective surfaces', () => {
    const w = new World();
    w.lights.push(pointLight(point(0,0,0), color(1, 1, 1)));

    const lower = new Plane();
    lower.material.reflective = 1;
    lower.transform = translation(0, -1, 0);
    w.objects.push(lower);

    const upper = new Plane();
    upper.material.reflective = 1;
    upper.transform = translation(0, 1, 0);
    w.objects.push(upper);

    const r = ray(point(0, 0, 0), vector(0, 1, 1));
    const c = w.colorAt(r);

    expect(c).toBeTruthy();
});

test('the reflected color at maximum recursive depth', () => {
    const w = defaultWorld();
    const shape = new Plane();
    shape.material.reflective = 0.5;
    shape.transform = translation(0, -1, 0);
    w.objects.push(shape);

    const r = ray(point(0, 0, -3), vector(0, -Math.sqrt(2)/2, Math.sqrt(2)/2));
    const i = intersection(Math.sqrt(2), shape);

    const comps = prepareComputations(i, r);
    const c = w.reflectedColor(comps, 0);

    expect(areEqual(c, color(0, 0, 0))).toBe(true);
});

test('the refracted color with an opaque surface', () => {
    const w = defaultWorld();
    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const xs = [
        intersection(4, w.objects[0]), 
        intersection(6, w.objects[0])
    ];

    const comps = prepareComputations(xs[0], r, xs);
    const c = w.refractedColor(comps);

    expect(areEqual(c, color(0, 0, 0))).toBe(true);
});

test('the refracted color at maximum recursive depth', () => {
    const w = defaultWorld();
    w.objects[0].material.transparancy = 1.0;
    w.objects[0].material.refractiveIndex = 1.5;

    const r = ray(point(0, 0, -5), vector(0, 0, 1));
    const xs = [
        intersection(4, w.objects[0]), 
        intersection(6, w.objects[0])
    ];

    const comps = prepareComputations(xs[0], r, xs);
    const c = w.refractedColor(comps, 0);

    expect(areEqual(c, color(0, 0, 0))).toBe(true);
});

test('the refracted color at under total internal reflection', () => {
    const w = defaultWorld();
    w.objects[0].material.transparancy = 1.0;
    w.objects[0].material.refractiveIndex = 1.5;

    const r = ray(point(0, 0, Math.sqrt(2)/2), vector(0, 1, 0));
    const xs = [
        intersection(-Math.sqrt(2)/2, w.objects[0]), 
        intersection(Math.sqrt(2)/2, w.objects[0])
    ];

    const comps = prepareComputations(xs[1], r, xs);
    const c = w.refractedColor(comps);

    expect(areEqual(c, color(0, 0, 0))).toBe(true);
});

test('the refracted color with a refracted ray', () => {
    const w = defaultWorld();
    w.objects[0].material.ambient = 1.0;
    w.objects[0].material.pattern = new TestPattern();

    w.objects[1].material.transparancy = 1.0;
    w.objects[1].material.refractiveIndex = 1.5;

    const r = ray(point(0, 0, 0.1), vector(0, 1, 0));
    const xs = [
        intersection(-0.9899, w.objects[0]), 
        intersection(-0.4899, w.objects[1]),
        intersection(0.4899, w.objects[1]),
        intersection(0.9899, w.objects[0])
    ];

    const comps = prepareComputations(xs[2], r, xs);
    const c = w.refractedColor(comps, 5);

    expect(areEqual(c, color(0, 0.99888, 0.04725))).toBe(true);
});

test('shadeHit() with a transparent material', () => {
    const w = defaultWorld();
    const floor = new Plane();
    floor.material.transparancy = 0.5;
    floor.material.refractiveIndex = 1.5;
    floor.transform = translation(0, -1, 0);
    w.objects.push(floor);

    const ball = new Sphere();
    ball.material.color = [1, 0, 0];
    ball.material.ambient = 0.5;
    ball.transform = translation(0, -3.5, -0.5);
    w.objects.push(ball);

    const r = ray(point(0, 0, -3), vector(0, -Math.sqrt(2)/2, Math.sqrt(2)/2));
    const i = intersection(Math.sqrt(2), floor);

    const comps = prepareComputations(i, r);
    const c = w.shadeHit(comps, 5);

    expect(areEqual(c, color(0.93642, 0.68642, 0.68642))).toBe(true);
});

test('shadeHit() with a reflective and transparent material', () => {
    const w = defaultWorld();
    const floor = new Plane();
    floor.material.reflective = 0.5;
    floor.material.transparancy = 0.5;
    floor.material.refractiveIndex = 1.5;
    floor.transform = translation(0, -1, 0);
    w.objects.push(floor);

    const ball = new Sphere();
    ball.material.color = [1, 0, 0];
    ball.material.ambient = 0.5;
    ball.transform = translation(0, -3.5, -0.5);
    w.objects.push(ball);

    const r = ray(point(0, 0, -3), vector(0, -Math.sqrt(2)/2, Math.sqrt(2)/2));
    const i = intersection(Math.sqrt(2), floor);

    const comps = prepareComputations(i, r);
    const c = w.shadeHit(comps, 5);

    expect(areEqual(c, color(0.93391, 0.69643, 0.69243))).toBe(true);
});
