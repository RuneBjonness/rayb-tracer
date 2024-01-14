import { Camera } from '../lib/camera';
import { RenderConfiguration } from '../renderer/configuration';
import { World } from '../lib/world';
import {
  CameraConfiguration,
  ColorDefinition,
  CubeFacePatterns,
  LightConfiguration,
  MaterialDefinition,
  PatternDefinition,
  SceneDefinition,
  ShapeDefinition,
  ShapePrimitiveDefinition,
  Transform,
  UvMapperDefinition,
  UvPatternDefinition,
} from './scene-definition';
import { radians, viewTransform } from '../lib/math/transformations';
import { point, vector } from '../lib/math/vector4';
import { AreaLight, Light, PointLight } from '../lib/lights';
import { Color, colorFromHex } from '../lib/math/color';
import { Shape } from '../lib/shapes/shape';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Plane } from '../lib/shapes/primitives/plane';
import { Matrix4 } from '../lib/math/matrices';
import {
  BlendedPatterns,
  Checkers3dPattern,
  GradientPattern,
  Pattern,
  RadialGradientPattern,
  RingPattern,
  SolidPattern,
  StripePattern,
} from '../lib/material/patterns';
import { Material, material } from '../lib/material/materials';
import { Cube } from '../lib/shapes/primitives/cube';
import { Cylinder } from '../lib/shapes/primitives/cylinder';
import { Cone } from '../lib/shapes/primitives/cone';
import { Group } from '../lib/shapes/group';
import { CsgShape } from '../lib/shapes/csg-shape';
import {
  CheckersUvPattern,
  UvPattern,
} from '../lib/material/texture-mapping/uv-patterns';
import { UvMapper } from '../lib/material/texture-mapping/uv-mappers';
import {
  CubeMap,
  TextureMap,
} from '../lib/material/texture-mapping/texture-map';

export type SceneMode = 'sceneDefinition' | 'scenePreset';
export class Scene {
  world: World = new World();
  camera: Camera = new Camera(0, 0, 0);
  materials: Material[] = [];
  patterns: Pattern[] = [];

  constructor(
    private definiton: SceneDefinition,
    renderCfg: RenderConfiguration
  ) {
    this.camera = this.createCamera(definiton.camera, renderCfg);
    this.init(renderCfg);
  }

  public renderTile(x: number, y: number, w: number, h: number): ImageData {
    return this.camera.renderPart(this.world, x, y, w, h).getImageData();
  }

  private createCamera(
    cameraCfg: CameraConfiguration,
    renderCfg: RenderConfiguration
  ): Camera {
    const camera = new Camera(
      renderCfg.width,
      renderCfg.height,
      radians(cameraCfg.fieldOfView)
    );
    camera.aperture = renderCfg.forceZeroAperture ? 0 : cameraCfg.aperture;
    camera.focalDistance = cameraCfg.focalDistance;
    camera.maxFocalSamples = renderCfg.maxFocalSamples;
    camera.adaptiveSamplingColorSensitivity =
      renderCfg.adaptiveFocalSamplingSensitivity;
    camera.transform = viewTransform(
      point(...cameraCfg.viewTransform.from),
      point(...cameraCfg.viewTransform.to),
      vector(...cameraCfg.viewTransform.up)
    );
    camera.maxDepth = renderCfg.maxDepth;
    camera.maxIndirectLightSamples = renderCfg.maxIndirectLightSamples;
    return camera;
  }

  private init(renderCfg: RenderConfiguration): void {
    if (this.definiton.materials) {
      const keys = Object.keys(this.definiton.materials) as Array<string>;
      this.materials = keys.map((k) => this.createMaterial(k));
    }

    const w = new World();
    if (this.definiton.world.lights) {
      const [lights, objects] = this.createLights(
        this.definiton.world.lights,
        renderCfg
      );
      w.lights.push(...lights);
      w.objects.push(...objects);
    }

    if (this.definiton.world.objects) {
      w.objects.push(
        ...this.definiton.world.objects.map((x) => this.createShape(x))
      );
    }

    this.world = w;
  }

