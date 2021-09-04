import { identityMatrix, inverse, multiply } from './matrices';
import { ray, Ray } from './rays';
import { Color, normalize, point, subtract } from './tuples'
import { World } from './world';
import { Canvas } from './canvas';

export class Camera {
    public transform: number[][];
    public pixelSize: number;

    private halfWidth: number;
    private halfHeight: number;

    constructor(public width: number, public height: number, public fieldOfView: number) {
        this.transform = identityMatrix();
        
        const halfView = Math.tan(fieldOfView / 2);
        const aspect = width / height;
        if(aspect >= 1){
            this.halfWidth = halfView;
            this.halfHeight = halfView / aspect;
        } else {
            this.halfWidth = halfView * aspect;
            this.halfHeight = halfView;
        }
        this.pixelSize = (this.halfWidth * 2) / width;
    }

    rayForPixel(x: number, y: number): Ray {
        const xOffset = (x + 0.5) * this.pixelSize;
        const yOffset = (y + 0.5) * this.pixelSize;
        const worldX = this.halfWidth - xOffset;
        const worldY = this.halfHeight - yOffset;

        const px = multiply(inverse(this.transform), point(worldX, worldY, -1));
        const origin = multiply(inverse(this.transform), point(0, 0, 0));
        const direction = normalize(subtract(px, origin));
        return ray(origin, direction);
    }

    render(w: World): Canvas {
        const c = new Canvas(this.width, this.height);

        for(let y=0; y < this.height; y++) {
            console.log(`       -redering ${y/this.height*100} %`);

            for(let x=0; x < this.width; x++){
                c.pixels[x][y] = w.colorAt(this.rayForPixel(x, y));
            }
        }
        return c;
    }
}

