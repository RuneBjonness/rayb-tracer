import { Pattern } from '../lib/material/patterns';
import { Color } from '../lib/math/color';
import { Vector4 } from '../lib/math/vector4';

export class TestPattern extends Pattern {
  protected localColorAt(p: Vector4): Color {
    return new Color(p.x, p.y, p.z);
  }

  protected copyCustomToArrayBuffer(
    _buffer: ArrayBufferLike,
    _offset: number
  ): number {
    throw new Error('Method not implemented.');
  }
}
