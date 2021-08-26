import { Group, Triangle } from './shapes';
import { point, Tuple } from './tuples'

export class ObjParser {
    ignoredLines = 0;
    vertices: Tuple[] = [];
    model: Group = new Group();

    constructor() {
    }

    parse(data: string): void {
        data.split('\n').forEach(cmd => this.parseLine(cmd));
    }

    private parseLine(command: string): void {
        const params = command.split(' ');

        if(params.length === 4 && params[0] === ('v')) {
            this.vertices.push(point(
                Number.parseFloat(params[1]), 
                Number.parseFloat(params[2]), 
                Number.parseFloat(params[3])
            ));
        } else if(params.length === 4 && params[0] === ('f')) {
            this.model.add(new Triangle(
                this.vertices[Number.parseFloat(params[1]) - 1],
                this.vertices[Number.parseFloat(params[2]) - 1],
                this.vertices[Number.parseFloat(params[3]) - 1]));
        } else {
            this.ignoredLines++;
        }
    }
}