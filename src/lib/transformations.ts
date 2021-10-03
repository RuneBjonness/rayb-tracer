import { identityMatrix, multiply } from './matrices';
import { cross, normalize, subtract, Tuple } from './tuples';

export function translation(x: number, y: number, z: number): number[][] {
    let t = identityMatrix();
    t[0][3] = x;
    t[1][3] = y;
    t[2][3] = z;
    return t;
}

export function scaling(x: number, y: number, z: number): number[][] {
    let t = identityMatrix();
    t[0][0] = x;
    t[1][1] = y;
    t[2][2] = z;
    return t;
}

export function radians(deg: number): number {
    return (deg / 180) * Math.PI;
}

export function rotationX(radians: number): number[][] {
    const cosR = Math.cos(radians);
    const sinR = Math.sin(radians);
    return [
        [1, 0, 0, 0],
        [0, cosR, -sinR, 0],
        [0, sinR, cosR, 0],
        [0, 0, 0, 1],
    ];
}

export function rotationY(radians: number): number[][] {
    const cosR = Math.cos(radians);
    const sinR = Math.sin(radians);
    return [
        [cosR, 0, sinR, 0],
        [0, 1, 0, 0],
        [-sinR, 0, cosR, 0],
        [0, 0, 0, 1],
    ];
}

export function rotationZ(radians: number): number[][] {
    const cosR = Math.cos(radians);
    const sinR = Math.sin(radians);
    return [
        [cosR, -sinR, 0, 0],
        [sinR, cosR, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
    ];
}

export function shearing(
    xy: number,
    xz: number,
    yx: number,
    yz: number,
    zx: number,
    zy: number
): number[][] {
    return [
        [1, xy, xz, 0],
        [yx, 1, yz, 0],
        [zx, zy, 1, 0],
        [0, 0, 0, 1],
    ];
}

export function viewTransform(from: Tuple, to: Tuple, up: Tuple): number[][] {
    const forward = normalize(subtract(to, from));
    const upn = normalize(up);
    const left = cross(forward, upn);
    const trueUp = cross(left, forward);

    const orientation = [
        [left[0], left[1], left[2], 0],
        [trueUp[0], trueUp[1], trueUp[2], 0],
        [-forward[0], -forward[1], -forward[2], 0],
        [0, 0, 0, 1],
    ];
    return multiply(orientation, translation(-from[0], -from[1], -from[2]));
}
