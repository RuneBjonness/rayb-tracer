import { intersection, Intersection } from './intersections';
import { identityMatrix, inverse, multiply, transpose } from './matrices';
import { Ray, transform } from './rays';
import { dot, normalize, point, subtract, Tuple, vector } from './tuples'
import { material, Material } from './materials';


export abstract class Shape {
    transform: number[][];
    material: Material;

    constructor(){
        this.transform = identityMatrix();
        this.material = material()
    }

    intersects(r: Ray): Intersection[] {
        const ray = transform(r, inverse(this.transform));
        return this.localIntersects(ray);
    }    
    protected abstract localIntersects(r: Ray): Intersection[];

    normalAt(p: Tuple): Tuple {
        const localPoint = multiply(inverse(this.transform), p);
        const localNormal = this.localNormalAt(localPoint);
        const worldNormal = multiply(transpose(inverse(this.transform)), localNormal);
        worldNormal[3] = 0;
        return normalize(worldNormal);
    }
    protected abstract localNormalAt(p: Tuple): Tuple;
}

export class TestShape extends Shape {
    localRayFromBase: Ray | null = null;

    constructor(){
        super();
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
    minimum: number;
    maximum: number;

    constructor(){
        super();

        this.minimum = Number.NEGATIVE_INFINITY;
        this.maximum = Number.POSITIVE_INFINITY;
    }

    protected localIntersects(r: Ray): Intersection[] {
        const a = r.direction[0]**2 + r.direction[2]**2;
        if(Math.abs(a) < 0.00001) {
            return [];
        }
        const b = 2 * r.origin[0] * r.direction[0] + 2 * r.origin[2] * r.direction[2];
        const c =  r.origin[0]**2 + r.origin[2]**2 - 1;
        const discriminant = b**2 - 4 * a * c;
    
        if(discriminant < 0) {
            return [];
        }

        let t0 = (-b - Math.sqrt(discriminant)) / (2 * a);
        let t1 = (-b + Math.sqrt(discriminant)) / (2 * a);

        if(t0 > t1){
            [t0, t1] = [t1, t0];
        }

        const xs = this.hit(r, t0);
        xs.push(...this.hit(r, t1));
        return xs;
    }

    protected localNormalAt(p: Tuple): Tuple {
        return vector(p[0], 0, p[2]);
    }

    private hit(r: Ray, t: number): Intersection[] {
        const y = r.origin[1] + t * r.direction[1];
        return this.minimum < y && y < this.maximum 
            ? [intersection(t, this)]
            : [];
    }

}
