import { point, Tuple } from "../tuples";

export type Bounds = [
    min: Tuple,
    max: Tuple
]

export function splitBounds(b: Bounds): [Bounds, Bounds] {
    let [x0, y0, z0] = b[0];
    let [x1, y1, z1] = b[1];

    const dx = x1 - x0;
    const dy = y1 - y0;
    const dz = z1 - z0;

    const greatestAxis = Math.max(dx, dy, dz);

    if(greatestAxis === dx) {
        x0 = x1 = x0 + dx / 2.0;
    } else if(greatestAxis === dy) {
        y0 = y1 = y0 + dy / 2.0;
    } else {
        z0 = z1 = z0 + dz / 2.0;
    }

    return [
        [b[0], point(x1, y1, z1)],
        [point(x0, y0, z0), b[1]]
    ];
}
