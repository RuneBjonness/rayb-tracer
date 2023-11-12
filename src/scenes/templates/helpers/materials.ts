import { Vec3, MaterialDefinition } from '../../scene-definition';

export function matte(color: Vec3): MaterialDefinition {
  return {
    color: color,
    specular: 0.1,
    shininess: 1,
  };
}

export function shiny(color: Vec3): MaterialDefinition {
  return {
    color: color,
    diffuse: 0.6,
    reflective: 0.3,
  };
}

export function metal(color: Vec3): MaterialDefinition {
  return {
    color: color,
    diffuse: 0,
    reflective: 1,
    shininess: 400.0,
  };
}

export function glass(color: Vec3): MaterialDefinition {
  return {
    color: color,
    reflective: 0.9,
    transparency: 1,
    refractiveIndex: 1.5,
  };
}

export function diamond(color: Vec3): MaterialDefinition {
  return {
    color: color,
    diffuse: 0.1,
    reflective: 0.9,
    shininess: 400.0,
    transparency: 1,
    refractiveIndex: 2.5,
  };
}
