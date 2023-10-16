import { Matrix4, identityMatrix, multiplyMatrices } from './matrices';
import { cross, normalize, subtract, Tuple } from './tuples';

export function translation(x: number, y: number, z: number): Matrix4 {
  let t = identityMatrix();
  t[3] = x;
  t[7] = y;
  t[11] = z;
  return t;
}

export function scaling(x: number, y: number, z: number): Matrix4 {
  let t = identityMatrix();
  t[0] = x;
  t[5] = y;
  t[10] = z;
  return t;
}

export function radians(deg: number): number {
  return (deg / 180) * Math.PI;
}

export function rotationX(radians: number): Matrix4 {
  const cosR = Math.cos(radians);
  const sinR = Math.sin(radians);
  // prettier-ignore
  return [
    1, 0, 0, 0,
    0, cosR, -sinR, 0,
    0, sinR, cosR, 0,
    0, 0, 0, 1,
  ];
}

export function rotationY(radians: number): Matrix4 {
  const cosR = Math.cos(radians);
  const sinR = Math.sin(radians);
  // prettier-ignore
  return [
    cosR, 0, sinR, 0,
    0, 1, 0, 0,
    -sinR, 0, cosR, 0,
    0, 0, 0, 1,
  ];
}

export function rotationZ(radians: number): Matrix4 {
  const cosR = Math.cos(radians);
  const sinR = Math.sin(radians);
  // prettier-ignore
  return [
    cosR, -sinR, 0, 0,
    sinR, cosR, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ];
}

export function shearing(
  xy: number,
  xz: number,
  yx: number,
  yz: number,
  zx: number,
  zy: number
): Matrix4 {
  // prettier-ignore
  return [
    1, xy, xz, 0,
    yx, 1, yz, 0,
    zx, zy, 1, 0,
    0, 0, 0, 1,
  ];
}

export function viewTransform(from: Tuple, to: Tuple, up: Tuple): Matrix4 {
  const forward = normalize(subtract(to, from));
  const upn = normalize(up);
  const left = cross(forward, upn);
  const trueUp = cross(left, forward);

  // prettier-ignore
  const orientation: Matrix4 = [
    left[0], left[1], left[2], 0,
    trueUp[0], trueUp[1], trueUp[2], 0,
    -forward[0], -forward[1], -forward[2], 0,
    0, 0, 0, 1,
  ];
  return multiplyMatrices(
    orientation,
    translation(-from[0], -from[1], -from[2])
  );
}
