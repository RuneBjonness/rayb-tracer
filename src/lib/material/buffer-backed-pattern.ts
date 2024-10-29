import { Color } from '../math/color';
import { Vector4 } from '../math/vector4';
import { PatternType } from './patterns';
import { PATTERN_BYTE_SIZE } from './patterns-buffer';
import { UvMapper } from './texture-mapping/uv-mappers';

export class BufferBackedPattern {
  readonly listLength: number;
  listIndex: number;
  float32View: Float32Array;
  int32View: Int32Array;

  constructor(private buffer: ArrayBufferLike) {
    this.listIndex = -1;
    this.listLength = buffer.byteLength / PATTERN_BYTE_SIZE;
    this.float32View = new Float32Array(this.buffer);
    this.int32View = new Int32Array(this.buffer);
  }

  get type(): PatternType {
    return this.int32View[this.listIndex * 28 + 0];
  }

  get uvMappingType(): UvMapper {
    return this.int32View[this.listIndex * 28 + 1];
  }

  get idxStart(): number {
    return this.float32View[this.listIndex * 28 + 2];
  }

  get idxEnd(): number {
    return this.float32View[this.listIndex * 28 + 3];
  }

  get color1(): Color {
    return new Color(
      this.float32View[this.listIndex * 28 + 4],
      this.float32View[this.listIndex * 28 + 5],
      this.float32View[this.listIndex * 28 + 6]
    );
  }

  get color2(): Color {
    return new Color(
      this.float32View[this.listIndex * 28 + 8],
      this.float32View[this.listIndex * 28 + 9],
      this.float32View[this.listIndex * 28 + 10]
    );
  }

  get width(): number {
    return this.float32View[this.listIndex * 28 + 7];
  }

  get height(): number {
    return this.float32View[this.listIndex * 28 + 11];
  }

  get inverseTransform(): Float32Array {
    return this.float32View.subarray(
      this.listIndex * 28 + 12,
      this.listIndex * 28 + 28
    );
  }

  colorAt(p: Vector4): Color {
    switch (this.type) {
      case PatternType.Solid:
        return this.color1;
      case PatternType.Stripe:
        return Math.floor(p.x) % 2 === 0 ? this.color1 : this.color2;
      case PatternType.Checkers3d:
        return (Math.floor(p.x) + Math.floor(p.y) + Math.floor(p.z)) % 2 === 0
          ? this.color1
          : this.color2;
      case PatternType.Gradient:
        return this.color1.add(
          this.color2.multiplyByScalar(p.x - Math.floor(p.x))
        );
      case PatternType.Ring:
        return Math.floor(Math.sqrt(p.x * p.x + p.z * p.z)) % 2 === 0
          ? this.color1
          : this.color2;

      case PatternType.RadialGradient:
        const r = Math.sqrt(p.x * p.x + p.z * p.z);
        return this.color1.add(this.color2.multiplyByScalar(r - Math.floor(r)));
      default:
        return new Color(1, 0, 1);
    }
  }
}