  private createLights(
    lightCfgs: LightConfiguration[],
    renderCfg: RenderConfiguration
  ): [Light[], Shape[]] {
    const lights: Light[] = [];
    const objects: Shape[] = [];
    let shapeIdx = 1;

    lightCfgs.forEach((l) => {
      if (l.type === 'point') {
        const light = new PointLight(
          point(...l.position),
          this.createColor(l.intensity)
        );

        lights.push(light);
      } else if (l.type === 'area') {
        const light = new AreaLight(
          this.createColor(l.intensity),
          renderCfg.maxLightSamples,
          renderCfg.adaptiveLightSamplingSensitivity,
          this.materials
        );
        light.transform = this.createTransformMatrix(l.transform);

        if (l.includeGeometry) {
          light.shapeIdx = shapeIdx;
          objects.push(light);

          shapeIdx++;
        }
        lights.push(light);
      }
    });

    return [lights, objects];
  }

  private createShapePrimitive(
    primitive: ShapePrimitiveDefinition | string
  ): Shape {
    if (typeof primitive === 'string') {
      if (!this.definiton.shapes) {
        throw new Error('No shapes defined');
      }
      return this.createShapePrimitive(this.definiton.shapes[primitive]);
    }

    switch (primitive.type) {
      case 'sphere':
        return new Sphere();
      case 'plane':
        return new Plane();
      case 'cube':
        return new Cube();
      case 'cylinder':
        return new Cylinder(
          primitive.minimum,
          primitive.maximum,
          primitive.closed
        );
      case 'cone':
        return new Cone(primitive.minimum, primitive.maximum, primitive.closed);
      case 'triangle':
        throw new Error('Triangle not supported');
      case 'smooth-triangle':
        throw new Error('Smooth triangle not supported');
      case 'group':
        const group = new Group();
        primitive.shapes.forEach((c) => group.add(this.createShape(c)));
        return group;
      case 'csg':
        return new CsgShape(
          primitive.operation,
          this.createShape(primitive.left),
          this.createShape(primitive.right)
        );
    }
  }

  private createShape(s: ShapeDefinition): Shape {
    const obj = this.createShapePrimitive(s.primitive);
    if (s.material) {
      const m = this.createMaterial(s.material);
      let idx = this.materials.indexOf(m);
      if (idx < 0) {
        idx = this.materials.push(m) - 1;
      }
      this.setMaterial(idx, obj);
    }
    if (s.transform && obj.isTransformable()) {
      obj.transform = this.createTransformMatrix(s.transform);
    }
    return obj;
  }

  private setMaterial(materialIdx: number, shape: Shape): void {
    if (shape instanceof Group) {
      shape.shapes.forEach((x) => this.setMaterial(materialIdx, x));
    } else if (shape instanceof CsgShape) {
      this.setMaterial(materialIdx, shape.left);
      this.setMaterial(materialIdx, shape.right);
    } else {
      shape.patternDefinitions = this.patterns;
      shape.materialDefinitions = this.materials;
      shape.materialIdx = materialIdx;
    }
  }

  private createTransformMatrix(transformations: Transform[]): Matrix4 {
    const m = new Matrix4();
    for (let t of transformations) {
      if (t[0] === 'translate') {
        m.translate(t[1], t[2], t[3]);
      } else if (t[0] === 'scale') {
        m.scale(t[1], t[2], t[3]);
      } else if (t[0] === 'rotateX') {
        m.rotateX(radians(t[1]));
      } else if (t[0] === 'rotateY') {
        m.rotateY(radians(t[1]));
      } else if (t[0] === 'rotateZ') {
        m.rotateZ(radians(t[1]));
      } else if (t[0] === 'shear') {
        m.shear(t[1], t[2], t[3], t[4], t[5], t[6]);
      }
    }
    return m;
  }

  private createMaterial(
    m?: MaterialDefinition | string | [string, ColorDefinition | string]
  ): Material {
    let mat = material();
    mat.ambient = this.definiton.world?.ambientLight ?? mat.ambient;

    if (!m) {
      return mat;
    }
    if (typeof m === 'string') {
      if (!this.definiton.materials) {
        return mat;
      }
      return this.createMaterial(this.definiton.materials[m]);
    }
    if (Array.isArray(m)) {
      if (!this.definiton.materials) {
        return mat;
      }
      const [name, color] = m;
      mat = this.createMaterial(this.definiton.materials[name]);
      mat.color = this.createColor(color) ?? mat.color;
      return mat;
    }

    const pattern = this.createPattern(m.pattern);
    if (pattern) {
      mat.patternIdx = this.patterns.indexOf(pattern);
      if (mat.patternIdx < 0) {
        mat.patternIdx = this.patterns.push(pattern) - 1;
      }
    }

    mat.color = this.createColor(m.color) ?? mat.color;
    mat.ambient = m.ambient ?? mat.ambient;
    mat.diffuse = m.diffuse ?? mat.diffuse;
    mat.specular = m.specular ?? mat.specular;
    mat.shininess = m.shininess ?? mat.shininess;
    mat.reflective = m.reflective ?? mat.reflective;
    mat.transparency = m.transparency ?? mat.transparency;
    mat.refractiveIndex = m.refractiveIndex ?? mat.refractiveIndex;
    return mat;
  }

