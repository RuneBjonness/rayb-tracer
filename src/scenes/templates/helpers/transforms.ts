import { Transform } from '../../scene-definition';

export function restingOnYplane(
  x: number,
  z: number,
  scale: number
): Transform[] {
  if (scale === 1) {
    return [['translate', x, 1, z]];
  }

  return [
    ['scale', scale, scale, scale],
    ['translate', x, scale, z],
  ];
}
