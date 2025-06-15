import { point } from '../../math/vector4';
import { Ray } from '../../rays';
import { intersectsBounds } from '../bounds';
import { BVH_NODE_BYTE_SIZE } from '../object-buffers';

export class BufferBackedBvhNode {
  readonly listLength: number;
  listIndex: number;
  float32View: Float32Array;
  int32View: Int32Array;

  constructor(private buffer: ArrayBufferLike) {
    this.listIndex = 0;
    this.listLength = buffer.byteLength / BVH_NODE_BYTE_SIZE;
    this.float32View = new Float32Array(this.buffer);
    this.int32View = new Int32Array(this.buffer);
  }

  get leaf() {
    return this.int32View[this.listIndex * 12 + 0] === 1;
  }
  get childType() {
    return this.int32View[this.listIndex * 12 + 1];
  }
  get childIdxStart() {
    return this.int32View[this.listIndex * 12 + 2];
  }
  get childIdxEnd() {
    return this.int32View[this.listIndex * 12 + 3];
  }
  get boundMin() {
    return point(
      this.float32View[this.listIndex * 12 + 4],
      this.float32View[this.listIndex * 12 + 5],
      this.float32View[this.listIndex * 12 + 6]
    );
  }
  get boundMax() {
    return point(
      this.float32View[this.listIndex * 12 + 8],
      this.float32View[this.listIndex * 12 + 9],
      this.float32View[this.listIndex * 12 + 10]
    );
  }

  intersectsBounds(r: Ray): boolean {
    return intersectsBounds(r, this.boundMin, this.boundMax);
  }
}
