export type Tuple = [
    x: number,
    y: number,
    z: number,
    w: number
]

export type Color = [
    r: number,
    g: number,
    b: number
]

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
        return Math.abs(a - b) < 0.00001 || (Number.isNaN(a) && Number.isNaN(b));
    }

    if(t1.length !== t2.length){
        return false;
    }

    for(let i=0; i < t1.length; i++){
        if(!equal(t1[i], t2[i])){
            return false;
        }
    }
    return true;
}

export function add(t1: Tuple, t2: Tuple): Tuple;
export function add(c1: Color, c2: Color): Color;
export function add(a1: number[], a2: number[]): number[] {
    const sum = a1.map((v, i) => v + a2[i]);
    if(sum.length === 4){
        return sum as Tuple;
    }
    return sum as Color;
}

export function subtract(t1: Tuple, t2: Tuple): Tuple;
export function subtract(c1: Color, c2: Color): Color;
export function subtract(a1: number[], a2: number[]): number[] {
    const diff = a1.map((v, i) => v - a2[i]);
    if(diff.length === 4){
        return diff as Tuple;
    }
    return diff as Color;
}

export function negate(t: Tuple): Tuple {
    const [x,y,z,w] = t;
    return [-x, -y, -z, -w];
}

export function multiply(t1: Tuple, scalar: number): Tuple;
export function multiply(t1: Tuple, t2: Tuple): Tuple;
export function multiply(c1: Color, scalar: number): Color;
export function multiply(c1: Color, c2: Color): Color;
export function multiply(a1: number[], scalarOrC2: number | number[]): number[] {
    let res: number[];
    if(Array.isArray(scalarOrC2)){
        res = a1.map((v, i) => v * scalarOrC2[i]);
    } else {
        res = a1.map((v) => v * scalarOrC2);
    }
    
    if(res.length === 4){
        return res as Tuple;
    }
    return res as Color;
}

export function divide(t1: Tuple, scalar: number): Tuple;
export function divide(c1: Color, scalar: number): Color;
export function divide(a1: number[], scalar: number): number[] {
    const res = a1.map((v) => v / scalar);
    if(res.length === 4){
        return res as Tuple;
    }
    return res as Color;
}

export function magnitude(t: Tuple): number {
    const [x,y,z,w] = t;
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2 + w ** 2);
}

export function normalize(t: Tuple): Tuple {
    const m = magnitude(t);
    return t.map((v) => v / m) as Tuple;
}

export function dot(t1: Tuple, t2: Tuple): number {
    return t1
        .map((v, i) => v * t2[i])
        .reduce((a, b) => a + b, 0);
}

export function cross(t1: Tuple, t2: Tuple): Tuple {
    return [
        t1[1] * t2[2] - t1[2] * t2[1],
        t1[2] * t2[0] - t1[0] * t2[2],
        t1[0] * t2[1] - t1[1] * t2[0],
        0
    ];
}

export function reflect(vectorIn: Tuple, normal: Tuple): Tuple {
    return subtract(vectorIn, multiply(multiply(normal, 2), dot(vectorIn, normal)));
}