  private createPattern(p?: PatternDefinition | string): Pattern | null {
    if (!p) {
      return null;
    }
    if (typeof p === 'string') {
      if (!this.definiton.patterns) {
        return null;
      }
      return this.createPattern(this.definiton.patterns[p]);
    }

    let pattern: Pattern | null;
    switch (p.type) {
      case 'solid':
        pattern = new SolidPattern(this.createColor(p.color1));
        break;
      case 'stripe':
        pattern = new StripePattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'gradient':
        pattern = new GradientPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'ring':
        pattern = new RingPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'radial-gradient':
        pattern = new RadialGradientPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'checkers':
        pattern = new Checkers3dPattern(
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
        break;
      case 'blended':
        const p1 = this.createPattern(p.pattern1);
        const p2 = this.createPattern(p.pattern2);
        if (p1 && p2) {
          pattern = new BlendedPatterns(p1, p2);
        } else {
          pattern = null;
        }
        break;
      case 'texture-map':
        pattern = new TextureMap(
          this.createUvPattern(p.uvPattern),
          this.createUvMapper(p.mapper)
        );
        break;
      case 'cube-map':
        if (this.isUvPatternDefinition(p.uvPattern)) {
          const uvPattern = this.createUvPattern(p.uvPattern);
          pattern = new CubeMap([
            uvPattern,
            uvPattern,
            uvPattern,
            uvPattern,
            uvPattern,
            uvPattern,
          ]);
        } else {
          pattern = new CubeMap([
            this.createUvPattern(p.uvPattern.left),
            this.createUvPattern(p.uvPattern.front),
            this.createUvPattern(p.uvPattern.right),
            this.createUvPattern(p.uvPattern.back),
            this.createUvPattern(p.uvPattern.top),
            this.createUvPattern(p.uvPattern.bottom),
          ]);
        }
        break;
      default:
        pattern = null;
    }

    if (pattern && p.transform) {
      pattern.transform = this.createTransformMatrix(p.transform);
    }
    return pattern;
  }

  private createUvPattern(p: UvPatternDefinition): UvPattern {
    switch (p.type) {
      case 'uv-checkers':
        return new CheckersUvPattern(
          p.width,
          p.height,
          this.createColor(p.color1),
          this.createColor(p.color2)
        );
    }
  }

  private createUvMapper(m: UvMapperDefinition): UvMapper {
    switch (m) {
      case 'planar':
        return UvMapper.Planar;
      case 'cylindrical':
        return UvMapper.Cylindrical;
      case 'spherical':
        return UvMapper.Spherical;
      case 'cube-front':
        return UvMapper.CubeFront;
      case 'cube-back':
        return UvMapper.CubeBack;
      case 'cube-left':
        return UvMapper.CubeLeft;
      case 'cube-right':
        return UvMapper.CubeRight;
      case 'cube-top':
        return UvMapper.CubeTop;
      case 'cube-bottom':
        return UvMapper.CubeBottom;
    }
  }

  private createColor(def?: ColorDefinition | string): Color {
    if (!def) {
      return new Color(1, 1, 1);
    }
    if (typeof def === 'string') {
      if (def.startsWith('#')) {
        try {
          return colorFromHex(def);
        } catch (e) {
          console.error(e);
          return new Color(1, 1, 1);
        }
      }
      if (!this.definiton.colors) {
        return new Color(1, 1, 1);
      }
      return this.createColor(this.definiton.colors[def]);
    }

    return new Color(...def);
  }

  private isUvPatternDefinition(
    cubePattern: UvPatternDefinition | CubeFacePatterns
  ): cubePattern is UvPatternDefinition {
    return (<UvPatternDefinition>cubePattern).type !== undefined;
  }
}
