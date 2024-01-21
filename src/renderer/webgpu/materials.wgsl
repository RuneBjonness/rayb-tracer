struct Material {
  color: vec3<f32>,
  pattern_idx: u32,
  ambient: f32,
  diffuse: f32,
  specular: f32,
  shininess: f32,
  reflective: f32,
  transparency: f32,
  refractive_index: f32,
}

struct Pattern {
  pattern_type: u32,
  uv_mapping_type: u32,
  idx_start: u32,
  idx_end: u32, 
  color1: vec3<f32>,
  width: f32,
  color2: vec3<f32>,
  height: f32,
  inv_transform: mat4x4<f32>,
}

const PATTERN_SOLID = 0u;
const PATTERN_STRIPE = 1u;
const PATTERN_CHECKERS_3D = 2u;
const PATTERN_GRADIENT = 3u;
const PATTERN_RING = 4u;
const PATTERN_RADIAL_GRADIENT = 5u;
const PATTERN_BLENDED = 6u;
const PATTERN_TEXTURE_MAP_CHECKERS = 7u;
const PATTERN_TEXTURE_MAP_IMAGE = 8u;
const PATTERN_CUBE_MAP = 9u;

const UV_MAPPING_PLANAR = 0u;
const UV_MAPPING_SPHERICAL = 1u;
const UV_MAPPING_CYLINDRICAL = 2u;
const UV_MAPPING_CUBIC_LEFT = 3u;
const UV_MAPPING_CUBIC_FRONT = 4u;
const UV_MAPPING_CUBIC_RIGHT = 5u;
const UV_MAPPING_CUBIC_BACK = 6u;
const UV_MAPPING_CUBIC_TOP = 7u;
const UV_MAPPING_CUBIC_BOTTOM = 8u;

fn material_color_at(hit: HitInfo, material_idx: u32) -> vec3f {
    let m = materials[material_idx];
    if(m.pattern_idx == 0) {
        return m.color;
    }
    let pattern = patterns[m.pattern_idx];

    if(pattern.pattern_type == PATTERN_BLENDED) {
        let c1 = pattern_color_at(hit, pattern.idx_start);
        let c2 = pattern_color_at(hit, pattern.idx_end);
        return c1 + c2;
    } else {
        return pattern_color_at(hit, m.pattern_idx);
    }
}

fn pattern_color_at(hit: HitInfo, pattern_idx: u32) -> vec3f {
    let pattern = patterns[pattern_idx];
    let pattern_point = pattern.inv_transform * vec4f(world_to_object(hit.point, hit.buffer_index).xyz, 1.0);

    switch(pattern.pattern_type) {
        case PATTERN_SOLID: {
            return pattern.color1;
        }
        case PATTERN_STRIPE: {
            let x = floor(pattern_point.x);
            if (x % 2.0 == 0) {
                return pattern.color1;
            } else {
                return pattern.color2;
            }
        }
        case PATTERN_CHECKERS_3D: {
            let x = floor(pattern_point.x);
            let y = floor(pattern_point.y);
            let z = floor(pattern_point.z);
            if ((x + y + z) % 2.0 == 0) {
                return pattern.color1;
            } else {
                return pattern.color2;
            }
        }
        case PATTERN_GRADIENT: {
            let fraction = pattern_point.x - floor(pattern_point.x);
            return pattern.color1 + (pattern.color2 * fraction);
        }
        case PATTERN_RING: {
            let x = pattern_point.x;
            let z = pattern_point.z;
            if (floor(sqrt(x*x + z*z)) % 2.0 == 0) {
                return pattern.color1;
            } else {
                return pattern.color2;
            }
        }
        case PATTERN_RADIAL_GRADIENT: {
            let x = pattern_point.x;
            let z = pattern_point.z;
            let r = sqrt(x*x + z*z);
            let fraction = r - floor(r);
            return pattern.color1 + (pattern.color2 * fraction);
        }
        case PATTERN_TEXTURE_MAP_CHECKERS: {
            let uv = uv_map(pattern_point.xyz, pattern.uv_mapping_type);
            return uv_color_at(uv.x, uv.y, pattern_idx);
        }
        // case PATTERN_TEXTURE_MAP_IMAGE: {
        // }
        case PATTERN_CUBE_MAP: {
            let abs_x = abs(pattern_point.x);
            let abs_y = abs(pattern_point.y);
            let abs_z = abs(pattern_point.z);
            let coord = max(abs_x, max(abs_y, abs_z));

            if(coord == -pattern_point.x) {
                let uv = uv_map(pattern_point.xyz, UV_MAPPING_CUBIC_LEFT);
                return uv_color_at(uv.x, uv.y, pattern_idx + 1);
            } else if(coord == pattern_point.z) {
                let uv = uv_map(pattern_point.xyz, UV_MAPPING_CUBIC_FRONT);
                return uv_color_at(uv.x, uv.y, pattern_idx + 2);
            } else if(coord == pattern_point.x) {
                let uv = uv_map(pattern_point.xyz, UV_MAPPING_CUBIC_RIGHT);
                return uv_color_at(uv.x, uv.y, pattern_idx + 3);
            } else if(coord == -pattern_point.z) {
                let uv = uv_map(pattern_point.xyz, UV_MAPPING_CUBIC_BACK);
                return uv_color_at(uv.x, uv.y, pattern_idx + 4);
            } else if(coord == pattern_point.y) {
                let uv = uv_map(pattern_point.xyz, UV_MAPPING_CUBIC_TOP);
                return uv_color_at(uv.x, uv.y, pattern.idx_start + 5);
            } else if(coord == -pattern_point.y) {
                let uv = uv_map(pattern_point.xyz, UV_MAPPING_CUBIC_BOTTOM);
                return uv_color_at(uv.x, uv.y, pattern.idx_start + 6);
            }

            return vec3f(0.0, 1.0, 0.0);
        }
        default: {
            return vec3f(0.5, 0.0, 1.0);
        }
    }
}

