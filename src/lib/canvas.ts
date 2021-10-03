import { Color } from './tuples';

export class Canvas {
    public pixels: Color[][];

    constructor(public width: number, public height: number) {
        this.pixels = new Array(width)
            .fill([0, 0, 0])
            .map(() => new Array(height).fill([0, 0, 0]));
    }

    getImageData(): ImageData {
        const arr = new Uint8ClampedArray(this.width * this.height * 4);

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const i = (y * this.width + x) * 4;
                const [r, g, b] = this.pixels[x][y];

                arr[i + 0] = Math.round(r * 255);
                arr[i + 1] = Math.round(g * 255);
                arr[i + 2] = Math.round(b * 255);
                arr[i + 3] = 255; // Alpha
            }
        }

        return new ImageData(arr, this.width);
    }
}
