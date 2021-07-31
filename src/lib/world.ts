import { hit, Intersection, IntersectionComputations, prepareComputations } from './intersections';
import { Light, pointLight } from './lights';
import { ray, Ray } from './rays';
import { Shape, Sphere } from './shapes'
import { add, Color, color, dot, magnitude, multiply, normalize, point, subtract, Tuple } from './tuples';
import { scaling} from './transformations';
import { lighting } from './materials';

export class World {
    objects: Shape[] = [];
    lights: Light[] = [];

    intersects(r: Ray): Intersection[] {
        const intersections: Intersection[] = [];
        this.objects.forEach(obj => {
            intersections.push(...obj.intersects(r));
        });

        return intersections.sort((a, b) => a.time - b.time );
    }

    shadeHit(comps: IntersectionComputations, maxDepth: number = 4): Color {
        let shades: Color[] = [];
        this.lights.forEach(l => {
            shades.push(lighting(comps.object, l, comps.point, comps.eyev, comps.normalv, this.isShadowed(comps.overPoint, l)));
        });
        if(shades.length === 0){
            return [0,0,0];
        } else {
            shades.push(this.reflectedColor(comps, maxDepth));
            shades.push(this.refractedColor(comps, maxDepth));
            return shades.reduce((a, b) => add(a, b));
        }
    }

    colorAt(r: Ray, maxDepth: number = 4): Color {
        const xs = this.intersects(r);
        const i = hit(xs);
        return i ? this.shadeHit(prepareComputations(i, r, xs), maxDepth) : [0,0,0];
    }

    isShadowed(p: Tuple, l: Light): boolean {
        const v = subtract(l.position, p);
        const distance = magnitude(v);
        const direction = normalize(v);
        const r = ray(p, direction);
        const h = hit(this.intersects(r));
        return (h != null && h.time < distance);
    }

    reflectedColor(comps: IntersectionComputations, maxDepth: number = 4): Color {
        if(maxDepth <= 0 || comps.object.material.reflective < 0.001){
            return [0,0,0];
        }
        const c = this.colorAt(ray(comps.overPoint, comps.reflectv), maxDepth - 1);
        return multiply(c, comps.object.material.reflective);
    }

    refractedColor(comps: IntersectionComputations, maxDepth: number = 4): Color {
        if(maxDepth <= 0 || comps.object.material.transparancy < 0.001){
            return [0,0,0];
        }

        // check for total internal refraction
        const nRatio = comps.n1 / comps.n2;
        const cosI = dot(comps.eyev, comps.normalv);
        const sin2T = nRatio**2 * (1 - cosI**2);
        if(sin2T > 1) {
            return [0,0,0];
        }

        const cosT = Math.sqrt(1 - sin2T);
        const dir = subtract(multiply(comps.normalv, (nRatio * cosI - cosT)), multiply(comps.eyev, nRatio))
        const c = this.colorAt(ray(comps.underPoint, dir), maxDepth - 1);
        return multiply(c, comps.object.material.transparancy);
    }
}

export function defaultWorld(): World {
    const w = new World();
    w.lights.push(pointLight(point(-10, 10, -10), color(1, 1, 1)));

    const s1 = new Sphere();
    s1.material.color = color(0.8, 1.0, 0.6)
    s1.material.diffuse = 0.7;
    s1.material.specular = 0.2;
    w.objects.push(s1);

    const s2 = new Sphere();
    s2.transform = scaling(0.5, 0.5, 0.5);
    w.objects.push(s2);
    return w;
}
