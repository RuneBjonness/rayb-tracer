struct Ray {
  origin: vec3<f32>,
  direction: vec3<f32>,
}

struct HitInfo {
  distance: f32,
  point: vec3<f32>,
  u: f32,
  v: f32,
  buffer_type: u32,
  buffer_index: u32,
};

fn hit(ray: Ray) -> HitInfo {
  var closest_hit: HitInfo = HitInfo(1000000.0, vec3<f32>(0.0, 0.0, 0.0), 0.0, 0.0, 0u, 0u);
  let shape_count = arrayLength(&shapes);
  var i = 1u;
  var parent_idx = 0u;
  var parent_space_ray = ray;

  let bvh_node_count = arrayLength(&bvh);
  var n = 0u;
  var last_bvh_approved_shape_idx = 0u;

  while(i < shape_count) {
    if(parent_idx > 0) {
      var last_child_idx = shapes[parent_idx].child_idx_end;

      if(shapes[parent_idx].shape_type == SHAPE_GROUP_BVH) {
        last_child_idx = bvh[shapes[parent_idx].child_idx_end].child_idx_end;
      }

      if(i > last_child_idx) {
        parent_space_ray = Ray(
          (shapes[parent_idx].transform * vec4<f32>(parent_space_ray.origin, 1.0)).xyz,
          (shapes[parent_idx].transform * vec4<f32>(parent_space_ray.direction, 0.0)).xyz,
        );
        parent_idx = shapes[parent_idx].parent_idx;
      }
    }

    let inv_ray = Ray(
      (shapes[i].inv_transform * vec4<f32>(parent_space_ray.origin, 1.0)).xyz,
      (shapes[i].inv_transform * vec4<f32>(parent_space_ray.direction, 0.0)).xyz,
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
      case SHAPE_CYLINDER: {
        hit = cylinder_local_intersects(inv_ray, shapes[i]);
      }
      case SHAPE_CONE: {
        hit = cone_local_intersects(inv_ray, shapes[i]);
      }
      case SHAPE_CSG: {
        if(bounds_intersects(inv_ray, shapes[i].bound_min, shapes[i].bound_max) == true) {
          parent_idx = i;
          parent_space_ray = inv_ray;
        } else {
          i = shapes[i].child_idx_end;
        }
      }
      case SHAPE_GROUP: {
        if(bounds_intersects(inv_ray, shapes[i].bound_min, shapes[i].bound_max) == true) {
          parent_idx = i;
          parent_space_ray = inv_ray;
        } else {
          i = shapes[i].child_idx_end;
        }
      }
      case SHAPE_GROUP_BVH: {
        if(bounds_intersects(inv_ray, shapes[i].bound_min, shapes[i].bound_max) == true) {
          parent_idx = i;
          parent_space_ray = inv_ray;
          n = shapes[i].child_idx_start + 1u;
        } else if(bvh[shapes[i].child_idx_end].child_type == OBJECT_BUFFER_TYPE_SHAPE) {
          i = bvh[shapes[i].child_idx_end].child_idx_end;
        }
      }
      default: {
        hit = -1.0;
      }
    }
    if(hit > 0 && hit < closest_hit.distance) {
      closest_hit.distance = hit;
      closest_hit.buffer_index = i;
      closest_hit.buffer_type = OBJECT_BUFFER_TYPE_SHAPE;
    }

    i++;

    while(n > 0 && n < bvh_node_count && i > last_bvh_approved_shape_idx) {
      if(bounds_intersects(parent_space_ray, bvh[n].bound_min, bvh[n].bound_max) == true) {
        if(bvh[n].leaf == 1u) {
          if(bvh[n].child_type == OBJECT_BUFFER_TYPE_PRIMITIVE) {
            let hit = hit_primitive(parent_space_ray, bvh[n].child_idx_start, bvh[n].child_idx_end, closest_hit.distance);
            if(hit.distance < closest_hit.distance) {
              closest_hit = hit;
            }
          } else if(bvh[n].child_type == OBJECT_BUFFER_TYPE_TRIANGLE) {
            let hit = hit_triangle(parent_space_ray, bvh[n].child_idx_start, bvh[n].child_idx_end, closest_hit.distance);
            if(hit.distance < closest_hit.distance) {
              closest_hit = hit;
            }
          } else if(bvh[n].child_type == OBJECT_BUFFER_TYPE_SHAPE) {
            i = bvh[n].child_idx_start;
            last_bvh_approved_shape_idx = bvh[n].child_idx_end;
          }
        }
        n++;
      } else {
        if(bvh[n].leaf == 1u) {
          if(bvh[n].child_type == OBJECT_BUFFER_TYPE_SHAPE) {
            i = bvh[n].child_idx_end + 1u;
          }
          n++;
        } else {
          if(bvh[bvh[n].child_idx_end].child_type == OBJECT_BUFFER_TYPE_SHAPE) {
            i = bvh[bvh[n].child_idx_end].child_idx_end + 1u;
          }
          n = bvh[n].child_idx_end + 1u;
        }
      }
    }
  }

  let primitives_count = arrayLength(&primitives);
  if(primitives_count > 1 && primitives[1].parent_idx == 0) {
    let hit_primitive_orphan = hit_primitive(parent_space_ray, 1, primitives_count, closest_hit.distance);
    if(hit_primitive_orphan.distance < closest_hit.distance) {
      closest_hit = hit_primitive_orphan;
    }
  }


  if(closest_hit.distance < 1000000.0) {
    closest_hit.point = ray.origin + (ray.direction * closest_hit.distance);
    return closest_hit;
  }

  return HitInfo(-1.0, vec3<f32>(0.0, 0.0, 0.0), 0.0, 0.0, 0u, 0u);
}

