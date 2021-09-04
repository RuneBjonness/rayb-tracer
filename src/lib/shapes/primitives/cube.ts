import { intersection, Intersection } from '../../intersections';
import { Ray } from '../../rays';
import { point, Tuple, vector } from '../../tuples';
import { Bounds } from '../bounds';
import { Shape } from '../shape';


export class Cube extends Shape {
    constructor() {
        super();
    }

    bounds(): Bounds {
        return [point(-1, -1, -1), point(1, 1, 1)];
    }

    protected localIntersects(r: Ray): Intersection[] {
        const [xtmin, xtmax] = this.checkAxis(r.origin[0], r.direction[0]);
        const [ytmin, ytmax] = this.checkAxis(r.origin[1], r.direction[1]);
        const [ztmin, ztmax] = this.checkAxis(r.origin[2], r.direction[2]);

        const tmin = Math.max(xtmin, ytmin, ztmin);
        const tmax = Math.min(xtmax, ytmax, ztmax);

        if (tmin > tmax) {
            return [];
        }

        return [
            intersection(tmin, this),
            intersection(tmax, this)
        ];
    }

    protected localNormalAt(p: Tuple): Tuple {
        const maxc = Math.max(Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));

        if (maxc == Math.abs(p[0])) {
            return vector(p[0], 0, 0);
        } else if (maxc == Math.abs(p[1])) {
            return vector(0, p[1], 0);
        }

        return vector(0, 0, p[2]);
    }

    private checkAxis(origin: number, direction: number): [number, number] {
        const tMinNumerator = (-1 - origin);
        const tMaxNumerator = (1 - origin);

        let tmin, tmax: number;

        if (Math.abs(direction) >= 0.00001) {
            tmin = tMinNumerator / direction;
            tmax = tMaxNumerator / direction;
        } else {
            tmin = tMinNumerator * Number.POSITIVE_INFINITY;
            tmax = tMaxNumerator * Number.POSITIVE_INFINITY;
        }
        return tmin < tmax ? [tmin, tmax] : [tmax, tmin];
    }
}
