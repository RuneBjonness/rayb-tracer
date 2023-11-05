import { Camera } from '../lib/camera';
import { RenderConfiguration } from '../renderer/configuration';
import { World } from '../lib/world';
import { CameraConfiguration, SceneDefinition } from './scene-definition';
import { radians, viewTransform } from '../lib/math/transformations';
import { point, vector } from '../lib/math/vector4';
import { PointLight } from '../lib/lights';
import { Color } from '../lib/math/color';
import { Shape } from '../lib/shapes/shape';
import { Sphere } from '../lib/shapes/primitives/sphere';
import { Plane } from '../lib/shapes/primitives/plane';

export type SceneMode = 'sceneDefinition' | 'scenePreset';
export class Scene {
  protected world: World;
  private camera: Camera;

  constructor(definiton: SceneDefinition, renderCfg: RenderConfiguration) {
    this.world = this.initWorld(definiton, renderCfg);
    this.camera = this.initCamera(definiton.camera, renderCfg);
  }

  public renderTile(x: number, y: number, w: number, h: number): ImageData {
    return this.camera.renderPart(this.world, x, y, w, h).getImageData();
  }

  private initCamera(
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
    this.camera = camera;
    return camera;
  }

  private initWorld(
    def: SceneDefinition,
    renderCfg: RenderConfiguration
  ): World {
    const w = new World();

    if (def.lights) {
      def.lights.forEach((l) => {
        if (l.type === 'point') {
          const light = new PointLight(
            point(...l.position),
            new Color(...l.intensity)
          );
          w.lights.push(light);
        } else if (l.type === 'area') {
          console.error('Area lights are not supported yet.');
        }
      });
    }

    if (def.objects) {
      def.objects.forEach((o) => {
        let obj: Shape | null = null;
        if (o.type === 'sphere') {
          obj = new Sphere();
        } else if (o.type === 'plane') {
          obj = new Plane();
        } else {
          console.error('Unsupported object type: ', o.type);
        }

        if (obj) {
          if (o.material?.color) {
            obj.material.color = new Color(...o.material?.color);
          }

          w.objects.push(obj);
        }
      });
    }

    this.world = w;
    return w;
  }
}
