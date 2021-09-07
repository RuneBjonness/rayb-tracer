import { add, Color, divide, multiply, point, Tuple } from './tuples'
import { World } from './world';

export interface Light {
    intensity: Color;
    intensityAt(p: Tuple, w: World): number;
    samplePoints(): Tuple[];
}


export class PointLight implements Light {
    constructor(private position: Tuple, public intensity: Color) {
    }
    
    samplePoints(): Tuple[] {
        return [this.position];
    }

    intensityAt(p: Tuple, w: World): number {
        return w.isShadowed(p, this.samplePoints()[0]) ? 0.0 : 1.0;
    }
}

export class AreaLight implements Light {
    private uVec: Tuple; 
    private vVec: Tuple; 
    private samples: number;


    constructor(private corner: Tuple, fullUvec: Tuple, private uSteps: number, fullVvec: Tuple, private vSteps: number, public intensity: Color) {
        this.samples = uSteps * vSteps;
        this.uVec = divide(fullUvec, uSteps);
        this.vVec = divide(fullVvec, vSteps);
    }

    samplePoints(): Tuple[] {
        const pts: Tuple[] = [];
        for(let v = 0; v < this.vSteps; v++){
            for(let u = 0; u < this.uSteps; u++){
                pts.push(this.pointOnLight(u, v));
            }
        }
        return pts;
    }
    
    intensityAt(p: Tuple, w: World): number {
        let total = 0.0;
        this.samplePoints().forEach(sp => {
            if(!w.isShadowed(p, sp)) {
                total += 1.0;
            }
        })
        return total / this.samples;
    }

    private pointOnLight(u: number, v: number): Tuple {
        return add(
            this.corner, 
            add(
                multiply(this.uVec, (u + Math.random())),
                multiply(this.vVec, (v + Math.random()))));
    }
}
