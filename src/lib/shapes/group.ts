import { Intersection } from '../intersections';
import { multiply } from '../matrices';
import { Ray } from '../rays';
import { point, Tuple } from '../tuples';
import { Bounds } from './bounds';
import { Shape } from './shape';


export class Group extends Shape {
    shapes: Shape[] = [];

    private groupBounds: Bounds | null = null;

    constructor() {
        super();
    }

    bounds(): Bounds {
        if (this.groupBounds) {
            return this.groupBounds;
        }
        const groupPoints: Tuple[] = [];

        this.shapes.forEach(s => {
            const [sMin, sMax] = s.bounds();
            let corners = [
                point(sMin[0], sMin[1], sMin[2]),
                point(sMin[0], sMin[1], sMax[2]),
                point(sMin[0], sMax[1], sMax[2]),
                point(sMin[0], sMax[1], sMin[2]),
                point(sMax[0], sMin[1], sMin[2]),
                point(sMax[0], sMin[1], sMax[2]),
                point(sMax[0], sMax[1], sMax[2]),
                point(sMax[0], sMax[1], sMin[2])
            ];

            groupPoints.push(...corners.map((v) => multiply(s.transform, v)));
        });

        this.groupBounds = [
            point(
                Math.min(...groupPoints.map(p => p[0])),
                Math.min(...groupPoints.map(p => p[1])),
                Math.min(...groupPoints.map(p => p[2]))
            ),
            point(
                Math.max(...groupPoints.map(p => p[0])),
                Math.max(...groupPoints.map(p => p[1])),
                Math.max(...groupPoints.map(p => p[2]))
            )
        ];
        return this.groupBounds;
    }

    add(child: Shape) {
        child.parent = this;
        this.shapes.push(child);
    }

    protected localIntersects(r: Ray): Intersection[] {
        const [bMin, bMax] = this.bounds();

        const [xtmin, xtmax] = this.checkAxis(r.origin[0], r.direction[0], bMin[0], bMax[0]);
        const [ytmin, ytmax] = this.checkAxis(r.origin[1], r.direction[1], bMin[1], bMax[1]);
        const [ztmin, ztmax] = this.checkAxis(r.origin[2], r.direction[2], bMin[2], bMax[2]);

        const tmin = Math.max(xtmin, ytmin, ztmin);
        const tmax = Math.min(xtmax, ytmax, ztmax);

        if (tmin > tmax) {
            return [];
        }

        return this.shapes.flatMap(x => x.intersects(r)).sort((a, b) => a.time - b.time);
    }

    protected localNormalAt(p: Tuple): Tuple {
        throw new Error('Groups don\'t have normal vectors, and if this is called we have done something wrong somewhere..');
    }

    private checkAxis(origin: number, direction: number, min: number, max: number): [number, number] {
        const tMinNumerator = (min - origin);
        const tMaxNumerator = (max - origin);

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
