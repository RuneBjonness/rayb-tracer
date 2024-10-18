import { Light } from './lights';

export const LIGHTS_BYTE_SIZE = 32;

export function toLightsArrayBuffer(
  lights: Light[],
  useSharedArrayBuffer: boolean
): ArrayBufferLike {
  if (lights.length > 5) {
    console.warn(
      'Max 5 artificial light scources allowed in the scene. Ignoring the rest.'
    );
  }
  const buffer = useSharedArrayBuffer
    ? new SharedArrayBuffer(5 * LIGHTS_BYTE_SIZE)
    : new ArrayBuffer(5 * LIGHTS_BYTE_SIZE);

  for (let i = 0; i < lights.length && i < 5; i++) {
    lights[i].copyLightToArrayBuffer(buffer, i * LIGHTS_BYTE_SIZE);
  }

  return buffer;
}
