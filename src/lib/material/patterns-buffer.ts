import { MatrixOrder } from '../math/matrices';
import { Pattern } from './patterns';

export const PATTERN_BYTE_SIZE = 112;

export function patternsArrayBufferByteLength(patterns: Pattern[]): number {
  return patterns.reduce(
    (acc, p) => acc + p.arrayBufferByteLength(),
    PATTERN_BYTE_SIZE
  );
}

export function patternsArrayBufferLength(patterns: Pattern[]): number {
  return patternsArrayBufferByteLength(patterns) / PATTERN_BYTE_SIZE;
}

export function toPatternsArrayBuffer(
  patterns: Pattern[],
  useSharedArrayBuffer: boolean,
  matrixOrder: MatrixOrder
): ArrayBufferLike {
  const size = patternsArrayBufferByteLength(patterns);
  const buffer = useSharedArrayBuffer
    ? new SharedArrayBuffer(size)
    : new ArrayBuffer(size);

  let patternsBufferOffset = PATTERN_BYTE_SIZE;

  for (let i = 0; i < patterns.length; i++) {
    patternsBufferOffset = patterns[i].copyToArrayBuffer(
      buffer,
      patternsBufferOffset,
      matrixOrder
    );
  }

  return buffer;
}
