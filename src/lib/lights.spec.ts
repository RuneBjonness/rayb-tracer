import { pointLight } from './lights';
import { areEqual, color, point } from './tuples'

test('a point light has a position and intensity', () => {
    const position = point(0, 0, 0);
    const intensity = color(1, 1, 1);

    const light = pointLight(position, intensity);

    expect(areEqual(light.position, position)).toBe(true);
    expect(areEqual(light.intensity, intensity)).toBe(true);
});
