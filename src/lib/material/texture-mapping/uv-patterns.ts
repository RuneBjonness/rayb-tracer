import { Color } from '../../math/color';
import { PatternType } from '../patterns';

export type UvPatternType = 'checkers' | 'image';
export interface UvPattern {
  type: UvPatternType;
  colorAt(u: number, v: number): Color;
  copyCustomToArrayBuffer(buffer: ArrayBufferLike, offset: number): void;
}

export class CheckersUvPattern implements UvPattern {
  type: UvPatternType = 'checkers';

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

  copyCustomToArrayBuffer(buffer: ArrayBufferLike, offset: number): void {
    const u32view = new Uint32Array(buffer, offset, 1);
    const f32view = new Float32Array(buffer, offset, 12);
    u32view[0] = PatternType.TextureMapCheckers;

    f32view[4] = this.c1.r;
    f32view[5] = this.c1.g;
    f32view[6] = this.c1.b;
    f32view[7] = this.width;

    f32view[8] = this.c2.r;
    f32view[9] = this.c2.g;
    f32view[10] = this.c2.b;
    f32view[11] = this.height;
  }
}

export class ImageUvPattern implements UvPattern {
  type: UvPatternType = 'image';

  constructor(private pixels: Color[][]) {}

  colorAt(u: number, v: number): Color {
    const x = Math.round(u * (this.pixels.length - 1));
    const y = Math.round((1 - v) * (this.pixels[x].length - 1));
    return this.pixels[x][y].clone();
  }

  copyCustomToArrayBuffer(buffer: ArrayBufferLike, offset: number): void {
    // const u32view = new Uint32Array(buffer, offset, 12);
    // u32view[2] = this.width;
    // u32view[3] = this.height;
    throw new Error('Method not implemented.');
  }
}
