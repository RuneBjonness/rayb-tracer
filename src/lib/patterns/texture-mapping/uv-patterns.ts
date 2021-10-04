import { Color } from '../../tuples';

export interface UvPattern {
    colorAt(u: number, v: number): Color;
}

export class CheckersUvPattern implements UvPattern {
    constructor(
        private width: number,
        private height: number,
        private c1: Color,
        private c2: Color
    ) {}

    colorAt(u: number, v: number): Color {
        const uw = Math.floor(u * this.width);
        const vh = Math.floor(v * this.height);
        return (uw + vh) % 2 === 0 ? this.c1 : this.c2;
    }
}
