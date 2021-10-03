import { position, ray, transform } from './rays';
import { point, vector, areEqual } from './tuples';
import { scaling, translation } from './transformations';

test('creating and accessing a ray', () => {
    const origin = point(1, 2, 3);
    const direction = vector(4, 5, 6);
    const r = ray(origin, direction);

    expect(areEqual(r.origin, origin)).toBe(true);
    expect(areEqual(r.direction, direction)).toBe(true);
});

test('computing a point from a distance', () => {
    const r = ray(point(2, 3, 4), vector(1, 0, 0));

    expect(areEqual(position(r, 0), point(2, 3, 4))).toBe(true);
    expect(areEqual(position(r, 1), point(3, 3, 4))).toBe(true);
    expect(areEqual(position(r, -1), point(1, 3, 4))).toBe(true);
    expect(areEqual(position(r, 2.5), point(4.5, 3, 4))).toBe(true);
});

test('translating a ray', () => {
    const r = ray(point(1, 2, 3), vector(0, 1, 0));
    const m = translation(3, 4, 5);

    const r2 = transform(r, m);

    expect(areEqual(r2.origin, point(4, 6, 8))).toBe(true);
    expect(areEqual(r2.direction, vector(0, 1, 0))).toBe(true);
});

test('scaling a ray', () => {
    const r = ray(point(1, 2, 3), vector(0, 1, 0));
    const m = scaling(2, 3, 4);

    const r2 = transform(r, m);

    expect(areEqual(r2.origin, point(2, 6, 12))).toBe(true);
    expect(areEqual(r2.direction, vector(0, 3, 0))).toBe(true);
});
