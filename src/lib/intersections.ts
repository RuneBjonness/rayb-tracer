import { position, Ray } from './rays';
import { Shape } from './shapes/shape';
import {
  add,
  dot,
  multiplyTupleByScalar,
  negate,
  reflect,
  subtract,
  Tuple,
} from './tuples';

export type Intersection = {
  time: number;
  object: Shape;
  u: number;
  v: number;
};

export type IntersectionComputations = {
  t: number;
  object: Shape;
  point: Tuple;
  overPoint: Tuple;
  underPoint: Tuple;
  eyev: Tuple;
  normalv: Tuple;
  inside: boolean;
  reflectv: Tuple;
  n1: number;
  n2: number;
};

export function intersection(
  time: number,
  object: Shape,
  u: number = 0,
  v: number = 0
): Intersection {
  return { time, object, u, v };
}

export function hit(intersections: Intersection[]): Intersection | null {
  let positives = intersections.filter((i) => i.time >= 0);
  if (positives.length === 0) {
    return null;
  }
  positives.sort((a, b) => a.time - b.time);
  return positives[0];
}

export function prepareComputations(
  i: Intersection,
  r: Ray,
  xs: Intersection[] = [i]
): IntersectionComputations {
  const p = position(r, i.time);
  const comps = {
    t: i.time,
    object: i.object,
    point: p,
    eyev: negate(r.direction),
    normalv: i.object.normalAt(p, i),
    inside: false,
    overPoint: p,
    underPoint: p,
    reflectv: p,
    n1: 0,
    n2: 0,
  };
  if (dot(comps.normalv, comps.eyev) < 0) {
    comps.inside = true;
    comps.normalv = negate(comps.normalv);
  }
  const adjustv = multiplyTupleByScalar(comps.normalv, 0.0001);
  comps.overPoint = add(comps.point, adjustv);
  comps.underPoint = subtract(comps.point, adjustv);
  comps.reflectv = reflect(r.direction, comps.normalv);

  const containers: Shape[] = [];
  xs.forEach((inter) => {
    if (inter === i) {
      comps.n1 =
        containers.length > 0
          ? containers[containers.length - 1].material.refractiveIndex
          : 1.0;
    }

    const containerIdx = containers.indexOf(inter.object);
    if (containerIdx >= 0) {
      containers.splice(containerIdx, 1);
    } else {
      containers.push(inter.object);
    }

    if (inter === i) {
      comps.n2 =
        containers.length > 0
          ? containers[containers.length - 1].material.refractiveIndex
          : 1.0;
      return;
    }
  });

  return comps;
}

export function reflectance(comps: IntersectionComputations): number {
  let cos = dot(comps.eyev, comps.normalv);

  if (comps.n1 > comps.n2) {
    const n = comps.n1 / comps.n2;
    const sin2t = n ** 2 * (1.0 - cos ** 2);
    if (sin2t > 1) {
      return 1.0;
    }

    cos = Math.sqrt(1.0 - sin2t);
  }

  const r0 = ((comps.n1 - comps.n2) / (comps.n1 + comps.n2)) ** 2;
  return r0 + (1 - r0) * (1 - cos) ** 5;
}

export function refractedDirection(
  comps: IntersectionComputations
): Tuple | null {
  if (comps.object.material.transparancy < 0.001) {
    return null;
  }

  // check for total internal refraction
  const nRatio = comps.n1 / comps.n2;
  const cosI = dot(comps.eyev, comps.normalv);
  const sin2T = nRatio ** 2 * (1 - cosI ** 2);
  if (sin2T > 1) {
    return null;
  }

  const cosT = Math.sqrt(1 - sin2T);
  const dir = subtract(
    multiplyTupleByScalar(comps.normalv, nRatio * cosI - cosT),
    multiplyTupleByScalar(comps.eyev, nRatio)
  );
  return dir;
}
