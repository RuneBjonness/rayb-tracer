import { Group, Triangle } from './shapes';
import { point, Tuple } from './tuples'

export class ObjParser {
    ignoredLines = 0;
    vertices: Tuple[] = [];
    groups: { [groupName: string]: Group } = {};
    model: Group = new Group();

    private activeGroup = this.model;

    constructor() {
    }

    parse(data: string): void {
        data.split('\n').forEach(cmd => this.parseLine(cmd));
    }

    private parseLine(command: string): void {
        const params = command.replace(/\s\s+/g, ' ').split(' ');

        if(params.length === 4 && params[0] === ('v')) {
            this.vertices.push(point(
                Number.parseFloat(params[1]), 
                Number.parseFloat(params[2]), 
                Number.parseFloat(params[3])
            ));
        } else if(params.length > 3 && params[0] === ('f')) {
            for(let i = 2; i < params.length - 1; i++) {
                this.activeGroup.add(new Triangle(
                    this.vertices[Number.parseInt(params[1]) - 1],
                    this.vertices[Number.parseInt(params[i]) - 1],
                    this.vertices[Number.parseInt(params[i + 1]) - 1])
                );
            }
        } else if(params.length === 2 && params[0] === ('g')) {
            this.groups[params[1]] = new Group();
            this.activeGroup = this.groups[params[1]];
            this.model.add(this.activeGroup);
        } else {
            this.ignoredLines++;
        }
    }
}