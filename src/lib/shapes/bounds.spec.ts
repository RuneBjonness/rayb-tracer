import each from "jest-each";
import { point } from "../tuples";
import { Bounds, splitBounds } from "./bounds";

describe('Bounds', () => {

    test('splitting an x-wide bounding box', () => {
        const b: Bounds = [point(-1, -2, -3), point(9, 5.5, 3)];
        const [left, right] = splitBounds(b);
    
        expect(left[0]).toEqual(point(-1, -2, -3));
        expect(left[1]).toEqual(point(4, 5.5, 3));
        expect(right[0]).toEqual(point(4, -2, -3));
        expect(right[1]).toEqual(point(9, 5.5, 3));
    });

    test('splitting an y-wide bounding box', () => {
        const b: Bounds = [point(-1, -2, -3), point(5, 8, 3)];
        const [left, right] = splitBounds(b);
    
        expect(left[0]).toEqual(point(-1, -2, -3));
        expect(left[1]).toEqual(point(5, 3, 3));
        expect(right[0]).toEqual(point(-1, 3, -3));
        expect(right[1]).toEqual(point(5, 8, 3));
    });

    test('splitting an z-wide bounding box', () => {
        const b: Bounds = [point(-1, -2, -3), point(5, 3, 7)];
        const [left, right] = splitBounds(b);
    
        expect(left[0]).toEqual(point(-1, -2, -3));
        expect(left[1]).toEqual(point(5, 3, 2));
        expect(right[0]).toEqual(point(-1, -2, 2));
        expect(right[1]).toEqual(point(5, 3, 7));
    });
});
