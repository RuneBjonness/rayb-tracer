import { expect, test } from 'vitest';
import { Matrix4 } from './matrices';
import {
  translation,
  scaling,
  rotationX,
  radians,
  rotationY,
  rotationZ,
  shearing,
  viewTransform,
} from './transformations';
import { point, vector } from './vector4';

test('multiplying by a translation matrix', () => {
  const transform = translation(5, -3, 2);
  const result = point(-3, 4, 5).applyMatrix(transform);

  expect(result.equals(point(2, 1, 7))).toBe(true);
});

test('multiplying by the inverse of a translation matrix', () => {
  const transform = translation(5, -3, 2);
  const result = point(-3, 4, 5).applyMatrix(transform.inverse());

  expect(result.equals(point(-8, 7, 3))).toBe(true);
});

test('translation does not affect vectors', () => {
  const transform = translation(5, -3, 2);
  const v = vector(-3, 4, 5);
  const result = v.applyMatrix(transform);

  expect(result.equals(v)).toBe(true);
});

test('scaling matrix applied to a point', () => {
  const transform = scaling(2, 3, 4);
  const result = point(-4, 6, 8).applyMatrix(transform);

  expect(result.equals(point(-8, 18, 32))).toBe(true);
});

test('scaling matrix applied to a vector', () => {
  const transform = scaling(2, 3, 4);
  const result = vector(-4, 6, 8).applyMatrix(transform);

  expect(result.equals(vector(-8, 18, 32))).toBe(true);
});

test('multiplying by the inverse of a scaling matrix', () => {
  const transform = scaling(2, 3, 4);
  const result = vector(-4, 6, 8).applyMatrix(transform.inverse());

  expect(result.equals(vector(-2, 2, 2))).toBe(true);
});

test('reflection is scaling by a negative value', () => {
  const transform = scaling(-1, 1, 1);
  const result = point(2, 3, 4).applyMatrix(transform);

  expect(result.equals(point(-2, 3, 4))).toBe(true);
});

test('rotating a point around the x axis', () => {
  const p = point(0, 1, 0);
  const halfQuarter = rotationX(Math.PI / 4);
  const fullQuarter = rotationX(Math.PI / 2);

  expect(
    p
      .clone()
      .applyMatrix(halfQuarter)
      .equals(point(0, Math.sqrt(2) / 2, Math.sqrt(2) / 2))
  ).toBe(true);

  expect(p.applyMatrix(fullQuarter).equals(point(0, 0, 1))).toBe(true);
});

test('degreees to radians conversion', () => {
  expect(radians(180)).toEqual(Math.PI);
  expect(radians(90)).toEqual(Math.PI / 2);
  expect(radians(45)).toEqual(Math.PI / 4);
});

test('the inverse of an x-rotatition rotates in the opposite direction', () => {
  const p = point(0, 1, 0);
  const inv = rotationX(Math.PI / 4).inverse();

  expect(
    p.applyMatrix(inv).equals(point(0, Math.sqrt(2) / 2, -Math.sqrt(2) / 2))
  ).toBe(true);
});

test('rotating a point around the y axis', () => {
  const p = point(0, 0, 1);
  const halfQuarter = rotationY(Math.PI / 4);
  const fullQuarter = rotationY(Math.PI / 2);

  expect(
    p
      .clone()
      .applyMatrix(halfQuarter)
      .equals(point(Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2))
  ).toBe(true);
  expect(p.applyMatrix(fullQuarter).equals(point(1, 0, 0))).toBe(true);
});

test('rotating a point around the z axis', () => {
  const p = point(0, 1, 0);
  const halfQuarter = rotationZ(Math.PI / 4);
  const fullQuarter = rotationZ(Math.PI / 2);

  expect(
    p
      .clone()
      .applyMatrix(halfQuarter)
      .equals(point(-Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0))
  ).toBe(true);
  expect(p.applyMatrix(fullQuarter).equals(point(-1, 0, 0))).toBe(true);
});

test('a shearing transformation moves x in proportion to y', () => {
  const p = point(2, 3, 4);
  const sheared = p.applyMatrix(shearing(1, 0, 0, 0, 0, 0));

  expect(sheared.equals(point(5, 3, 4))).toBe(true);
});

