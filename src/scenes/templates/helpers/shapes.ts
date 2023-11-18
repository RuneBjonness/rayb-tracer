import { Vec3, ShapeDefinition } from '../../scene-definition';
import { glass, shiny } from './materials';
import { restingOnYplane } from './transforms';

export function shinySphere(
  color: Vec3 | string,
  x: number,
  z: number,
  scale: number
): ShapeDefinition {
  return {
    primitive: { type: 'sphere' },
    transform: restingOnYplane(x, z, scale),
    material: shiny(color),
  };
}

export function glassSphere(
  color: Vec3 | string,
  x: number,
  z: number,
  scale: number
): ShapeDefinition {
  return {
    primitive: { type: 'sphere' },
    transform: restingOnYplane(x, z, scale),
    material: glass(color),
  };
}
