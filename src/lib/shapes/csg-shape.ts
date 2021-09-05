import { Intersection } from '../intersections';
import { multiply } from '../matrices';
import { Ray } from '../rays';
import { point, Tuple } from '../tuples';
import { Bounds, transformGroupBounds } from './bounds';
import { Group } from './group';
import { Shape } from './shape';


export class CsgShape extends Shape {

    private groupBounds: Bounds | null = null;

    constructor(public operation: 'union' | 'intersection' | 'difference',
        public left: Shape,
        public right: Shape) {
        super();
        left.parent = this;
        right.parent = this;
    }

    bounds(): Bounds {
        if (!this.groupBounds) {
            this.groupBounds = transformGroupBounds([this.left, this.right]);
        }
        return this.groupBounds;
    }

    override divide(threshold: number): void {
        this.left.divide(threshold);
        this.right.divide(threshold);
    }

    validIntersection(leftHit: boolean, inLeft: boolean, inRight: boolean): boolean {
        if (this.operation === 'union') {
            return (leftHit && !inRight) || (!leftHit && !inLeft);
        } else if (this.operation === 'intersection') {
            return (leftHit && inRight) || (!leftHit && inLeft);
        } else if (this.operation === 'difference') {
            return (leftHit && !inRight) || (!leftHit && inLeft);
        }
        return false;
    }

    filterIntersections(xs: Intersection[]): Intersection[] {
        let inl = false;
        let inr = false;
        const res: Intersection[] = [];
        xs.forEach(i => {
            const lhit = this.includes(this.left, i.object);

            if (this.validIntersection(lhit, inl, inr)) {
                res.push(i);
            }

            if (lhit) {
                inl = !inl;
            } else {
                inr = !inr;
            }
        });

        return res;
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

        const xs = [this.left, this.right].flatMap(x => x.intersects(r)).sort((a, b) => a.time - b.time);
        return this.filterIntersections(xs);
    }

    protected localNormalAt(p: Tuple): Tuple {
        throw new Error('CSG Shapes don\'t have normal vectors, and if this is called we have done something wrong somewhere..');
    }

    private includes(s1: Shape, s2: Shape): boolean {
        if (this.isGroup(s1)) {
            const self = this;
            return s1.shapes.some(s => self.includes(s, s2));
        }
        if (this.isCsgShape(s1)) {
            return this.includes(s1.left, s2) || this.includes(s1.right, s2);
        }
        return s1 === s2;
    }
    private isGroup(shape: Shape): shape is Group {
        return (<Group>shape).shapes !== undefined;
    }
    private isCsgShape(shape: Shape): shape is CsgShape {
        return (<CsgShape>shape).operation !== undefined;
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
