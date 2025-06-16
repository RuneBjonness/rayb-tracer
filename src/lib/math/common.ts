export function equals(a: number, b: number): boolean {
  return Math.abs(a - b) < 0.00001 || (Number.isNaN(a) && Number.isNaN(b));
}