fn uv_color_at(u: f32, v: f32, pattern_idx: u32) -> vec3f {
    let pattern = patterns[pattern_idx];
    switch(pattern.pattern_type) {
        case PATTERN_TEXTURE_MAP_CHECKERS: {
            let uw = floor(u * pattern.width);
            let vh = floor(v * pattern.height);
            if ((uw + vh) % 2.0 == 0) {
                return pattern.color1;
            } else {
                return pattern.color2;
            }
        }
        // case PATTERN_TEXTURE_MAP_IMAGE: {
        // }
        default: {
            return vec3f(0.5, 1.0, 1.0);
        }
    }
}

fn uv_map(p: vec3f, uv_mapping_type: u32) -> vec2f {
    switch(uv_mapping_type) {
        case UV_MAPPING_PLANAR: {
            var u = p.x % 1.0;
            var v = p.z % 1.0;
            if (u < 0.0) {
                u = 1.0 + u;
            }
            if (v < 0.0) {
                v = 1.0 + v;
            }
            return vec2f(u, v);
        }
        case UV_MAPPING_SPHERICAL: {
            let theta = atan2(p.x, p.z);

            let raw_u = theta / (2.0 * PI);
            let r = sqrt(p.x*p.x + p.y*p.y + p.z*p.z);
            let phi = acos(p.y / r);
            let u = 1.0 - (raw_u + 0.5);
            let v = 1.0 - phi / PI;
            return vec2f(u, v);
        }
        case UV_MAPPING_CYLINDRICAL: {
            let theta = atan2(p.x, p.z);
            let raw_u = theta / (2.0 * PI);
            let u = 1.0 - (raw_u + 0.5);
            var v = p.y % 1.0;
            if (v < 0.0) {
                v = 1.0 + v;
            }
            return vec2f(u, v);
        }
        case UV_MAPPING_CUBIC_LEFT: {
            let u = ((p.z + 1) % 2.0) / 2.0;
            let v = ((p.y + 1) % 2.0) / 2.0;
            return vec2f(u, v);
        }
        case UV_MAPPING_CUBIC_FRONT: {
            let u = ((p.x + 1) % 2.0) / 2.0;
            let v = ((p.y + 1) % 2.0) / 2.0;
            return vec2f(u, v);
        }
        case UV_MAPPING_CUBIC_RIGHT: {
            let u = ((1 - p.z) % 2.0) / 2.0;
            let v = ((p.y + 1) % 2.0) / 2.0;
            return vec2f(u, v);
        }
        case UV_MAPPING_CUBIC_BACK: {
            let u = ((1 - p.x) % 2.0) / 2.0;
            let v = ((p.y + 1) % 2.0) / 2.0;
            return vec2f(u, v);
        }
        case UV_MAPPING_CUBIC_TOP: {
            let u = ((p.x + 1) % 2.0) / 2.0;
            let v = ((1 - p.z) % 2.0) / 2.0;
            return vec2f(u, v);
        }
        case UV_MAPPING_CUBIC_BOTTOM: {
            let u = ((p.x + 1) % 2.0) / 2.0;
            let v = ((p.z + 1) % 2.0) / 2.0;
            return vec2f(u, v);
        }
        default: {
            return vec2f(0.5, 0.5);
        }
    }
}