import { Matrix4, identityMatrix, multiplyMatrices } from './matrices';
import { Vector4 } from './vector4';

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

export function viewTransform(
  from: Vector4,
  to: Vector4,
  up: Vector4
): Matrix4 {
  const forward = to.clone().subtract(from).normalize();
  const upn = up.clone().normalize();
  const left = forward.clone().cross(upn);
  const trueUp = left.clone().cross(forward);

  // prettier-ignore
  const orientation: Matrix4 = [
    left.x, left.y, left.z, 0,
    trueUp.x, trueUp.y, trueUp.z, 0,
    -forward.x, -forward.y, -forward.z, 0,
    0, 0, 0, 1,
  ];
  return multiplyMatrices(orientation, translation(-from.x, -from.y, -from.z));
}
