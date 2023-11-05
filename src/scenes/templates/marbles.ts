import { ObjectPrimitive, SceneDefinition, Vec3 } from '../scene-definition';

export function marbleScene(): SceneDefinition {
  const scene: SceneDefinition = {
    name: 'Marbles',
    camera: {
      fieldOfView: 60,
      viewTransform: {
        from: [0, 1.3, -5],
        to: [0, 0.5, 0],
        up: [0, 1, 0],
      },
      aperture: 0.04,
      focalDistance: 5,
    },
    lights: [
      {
        type: 'area',
        intensity: [1.5, 1.5, 1.5],
        transform: [
          ['translate', -5, 6, -3],
          ['scale', 2, 2, 2],
        ],
      },
    ],
    objects: [
      {
        type: 'plane',
        material: {
          color: [1, 1, 1],
          ambient: 0.025,
          diffuse: 0.67,
          specular: 0,
          reflective: 0.2,
        },
      },
      glassSphere([0.1, 0, 0.2], 0.3, 0.4, 0.7),

      basicSphere([0.5, 0, 1], -1.2, 0.2, 0.5),
      basicSphere([0.6, 0.2, 1], -2.5, 2, 0.75),
      basicSphere([0.6, 0.3, 1], 1.9, 6, 0.5),
      basicSphere([0.7, 0.3, 0.9], 1.3, -2.5, 0.8),
      basicSphere([0.8, 0.3, 0.9], -0.4, -1.5, 0.3),
      basicSphere([0.8, 0.3, 0.8], -1, 7, 0.5),
      basicSphere([0.9, 0.3, 0.8], 0.3, -1.1, 0.3),
      basicSphere([1, 0.4, 0.8], -1.4, -1.5, 0.5),
      basicSphere([1, 0.5, 0.9], -1.1, 4, 0.5),
      basicSphere([1, 0.6, 1], -3, 11, 0.5),
    ],
  };

  return scene;
}

function basicSphere(
  color: Vec3,
  x: number,
  z: number,
  scale: number
): ObjectPrimitive {
  return {
    type: 'sphere',
    transform: [
      ['translate', x, scale, z],
      ['scale', scale, scale, scale],
    ],
    material: {
      color: color,
      diffuse: 0.6,
      specular: 0,
      reflective: 0.3,
    },
  };
}

function glassSphere(
  color: Vec3,
  x: number,
  z: number,
  scale: number
): ObjectPrimitive {
  return {
    type: 'sphere',
    transform: [
      ['translate', x, scale, z],
      ['scale', scale, scale, scale],
    ],
    material: {
      color: color,
      reflective: 0.9,
      transparency: 1,
      refractiveIndex: 1.5,
    },
  };
}
