struct Ray {
  origin: vec3<f32>,
  direction: vec3<f32>,
}

struct HitInfo {
  distance: f32,
  point: vec3<f32>,
  shape_index: u32,
};

fn hit(ray: Ray) -> HitInfo {
  let shape_count = arrayLength(&shapes);
  var closest_hit = 1000000.0;
  var closest_shape = 0u;

  for(var i = 0u; i < shape_count; i++) {
    let inv_ray = Ray(
      (shapes[i].inv_transform * vec4<f32>(ray.origin, 1.0)).xyz,
      (shapes[i].inv_transform * vec4<f32>(ray.direction, 0.0)).xyz,
    );

    var hit = -1.0;
    switch(shapes[i].shape_type) {
      case SHAPE_SPHERE: {
        hit = sphere_local_intersects(inv_ray, shapes[i]);
      }
      case SHAPE_PLANE: {
        hit = plane_local_intersects(inv_ray, shapes[i]);
      }
      case SHAPE_CUBE: {
        hit = cube_local_intersects(inv_ray, shapes[i]);
      }
      default: {
        hit = -1.0;
      }
      
    }
    if(hit > 0 && hit < closest_hit) {
      closest_hit = hit;
      closest_shape = i;
    }
  }

  if(closest_hit < 1000000.0) {
    let hit_point = ray.origin + (ray.direction * closest_hit);
    return HitInfo(closest_hit, hit_point, closest_shape);
  }

  return HitInfo(-1.0, vec3<f32>(0.0, 0.0, 0.0), 0u);
}

fn normal_at(hit: HitInfo) -> vec3<f32> {
  let shape = shapes[hit.shape_index];
  let local_point = (shape.inv_transform * vec4<f32>(hit.point, 1.0)).xyz;
  var local_normal = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  switch(shape.shape_type) {
    case SHAPE_SPHERE: {
      local_normal = vec4<f32>(local_point, 0.0);
    }
    case SHAPE_PLANE: {
      local_normal = vec4<f32>(0.0, 1.0, 0.0, 0.0);
    }
    case SHAPE_CUBE: {
      local_normal = vec4<f32>(cube_local_normal(local_point), 0.0);
    }
    default: {
      local_normal = vec4<f32>(0.0, 0.0, 0.0, 0.0);
    }
  }
  let world_normal = (shape.inv_transform_transposed * local_normal).xyz;
  return normalize(world_normal);
}


fn sphere_local_intersects(ray: Ray, sphere: Shape) -> f32 {
  let sphere_to_ray = ray.origin.xyz;
  let a = dot(ray.direction, ray.direction);
  let b = 2.0 * dot(ray.direction, ray.origin);
  let c = dot(ray.origin, ray.origin) - 1.0;

  let discriminant = b * b - 4.0 * a * c;
  if(discriminant < 0.0) {
    return -1.0;
  }
  let t1 = (-b - sqrt(discriminant)) / (2.0 * a);
  let t2 = (-b + sqrt(discriminant)) / (2.0 * a);
  if(t1 >= 0.0 && t2 >= 0.0) {
    return min(t1, t2);
  }
  if(t1 >= 0.0) {
    return t1;
  }
  if(t2 >= 0.0) {
    return t2;
  }
  return -1.0;
}

fn plane_local_intersects(ray: Ray, plane: Shape) -> f32 {
  if(abs(ray.direction.y) < 0.0001) {
    return -1.0;
  }
  return -ray.origin.y / ray.direction.y;
}

fn cube_local_intersects(ray: Ray, plane: Shape) -> f32 {
  let x = check_axis(ray.origin.x, ray.direction.x);
  let y = check_axis(ray.origin.y, ray.direction.y);
  let z = check_axis(ray.origin.z, ray.direction.z);

  let tmin = max(max(x.x, y.x), z.x);
  let tmax = min(min(x.y, y.y), z.y);

  if(tmin > tmax) {
    return -1.0;
  }
  return tmin;
}

fn check_axis(origin: f32, direction: f32) -> vec2f {
  let tmin_numerator = -1.0 - origin;
  let tmax_numerator = 1.0 - origin;

  var tmin: f32;
  var tmax: f32;

  if(abs(direction) >= 0.0001) {
    tmin = tmin_numerator / direction;
    tmax = tmax_numerator / direction;
  } else {
    tmin = tmin_numerator * 1000000.0;
    tmax = tmax_numerator * 1000000.0;
  }

  if(tmin < tmax) {
    return vec2f(tmin, tmax);
  }
  return vec2f(tmax, tmin);
}

fn cube_local_normal(point: vec3<f32>) -> vec3<f32> {
  let abs_x = abs(point.x);
  let abs_y = abs(point.y);
  let abs_z = abs(point.z);

  if(abs_x > abs_y && abs_x > abs_z) {
    return vec3<f32>(point.x, 0.0, 0.0);
  }
  if(abs_y > abs_x && abs_y > abs_z) {
    return vec3<f32>(0.0, point.y, 0.0);
  }
  return vec3<f32>(0.0, 0.0, point.z);
}
