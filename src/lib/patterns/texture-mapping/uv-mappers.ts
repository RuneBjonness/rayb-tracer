import { magnitude, Tuple, vector } from '../../tuples';

export interface UvMapper {
    map(p: Tuple): [u: number, v: number];
}

export class SphericalMapper implements UvMapper {
    map(p: Tuple): [u: number, v: number] {
        const theta = Math.atan2(p[0], p[2]);
        const vec = vector(p[0], p[1], p[2]);
        const r = magnitude(vec);
        const phi = Math.acos(p[1] / r);
        const rawU = theta / (2 * Math.PI);
        const u = 1 - (rawU + 0.5);
        const v = 1 - phi / Math.PI;
        return [u, v];
    }
}
