import { describe, expect, test } from 'vitest';
import { BufferBackedWorld } from './buffer-backed-world';
import { World } from './world';
import { PointLight } from '../lights/lights';
import { point, vector, Vector4 } from '../math/vector4';
import { Color } from '../math/color';
import { Material, material } from '../material/materials';
import { TransformableSphere } from '../shapes/primitives/sphere';
import { scaling, translation } from '../math/transformations';
import { toLightsArrayBuffer } from '../lights/lights-buffer';
import { MatrixOrder } from '../math/matrices';
import { toObjectBuffers } from '../shapes/object-buffers';
import { Ray } from '../rays';
import { toMaterialsArrayBuffer } from '../material/materials-buffer';
import { defaultWorld, defaultWorldMaterials } from './world.spec';
import { Plane } from '../shapes/primitives/plane';

export function defaultBufferBackedWorld(
  lightPosition?: Vector4
): BufferBackedWorld {
  const w = new World();
  w.lights.push(
    new PointLight(lightPosition ?? point(-10, 10, -10), new Color(1, 1, 1))
  );

  const mats = defaultWorldMaterials();

  const s1 = new TransformableSphere();
  s1.materialDefinitions = mats;
  s1.materialIdx = 1;
  w.objects.push(s1);

  const s2 = new TransformableSphere();
  s2.materialDefinitions = mats;
  s2.materialIdx = 0;
  s2.transform = scaling(0.5, 0.5, 0.5);
  w.objects.push(s2);

  const objectBuffers = toObjectBuffers(w.objects, true, MatrixOrder.RowMajor);
  const lightsBuffer = toLightsArrayBuffer(w.lights, true);
  const materialsBuffer = toMaterialsArrayBuffer(mats, true);

  const bufferBackedWorld = new BufferBackedWorld(
    lightsBuffer,
    objectBuffers,
    materialsBuffer,
    new ArrayBuffer(0),
    new ArrayBuffer(0)
  );

  return bufferBackedWorld;
}

export function customBufferBackedWorld(
  w: World,
  mats: Material[]
): BufferBackedWorld {
  const objectBuffers = toObjectBuffers(w.objects, true, MatrixOrder.RowMajor);
  const lightsBuffer = toLightsArrayBuffer(w.lights, true);
  const materialsBuffer = toMaterialsArrayBuffer(mats, true);

  const bufferBackedWorld = new BufferBackedWorld(
    lightsBuffer,
    objectBuffers,
    materialsBuffer,
    new ArrayBuffer(0),
    new ArrayBuffer(0)
  );

  return bufferBackedWorld;
}