fn hit_primitive(ray: Ray, start: u32, end: u32, closest_hit: f32) -> HitInfo {
  var hit: HitInfo = HitInfo(closest_hit, vec3<f32>(0.0, 0.0, 0.0), 0.0, 0.0, 0u, 0u);
  for(var i = start; i <= end; i++) {
    let prim = primitives[i];

    let l = prim.center - ray.origin;
    let tca = dot(l, ray.direction);
    if(tca < 0.0) {
      continue;
    }
    let d2 = dot(l, l) - tca * tca;
    if(d2 > prim.radius_squared) {
      continue;
    }
    let thc = sqrt(prim.radius_squared - d2);
    let t0 = tca - thc;
    let t1 = tca + thc;

    if(t0 > 0 && t0 < hit.distance) {
      hit.distance = t0;
      hit.buffer_index = i;
      hit.buffer_type = OBJECT_BUFFER_TYPE_PRIMITIVE;
    } else if(t1 > 0 && t1 < hit.distance) {
      hit.distance = t1;
      hit.buffer_index = i;
      hit.buffer_type = OBJECT_BUFFER_TYPE_PRIMITIVE;
    }
  }
  return hit;
}

fn hit_triangle(ray: Ray, start: u32, end: u32, closest_hit: f32) -> HitInfo {
  var hit: HitInfo = HitInfo(closest_hit, vec3<f32>(0.0, 0.0, 0.0), 0.0, 0.0, 0u, 0u);
  for(var i = start; i <= end; i++) {
    let t = triangles[i];
    let dirCrossE2 = cross(ray.direction, t.e2);
    let det = dot(t.e1, dirCrossE2);
    if(abs(det) < EPSILON) {
      continue;
    }
    let f = 1.0 / det;
    let p1ToOrigin = ray.origin - t.p1;
    let u = f * dot(p1ToOrigin, dirCrossE2);
    
    if(u < 0.0 || u > 1.0) {
      continue;
    }
    let originCrossE1 = cross(p1ToOrigin, t.e1);
    let v = f * dot(ray.direction, originCrossE1);

    if(v < 0.0 || u + v > 1.0) {
      continue;
    }
    let dist = f * dot(t.e2, originCrossE1);

    if(dist > 0 && dist < hit.distance) {
      hit.distance = dist;
      hit.u = u;
      hit.v = v;
      hit.buffer_index = i;
      hit.buffer_type = OBJECT_BUFFER_TYPE_TRIANGLE;
    }
  }
  return hit;
}

fn world_to_object(point: vec3<f32>, shape_idx: u32) -> vec3<f32> {
  var i = shape_idx;
  var m = shapes[i].inv_transform;
  while(shapes[i].parent_idx > 0) {
    i = shapes[i].parent_idx;
    m = m * shapes[i].inv_transform;
  }
  return (m * vec4<f32>(point, 1.0)).xyz;
}

