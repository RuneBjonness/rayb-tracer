import { point, Vector4 } from '../../math/vector4';
import { Ray } from '../../rays';
import { intersectsBounds } from '../bounds';
import { BVH_NODE_BYTE_SIZE } from '../object-buffers';

export class BufferBackedBvhNode {
  leaf: boolean;
  childType: number;
  childIdxStart: number;
  childIdxEnd: number;

  boundMin: Vector4;
  boundMax: Vector4;

  readonly listLength: number;
  private _listIndex: number;

  constructor(private buffer: ArrayBufferLike) {
    this._listIndex = 0;
    this.listLength = buffer.byteLength / BVH_NODE_BYTE_SIZE;

    this.leaf = false;
    this.childType = 0;
    this.childIdxStart = 0;
    this.childIdxEnd = 0;

    this.boundMin = point(0, 0, 0);
    this.boundMax = point(0, 0, 0);
  }

  get listIndex() {
    return this._listIndex;
  }

  set listIndex(index: number) {
    if (index === this._listIndex) {
      return;
    }

    this._listIndex = index;
    const float32View = new Float32Array(
      this.buffer,
      index * BVH_NODE_BYTE_SIZE,
      BVH_NODE_BYTE_SIZE / 4
    );
    const int32View = new Int32Array(
      this.buffer,
      index * BVH_NODE_BYTE_SIZE,
      BVH_NODE_BYTE_SIZE / 4
    );

    this.leaf = int32View[0] === 1;
    this.childType = int32View[1];
    this.childIdxStart = int32View[2];
    this.childIdxEnd = int32View[3];

    this.boundMin.x = float32View[4];
    this.boundMin.y = float32View[5];
    this.boundMin.z = float32View[6];

    this.boundMax.x = float32View[8];
    this.boundMax.y = float32View[9];
    this.boundMax.z = float32View[10];
  }

  intersectsBounds(r: Ray): boolean {
    return intersectsBounds(r, this.boundMin, this.boundMax);
  }
}