describe('buffer-backed world', () => {
  test('intersections for all objects in world', () => {
    const w = defaultBufferBackedWorld();
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const xs = w.intersects(r);

    expect(xs.length).toBe(4);
    expect(xs[0].time).toEqual(4);
    expect(xs[1].time).toEqual(4.5);
    expect(xs[2].time).toEqual(5.5);
    expect(xs[3].time).toEqual(6);
  });

  test('hits any objects in world', () => {
    const w = defaultBufferBackedWorld();
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const hitsAny = w.hitsAny(r, 10);

    expect(hitsAny).toBe(true);
  });

  test('hits no objects in world before a ray reaches the cloesest object', () => {
    const w = defaultBufferBackedWorld();
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const hitsAny = w.hitsAny(r, 3);

    expect(hitsAny).toBe(false);
  });

  test('shading an intersection', () => {
    const w = defaultBufferBackedWorld();
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const c = w.colorAt(r);

    expect(c.equals(new Color(0.38066, 0.47583, 0.2855))).toBe(true);
  });

  test('shading an intersection from the inside', () => {
    const w = defaultBufferBackedWorld(point(0, 0.25, 0));
    const r = new Ray(point(0, 0, 0), vector(0, 0, 1));
    const c = w.colorAt(r);

    expect(c.equals(new Color(0.90498, 0.90498, 0.90498))).toBe(true);
  });

  test('the color when a ray misses', () => {
    const w = defaultBufferBackedWorld();
    const r = new Ray(point(0, 0, -5), vector(0, 1, 0));
    const c = w.colorAt(r);

    expect(c.equals(new Color(0.0, 0.0, 0.0))).toBe(true);
  });

  test('the color when a ray hits', () => {
    const w = defaultBufferBackedWorld();
    const r = new Ray(point(0, 0, -5), vector(0, 0, 1));
    const c = w.colorAt(r);

    expect(c.equals(new Color(0.38066, 0.47583, 0.2855))).toBe(true);
  });

  test('the color with an intersection behind the ray', () => {
    const w = defaultWorld();
    const mats = defaultWorldMaterials();
    mats[0].ambient = 1;
    mats[1].ambient = 1;

    const inner = w.objects[1];

    const bufferBackedWorld = customBufferBackedWorld(w, mats);
    const r = new Ray(point(0, 0, 0.75), vector(0, 0, -1));
    const c = bufferBackedWorld.colorAt(r);

    expect(c.equals(inner.material.color)).toBe(true);
  });

  test.each`
    case                                              | p                      | result
    ${'nothing is collinear with point and light'}    | ${point(0, 10, 0)}     | ${false}
    ${'an object is between the point and the light'} | ${point(10, -10, 10)}  | ${true}
    ${'an object is behind the light'}                | ${point(-20, 20, -20)} | ${false}
    ${'an object is behind the point'}                | ${point(-2, 2, -2)}    | ${false}
  `('isShadowed() when $case', ({ p, result }) => {
    const lightPos = point(-10, 10, -10);
    const w = defaultBufferBackedWorld(lightPos);
    expect(w.isShadowed(p, lightPos)).toBe(result);
  });

  test('shading an intersection in shadow', () => {
    const w = new World();
    w.lights.push(new PointLight(point(0, 0, -10), new Color(1, 1, 1)));
    const s = new TransformableSphere();
    s.transform = translation(0, 0, 10);
    s.materialIdx = 0;
    const s2 = new TransformableSphere();
    s2.materialIdx = 0;
    w.objects.push(s, s2);

    const bufferBackedWorld = customBufferBackedWorld(w, [material()]);

    const r = new Ray(point(0, 0, 5), vector(0, 0, 1));
    const c = bufferBackedWorld.colorAt(r);

    expect(c.equals(new Color(0.1, 0.1, 0.1))).toBe(true);
  });

  test('colorAt() with a reflective material', () => {
    const w = defaultWorld();
    const shape = new Plane();

    const mat = material();
    mat.reflective = 0.5;
    const mats = defaultWorldMaterials();
    mats.push(mat);

    shape.materialDefinitions = mats;
    shape.material = mat;
    shape.transform = translation(0, -1, 0);
    w.objects.push(shape);

    const bufferBackedWorld = customBufferBackedWorld(w, mats);

    const r = new Ray(
      point(0, 0, -3),
      vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
    );
    const c = bufferBackedWorld.colorAt(r);

    expect(c.equals(new Color(0.876773, 0.92436, 0.829186))).toBe(true);
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

    const bufferBackedWorld = customBufferBackedWorld(w, [mat]);

    const r = new Ray(point(0, 0, 0), vector(0, 1, 1));
    const c = bufferBackedWorld.colorAt(r);

    expect(c).toBeTruthy();
  });

  test('colorAt() with a transparent material', () => {
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

    const ball = new TransformableSphere();
    ball.materialDefinitions = mats;
    ball.material = mat2;
    ball.transform = translation(0, -3.5, -0.5);
    w.objects.push(ball);

    const bufferBackedWorld = customBufferBackedWorld(w, mats);
    const r = new Ray(
      point(0, 0, -3),
      vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
    );

    const c = bufferBackedWorld.colorAt(r, 5);

    expect(c.equals(new Color(0.93642, 0.68642, 0.68642))).toBe(true);
  });

  test('colorAt() with a reflective and transparent material', () => {
    const w = defaultWorld();
    const mats = defaultWorldMaterials();

    const mat = material();
    mat.reflective = 0.5;
    mat.transparency = 0.5;
    mat.refractiveIndex = 1.5;
    mats.push(mat);

    const mat2 = material();
    mat2.color = new Color(1, 0, 0);
    mat2.ambient = 0.5;
    mats.push(mat2);

    const floor = new Plane();
    floor.materialDefinitions = mats;
    floor.material = mat;
    floor.transform = translation(0, -1, 0);
    w.objects.push(floor);

    const ball = new TransformableSphere();
    ball.materialDefinitions = mats;
    ball.material = mat2;
    ball.transform = translation(0, -3.5, -0.5);
    w.objects.push(ball);

    const bufferBackedWorld = customBufferBackedWorld(w, mats);

    const r = new Ray(
      point(0, 0, -3),
      vector(0, -Math.sqrt(2) / 2, Math.sqrt(2) / 2)
    );
    const c = bufferBackedWorld.colorAt(r, 5);

    expect(c.equals(new Color(0.93391, 0.69643, 0.69243))).toBe(true);
  });
});
