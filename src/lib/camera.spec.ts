import { Camera } from './camera';
import {
  areEqual as matricesAreEqual,
  identityMatrix,
  multiplyMatrices,
} from './math/matrices';
import { rotationY, translation, viewTransform } from './transformations';
import { areEqual, color, point, vector } from './math/tuples';
import { defaultWorld } from './world';

test('creating a Camera', () => {
  const c = new Camera(160, 120, Math.PI / 2);

  expect(c.width).toBe(160);
  expect(c.height).toBe(120);
  expect(c.fieldOfView).toEqual(Math.PI / 2);
  expect(matricesAreEqual(c.transform, identityMatrix())).toBe(true);
});

test('the pixel size for a horizontal canvas', () => {
  const c = new Camera(200, 125, Math.PI / 2);
  expect(c.pixelSize).toBeCloseTo(0.01);
});

test('the pixel size for a vertical canvas', () => {
  const c = new Camera(125, 200, Math.PI / 2);
  expect(c.pixelSize).toBeCloseTo(0.01);
});

test('constructing a ray through the center of the canvas', () => {
  const c = new Camera(201, 101, Math.PI / 2);
  const r = c.raysForPixel(100, 50)[0];

  expect(areEqual(r.origin, point(0, 0, 0))).toBe(true);
  expect(areEqual(r.direction, vector(0, 0, -1))).toBe(true);
});

test('constructing a ray through a corner of the canvas', () => {
  const c = new Camera(201, 101, Math.PI / 2);
  const r = c.raysForPixel(0, 0)[0];

  expect(areEqual(r.origin, point(0, 0, 0))).toBe(true);
  expect(areEqual(r.direction, vector(0.66519, 0.33259, -0.66851))).toBe(true);
});

test('constructing a ray when the camera is transformed', () => {
  const c = new Camera(201, 101, Math.PI / 2);
  c.transform = multiplyMatrices(rotationY(Math.PI / 4), translation(0, -2, 5));
  const r = c.raysForPixel(100, 50)[0];

  expect(areEqual(r.origin, point(0, 2, -5))).toBe(true);
  expect(
    areEqual(r.direction, vector(Math.sqrt(2) / 2, 0, -Math.sqrt(2) / 2))
  ).toBe(true);
});

test('rendering a world with a camera', () => {
  const c = new Camera(11, 11, Math.PI / 2);
  const from = point(0, 0, -5);
  const to = point(0, 0, 0);
  const up = vector(0, 1, 0);
  c.transform = viewTransform(from, to, up);

  const image = c.render(defaultWorld());

  expect(areEqual(image.pixels[5][5], color(0.38066, 0.47583, 0.2855))).toBe(
    true
  );
});

test('a camera with default aperture will construct 1 ray per pixel ', () => {
  const c = new Camera(201, 101, Math.PI / 2);
  const rays = c.raysForPixel(100, 50);

  expect(c.aperture).toBe(0);
  expect(rays.length).toBe(1);
});

test('a camera with a bigger aperture will sample a number of rays per pixel capped by maxFocalSamples', () => {
  const c = new Camera(201, 101, Math.PI / 2);
  c.aperture = 0.01;
  c.maxFocalSamples = 2;
  const rays = c.raysForPixel(100, 50);

  expect(rays.length).toEqual(c.maxFocalSamples);
});
