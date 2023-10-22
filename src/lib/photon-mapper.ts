import {
  hit,
  prepareComputations,
  reflectance,
  refractedDirection,
} from './intersections';
import { materialColorAt } from './materials';
import { Ray } from './rays';
import { Color } from './math/color';
import { World } from './world';
import { Vector4, vector } from './math/vector4';

export type Photon = {
  position: Vector4;
  direction: Vector4;
  power: Color;
  interactedWithSpecular: boolean;
};

export type PhotonMapResult = {
  globalMap: Photon[];
  causticMap: Photon[];
};

export class PhotonMapper {
  totalLightIntensity: number;
  photonPowerFactor: number;

  constructor(
    public world: World,
    public totalPhotons: number,
    public maxBounces: number = 4
  ) {
    this.totalLightIntensity = world.lights
      .map((l) => l.intensity.r + l.intensity.b + l.intensity.g)
      .reduce((a, b) => a + b);

    this.photonPowerFactor = this.totalLightIntensity / totalPhotons;
  }

  calculatePhotonMaps(photonCount: number): PhotonMapResult {
    const result: PhotonMapResult = {
      globalMap: [],
      causticMap: [],
    };

    const photons = this.emitPhotons(photonCount);

    for (let i = 0; i < photonCount; i++) {
      this.trace(photons[i], result.globalMap, result.causticMap);
    }

    return result;
  }

  private trace(
    photon: Photon,
    globalMap: Photon[],
    causticMap: Photon[],
    bounces = 0
  ): void {
    if (bounces > this.maxBounces) {
      return;
    }

    const r = new Ray(photon.position, photon.direction);
    const xs = this.world.intersects(r);
    const i = hit(xs);

    if (i === null) {
      return;
    }
    const ic = prepareComputations(i, r, xs);

    const specularReflection = Math.max(
      i.object.material.reflective,
      i.object.material.transparancy
    );
    const diffuseReflection = Math.min(
      i.object.material.diffuse,
      1 - specularReflection
    );

    const interactionResult = Math.random();
    if (interactionResult < diffuseReflection) {
      if (bounces > 0) {
        const interaction: Photon = {
          position: ic.point,
          direction: photon.direction,
          power: photon.power,
          interactedWithSpecular: photon.interactedWithSpecular,
        };
        if (photon.interactedWithSpecular) {
          causticMap.push(interaction);
        } else {
          globalMap.push(interaction);
        }
      }

      this.trace(
        {
          position: ic.point,
          direction: vector(
            ic.normalv.x * Math.random(),
            ic.normalv.y * Math.random(),
            ic.normalv.z * Math.random()
          ),
          power: photon.power
            .clone()
            .blend(materialColorAt(ic.object, ic.point)),
          interactedWithSpecular: photon.interactedWithSpecular,
        },
        globalMap,
        causticMap,
        bounces + 1
      );
    } else if (interactionResult - diffuseReflection < specularReflection) {
      let reflect: boolean;

      if (
        ic.object.material.reflective > 0 &&
        ic.object.material.transparancy > 0
      ) {
        reflect =
          interactionResult - diffuseReflection <
          specularReflection * reflectance(ic);
      } else {
        reflect = ic.object.material.reflective > 0;
      }
      if (reflect) {
        this.trace(
          {
            position: ic.overPoint,
            direction: ic.reflectv,
            power: photon.power
              .clone()
              .blend(materialColorAt(ic.object, ic.point)),
            interactedWithSpecular: true,
          },
          globalMap,
          causticMap,
          bounces + 1
        );
      } else {
        const dir = refractedDirection(ic);
        if (dir !== null) {
          this.trace(
            {
              position: ic.underPoint,
              direction: dir,
              power: photon.power
                .clone()
                .blend(materialColorAt(ic.object, ic.point)),
              interactedWithSpecular: true,
            },
            globalMap,
            causticMap,
            bounces + 1
          );
        }
      }
    }
  }

  private emitPhotons(count: number): Photon[] {
    const photons: Photon[] = [];
    this.world.lights.forEach((l) => {
      const emitCount =
        (count * (l.intensity.r + l.intensity.g + l.intensity.b)) /
        this.totalLightIntensity;

      photons.push(...l.emitPhotons(emitCount, this.photonPowerFactor));
    });
    return photons;
  }
}
