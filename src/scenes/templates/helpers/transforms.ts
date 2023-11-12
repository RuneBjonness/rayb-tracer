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
    ['translate', x, scale, z],
    ['scale', scale, scale, scale],
  ];
}
