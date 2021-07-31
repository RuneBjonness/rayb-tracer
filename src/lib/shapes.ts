import { intersection, Intersection } from './intersections';
import { identityMatrix, inverse, multiply, transpose } from './matrices';
import { Ray, transform } from './rays';
import { divide, dot, normalize, point, subtract, Tuple, vector } from './tuples'
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
