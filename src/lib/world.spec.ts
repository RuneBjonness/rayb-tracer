import { World } from './world';
import { PointLight } from './lights';
import { Color } from './math/color';
import { scaling, translation } from './math/transformations';
import { Ray } from './rays';
import { intersection, prepareComputations } from './intersections';
import { Plane } from './shapes/primitives/plane';
import { Sphere } from './shapes/primitives/sphere';
import each from 'jest-each';
import { point, vector } from './math/vector4';
import { material } from './material/materials';
import { TestPattern } from './material/patterns.spec';

export function defaultWorld(): World {
  const w = new World();
  w.lights.push(new PointLight(point(-10, 10, -10), new Color(1, 1, 1)));

  const mat = material();
  mat.color = new Color(0.8, 1.0, 0.6);
  mat.diffuse = 0.7;
  mat.specular = 0.2;

  const mats = [material(), mat];

  const s1 = new Sphere();
  s1.materialDefinitions = mats;
  s1.materialIdx = 1;
  w.objects.push(s1);

  const s2 = new Sphere();
  s2.materialDefinitions = mats;
  s2.materialIdx = 0;
  s2.transform = scaling(0.5, 0.5, 0.5);
  w.objects.push(s2);
  return w;
}

test('creating a world', () => {
  const w = new World();

  expect(w.lights.length).toBe(0);
  expect(w.objects.length).toBe(0);
});

test('intersections for all objects in world', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
  const xs = w.intersects(r);

  expect(xs.length).toBe(4);
  expect(xs[0].time).toEqual(4);
  expect(xs[1].time).toEqual(4.5);
  expect(xs[2].time).toEqual(5.5);
  expect(xs[3].time).toEqual(6);
});

test('hits any objects in world', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
  const hitsAny = w.hitsAny(r, 10);

  expect(hitsAny).toBe(true);
});

test('hits no objects in world before a ray reaches the cloesest object', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
  const hitsAny = w.hitsAny(r, 3);

  expect(hitsAny).toBe(false);
});

test('shading an intersection', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
  const shape = w.objects[0];
  const i = intersection(4, shape);

  const c = w.shadeHit(prepareComputations(i, r));

  expect(c.equals(new Color(0.38066, 0.47583, 0.2855))).toBe(true);
});

test('shading an intersection from the inside', () => {
  const w = defaultWorld();
  w.lights[0] = new PointLight(point(0, 0.25, 0), new Color(1, 1, 1));
  const r = new Ray(point(0, 0, 0), vector(0, 0, 1));
  const shape = w.objects[1];
  const i = intersection(0.5, shape);

  const c = w.shadeHit(prepareComputations(i, r));

  expect(c.equals(new Color(0.90498, 0.90498, 0.90498))).toBe(true);
});

test('the color when a ray misses', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, -5), vector(0, 1, 0));
  const c = w.colorAt(r);

  expect(c.equals(new Color(0.0, 0.0, 0.0))).toBe(true);
});

test('the color when a ray hits', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
  const c = w.colorAt(r);

  expect(c.equals(new Color(0.38066, 0.47583, 0.2855))).toBe(true);
});

test('the color with an intersection behind the ray', () => {
  const w = defaultWorld();
  const outer = w.objects[0];
  outer.material.ambient = 1;

  const inner = w.objects[1];
  inner.material.ambient = 1;

  const r = new Ray(point(0, 0, 0.75), vector(0, 0, -1));
  const c = w.colorAt(r);

  expect(c.equals(inner.material.color)).toBe(true);
});

// prettier-ignore
each`
    case                                                | p                      | result
    ${'nothing is collinear with point and light'}      | ${point(0, 10, 0)}     | ${false}
    ${'an object is between the point and the light'}   | ${point(10, -10, 10)}  | ${true}
    ${'an object is behind the light'}                  | ${point(-20, 20, -20)} | ${false}
    ${'an object is behind the point'}                  | ${point(-2, 2, -2)}    | ${false}
`.test('isShadowed() when $case', ({ p, result }) => {
  const w = defaultWorld();
  const lightPos = point(-10, 10, -10);
  expect(w.isShadowed(p, lightPos)).toBe(result);
});

