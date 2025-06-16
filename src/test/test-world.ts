import { PointLight } from '../lib/lights/lights';
import { Material, material } from '../lib/material/materials';
import { Color } from '../lib/math/color';
import { scaling } from '../lib/math/transformations';
import { point } from '../lib/math/vector4';
import { TransformableSphere } from '../lib/shapes/primitives/sphere';
import { World } from '../lib/world/world';

export function defaultWorldMaterials(): Material[] {
  const mat = material();
  mat.color = new Color(0.8, 1.0, 0.6);
  mat.diffuse = 0.7;
  mat.specular = 0.2;

  return [material(), mat];
}

export function defaultWorld(): World {
  const w = new World();
  w.lights.push(new PointLight(point(-10, 10, -10), new Color(1, 1, 1)));

  const mats = defaultWorldMaterials();

  const s1 = new TransformableSphere();
  s1.materialDefinitions = mats;
  s1.materialIdx = 1;
  w.objects.push(s1);

  const s2 = new TransformableSphere();
  s2.materialDefinitions = mats;
  s2.materialIdx = 0;
  s2.transform = scaling(0.5, 0.5, 0.5);
  w.objects.push(s2);
  return w;
}
