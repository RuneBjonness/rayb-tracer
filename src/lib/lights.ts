import { add, Color, divide, multiply, point, Tuple } from './tuples'
import { World } from './world';

export interface Light {
    position: Tuple;
    intensity: Color;
    intensityAt(p: Tuple, w: World): number;
}


export class PointLight implements Light {
    constructor(public position: Tuple, public intensity: Color){
    }
    
    intensityAt(p: Tuple, w: World): number {
        return w.isShadowed(p, this.position) ? 0.0 : 1.0;
    }
}

export class AreaLight implements Light {
    position: Tuple = point(1, 0, 0.5);
    private uVec: Tuple; 
    private vVec: Tuple; 
    private samples: number;


    constructor(private corner: Tuple, fullUvec: Tuple, private uSteps: number, fullVvec: Tuple, private vSteps: number, public intensity: Color) {
        this.samples = uSteps * vSteps;
        this.uVec = divide(fullUvec, uSteps);
        this.vVec = divide(fullVvec, vSteps);
        this.position = corner;
    }
    
    intensityAt(p: Tuple, w: World): number {
        let total = 0.0;

        for(let v = 0; v < this.vSteps; v++){
            for(let u = 0; u < this.uSteps; u++){
                if(!w.isShadowed(p, this.pointOnLight(u, v))) {
                    total += 1.0;
                }
            }
        }
        return total / this.samples;
    }

    private pointOnLight(u: number, v: number): Tuple {
        return add(
            this.corner, 
            add(
                multiply(this.uVec, (u + 0.5)),
                multiply(this.vVec, (v + 0.5))));
    }
}
