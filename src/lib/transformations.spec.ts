import { areEqual, point, vector } from './tuples';
import {
    inverse,
    areEqual as matricesAreEqual,
    identityMatrix,
    multiplyMatrixByTuple,
    multiplyMatrices,
} from './matrices';
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

test('multiplying by a translation matrix', () => {
    const transform = translation(5, -3, 2);
    const result = multiplyMatrixByTuple(transform, point(-3, 4, 5));

    expect(areEqual(result, point(2, 1, 7))).toBe(true);
});

test('multiplying by the inverse of a translation matrix', () => {
    const transform = translation(5, -3, 2);
    const inv = inverse(transform);
    const result = multiplyMatrixByTuple(inv, point(-3, 4, 5));

    expect(areEqual(result, point(-8, 7, 3))).toBe(true);
});

test('translation does not affect vectors', () => {
    const transform = translation(5, -3, 2);
    const v = vector(-3, 4, 5);
    const result = multiplyMatrixByTuple(transform, v);

    expect(areEqual(result, v)).toBe(true);
});

test('scaling matrix applied to a point', () => {
    const transform = scaling(2, 3, 4);
    const result = multiplyMatrixByTuple(transform, point(-4, 6, 8));

    expect(areEqual(result, point(-8, 18, 32))).toBe(true);
});

test('scaling matrix applied to a vector', () => {
    const transform = scaling(2, 3, 4);
    const result = multiplyMatrixByTuple(transform, vector(-4, 6, 8));

    expect(areEqual(result, vector(-8, 18, 32))).toBe(true);
});

test('multiplying by the inverse of a scaling matrix', () => {
    const transform = scaling(2, 3, 4);
    const inv = inverse(transform);
    const result = multiplyMatrixByTuple(inv, vector(-4, 6, 8));

    expect(areEqual(result, vector(-2, 2, 2))).toBe(true);
});

test('reflection is scaling by a negative value', () => {
    const transform = scaling(-1, 1, 1);
    const result = multiplyMatrixByTuple(transform, point(2, 3, 4));

    expect(areEqual(result, point(-2, 3, 4))).toBe(true);
});

test('rotating a point around the x axis', () => {
    const p = point(0, 1, 0);
    const halfQuarter = rotationX(Math.PI / 4);
    const fullQuarter = rotationX(Math.PI / 2);

    expect(
        areEqual(
            multiplyMatrixByTuple(halfQuarter, p),
            point(0, Math.sqrt(2) / 2, Math.sqrt(2) / 2)
        )
    ).toBe(true);
    expect(areEqual(multiplyMatrixByTuple(fullQuarter, p), point(0, 0, 1))).toBe(true);
});

test('degreees to radians conversion', () => {
    expect(radians(180)).toEqual(Math.PI);
    expect(radians(90)).toEqual(Math.PI / 2);
    expect(radians(45)).toEqual(Math.PI / 4);
});

test('the inverse of an x-rotatition rotates in the opposite direction', () => {
    const p = point(0, 1, 0);
    const inv = inverse(rotationX(Math.PI / 4));

    expect(
        areEqual(
            multiplyMatrixByTuple(inv, p),
            point(0, Math.sqrt(2) / 2, -Math.sqrt(2) / 2)
        )
    ).toBe(true);
});

test('rotating a point around the y axis', () => {
    const p = point(0, 0, 1);
    const halfQuarter = rotationY(Math.PI / 4);
    const fullQuarter = rotationY(Math.PI / 2);

    expect(
        areEqual(
            multiplyMatrixByTuple(halfQuarter, p),
            point(Math.sqrt(2) / 2, 0, Math.sqrt(2) / 2)
        )
    ).toBe(true);
    expect(areEqual(multiplyMatrixByTuple(fullQuarter, p), point(1, 0, 0))).toBe(true);
});

test('rotating a point around the z axis', () => {
    const p = point(0, 1, 0);
    const halfQuarter = rotationZ(Math.PI / 4);
    const fullQuarter = rotationZ(Math.PI / 2);

    expect(
        areEqual(
            multiplyMatrixByTuple(halfQuarter, p),
            point(-Math.sqrt(2) / 2, Math.sqrt(2) / 2, 0)
        )
    ).toBe(true);
    expect(areEqual(multiplyMatrixByTuple(fullQuarter, p), point(-1, 0, 0))).toBe(true);
});

