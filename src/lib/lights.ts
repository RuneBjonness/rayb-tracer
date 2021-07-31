import { Color, Tuple } from './tuples'

export type Light = {
    position: Tuple,
    intensity: Color
}

export function pointLight(position: Tuple, intensity: Color): Light {
    return { position, intensity};
}
