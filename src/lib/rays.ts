import { add, multiply, Tuple } from './tuples'
import * as matrices from './matrices'

export type Ray = {
    origin: Tuple,
    direction: Tuple
}

export function ray(origin: Tuple, direction: Tuple): Ray {
    return { origin, direction};
}

export function position(ray: Ray, time: number): Tuple {
    return add(multiply(ray.direction, time), ray.origin);
}

export function transform(ray: Ray, m: number[][]): Ray {
    return { 
        origin: matrices.multiply(m, ray.origin), 
        direction: matrices.multiply(m, ray.direction)
    };
}
