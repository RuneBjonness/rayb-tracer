import { Color } from './math/color';

export class Canvas {
  public pixels: Color[];

  constructor(
    public width: number,
    public height: number
  ) {
    this.pixels = Array.from({ length: width * height });
  }

  getColor(x: number, y: number): Color {
    return this.pixels[y * this.width + x] || new Color(0, 0, 0);
  }

  setColor(x: number, y: number, color: Color): void {
    this.pixels[y * this.width + x] = color;
  }

  getImageData(): ImageData {
    const arr = new Uint8ClampedArray(this.width * this.height * 4);

    for (let i = 0; i < this.pixels.length; i++) {
      const j = i * 4;
      const c = this.pixels[i];

      arr[j + 0] = Math.round(c.r * 255);
      arr[j + 1] = Math.round(c.g * 255);
      arr[j + 2] = Math.round(c.b * 255);
      arr[j + 3] = 255; // Alpha
    }

    return new ImageData(arr, this.width);
  }
}
