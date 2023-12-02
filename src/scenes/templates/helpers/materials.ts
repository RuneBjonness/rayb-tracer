import { MaterialDefinition } from '../../scene-definition';

export const MATERIAL_MATTE: MaterialDefinition = {
  specular: 0.1,
  shininess: 1,
};

export const MATERIAL_SHINY: MaterialDefinition = {
  diffuse: 0.6,
  reflective: 0.3,
};

export const MATERIAL_METAL: MaterialDefinition = {
  diffuse: 0,
  reflective: 1,
  shininess: 400.0,
};

export const MATERIAL_GLASS: MaterialDefinition = {
  reflective: 0.9,
  transparency: 1,
  refractiveIndex: 1.5,
};

export const MATERIAL_DIAMOND: MaterialDefinition = {
  diffuse: 0.1,
  reflective: 0.9,
  shininess: 400.0,
  transparency: 1,
  refractiveIndex: 2.5,
};
