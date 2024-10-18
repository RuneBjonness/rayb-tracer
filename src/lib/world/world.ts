import {
  hitSorted,
  Intersection,
  IntersectionComputations,
  prepareComputations,
  reflectance,
  refractedDirection,
} from '../intersections';
import { Light } from '../lights/lights';
import { Ray } from '../rays';
import { Shape } from '../shapes/shape';
import { Color } from '../math/color';
import { lighting } from '../material/materials';
import { vector, Vector4 } from '../math/vector4';

export class World {
  objects: Shape[] = [];
  lights: Light[] = [];

  intersects(r: Ray): Intersection[] {
    const intersections: Intersection[] = [];
    for (let i = 0; i < this.objects.length; i++) {
      this.objects[i].intersects(r, intersections);
    }

    return intersections.sort((a, b) => a.time - b.time);
  }

  hitsAny(r: Ray, maxDistance: number): boolean {
    for (let i = 0; i < this.objects.length; i++) {
      if (this.objects[i].hits(r, maxDistance)) {
        return true;
      }
    }
    return false;
  }

  shadeHit(
    comps: IntersectionComputations,
    maxDepth: number = 4,
    indirectLightningSamples: number = 0
  ): Color {
    const indirectLightning = new Color(0, 0, 0);
    let sampleCount = 0;
    for (let i = 0; i < indirectLightningSamples; i++) {
      const s = this.indirectLightningSample(comps, maxDepth);
      if (s) {
        indirectLightning.add(s);
        sampleCount++;
      }
    }
    if (sampleCount) {
      indirectLightning.divideByScalar(sampleCount);
    }

    const shades = new Color(0, 0, 0);
    for (let l of this.lights) {
      shades.add(
        lighting(
          comps.object,
          l,
          comps.point,
          comps.eyev,
          comps.normalv,
          l.intensityAt(comps.overPoint, this),
          sampleCount > 0 ? indirectLightning : null
        )
      );
    }
    if (this.lights.length === 0) {
      return new Color(0, 0, 0);
    }

    const reflected = this.reflectedColor(comps, maxDepth);
    const refracted = this.refractedColor(comps, maxDepth);

    if (
      comps.object.material.reflective > 0 &&
      comps.object.material.transparency > 0
    ) {
      const r = reflectance(comps);
      reflected.multiplyByScalar(r);
      refracted.multiplyByScalar(1 - r);
    }
    shades.add(reflected).add(refracted);
    return shades;
  }

  colorAt(
    r: Ray,
    maxDepth: number = 4,
    maxIndirectLightSamples: number = 0
  ): Color {
    const xs = this.intersects(r);
    const i = hitSorted(xs);
    return i
      ? this.shadeHit(
          prepareComputations(i, r, xs),
          maxDepth,
          maxIndirectLightSamples
        )
      : new Color(0, 0, 0);
  }

  isShadowed(p: Vector4, lightPosition: Vector4): boolean {
    const v = lightPosition.clone().subtract(p);
    const distance = v.magnitude();
    const direction = v.scale(1 / distance);
    return this.hitsAny(new Ray(p, direction), distance);
  }

  reflectedColor(comps: IntersectionComputations, maxDepth: number = 4): Color {
    if (maxDepth <= 0 || comps.object.material.reflective < 0.001) {
      return new Color(0, 0, 0);
    }
    const c = this.colorAt(
      new Ray(comps.overPoint, comps.reflectv),
      maxDepth - 1
    );
    return c.multiplyByScalar(comps.object.material.reflective);
  }

  refractedColor(comps: IntersectionComputations, maxDepth: number = 4): Color {
    if (maxDepth <= 0 || comps.object.material.transparency < 0.001) {
      return new Color(0, 0, 0);
    }
    const dir = refractedDirection(comps);
    if (dir === null) {
      return new Color(0, 0, 0);
    }
    const c = this.colorAt(new Ray(comps.underPoint, dir), maxDepth - 1);
    return c.multiplyByScalar(comps.object.material.transparency);
  }

  indirectLightningSample(
    comps: IntersectionComputations,
    maxDepth: number
  ): Color | null {
    if (maxDepth <= 0) {
      return null;
    }

    let sampleDir = vector(
      Math.random() * 2 - 1,
      Math.random() * 2 - 1,
      Math.random() * 2 - 1
    ).normalize();

    let normalDiff = sampleDir.dot(comps.normalv);
    if (normalDiff < 0) {
      sampleDir = sampleDir.negate();
      normalDiff = normalDiff * -1;
    }

    const r = new Ray(comps.overPoint, sampleDir);

    const xs = this.intersects(r);
    const i = hitSorted(xs);
    if (i == null) {
      return new Color(0, 0, 0);
    }

    const ic = prepareComputations(i, r, xs);
    if (
      ic.object.material.reflective > 0.01 ||
      ic.object.material.transparency > 0.01 ||
      (ic.object.material.specular > 0.01 &&
        ic.object.material.shininess > 5) ||
      ic.object.material.ambient === 1
    ) {
      return null;
    }
    const c = this.shadeHit(ic, maxDepth - 1);

    return c.multiplyByScalar(
      ic.object.material.diffuse * 0.5 +
        normalDiff * (1 - ic.object.material.diffuse * 0.5)
    );
  }
}