test('a shearing transformation moves x in proportion to y', () => {
    const p = point(2, 3, 4);
    const sheared = multiplyMatrixByTuple(shearing(1, 0, 0, 0, 0, 0), p);

    expect(areEqual(sheared, point(5, 3, 4))).toBe(true);
});

test('a shearing transformation moves x in proportion to z', () => {
    const p = point(2, 3, 4);
    const sheared = multiplyMatrixByTuple(shearing(0, 1, 0, 0, 0, 0), p);

    expect(areEqual(sheared, point(6, 3, 4))).toBe(true);
});

test('a shearing transformation moves y in proportion to x', () => {
    const p = point(2, 3, 4);
    const sheared = multiplyMatrixByTuple(shearing(0, 0, 1, 0, 0, 0), p);

    expect(areEqual(sheared, point(2, 5, 4))).toBe(true);
});

test('a shearing transformation moves y in proportion to z', () => {
    const p = point(2, 3, 4);
    const sheared = multiplyMatrixByTuple(shearing(0, 0, 0, 1, 0, 0), p);

    expect(areEqual(sheared, point(2, 7, 4))).toBe(true);
});

test('a shearing transformation moves z in proportion to x', () => {
    const p = point(2, 3, 4);
    const sheared = multiplyMatrixByTuple(shearing(0, 0, 0, 0, 1, 0), p);

    expect(areEqual(sheared, point(2, 3, 6))).toBe(true);
});

test('a shearing transformation moves z in proportion to y', () => {
    const p = point(2, 3, 4);
    const sheared = multiplyMatrixByTuple(shearing(0, 0, 0, 0, 0, 1), p);

    expect(areEqual(sheared, point(2, 3, 7))).toBe(true);
});

test('individual transformations are applied in sequence', () => {
    const p = point(1, 0, 1);
    const a = rotationX(Math.PI / 2);
    const b = scaling(5, 5, 5);
    const c = translation(10, 5, 7);

    const p2 = multiplyMatrixByTuple(a, p);
    expect(areEqual(p2, point(1, -1, 0))).toBe(true);

    const p3 = multiplyMatrixByTuple(b, p2);
    expect(areEqual(p3, point(5, -5, 0))).toBe(true);

    const p4 = multiplyMatrixByTuple(c, p3);
    expect(areEqual(p4, point(15, 0, 7))).toBe(true);
});

test('chained transformations must be applied in reverse order', () => {
    const p = point(1, 0, 1);
    const a = rotationX(Math.PI / 2);
    const b = scaling(5, 5, 5);
    const c = translation(10, 5, 7);

    const t = multiplyMatrices(c, multiplyMatrices(b, a));
    const p2 = multiplyMatrixByTuple(t, p);
    expect(areEqual(p2, point(15, 0, 7))).toBe(true);
});

test('the tranformation matrix for the default orientation', () => {
    const from = point(0, 0, 0);
    const to = point(0, 0, -1);
    const up = vector(0, 1, 0);
    const t = viewTransform(from, to, up);

    expect(matricesAreEqual(t, identityMatrix())).toBe(true);
});

test('a view tranformation matrix looking in positive z direction', () => {
    const from = point(0, 0, 0);
    const to = point(0, 0, 1);
    const up = vector(0, 1, 0);
    const t = viewTransform(from, to, up);

    expect(matricesAreEqual(t, scaling(-1, 1, -1))).toBe(true);
});

test('a view tranformation moves the world', () => {
    const from = point(0, 0, 8);
    const to = point(0, 0, 0);
    const up = vector(0, 1, 0);
    const t = viewTransform(from, to, up);

    expect(matricesAreEqual(t, translation(0, 0, -8))).toBe(true);
});

test('an arbitrary view tranformation', () => {
    const from = point(1, 3, 2);
    const to = point(4, -2, 8);
    const up = vector(1, 1, 0);
    const t = viewTransform(from, to, up);

    const expected = [
        [-0.50709, 0.50709, 0.67612, -2.36643],
        [0.76772, 0.60609, 0.12122, -2.82843],
        [-0.35857, 0.59761, -0.71714, 0.0],
        [0.0, 0.0, 0.0, 1.0],
    ];

    expect(matricesAreEqual(t, expected)).toBe(true);
});
