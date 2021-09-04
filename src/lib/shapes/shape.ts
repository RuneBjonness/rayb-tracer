import { Intersection } from '../intersections';
import { identityMatrix, inverse, multiply, transpose } from '../matrices';
import { Ray, transform } from '../rays';
import { normalize, point, Tuple, vector } from '../tuples'
import { material, Material } from '../materials';
import { Bounds } from './bounds';
import { Group } from './group';
import { CsgShape } from './csg-shape';


export abstract class Shape {
    transform: number[][];
    material: Material;
    parent: Group | CsgShape | null = null;

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
