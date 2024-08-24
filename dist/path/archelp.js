import { BoundingBox } from "../bbox.js";
import { Vector } from "../vector.js";
const { abs, tan, cos, sin, sqrt, acos, PI, ceil, min, max, atan } = Math;
const TAU = PI * 2;
function cossin(θ) {
    θ = ((θ % 360) + 360) % 360;
    switch (θ) {
        case 0:
            return [+1, +0];
        case 30:
            return [sqrt(3) / 2, 0.5];
        case 45:
            return [sqrt(2) / 2, sqrt(2) / 2];
        case 60:
            return [0.5, sqrt(3) / 2];
        case 90:
            return [+0, +1];
        case 120:
            return [-0.5, sqrt(3) / 2];
        case 135:
            return [-sqrt(2) / 2, sqrt(2) / 2];
        case 150:
            return [-sqrt(3) / 2, 0.5];
        case 180:
            return [-1, +0];
        case 210:
            return [-sqrt(3) / 2, -0.5];
        case 225:
            return [-sqrt(2) / 2, -sqrt(2) / 2];
        case 240:
            return [-0.5, -sqrt(3) / 2];
        case 270:
            return [-0, -1];
        case 300:
            return [0.5, -sqrt(3) / 2];
        case 315:
            return [sqrt(2) / 2, -sqrt(2) / 2];
        case 330:
            return [sqrt(3) / 2, -0.5];
        default:
            const r = (θ * PI) / 180;
            return [cos(r), sin(r)];
    }
}
function unit_vector_angle(ux, uy, vx, vy) {
    const sign = ux * vy - uy * vx < 0 ? -1 : 1;
    var dot = ux * vx + uy * vy;
    if (dot > 1.0) {
        dot = 1.0;
    }
    else if (dot < -1.0) {
        dot = -1.0;
    }
    return sign * acos(dot);
}
const LENGTH_MIN_DEPTH = 17;
const LENGTH_ERROR = 1e-12;
export function segment_length(curve, start, end, start_point, end_point, error = LENGTH_ERROR, min_depth = LENGTH_MIN_DEPTH, depth = 0) {
    const mid = (start + end) / 2;
    const mid_point = curve.point_at(mid);
    const length = end_point.sub(start_point).abs();
    const first_half = mid_point.sub(start_point).abs();
    const second_half = end_point.sub(mid_point).abs();
    const length2 = first_half + second_half;
    if (length2 - length > error || depth < min_depth) {
        depth += 1;
        return (segment_length(curve, start, mid, start_point, mid_point, error, min_depth, depth) +
            segment_length(curve, mid, end, mid_point, end_point, error, min_depth, depth));
    }
    return length2;
}
export function arc_params(x1, y1, rx, ry, φ, arc, sweep, x2, y2) {
    const [cosφ, sinφ] = cossin(φ);
    const x1ˈ = (cosφ * (x1 - x2) + sinφ * (y1 - y2)) / 2;
    const y1ˈ = (-sinφ * (x1 - x2) + cosφ * (y1 - y2)) / 2;
    if (1) {
        if (!rx || !ry) {
            throw new Error("Not an ellipse");
        }
        else {
            rx = abs(rx);
            ry = abs(ry);
        }
    }
    const rxSq = rx ** 2;
    const rySq = ry ** 2;
    const y1ˈSq = y1ˈ ** 2;
    const x1ˈSq = x1ˈ ** 2;
    if (1) {
        const Λ = x1ˈ ** 2 / rxSq + y1ˈ ** 2 / rySq;
        if (Λ > 1) {
            const m = sqrt(Λ);
            rx = m * rx;
            ry = m * ry;
        }
    }
    const s1 = rxSq * y1ˈSq;
    const s2 = rySq * x1ˈSq;
    const v1 = (rxSq * rySq - s1 - s2) / (s1 + s2);
    const m1 = v1 <= 0 ? 0 : sqrt(v1) * (!!arc === !!sweep ? -1 : 1);
    let cxˈ = (rx * y1ˈ * m1) / ry;
    let cyˈ = (-ry * x1ˈ * m1) / rx;
    const cx = cosφ * cxˈ - sinφ * cyˈ + (x1 + x2) / 2;
    const cy = sinφ * cxˈ + cosφ * cyˈ + (y1 + y2) / 2;
    const v1x = (x1ˈ - cxˈ) / rx;
    const v1y = (y1ˈ - cyˈ) / ry;
    const v2x = (-x1ˈ - cxˈ) / rx;
    const v2y = (-y1ˈ - cyˈ) / ry;
    const theta1 = unit_vector_angle(1, 0, v1x, v1y);
    const delta_theta = unit_vector_angle(v1x, v1y, v2x, v2y);
    return [
        φ,
        rx,
        ry,
        sinφ,
        cosφ,
        cx,
        cy,
        theta1,
        delta_theta +
            (sweep ? (delta_theta < 0 ? +TAU : 0) : delta_theta > 0 ? -TAU : 0),
    ];
}
function approximate_unit_arc(theta1, delta_theta) {
    var alpha = (4 / 3) * tan(delta_theta / 4);
    var x1 = cos(theta1);
    var y1 = sin(theta1);
    var x2 = cos(theta1 + delta_theta);
    var y2 = sin(theta1 + delta_theta);
    return [
        x1,
        y1,
        x1 - y1 * alpha,
        y1 + x1 * alpha,
        x2 + y2 * alpha,
        y2 - x2 * alpha,
        x2,
        y2,
    ];
}
export function arc_to_curve(rx, ry, cx, cy, sin_phi, cos_phi, theta1, delta_theta) {
    var result = [];
    const segments = max(ceil(abs(delta_theta) / (TAU / 12)), 1);
    delta_theta /= segments;
    for (var i = 0; i < segments; i++) {
        result.push(approximate_unit_arc(theta1, delta_theta));
        theta1 += delta_theta;
    }
    return result.map(function (curve) {
        for (let i = 0; i < curve.length; i += 2) {
            let x = curve[i + 0];
            let y = curve[i + 1];
            x *= rx;
            y *= ry;
            const xp = cos_phi * x - sin_phi * y;
            const yp = sin_phi * x + cos_phi * y;
            curve[i + 0] = xp + cx;
            curve[i + 1] = yp + cy;
        }
        return curve;
    });
}
export function arc_point_at(arc, t) {
    const { from, to } = arc;
    if (from.equals(to)) {
        return from.clone();
    }
    else if (t <= 0) {
        return from;
    }
    else if (t >= 1) {
        return to;
    }
    const { rx, ry, cosφ, sinφ, rtheta, rdelta, cx, cy } = arc;
    const θ = rtheta + rdelta * t;
    const sinθ = sin(θ);
    const cosθ = cos(θ);
    try {
        return Vector.new(rx * cosφ * cosθ - ry * sinφ * sinθ + cx, rx * sinφ * cosθ + ry * cosφ * sinθ + cy);
    }
    catch (err) {
        console.warn(rtheta, rdelta, rx, cosφ, cosθ, ry, sinφ, sinθ, cx, cy);
        throw err;
    }
}
export function arc_bbox(arc) {
    const { rx, ry, cosφ, sinφ, from, to, rdelta, rtheta, phi } = arc;
    let atan_x, atan_y;
    if (cosφ == 0) {
        atan_x = PI / 2;
        atan_y = 0;
    }
    else if (sinφ == 0) {
        atan_x = 0;
        atan_y = PI / 2;
    }
    else {
        const tanφ = tan(phi);
        atan_x = atan(-(ry / rx) * tanφ);
        atan_y = atan(ry / rx / tanφ);
    }
    const xtrema = [from.x, to.x];
    const ytrema = [from.y, to.y];
    function angle_inv(ang, k) {
        return (ang + PI * k - rtheta) / rdelta;
    }
    for (let k = -4; k < 5; ++k) {
        const tx = angle_inv(atan_x, k);
        const ty = angle_inv(atan_y, k);
        0 <= tx && tx <= 1 && xtrema.push(arc_point_at(arc, tx).x);
        0 <= ty && ty <= 1 && ytrema.push(arc_point_at(arc, ty).y);
    }
    const [xmin, xmax] = [min(...xtrema), max(...xtrema)];
    const [ymin, ymax] = [min(...ytrema), max(...ytrema)];
    return BoundingBox.extrema(xmin, xmax, ymin, ymax);
}
export function arc_length(arc) {
    const { from, to } = arc;
    if (from.equals(to))
        return 0;
    return segment_length(arc, 0, 1, from, to);
}
export function arc_slope_at(arc, t) {
    const { rx, ry, cosφ, sinφ, rdelta, rtheta } = arc;
    const θ = rtheta + t * rdelta;
    const sinθ = sin(θ);
    const cosθ = cos(θ);
    const k = rdelta;
    return Vector.new(-rx * cosφ * sinθ * k - ry * sinφ * cosθ * k, -rx * sinφ * sinθ * k + ry * cosφ * cosθ * k);
}
export function arc_transform(self, matrix) {
    let { rx, ry, sweep, phi } = self;
    const { rotate, scaleX, scaleY, skewX } = matrix.decompose();
    if (scaleX == scaleY && scaleX != 1) {
        rx = rx * scaleX;
        ry = ry * scaleX;
    }
    OUT: if (rotate || skewX || scaleX != 1 || scaleY != 1) {
        phi = (((phi + rotate) % 360) + 360) % 360;
        const { a, c, b, d } = matrix;
        const detT = a * d - b * c;
        const detT2 = detT * detT;
        if (!rx || !ry || !detT2)
            break OUT;
        if (detT < 0) {
            sweep = !sweep;
        }
    }
    return [rx, ry, phi, sweep ? 1 : 0];
}
//# sourceMappingURL=archelp.js.map