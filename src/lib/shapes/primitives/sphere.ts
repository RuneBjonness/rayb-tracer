import { intersection, Intersection } from '../../intersections';
import { Ray } from '../../rays';
import { dot, point, subtract, Tuple } from '../../tuples';
import { Bounds } from '../bounds';
import { Shape } from '../shape';

export class Sphere extends Shape {
    constructor() {
        super();
    }

    bounds(): Bounds {
        return [point(-1, -1, -1), point(1, 1, 1)];
    }

    protected localIntersects(r: Ray): Intersection[] {
        const spehereToRay = subtract(r.origin, point(0, 0, 0));
        const a = dot(r.direction, r.direction);
        const b = 2 * dot(r.direction, spehereToRay);
        const c = dot(spehereToRay, spehereToRay) - 1;
        const discriminant = b ** 2 - 4 * a * c;

        if (discriminant < 0) {
            return [];
        }
        const sqrtDiscriminant = Math.sqrt(discriminant);
        return [
            intersection((-b - sqrtDiscriminant) / (2 * a), this),
            intersection((-b + sqrtDiscriminant) / (2 * a), this),
        ];
    }

    protected localNormalAt(p: Tuple): Tuple {
        return subtract(p, point(0, 0, 0));
    }
}

export function glassSphere(): Sphere {
    const s = new Sphere();
    s.material.transparancy = 1.0;
    s.material.refractiveIndex = 1.5;
    return s;
}
