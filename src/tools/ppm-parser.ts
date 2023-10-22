import { Canvas } from '../lib/canvas';
import { Color } from '../lib/math/color';

export function parsePPM(ppm: string): Canvas {
  const lines = ppm.split('\n');

  if (lines[0].trim() !== 'P3') {
    throw new Error('Not supported type: ' + lines[0]);
  }
  const dimensions = parseLine(lines[1]);
  const canvas = new Canvas(dimensions[0], dimensions[1]);

  const scale = parseLine(lines[2])[0];

  const data = lines.slice(3).flatMap((l) => parseLine(l));

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 3;
      canvas.pixels[x][y] = new Color(
        data[i] / scale,
        data[i + 1] / scale,
        data[i + 2] / scale
      );
    }
  }
  return canvas;
}

function parseLine(l: string): number[] {
  if (l.charAt(0) === '#') {
    return [];
  }
  const numbers = l.trim().replace(/\s\s+/g, ' ').split(' ');
  return numbers.map((n) => Number.parseInt(n));
}
