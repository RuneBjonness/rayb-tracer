import { Matrix4 } from '../math/matrices';
import { Vector4, point, vector } from '../math/vector4';
import { Ray } from '../rays';
import { Shape } from './shape';

export type Bounds = [min: Vector4, max: Vector4];

export function boundsContainsPoint(b: Bounds, p: Vector4): boolean {
  return (
    p.x >= b[0].x &&
    p.x <= b[1].x &&
    p.y >= b[0].y &&
    p.y <= b[1].y &&
    p.z >= b[0].z &&
    p.z <= b[1].z
  );
}

export function boundsContainsBounds(b1: Bounds, b2: Bounds): boolean {
  return boundsContainsPoint(b1, b2[0]) && boundsContainsPoint(b1, b2[1]);
}

export function transformBoundsCorners(b: Bounds, m: Matrix4): Vector4[] {
  const [sMin, sMax] = b;
  let corners = [
    point(sMin.x, sMin.y, sMin.z),
    point(sMin.x, sMin.y, sMax.z),
    point(sMin.x, sMax.y, sMax.z),
    point(sMin.x, sMax.y, sMin.z),
    point(sMax.x, sMin.y, sMin.z),
    point(sMax.x, sMin.y, sMax.z),
    point(sMax.x, sMax.y, sMax.z),
    point(sMax.x, sMax.y, sMin.z),
  ];

  return corners.map((t) => t.applyMatrix(m));
}

export function transformGroupBounds(shapes: Shape[]): Bounds {
  const groupPoints: Vector4[] = shapes.flatMap((s) =>
    transformBoundsCorners(s.bounds(), s.transform)
  );

  return [
    point(
      Math.min(...groupPoints.map((p) => p.x)),
      Math.min(...groupPoints.map((p) => p.y)),
      Math.min(...groupPoints.map((p) => p.z))
    ),
    point(
      Math.max(...groupPoints.map((p) => p.x)),
      Math.max(...groupPoints.map((p) => p.y)),
      Math.max(...groupPoints.map((p) => p.z))
    ),
  ];
}

export function splitBounds(b: Bounds): [Bounds, Bounds] {
  let x0 = b[0].x;
  let y0 = b[0].y;
  let z0 = b[0].z;
  let x1 = b[1].x;
  let y1 = b[1].y;
  let z1 = b[1].z;

  const dx = x1 - x0;
  const dy = y1 - y0;
  const dz = z1 - z0;

  const greatestAxis = Math.max(dx, dy, dz);

  if (greatestAxis === dx) {
    x0 = x1 = x0 + dx / 2.0;
  } else if (greatestAxis === dy) {
    y0 = y1 = y0 + dy / 2.0;
  } else {
    z0 = z1 = z0 + dz / 2.0;
  }

  return [
    [b[0], point(x1, y1, z1)],
    [point(x0, y0, z0), b[1]],
  ];
}

export function intersectsBounds(b: Bounds, r: Ray): boolean {
  const [bMin, bMax] = b;
  const invRayDir = vector(
    1 / r.direction.x,
    1 / r.direction.y,
    1 / r.direction.z
  );
  const tx1 = (bMin.x - r.origin.x) * invRayDir.x;
  const tx2 = (bMax.x - r.origin.x) * invRayDir.x;
  const ty1 = (bMin.y - r.origin.y) * invRayDir.y;
  const ty2 = (bMax.y - r.origin.y) * invRayDir.y;
  const tz1 = (bMin.z - r.origin.z) * invRayDir.z;
  const tz2 = (bMax.z - r.origin.z) * invRayDir.z;
  const tmin = Math.max(
    Math.min(tx1, tx2),
    Math.min(ty1, ty2),
    Math.min(tz1, tz2),
    0
  );
  const tmax = Math.min(
    Math.max(tx1, tx2),
    Math.max(ty1, ty2),
    Math.max(tz1, tz2)
  );

  return tmin <= tmax;
}
