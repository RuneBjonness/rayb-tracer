import {
  hit,
  Intersection,
  IntersectionComputations,
  prepareComputations,
  reflectance,
  refractedDirection,
} from './intersections';
import { Light, PointLight } from './lights';
import { ray, Ray } from './rays';
import { Shape } from './shapes/shape';
import { Sphere } from './shapes/primitives/sphere';
import {
  addColors,
  Color,
  color,
  divideColor,
  dot,
  magnitude,
  multiplyColorByScalar,
  negate,
  normalize,
  point,
  subtract,
  Tuple,
  vector,
} from './math/tuples';
import { scaling } from './math/transformations';
import { lighting } from './materials';

export class World {
  objects: Shape[] = [];
  lights: Light[] = [];

  intersects(r: Ray): Intersection[] {
    const intersections: Intersection[] = [];
    for (let i = 0; i < this.objects.length; i++) {
      intersections.push(...this.objects[i].intersects(r));
    }

    return intersections.sort((a, b) => a.time - b.time);
  }

  shadeHit(
    comps: IntersectionComputations,
    maxDepth: number = 4,
    indirectLightningSamples: number = 0
  ): Color {
    let samples: Color[] = [];
    for (let i = 0; i < indirectLightningSamples; i++) {
      const s = this.indirectLightningSample(comps, maxDepth);
      if (s) {
        samples.push(s);
      }
    }
    const indirectLightning = samples.length
      ? divideColor(
          samples.reduce((a, b) => addColors(a, b)),
          samples.length
        )
      : null;

    let shades: Color[] = [];
    this.lights.forEach((l) => {
      shades.push(
        lighting(
          comps.object,
          l,
          comps.point,
          comps.eyev,
          comps.normalv,
          l.intensityAt(comps.overPoint, this),
          indirectLightning
        )
      );
    });
    if (shades.length === 0) {
      return [0, 0, 0];
    }

    let reflected = this.reflectedColor(comps, maxDepth);
    let refracted = this.refractedColor(comps, maxDepth);

    if (
      comps.object.material.reflective > 0 &&
      comps.object.material.transparancy > 0
    ) {
      const r = reflectance(comps);
      shades.push(
        multiplyColorByScalar(reflected, r),
        multiplyColorByScalar(refracted, 1 - r)
      );
    } else {
      shades.push(reflected, refracted);
    }
    return shades.reduce((a, b) => addColors(a, b));
  }

  colorAt(
    r: Ray,
    maxDepth: number = 4,
    maxIndirectLightSamples: number = 0
  ): Color {
    const xs = this.intersects(r);
    const i = hit(xs);
    return i
      ? this.shadeHit(
          prepareComputations(i, r, xs),
          maxDepth,
          maxIndirectLightSamples
        )
      : [0, 0, 0];
  }

  isShadowed(p: Tuple, lightPosition: Tuple): boolean {
    const v = subtract(lightPosition, p);
    const distance = magnitude(v);
    const direction = normalize(v);
    const r = ray(p, direction);
    const h = hit(this.intersects(r));
    return h != null && h.time < distance;
  }

  reflectedColor(comps: IntersectionComputations, maxDepth: number = 4): Color {
    if (maxDepth <= 0 || comps.object.material.reflective < 0.001) {
      return [0, 0, 0];
    }
    const c = this.colorAt(ray(comps.overPoint, comps.reflectv), maxDepth - 1);
    return multiplyColorByScalar(c, comps.object.material.reflective);
  }

  refractedColor(comps: IntersectionComputations, maxDepth: number = 4): Color {
    if (maxDepth <= 0 || comps.object.material.transparancy < 0.001) {
      return [0, 0, 0];
    }
    const dir = refractedDirection(comps);
    if (dir === null) {
      return [0, 0, 0];
    }
    const c = this.colorAt(ray(comps.underPoint, dir), maxDepth - 1);
    return multiplyColorByScalar(c, comps.object.material.transparancy);
  }

  indirectLightningSample(
    comps: IntersectionComputations,
    maxDepth: number
  ): Color | null {
    if (maxDepth <= 0) {
      return null;
    }

    let sampleDir = normalize(
      vector(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      )
    );

    let normalDiff = dot(sampleDir, comps.normalv);
    if (normalDiff < 0) {
      sampleDir = negate(sampleDir);
      normalDiff = normalDiff * -1;
    }

    const r = ray(comps.overPoint, sampleDir);

    const xs = this.intersects(r);
    const i = hit(xs);
    if (i == null) {
      return [0, 0, 0];
    }

    const ic = prepareComputations(i, r, xs);
    if (
      ic.object.material.reflective > 0.01 ||
      ic.object.material.transparancy > 0.01 ||
      (ic.object.material.specular > 0.01 &&
        ic.object.material.shininess > 5) ||
      ic.object.material.ambient === 1
    ) {
      return null;
    }
    const c = this.shadeHit(ic, maxDepth - 1);

    return multiplyColorByScalar(
      c,
      ic.object.material.diffuse * 0.5 +
        normalDiff * (1 - ic.object.material.diffuse * 0.5)
    );
  }
}

export function defaultWorld(): World {
  const w = new World();
  w.lights.push(new PointLight(point(-10, 10, -10), color(1, 1, 1)));

  const s1 = new Sphere();
  s1.material.color = color(0.8, 1.0, 0.6);
  s1.material.diffuse = 0.7;
  s1.material.specular = 0.2;
  w.objects.push(s1);

  const s2 = new Sphere();
  s2.transform = scaling(0.5, 0.5, 0.5);
  w.objects.push(s2);
  return w;
}
