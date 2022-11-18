import { multiplyMatrixByTuple } from '../matrices';
import { Ray } from '../rays';
import { point, Tuple, vector } from '../tuples';
import { Shape } from './shape';

export type Bounds = [min: Tuple, max: Tuple];

export function boundsContainsPoint(b: Bounds, p: Tuple): boolean {
  return (
    p[0] >= b[0][0] &&
    p[0] <= b[1][0] &&
    p[1] >= b[0][1] &&
    p[1] <= b[1][1] &&
    p[2] >= b[0][2] &&
    p[2] <= b[1][2]
  );
}

export function boundsContainsBounds(b1: Bounds, b2: Bounds): boolean {
  return boundsContainsPoint(b1, b2[0]) && boundsContainsPoint(b1, b2[1]);
}

export function transformBoundsCorners(b: Bounds, m: number[][]): Tuple[] {
  const [sMin, sMax] = b;
  let corners = [
    point(sMin[0], sMin[1], sMin[2]),
    point(sMin[0], sMin[1], sMax[2]),
    point(sMin[0], sMax[1], sMax[2]),
    point(sMin[0], sMax[1], sMin[2]),
    point(sMax[0], sMin[1], sMin[2]),
    point(sMax[0], sMin[1], sMax[2]),
    point(sMax[0], sMax[1], sMax[2]),
    point(sMax[0], sMax[1], sMin[2]),
  ];

  return corners.map((t) => multiplyMatrixByTuple(m, t));
}

export function transformGroupBounds(shapes: Shape[]): Bounds {
  const groupPoints: Tuple[] = shapes.flatMap((s) =>
    transformBoundsCorners(s.bounds(), s.transform)
  );

  return [
    point(
      Math.min(...groupPoints.map((p) => p[0])),
      Math.min(...groupPoints.map((p) => p[1])),
      Math.min(...groupPoints.map((p) => p[2]))
    ),
    point(
      Math.max(...groupPoints.map((p) => p[0])),
      Math.max(...groupPoints.map((p) => p[1])),
      Math.max(...groupPoints.map((p) => p[2]))
    ),
  ];
}

export function splitBounds(b: Bounds): [Bounds, Bounds] {
  let [x0, y0, z0] = b[0];
  let [x1, y1, z1] = b[1];

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
    1 / r.direction[0],
    1 / r.direction[1],
    1 / r.direction[2]
  );
  const tx1 = (bMin[0] - r.origin[0]) * invRayDir[0];
  const tx2 = (bMax[0] - r.origin[0]) * invRayDir[0];
  const ty1 = (bMin[1] - r.origin[1]) * invRayDir[1];
  const ty2 = (bMax[1] - r.origin[1]) * invRayDir[1];
  const tz1 = (bMin[2] - r.origin[2]) * invRayDir[2];
  const tz2 = (bMax[2] - r.origin[2]) * invRayDir[2];
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
