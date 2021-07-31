import { identityMatrix, inverse, multiply } from './matrices';
import { add, color, Color, subtract, Tuple, multiply as tupleMultiply } from './tuples'
import { Shape } from './shapes';


export abstract class Pattern {
    transform: number[][];

    constructor(){
        this.transform = identityMatrix();
    }

    colorAt(shape: Shape, p: Tuple): Color {
        const objectPoint = multiply(inverse(shape.transform), p);
        const patternPoint = multiply(inverse(this.transform), objectPoint);
        return this.localColorAt(patternPoint);
    }    
    protected abstract localColorAt(p: Tuple): Color;

}

export class TestPattern extends Pattern {
    constructor(){
        super();
    }

    protected localColorAt(p: Tuple): Color {
        return color(p[0], p[1], p[2]);
    }
}

export class StripePattern extends Pattern {
    constructor(public a: Color, public b: Color){
        super();
    }

    protected localColorAt(p: Tuple): Color {
        return Math.floor(p[0]) % 2 === 0 ? this.a: this.b;
    }
}

export class GradientPattern extends Pattern {
    constructor(public a: Color, public b: Color){
        super();
    }

    protected localColorAt(p: Tuple): Color {
        const distance = subtract(this.b, this.a);
        const fraction = p[0] - Math.floor(p[0]);
        return add(this.a, tupleMultiply(distance, fraction));
    }
}

export class RingPattern extends Pattern {
    constructor(public a: Color, public b: Color){
        super();
    }

    protected localColorAt(p: Tuple): Color {
        return Math.floor(Math.sqrt(p[0]**2 + p[2]**2)) % 2 === 0 ? this.a: this.b;
    }
}

export class Checkers3dPattern extends Pattern {
    constructor(public a: Color, public b: Color){
        super();
    }

    protected localColorAt(p: Tuple): Color {

        return (Math.floor(p[0]) + Math.floor(p[1]) + Math.floor(p[2])) % 2 === 0 ? this.a: this.b;
    }
}

export class RadialGradientPattern extends Pattern {
    constructor(public a: Color, public b: Color){
        super();
    }

    protected localColorAt(p: Tuple): Color {
        const distance = subtract(this.b, this.a);
        const r = Math.sqrt(p[0]**2 + p[2]**2);
        const fraction = r - Math.floor(r);
        return add(this.a, tupleMultiply(distance, fraction));
    }
}

export class SolidPattern extends Pattern {
    constructor(public c: Color){
        super();
    }

    protected localColorAt(_p: Tuple): Color {
        return this.c;
    }
}

export class BlendedPatterns extends Pattern {
    constructor(public a: Pattern, public b: Pattern){
        super();
    }

    colorAt(shape: Shape, p: Tuple): Color {
        return add(this.a.colorAt(shape, p), this.b.colorAt(shape, p));
    }
    protected localColorAt(p: Tuple): Color {
        // Not used in overriden colorAt()
        return [0,0,0];
    }
}
