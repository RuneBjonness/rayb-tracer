import { addColors, Color, Tuple } from './tuples';
import { World } from './world';

export type Photon = {
  position: Tuple;
  direction: Tuple;
  power: Color;
  interactedWithSpecular: boolean;
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
      .map((l) => l.intensity)
      .reduce((a, b) => addColors(a, b))
      .reduce((a, b) => a + b);

    this.photonPowerFactor = this.totalLightIntensity / totalPhotons;
  }

  trace(count: number): Photon[] {
    const photons: Photon[] = [];
    this.world.lights.forEach((l) => {
      const emitCount =
        (count * (l.intensity[0] + l.intensity[1] + l.intensity[2])) /
        this.totalLightIntensity;

      photons.push(...l.emitPhotons(emitCount, this.photonPowerFactor));
    });
    return photons;
  }
}
