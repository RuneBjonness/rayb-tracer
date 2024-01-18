import { Color } from '../../math/color';

export interface UvPattern {
  colorAt(u: number, v: number): Color;
}

export class CheckersUvPattern implements UvPattern {
  constructor(
    private width: number,
    private height: number,
    private c1: Color,
    private c2: Color
  ) {}

  colorAt(u: number, v: number): Color {
    const uw = Math.floor(u * this.width);
    const vh = Math.floor(v * this.height);
    return (uw + vh) % 2 === 0 ? this.c1.clone() : this.c2.clone();
  }
}

export class ImageUvPattern implements UvPattern {
  constructor(private pixels: Color[][]) {}

  colorAt(u: number, v: number): Color {
    const x = Math.round(u * (this.pixels.length - 1));
    const y = Math.round((1 - v) * (this.pixels[x].length - 1));
    return this.pixels[x][y].clone();
  }
}
