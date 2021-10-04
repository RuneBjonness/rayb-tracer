import { Color, Tuple } from '../../tuples';
import { Pattern } from '../patterns';
import { UvPattern } from './uv-patterns';
import { UvMapper } from './uv-mappers';

export class TextureMap extends Pattern {
    constructor(private uvPattern: UvPattern, private uvMapper: UvMapper) {
        super();
    }

    protected localColorAt(p: Tuple): Color {
        const [u, v] = this.uvMapper.map(p);
        return this.uvPattern.colorAt(u, v);
    }
}