test('shading an intersection in shadow', () => {
  const w = new World();
  w.lights.push(new PointLight(point(0, 0, -10), new Color(1, 1, 1)));
  const s = new Sphere();
  s.transform = translation(0, 0, 10);
  w.objects.push(new Sphere(), s);

  const r = new Ray(point(0, 0, 5), vector(0, 0, 1));
  const i = intersection(4, s);

  const c = w.shadeHit(prepareComputations(i, r));

  expect(c.equals(new Color(0.1, 0.1, 0.1))).toBe(true);
});

test('the reflected color for a nonreflective material', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, 0), vector(0, 0, 1));
  w.objects[1].material.ambient = 1;
  const i = intersection(1, w.objects[1]);

  const comps = prepareComputations(i, r);
  const c = w.reflectedColor(comps);

  expect(c.equals(new Color(0, 0, 0))).toBe(true);
});

test('the reflected color for a reflective material', () => {
  const w = defaultWorld();
  const shape = new Plane();
  const mat = material();
  mat.reflective = 0.5;
  shape.materialDefinitions = [mat];
  shape.material = mat;
  shape.transform = translation(0, -1, 0);
  w.objects.push(shape);

  const r = new Ray(
    point(0, 0, -3),
    vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
  );
  const i = intersection(Math.sqrt(2), shape);

  const comps = prepareComputations(i, r);
  const c = w.reflectedColor(comps);

  expect(c.equals(new Color(0.19035, 0.23793, 0.14276))).toBe(true);
});

test('shadeHit() with a reflective material', () => {
  const w = defaultWorld();
  const shape = new Plane();
  const mat = material();
  mat.reflective = 0.5;
  shape.materialDefinitions = [mat];
  shape.material = mat;
  shape.transform = translation(0, -1, 0);
  w.objects.push(shape);

  const r = new Ray(
    point(0, 0, -3),
    vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
  );
  const i = intersection(Math.sqrt(2), shape);

  const comps = prepareComputations(i, r);
  const c = w.shadeHit(comps);

  expect(c.equals(new Color(0.87677, 0.92436, 0.82918))).toBe(true);
});

test('colorAt() with mutually reflective surfaces', () => {
  const w = new World();
  w.lights.push(new PointLight(point(0, 0, 0), new Color(1, 1, 1)));

  const lower = new Plane();
  const mat = material();
  mat.reflective = 1;
  lower.materialDefinitions = [mat];
  lower.material = mat;
  lower.transform = translation(0, -1, 0);
  w.objects.push(lower);

  const upper = new Plane();
  upper.materialDefinitions = [mat];
  upper.material = mat;
  upper.transform = translation(0, 1, 0);
  w.objects.push(upper);

  const r = new Ray(point(0, 0, 0), vector(0, 1, 1));
  const c = w.colorAt(r);

  expect(c).toBeTruthy();
});

test('the reflected color at maximum recursive depth', () => {
  const w = defaultWorld();
  const shape = new Plane();
  const mat = material();
  mat.reflective = 0.5;
  shape.materialDefinitions = [mat];
  shape.material = mat;
  shape.transform = translation(0, -1, 0);
  w.objects.push(shape);

  const r = new Ray(
    point(0, 0, -3),
    vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
  );
  const i = intersection(Math.sqrt(2), shape);

  const comps = prepareComputations(i, r);
  const c = w.reflectedColor(comps, 0);

  expect(c.equals(new Color(0, 0, 0))).toBe(true);
});

test('the refracted color with an opaque surface', () => {
  const w = defaultWorld();
  const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
  const xs = [intersection(4, w.objects[0]), intersection(6, w.objects[0])];

  const comps = prepareComputations(xs[0], r, xs);
  const c = w.refractedColor(comps);

  expect(c.equals(new Color(0, 0, 0))).toBe(true);
});