test('a shearing transformation moves x in proportion to z', () => {
  const p = point(2, 3, 4);
  const sheared = p.applyMatrix(shearing(0, 1, 0, 0, 0, 0));

  expect(sheared.equals(point(6, 3, 4))).toBe(true);
});

test('a shearing transformation moves y in proportion to x', () => {
  const p = point(2, 3, 4);
  const sheared = p.applyMatrix(shearing(0, 0, 1, 0, 0, 0));

  expect(sheared.equals(point(2, 5, 4))).toBe(true);
});

test('a shearing transformation moves y in proportion to z', () => {
  const p = point(2, 3, 4);
  const sheared = p.applyMatrix(shearing(0, 0, 0, 1, 0, 0));

  expect(sheared.equals(point(2, 7, 4))).toBe(true);
});

test('a shearing transformation moves z in proportion to x', () => {
  const p = point(2, 3, 4);
  const sheared = p.applyMatrix(shearing(0, 0, 0, 0, 1, 0));

  expect(sheared.equals(point(2, 3, 6))).toBe(true);
});

test('a shearing transformation moves z in proportion to y', () => {
  const p = point(2, 3, 4);
  const sheared = p.applyMatrix(shearing(0, 0, 0, 0, 0, 1));

  expect(sheared.equals(point(2, 3, 7))).toBe(true);
});

test('individual transformations are applied in sequence', () => {
  const p = point(1, 0, 1);
  const a = rotationX(Math.PI / 2);
  const b = scaling(5, 5, 5);
  const c = translation(10, 5, 7);

  const p2 = p.applyMatrix(a);
  expect(p2.equals(point(1, -1, 0))).toBe(true);

  const p3 = p2.applyMatrix(b);
  expect(p3.equals(point(5, -5, 0))).toBe(true);

  const p4 = p3.applyMatrix(c);
  expect(p4.equals(point(15, 0, 7))).toBe(true);
});

test('chained transformations must be applied in reverse order', () => {
  const p = point(1, 0, 1);
  const a = rotationX(Math.PI / 2);
  const b = scaling(5, 5, 5);
  const c = translation(10, 5, 7);

  const t = c.multiply(b).multiply(a);
  const p2 = p.applyMatrix(t);
  expect(p2.equals(point(15, 0, 7))).toBe(true);
});

test('chained Matrix4 fluent api transformation operations must be applied in natural order', () => {
  const p = point(1, 0, 1);
  const t = new Matrix4();

  t.rotateX(Math.PI / 2)
    .scale(5, 5, 5)
    .translate(10, 5, 7);

  const p2 = p.applyMatrix(t);
  expect(p2.equals(point(15, 0, 7))).toBe(true);
});

test('the tranformation matrix for the default orientation', () => {
  const from = point(0, 0, 0);
  const to = point(0, 0, -1);
  const up = vector(0, 1, 0);
  const t = viewTransform(from, to, up);

  expect(t.equals(new Matrix4())).toBe(true);
});

test('a view tranformation matrix looking in positive z direction', () => {
  const from = point(0, 0, 0);
  const to = point(0, 0, 1);
  const up = vector(0, 1, 0);
  const t = viewTransform(from, to, up);

  expect(t.equals(scaling(-1, 1, -1))).toBe(true);
});

test('a view tranformation moves the world', () => {
  const from = point(0, 0, 8);
  const to = point(0, 0, 0);
  const up = vector(0, 1, 0);
  const t = viewTransform(from, to, up);

  expect(t.equals(translation(0, 0, -8))).toBe(true);
});

test('an arbitrary view tranformation', () => {
  const from = point(1, 3, 2);
  const to = point(4, -2, 8);
  const up = vector(1, 1, 0);
  const t = viewTransform(from, to, up);

  // prettier-ignore
  const expected = new Matrix4([
    -0.50709, 0.50709, 0.67612, -2.36643,
    0.76772, 0.60609, 0.12122, -2.82843,
    -0.35857, 0.59761, -0.71714, 0.0,
    0.0, 0.0, 0.0, 1.0,
  ]);

  expect(expected.equals(t)).toBe(true);
});
