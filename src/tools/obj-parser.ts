import { Material, material } from '../lib/materials';
import { Vector4, point, vector } from '../lib/math/vector4';
import { Group } from '../lib/shapes/group';
import { SmoothTriangle } from '../lib/shapes/primitives/smooth-triangle';
import { Triangle } from '../lib/shapes/primitives/triangle';

export class ObjParser {
  ignoredLines = 0;
  vertices: Vector4[] = [];
  normals: Vector4[] = [];
  groups: { [groupName: string]: Group } = {};
  model: Group = new Group();
  currentMaterial: Material = material();

  private activeGroup: Group | null = null;

  constructor() {}

  parse(data: string): Group {
    data.split('\n').forEach((cmd) => this.parseLine(cmd));
    if (this.activeGroup?.shapes.length) {
      this.model.add(this.activeGroup);
    }
    this.model.divide(4);
    return this.model;
  }

  private parseLine(command: string): void {
    const params = command.trim().replace(/\s\s+/g, ' ').split(' ');

    if (params.length === 4 && params[0] === 'v') {
      this.vertices.push(
        point(
          Number.parseFloat(params[1]),
          Number.parseFloat(params[2]),
          Number.parseFloat(params[3])
        )
      );
    } else if (params.length === 4 && params[0] === 'vn') {
      this.normals.push(
        vector(
          Number.parseFloat(params[1]),
          Number.parseFloat(params[2]),
          Number.parseFloat(params[3])
        )
      );
    } else if (params.length > 3 && params[0] === 'f') {
      const p = params
        .slice(1)
        .map((s) => s.split('/').map((n) => Number.parseInt(n)));

      for (let i = 1; i < p.length - 1; i++) {
        if (p[i].length == 1) {
          const t = new Triangle(
            this.vertices[p[0][0] - 1],
            this.vertices[p[i][0] - 1],
            this.vertices[p[i + 1][0] - 1]
          );
          t.material = this.currentMaterial;
          if (this.activeGroup) {
            this.activeGroup.add(t);
          } else {
            this.model.add(t);
          }
        } else if (p[i].length == 3) {
          const t = new SmoothTriangle(
            this.vertices[p[0][0] - 1],
            this.vertices[p[i][0] - 1],
            this.vertices[p[i + 1][0] - 1],
            this.normals[p[0][2] - 1],
            this.normals[p[i][2] - 1],
            this.normals[p[i + 1][2] - 1]
          );
          t.material = this.currentMaterial;
          if (this.activeGroup) {
            this.activeGroup.add(t);
          } else {
            this.model.add(t);
          }
        }
      }
    } else if (params.length === 2 && params[0] === 'g') {
      if (this.activeGroup?.shapes.length) {
        this.model.add(this.activeGroup);
      }
      this.groups[params[1]] = new Group();
      this.activeGroup = this.groups[params[1]];
    } else {
      this.ignoredLines++;
    }
  }
}
