import { identityMatrix, inverse, multiply } from './matrices';
import { ray, Ray } from './rays';
import { normalize, point, subtract, Tuple } from './tuples'
import { World } from './world';
import { Canvas } from './canvas';

export class Camera {
    private _transform: number[][] = [];
    public get transform() { 
        return this._transform; 
    }
    public set transform(m: number[][]) { 
        this._transform = m;
        this.invTransform = inverse(m);
        this.origin = multiply(this.invTransform, point(0, 0, 0));
    }

    public pixelSize: number;

    private halfWidth: number;
    private halfHeight: number;
    private invTransform: number[][] = [];
    private origin: Tuple = point(0, 0, 0);

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

        const px = multiply(this.invTransform, point(worldX, worldY, -1));
        const direction = normalize(subtract(px, this.origin));
        return ray(this.origin, direction);
    }

    render(w: World): Canvas {
        return this.renderPart(w, 0, 0, this.width, this.height);
    }

    renderPart(w: World, startX: number, startY: number, lengthX: number, lengthY: number): Canvas {
        const c = new Canvas(lengthX, lengthY);
        for(let y = 0; y < lengthY; y++) {
            for(let x = 0; x < lengthX; x++){
                c.pixels[x][y] = w.colorAt(this.rayForPixel(startX + x, startY + y));
            }
        }
        return c;
    }    
}
