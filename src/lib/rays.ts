import { add, subtract, Tuple, normalize, multiplyTupleByScalar } from './tuples';
import * as matrices from './matrices';

export type Ray = {
    origin: Tuple;
    direction: Tuple;
};

export function ray(origin: Tuple, direction: Tuple): Ray {
    return { origin, direction };
}

export function rayToTarget(origin: Tuple, target: Tuple): Ray {
    const direction = normalize(subtract(target, origin));
    return { origin, direction };
}

export function rayFocalPoint(
    origin: Tuple,
    target: Tuple,
    focalLength: number
): Tuple {
    return position(rayToTarget(origin, target), focalLength);
}

export function position(ray: Ray, time: number): Tuple {
    return add(multiplyTupleByScalar(ray.direction, time), ray.origin);
}

export function transform(ray: Ray, m: number[][]): Ray {
    return {
        origin: matrices.multiplyMatrixByTuple(m, ray.origin),
        direction: matrices.multiplyMatrixByTuple(m, ray.direction),
    };
}
