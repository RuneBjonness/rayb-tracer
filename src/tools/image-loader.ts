import { Canvas } from '../lib/canvas';
import { Color } from '../lib/math/color';

export async function canvasFromImage(imageUrl: string): Promise<Canvas> {
  const img = await loadImageData(imageUrl);
  const canvas = new Canvas(img.width, img.height);

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const i = (y * canvas.width + x) * 4;
      canvas.pixels[x][y] = new Color(
        img.data[i] / 255,
        img.data[i + 1] / 255,
        img.data[i + 2] / 255
      );
    }
  }
  return canvas;
}

export async function loadImageData(url: string) {
  const bitmap = await loadImageBitmap(url);
  return getImageDataFromBitMap(bitmap);
}

export async function loadImageBitmap(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
}

export function getImageDataFromBitMap(bitmap: ImageBitmap) {
  const { width, height } = bitmap;
  const offScreen = new OffscreenCanvas(width, height);
  const ctx = offScreen.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create offscreen canvas context');
  }
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, width, height);
}