test('the refracted color at maximum recursive depth', () => {
  const w = defaultWorld();
  w.objects[0].material.transparency = 1.0;
  w.objects[0].material.refractiveIndex = 1.5;

  const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
  const xs = [intersection(4, w.objects[0]), intersection(6, w.objects[0])];

  const comps = prepareComputations(xs[0], r, xs);
  const c = w.refractedColor(comps, 0);

  expect(c.equals(new Color(0, 0, 0))).toBe(true);
});

test('the refracted color at under total internal reflection', () => {
  const w = defaultWorld();
  w.objects[0].material.transparency = 1.0;
  w.objects[0].material.refractiveIndex = 1.5;

  const r = new Ray(point(0, 0, Math.sqrt(2) / 2), vector(0, 1, 0));
  const xs = [
    intersection(-Math.sqrt(2) / 2, w.objects[0]),
    intersection(Math.sqrt(2) / 2, w.objects[0]),
  ];

  const comps = prepareComputations(xs[1], r, xs);
  const c = w.refractedColor(comps);

  expect(c.equals(new Color(0, 0, 0))).toBe(true);
});

test('the refracted color with a refracted ray', () => {
  const w = defaultWorld();
  w.objects[0].material.ambient = 1.0;
  w.objects[0].material.patternIdx = 0;
  w.objects[0].patternDefinitions = [new TestPattern()];

  w.objects[1].material.transparency = 1.0;
  w.objects[1].material.refractiveIndex = 1.5;

  const r = new Ray(point(0, 0, 0.1), vector(0, 1, 0));
  const xs = [
    intersection(-0.9899, w.objects[0]),
    intersection(-0.4899, w.objects[1]),
    intersection(0.4899, w.objects[1]),
    intersection(0.9899, w.objects[0]),
  ];

  const comps = prepareComputations(xs[2], r, xs);
  const c = w.refractedColor(comps, 5);

  expect(c.equals(new Color(0, 0.99888, 0.04725))).toBe(true);
});

test('shadeHit() with a transparent material', () => {
  const w = defaultWorld();
  const mat = material();
  mat.transparency = 0.5;
  mat.refractiveIndex = 1.5;

  const mat2 = material();
  mat2.color = new Color(1, 0, 0);
  mat2.ambient = 0.5;

  const mats = [mat, mat2];

  const floor = new Plane();
  floor.materialDefinitions = mats;
  floor.material = mat;
  floor.transform = translation(0, -1, 0);
  w.objects.push(floor);

  const ball = new Sphere();
  ball.materialDefinitions = mats;
  ball.material = mat2;
  ball.transform = translation(0, -3.5, -0.5);
  w.objects.push(ball);

  const r = new Ray(
    point(0, 0, -3),
    vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
  );
  const i = intersection(Math.sqrt(2), floor);

  const comps = prepareComputations(i, r);
  const c = w.shadeHit(comps, 5);

  expect(c.equals(new Color(0.93642, 0.68642, 0.68642))).toBe(true);
});

test('shadeHit() with a reflective and transparent material', () => {
  const w = defaultWorld();
  const mat = material();
  mat.reflective = 0.5;
  mat.transparency = 0.5;
  mat.refractiveIndex = 1.5;

  const mat2 = material();
  mat2.color = new Color(1, 0, 0);
  mat2.ambient = 0.5;

  const mats = [mat, mat2];

  const floor = new Plane();
  floor.materialDefinitions = mats;
  floor.material = mat;
  floor.transform = translation(0, -1, 0);
  w.objects.push(floor);

  const ball = new Sphere();
  ball.materialDefinitions = mats;
  ball.material = mat2;
  ball.transform = translation(0, -3.5, -0.5);
  w.objects.push(ball);

  const r = new Ray(
    point(0, 0, -3),
    vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
  );
  const i = intersection(Math.sqrt(2), floor);

  const comps = prepareComputations(i, r);
  const c = w.shadeHit(comps, 5);

  expect(c.equals(new Color(0.93391, 0.69643, 0.69243))).toBe(true);
});
