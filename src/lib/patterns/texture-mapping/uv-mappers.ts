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

export class PlanarMapper implements UvMapper {
    map(p: Tuple): [u: number, v: number] {
        let u = p[0] % 1;
        let v = p[2] % 1;
        if (u < 0) {
            u = 1 + u;
        }
        if (v < 0) {
            v = 1 + v;
        }
        return [u, v];
    }
}