fn normal_at(hit: HitInfo) -> vec3<f32> {
  var local_normal = vec3<f32>(0.0, 0.0, 0.0);
  var idx = hit.buffer_index;

  if(hit.buffer_type == OBJECT_BUFFER_TYPE_PRIMITIVE) {
    let prim = primitives[hit.buffer_index];
    local_normal = normalize(hit.point - prim.center);
    idx = prim.parent_idx;
  } else if(hit.buffer_type == OBJECT_BUFFER_TYPE_TRIANGLE) {
    let t = triangles[hit.buffer_index];
    if(t.shape_type == SHAPE_TRIANGLE) {
      local_normal = t.n1;
    } else {
      local_normal = normalize(t.n1 + (t.n2 - t.n1) * hit.u + (t.n3 - t.n1) * hit.v);
    }
    idx = t.parent_idx;
  } else {
    let shape = shapes[idx];

    let local_point = world_to_object(hit.point, idx);

    switch(shape.shape_type) {
      case SHAPE_SPHERE: {
        local_normal = vec3<f32>(local_point);
      }
      case SHAPE_PLANE: {
        local_normal = vec3<f32>(0.0, 1.0, 0.0);
      }
      case SHAPE_CUBE: {
        local_normal = vec3<f32>(cube_local_normal(local_point));
      }
      case SHAPE_CYLINDER: {
        local_normal = vec3<f32>(cylinder_local_normal(local_point, shape.min, shape.max));
      }
      case SHAPE_CONE: {
        local_normal = vec3<f32>(cone_local_normal(local_point, shape.min, shape.max));
      }
      default: {
        local_normal = vec3<f32>(0.0, 0.0, 0.0);
      }
    }
    idx = hit.buffer_index;
  }

  while(idx > 0) {
    local_normal = normalize((shapes[idx].inv_transform_transposed * vec4<f32>(local_normal, 0.0)).xyz);
    idx = shapes[idx].parent_idx;
  }

  return local_normal;
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
  if(abs(ray.direction.y) < EPSILON) {
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

  if(abs(direction) >= EPSILON) {
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

fn cylinder_local_intersects(ray: Ray, cylinder: Shape) -> f32 {
  let a = ray.direction.x * ray.direction.x + ray.direction.z * ray.direction.z;
  var closest_hit = 1000000.0;
  if(abs(a) > EPSILON) {
    let b = 2.0 * ray.origin.x * ray.direction.x + 2.0 * ray.origin.z * ray.direction.z;
    let c = ray.origin.x * ray.origin.x + ray.origin.z * ray.origin.z - 1.0;

    let discriminant = b * b - 4.0 * a * c;
    
    if(discriminant >= 0.0) {
      let hit0 = hit_cone_or_cylinder_walls(ray, (-b - sqrt(discriminant)) / (2.0 * a), cylinder.min, cylinder.max);
      let hit1 = hit_cone_or_cylinder_walls(ray, (-b + sqrt(discriminant)) / (2.0 * a), cylinder.min, cylinder.max);
      if(hit0 > 0.0 && hit0 < closest_hit) {
        closest_hit = hit0;
      }
      if(hit1 > 0.0 && hit1 < closest_hit) {
        closest_hit = hit1;
      }
    }

    if(cylinder.closed == 1 && abs(ray.direction.y) > EPSILON) {
      let hit0 = hit_cylinder_caps(ray, (cylinder.min - ray.origin.y) / ray.direction.y);
      let hit1 = hit_cylinder_caps(ray, (cylinder.max - ray.origin.y) / ray.direction.y);
      if(hit0 > 0.0 && hit0 < closest_hit) {
        closest_hit = hit0;
      }
      if(hit1 > 0.0 && hit1 < closest_hit) {
        closest_hit = hit1;
      }
    }
    if(closest_hit < 1000000.0) {
      return closest_hit;
    }
  }
  return -1.0;
}

fn cone_local_intersects(ray: Ray, cylinder: Shape) -> f32 {
  let a = ray.direction.x * ray.direction.x - ray.direction.y * ray.direction.y + ray.direction.z * ray.direction.z;
  let b = 2.0 * ray.origin.x * ray.direction.x - 2.0 * ray.origin.y * ray.direction.y + 2.0 * ray.origin.z * ray.direction.z;
  let c = ray.origin.x * ray.origin.x - ray.origin.y * ray.origin.y + ray.origin.z * ray.origin.z;

  var closest_hit = 1000000.0;

  if(abs(a) > EPSILON) {
    let discriminant = b * b - 4.0 * a * c;
    
    if(discriminant >= 0.0) {
      let hit0 = hit_cone_or_cylinder_walls(ray, (-b - sqrt(discriminant)) / (2.0 * a), cylinder.min, cylinder.max);
      let hit1 = hit_cone_or_cylinder_walls(ray, (-b + sqrt(discriminant)) / (2.0 * a), cylinder.min, cylinder.max);
      if(hit0 > 0.0 && hit0 < closest_hit) {
        closest_hit = hit0;
      }
      if(hit1 > 0.0 && hit1 < closest_hit) {
        closest_hit = hit1;
      }
    }
  } else if(abs(b) > EPSILON) {
    let hit0 = hit_cone_or_cylinder_walls(ray, -c / (2.0 * b), cylinder.min, cylinder.max);
    if(hit0 > 0.0 && hit0 < closest_hit) {
      closest_hit = hit0;
    }
  }

  if(cylinder.closed == 1 && abs(ray.direction.y) > EPSILON) {
    let hit0 = hit_cone_caps(ray, cylinder.min);
    let hit1 = hit_cone_caps(ray, cylinder.max);
    if(hit0 > 0.0 && hit0 < closest_hit) {
      closest_hit = hit0;
    }
    if(hit1 > 0.0 && hit1 < closest_hit) {
      closest_hit = hit1;
    }
  }
  if(closest_hit < 1000000.0) {
    return closest_hit;
  }
  return -1.0;
}

fn hit_cone_or_cylinder_walls(ray: Ray, t: f32, min: f32, max: f32) -> f32 {
  let y = ray.origin.y + t * ray.direction.y;
  if(y > min && y < max) {
    return t;
  }
  return -1.0;
}

fn hit_cylinder_caps(ray: Ray, t: f32) -> f32 {
  let x = ray.origin.x + t * ray.direction.x;
  let z = ray.origin.z + t * ray.direction.z;
  if(x * x + z * z <= 1.0) {
    return t;
  }
  return -1.0;
}

fn cylinder_local_normal(point: vec3<f32>, min: f32, max: f32) -> vec3<f32> {
  let dist = point.x * point.x + point.z * point.z;
  if(dist < 1.0 && point.y >= max - EPSILON) {
    return vec3<f32>(0.0, 1.0, 0.0);
  }
  if(dist < 1.0 && point.y <= min + EPSILON) {
    return vec3<f32>(0.0, -1.0, 0.0);
  }
  return vec3<f32>(point.x, 0.0, point.z);
}

fn hit_cone_caps(ray: Ray, y: f32) -> f32 {
  let t = (y - ray.origin.y) / ray.direction.y;
  let x = ray.origin.x + t * ray.direction.x;
  let z = ray.origin.z + t * ray.direction.z;
  if(x * x + z * z <= abs(y)) {
    return t;
  }
  return -1.0;
}

fn cone_local_normal(point: vec3<f32>, min: f32, max: f32) -> vec3<f32> {
  let dist = point.x * point.x + point.z * point.z;
  if(dist < 1.0 && point.y >= max - EPSILON) {
    return vec3<f32>(0.0, 1.0, 0.0);
  }
  if(dist < 1.0 && point.y <= min + EPSILON) {
    return vec3<f32>(0.0, -1.0, 0.0);
  }
  var y = sqrt(dist);
  if(point.y > 0.0) {
    y = -y;
  }
  return vec3<f32>(point.x, y, point.z);
}


fn bounds_intersects(ray: Ray, min_bounds: vec3f, max_bounds: vec3f) -> bool {
  let xtmin = (min_bounds.x - ray.origin.x) / ray.direction.x;
  let xtmax = (max_bounds.x - ray.origin.x) / ray.direction.x;

  let ytmin = (min_bounds.y - ray.origin.y) / ray.direction.y;
  let ytmax = (max_bounds.y - ray.origin.y) / ray.direction.y;

  let ztmin = (min_bounds.z - ray.origin.z) / ray.direction.z;
  let ztmax = (max_bounds.z - ray.origin.z) / ray.direction.z;

  let tmin = max(max(min(xtmin, xtmax), min(ytmin, ytmax)), min(ztmin, ztmax));
  let tmax = min(min(max(xtmin, xtmax), max(ytmin, ytmax)), max(ztmin, ztmax));

  return tmin <= tmax;
}
