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
        default: {
            return vec3f(0.5, 0.0, 1.0);
        }
    }
}