import { intersection, Intersection } from './intersections';
import { identityMatrix, inverse, multiply, transpose } from './matrices';
import { Ray, transform } from './rays';
import { cross, dot, normalize, point, subtract, Tuple, vector, multiply as multiplyTuples, add } from './tuples'
import { material, Material } from './materials';

export type Bounds = [
    min: Tuple,
    max: Tuple
]

export abstract class Shape {
    transform: number[][];
    material: Material;
    parent: Group | null = null;

    constructor(){
        this.transform = identityMatrix();
        this.material = material()
    }

    abstract bounds(): Bounds;

    intersects(r: Ray): Intersection[] {
        const ray = transform(r, inverse(this.transform));
        return this.localIntersects(ray);
    }    
    protected abstract localIntersects(r: Ray): Intersection[];

    normalAt(p: Tuple, i: Intersection | null = null): Tuple {
        const localPoint = this.worldToObject(p);
        const localNormal = this.localNormalAt(localPoint, i);
        return this.normalToWorld(localNormal);
    }
    protected abstract localNormalAt(p: Tuple, i: Intersection | null): Tuple;

    worldToObject(p: Tuple): Tuple {
        return multiply(inverse(this.transform), this.parent ? this.parent.worldToObject(p) : p);
    }

    normalToWorld(n: Tuple): Tuple {
        let normal = multiply(transpose(inverse(this.transform)), n);
        normal[3] = 0;
        normal = normalize(normal);
        return this.parent ? this.parent.normalToWorld(normal) : normal;
    }
}

export class TestShape extends Shape {
    localRayFromBase: Ray | null = null;

    constructor(){
        super();
    }

    bounds(): Bounds {
        return [point(-1, -1, -1), point(1, 1, 1)];
    }

    protected localIntersects(r: Ray): Intersection[] {
        this.localRayFromBase = r;
        return [];
    }

    protected localNormalAt(p: Tuple): Tuple {
        return vector(p[0], p[1], p[2]);
    }
}

