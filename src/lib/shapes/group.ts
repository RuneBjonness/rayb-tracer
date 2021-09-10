import { Intersection } from '../intersections';
import { Ray } from '../rays';
import { Tuple } from '../tuples';
import { Bounds, boundsContainsBounds, splitBounds, transformGroupBounds } from './bounds';
import { Shape } from './shape';


export class Group extends Shape {
    shapes: Shape[] = [];

    private groupBounds: Bounds | null = null;

    constructor() {
        super();
    }

    bounds(): Bounds {
        if (!this.groupBounds) {
            this.groupBounds = transformGroupBounds(this.shapes);
        }
        return this.groupBounds;
    }

    add(child: Shape) {
        child.parent = this;
        this.shapes.push(child);
    }

    override divide(threshold: number): void {
        if(this.shapes.length >= threshold) {
            const g1 = new Group();
            const g2 = new Group();
            const overlappingShapes: Shape[] = [];
            const [b1, b2] = splitBounds(this.bounds());

            this.shapes.forEach(s => {
                const transformedShapeBounds = transformGroupBounds([s]);
                if(boundsContainsBounds(b1, transformedShapeBounds)) {
                    g1.add(s);
                } else if(boundsContainsBounds(b2, transformedShapeBounds)) {
                    g2.add(s);
                } else {
                    overlappingShapes.push(s);
                }
            });

            this.shapes = overlappingShapes;
            if(g1.shapes.length > 0) {
                this.add(g1);
            } 
            if(g2.shapes.length > 0) {
                this.add(g2);
            } 

        }

        this.shapes.forEach(s => s.divide(threshold));
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