export type Color = [r: number, g: number, b: number];

export function color(r: number, g: number, b: number): Color {
  return [r, g, b];
}

export function areEqual(t1: Color, t2: Color): boolean {
  const equal = function (a: number, b: number): boolean {
    return Math.abs(a - b) < 0.00001 || (Number.isNaN(a) && Number.isNaN(b));
  };

  if (t1.length !== t2.length) {
    return false;
  }

  for (let i = 0; i < t1.length; i++) {
    if (!equal(t1[i], t2[i])) {
      return false;
    }
  }
  return true;
}

export function addColors(c1: Color, c2: Color): Color {
  return [c1[0] + c2[0], c1[1] + c2[1], c1[2] + c2[2]];
}

export function subtractColors(c1: Color, c2: Color): Color {
  return [c1[0] - c2[0], c1[1] - c2[1], c1[2] - c2[2]];
}

export function multiplyColorByScalar(c: Color, scalar: number): Color {
  return [c[0] * scalar, c[1] * scalar, c[2] * scalar];
}

export function multiplyColors(a: Color, b: Color): Color {
  return [a[0] * b[0], a[1] * b[1], a[2] * b[2]];
}

export function divideColor(c: Color, scalar: number): Color {
  return multiplyColorByScalar(c, 1 / scalar);
}

export function blendColors(c1: Color, c2: Color): Color {
  return [(c1[0] + c2[0]) * 0.5, (c1[1] + c2[1]) * 0.5, (c1[2] + c2[2]) * 0.5];
}