export class Sphere extends Shape {
    constructor(){
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
        const discriminant = b**2 - 4 * a * c;
    
        if(discriminant < 0) {
            return [];
        }
        return [
            intersection((-b - Math.sqrt(discriminant)) / (2 * a), this),
            intersection((-b + Math.sqrt(discriminant)) / (2 * a), this)
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

export class Plane extends Shape {
    constructor(){
        super();
    }

    bounds(): Bounds {
        return [
            point(Number.NEGATIVE_INFINITY, 0, Number.NEGATIVE_INFINITY), 
            point(Number.POSITIVE_INFINITY, 0, Number.POSITIVE_INFINITY)
        ];
    }

    protected localIntersects(r: Ray): Intersection[] {
        if(Math.abs(r.direction[1]) < 0.00001) {
            return [];
        }
        return [intersection(-r.origin[1] / r.direction[1], this)];
    }

    protected localNormalAt(_p: Tuple): Tuple {
        return vector(0, 1, 0);
    }
}

export class Cube extends Shape {
    constructor(){
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

        if(tmin > tmax) {
            return [];
        }

        return [
            intersection(tmin, this),
            intersection(tmax, this)
        ];
    }

    protected localNormalAt(p: Tuple): Tuple {
        const maxc = Math.max(Math.abs(p[0]), Math.abs(p[1]), Math.abs(p[2]));
        
        if(maxc == Math.abs(p[0])){
            return vector(p[0], 0, 0);
        } else if(maxc == Math.abs(p[1])){
            return vector(0, p[1], 0);
        }

        return vector(0, 0, p[2]);
    }

    private checkAxis(origin: number, direction: number): [number, number] {
        const tMinNumerator = (-1 - origin);
        const tMaxNumerator = (1 - origin);

        let tmin, tmax : number;

        if(Math.abs(direction) >= 0.00001) {
            tmin = tMinNumerator / direction;
            tmax = tMaxNumerator / direction;
        } else {
            tmin = tMinNumerator * Number.POSITIVE_INFINITY;
            tmax = tMaxNumerator * Number.POSITIVE_INFINITY;
        }
        return tmin < tmax ? [tmin, tmax] : [tmax, tmin];
    }
}

export class Cylinder extends Shape {
    minimum: number = Number.NEGATIVE_INFINITY;
    maximum: number = Number.POSITIVE_INFINITY;
    closed: boolean = false;

    constructor(){
        super();
    }

    bounds(): Bounds {
        return [
            point(-1, this.minimum, -1), 
            point(1, this.maximum, 1)
        ];
    }

    protected localIntersects(r: Ray): Intersection[] {
        const xs: Intersection[] = [];

        const a = r.direction[0]**2 + r.direction[2]**2;

        if(Math.abs(a) > 0.00001) {
            const b = 2 * r.origin[0] * r.direction[0] + 2 * r.origin[2] * r.direction[2];
            const c =  r.origin[0]**2 + r.origin[2]**2 - 1;
            const discriminant = b**2 - 4 * a * c;
        
            if(discriminant >= 0) {
                let t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
                let t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        
                if(t0 > t1){
                    [t0, t1] = [t1, t0];
                }
        
                xs.push(...this.hitWalls(r, t0));
                xs.push(...this.hitWalls(r, t1));
            }
        }

        if(this.closed && Math.abs(r.direction[1]) > 0.00001){
            xs.push(...this.hitCaps(r, (this.minimum - r.origin[1]) / r.direction[1]));
            xs.push(...this.hitCaps(r, (this.maximum - r.origin[1]) / r.direction[1]));
        }

        return xs;
    }

    protected localNormalAt(p: Tuple): Tuple {
        const dist = p[0]**2 + p[2]**2;
        if(dist < 1 && p[1] >= this.maximum - 0.00001){
            return vector(0, 1, 0);
        }

        if(dist < 1 && p[1] <= this.minimum + 0.00001){
            return vector(0, -1, 0);
        }

        return vector(p[0], 0, p[2]);
    }

    private hitWalls(r: Ray, t: number): Intersection[] {
        const y = r.origin[1] + t * r.direction[1];
        return this.minimum < y && y < this.maximum 
            ? [intersection(t, this)]
            : [];
    }

    private hitCaps(r: Ray, t: number): Intersection[] {
        const x = r.origin[0] + t * r.direction[0];
        const z = r.origin[2] + t * r.direction[2];
        return (x**2 +  z**2) <= 1 
            ? [intersection(t, this)]
            : [];
    }
}

export class Cone extends Shape {
    minimum: number = Number.NEGATIVE_INFINITY;
    maximum: number = Number.POSITIVE_INFINITY;
    closed: boolean = false;

    constructor(){
        super();
    }

    bounds(): Bounds {
        return [
            point(-1, this.minimum, -1), 
            point(1, this.maximum, 1)
        ];
    }

    protected localIntersects(r: Ray): Intersection[] {
        const xs: Intersection[] = [];

        const a = r.direction[0]**2 - r.direction[1]**2 + r.direction[2]**2;
        const b = 2 * r.origin[0] * r.direction[0] - 2 * r.origin[1] * r.direction[1] + 2 * r.origin[2] * r.direction[2];
        const c =  r.origin[0]**2 - r.origin[1]**2 + r.origin[2]**2;

        if(Math.abs(a) > 0.00001) {
            const discriminant = b**2 - 4 * a * c;
        
            if(discriminant >= 0) {
                let t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
                let t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
        
                if(t0 > t1){
                    [t0, t1] = [t1, t0];
                }
        
                xs.push(...this.hitWalls(r, t0));
                xs.push(...this.hitWalls(r, t1));
            }
        } else if(Math.abs(b) > 0.00001) {
            xs.push(...this.hitWalls(r, -c/(2*b)));
        }

        if(this.closed && Math.abs(r.direction[1]) > 0.00001){
            xs.push(...this.hitCaps(r, this.minimum));
            xs.push(...this.hitCaps(r, this.maximum));
        }

        return xs;
    }

    protected localNormalAt(p: Tuple): Tuple {
        const dist = p[0]**2 + p[2]**2;
        if(dist < 1 && p[1] >= this.maximum - 0.00001){
            return vector(0, 1, 0);
        }

        if(dist < 1 && p[1] <= this.minimum + 0.00001){
            return vector(0, -1, 0);
        }
        
        let y = Math.sqrt(dist);
        return vector(p[0], p[1] > 0 ? -y : y, p[2]);
    }

    private hitWalls(r: Ray, t: number): Intersection[] {
        const y = r.origin[1] + t * r.direction[1];
        return this.minimum < y && y < this.maximum 
            ? [intersection(t, this)]
            : [];
    }

    private hitCaps(r: Ray, y: number): Intersection[] {
        const t = (y - r.origin[1]) / r.direction[1];
        const x = r.origin[0] + t * r.direction[0];
        const z = r.origin[2] + t * r.direction[2];
        return (x**2 + z**2) <= Math.abs(y) 
            ? [intersection(t, this)]
            : [];
    }
}

export class Triangle extends Shape {
    e1: Tuple;
    e2: Tuple;
    normal: Tuple;

    private calculatedBounds: Bounds | null = null;

    constructor(public p1: Tuple, public p2: Tuple, public p3: Tuple){
        super();
        this.e1 = subtract(p2, p1);
        this.e2 = subtract(p3, p1);
        this.normal = normalize(cross(this.e2, this.e1));
    }

    bounds(): Bounds {
        if(this.calculatedBounds) {
            return this.calculatedBounds;
        }
        
        this.calculatedBounds = [
            point(
                Math.min(this.p1[0], this.p2[0], this.p3[0]),
                Math.min(this.p1[1], this.p2[1], this.p3[1]),
                Math.min(this.p1[2], this.p2[2], this.p3[2]),
            ),
            point(
                Math.max(this.p1[0], this.p2[0], this.p3[0]),
                Math.max(this.p1[1], this.p2[1], this.p3[1]),
                Math.max(this.p1[2], this.p2[2], this.p3[2]),
            )
        ];
        return this.calculatedBounds;
    }

    protected localIntersects(r: Ray): Intersection[] {
        const dirCrossE2 = cross(r.direction, this.e2);
        const det = dot(this.e1, dirCrossE2);
        
        if(Math.abs(det) < 0.00001) {
            return [];
        }

        const f = 1 / det;
        const p1ToOrigin = subtract(r.origin, this.p1);
        const u = f * dot(p1ToOrigin, dirCrossE2);

        if(u < 0 || u > 1) {
            return [];
        }

        const originCrossE1 = cross(p1ToOrigin, this.e1);
        const v = f * dot(r.direction, originCrossE1);

        if(v < 0 || (u + v) > 1) {
            return [];
        }

        const t = f * dot(this.e2, originCrossE1);
        return [intersection(t, this)];
    }

    protected localNormalAt(_p: Tuple): Tuple {
        return this.normal;
    }
}

export class SmoothTriangle extends Shape {
    e1: Tuple;
    e2: Tuple;

    private calculatedBounds: Bounds | null = null;

    constructor(public p1: Tuple, 
                public p2: Tuple, 
                public p3: Tuple,
                public n1: Tuple,
                public n2: Tuple,
                public n3: Tuple){
        super();
        this.e1 = subtract(p2, p1);
        this.e2 = subtract(p3, p1);
    }

    bounds(): Bounds {
        if(this.calculatedBounds) {
            return this.calculatedBounds;
        }
        
        this.calculatedBounds = [
            point(
                Math.min(this.p1[0], this.p2[0], this.p3[0]),
                Math.min(this.p1[1], this.p2[1], this.p3[1]),
                Math.min(this.p1[2], this.p2[2], this.p3[2]),
            ),
            point(
                Math.max(this.p1[0], this.p2[0], this.p3[0]),
                Math.max(this.p1[1], this.p2[1], this.p3[1]),
                Math.max(this.p1[2], this.p2[2], this.p3[2]),
            )
        ];
        return this.calculatedBounds;
    }

    protected localIntersects(r: Ray): Intersection[] {
        const dirCrossE2 = cross(r.direction, this.e2);
        const det = dot(this.e1, dirCrossE2);
        
        if(Math.abs(det) < 0.00001) {
            return [];
        }

        const f = 1 / det;
        const p1ToOrigin = subtract(r.origin, this.p1);
        const u = f * dot(p1ToOrigin, dirCrossE2);

        if(u < 0 || u > 1) {
            return [];
        }

        const originCrossE1 = cross(p1ToOrigin, this.e1);
        const v = f * dot(r.direction, originCrossE1);

        if(v < 0 || (u + v) > 1) {
            return [];
        }

        const t = f * dot(this.e2, originCrossE1);
        return [intersection(t, this, u, v)];
    }

    protected localNormalAt(_p: Tuple, i: Intersection | null): Tuple {
        if(i == null) {
            return vector(0, 0, 0);
        }

        return add(add(multiplyTuples(this.n2, i.u), multiplyTuples(this.n3, i.v)), multiplyTuples(this.n1, 1 - i.u - i.v));
    }
}

export class Group extends Shape {
    shapes: Shape[] = [];

    private groupBounds: Bounds | null = null;

    constructor(){
        super();
    }

    bounds(): Bounds {
        if(this.groupBounds) {
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

    add(child: Shape){
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

        if(tmin > tmax) {
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

        let tmin, tmax : number;

        if(Math.abs(direction) >= 0.00001) {
            tmin = tMinNumerator / direction;
            tmax = tMaxNumerator / direction;
        } else {
            tmin = tMinNumerator * Number.POSITIVE_INFINITY;
            tmax = tMaxNumerator * Number.POSITIVE_INFINITY;
        }
        return tmin < tmax ? [tmin, tmax] : [tmax, tmin];
    }
}
