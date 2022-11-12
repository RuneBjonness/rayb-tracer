export type Tuple = [x: number, y: number, z: number, w: number];

export type Color = [r: number, g: number, b: number];

export function tuple(x: number, y: number, z: number, w: number): Tuple {
    return [x, y, z, w];
}

export function point(x: number, y: number, z: number): Tuple {
    return [x, y, z, 1];
}

export function vector(x: number, y: number, z: number): Tuple {
    return [x, y, z, 0];
}

export function color(r: number, g: number, b: number): Color {
    return [r, g, b];
}

export function isPoint(t: Tuple): boolean {
    return t[3] === 1;
}

export function isVector(t: Tuple): boolean {
    return t[3] !== 1;
}

export function areEqual(t1: Tuple | Color, t2: Tuple | Color): boolean {
    const equal = function (a: number, b: number): boolean {
        return (
            Math.abs(a - b) < 0.00001 || (Number.isNaN(a) && Number.isNaN(b))
        );
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

export function add(t1: Tuple, t2: Tuple): Tuple {
    return t1.map((v, i) => v + t2[i]) as Tuple;
}

export function addColors(c1: Color, c2: Color): Color {
    return c1.map((v, i) => v + c2[i]) as Color;
}

export function subtract(t1: Tuple, t2: Tuple): Tuple {
    return t1.map((v, i) => v - t2[i]) as Tuple;
}

export function subtractColors(c1: Color, c2: Color): Color {
    return c1.map((v, i) => v - c2[i]) as Color;
}

export function negate(t: Tuple): Tuple {
    const [x, y, z, w] = t;
    return [-x, -y, -z, -w];
}

export function multiplyTupleByScalar(t: Tuple, scalar: number): Tuple {
    return t.map((v) => v * scalar) as Tuple;
}

export function multiplyTuples(a: Tuple, b: Tuple): Tuple {
    return a.map((v, i) => v * b[i]) as Tuple;
}

export function multiplyColorByScalar(c: Color, scalar: number): Color {
    return c.map((v) => v * scalar) as Color;
}

export function multiplyColors(a: Color, b: Color): Color {
    return a.map((v, i) => v * b[i]) as Color;
}

export function divide(t: Tuple, scalar: number): Tuple{
    return t.map((v) => v / scalar) as Tuple;
}

export function divideColor(c: Color, scalar: number): Color {
    return c.map((v) => v / scalar) as Color;
}

export function magnitude(t: Tuple): number {
    const [x, y, z, w] = t;
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2 + w ** 2);
}

export function normalize(t: Tuple): Tuple {
    const m = magnitude(t);
    return t.map((v) => v / m) as Tuple;
}

export function dot(t1: Tuple, t2: Tuple): number {
    return (t1[0]*t2[0] + t1[1]*t2[1] + t1[2]*t2[2] + t1[3]*t2[3]);
}

export function cross(t1: Tuple, t2: Tuple): Tuple {
    return [
        t1[1] * t2[2] - t1[2] * t2[1],
        t1[2] * t2[0] - t1[0] * t2[2],
        t1[0] * t2[1] - t1[1] * t2[0],
        0,
    ];
}

export function reflect(vectorIn: Tuple, normal: Tuple): Tuple {
    return subtract(
        vectorIn,
        multiplyTupleByScalar(multiplyTupleByScalar(normal, 2), dot(vectorIn, normal))
    );
}
