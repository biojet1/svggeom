"use strict";
const TAU = Math.PI * 2;
function unit_vector_angle(ux, uy, vx, vy) {
    const sign = ux * vy - uy * vx < 0 ? -1 : 1;
    var dot = ux * vx + uy * vy;
    if (dot > 1.0) {
        dot = 1.0;
    }
    if (dot < -1.0) {
        dot = -1.0;
    }
    return sign * Math.acos(dot);
}
function get_arc_center(x1, y1, x2, y2, fa, fs, rx, ry, sin_phi, cos_phi) {
    const x1p = (cos_phi * (x1 - x2)) / 2 + (sin_phi * (y1 - y2)) / 2;
    const y1p = (-sin_phi * (x1 - x2)) / 2 + (cos_phi * (y1 - y2)) / 2;
    const rx_sq = rx * rx;
    const ry_sq = ry * ry;
    const x1p_sq = x1p * x1p;
    const y1p_sq = y1p * y1p;
    var radicant = rx_sq * ry_sq - rx_sq * y1p_sq - ry_sq * x1p_sq;
    if (radicant < 0) {
        radicant = 0;
    }
    radicant /= rx_sq * y1p_sq + ry_sq * x1p_sq;
    radicant = Math.sqrt(radicant) * (fa === fs ? -1 : 1);
    const cxp = ((radicant * rx) / ry) * y1p;
    const cyp = ((radicant * -ry) / rx) * x1p;
    const cx = cos_phi * cxp - sin_phi * cyp + (x1 + x2) / 2;
    const cy = sin_phi * cxp + cos_phi * cyp + (y1 + y2) / 2;
    const v1x = (x1p - cxp) / rx;
    const v1y = (y1p - cyp) / ry;
    const v2x = (-x1p - cxp) / rx;
    const v2y = (-y1p - cyp) / ry;
    const theta1 = unit_vector_angle(1, 0, v1x, v1y);
    let delta_theta = unit_vector_angle(v1x, v1y, v2x, v2y);
    if (fs === 0 && delta_theta > 0) {
        delta_theta -= TAU;
    }
    if (fs === 1 && delta_theta < 0) {
        delta_theta += TAU;
    }
    return [cx, cy, theta1, delta_theta];
}
function approximate_unit_arc(theta1, delta_theta) {
    var alpha = (4 / 3) * Math.tan(delta_theta / 4);
    var x1 = Math.cos(theta1);
    var y1 = Math.sin(theta1);
    var x2 = Math.cos(theta1 + delta_theta);
    var y2 = Math.sin(theta1 + delta_theta);
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
export function a2c(x1, y1, x2, y2, fa, fs, rx, ry, phi) {
    const sin_phi = Math.sin((phi * TAU) / 360);
    const cos_phi = Math.cos((phi * TAU) / 360);
    const x1p = (cos_phi * (x1 - x2)) / 2 + (sin_phi * (y1 - y2)) / 2;
    const y1p = (-sin_phi * (x1 - x2)) / 2 + (cos_phi * (y1 - y2)) / 2;
    if (x1p === 0 && y1p === 0) {
        return [];
    }
    if (rx === 0 || ry === 0) {
        return [];
    }
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    const lambda = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lambda > 1) {
        rx *= Math.sqrt(lambda);
        ry *= Math.sqrt(lambda);
    }
    const cc = get_arc_center(x1, y1, x2, y2, fa, fs, rx, ry, sin_phi, cos_phi);
    var result = [];
    var theta1 = cc[2];
    var delta_theta = cc[3];
    const segments = Math.max(Math.ceil(Math.abs(delta_theta) / (TAU / 12)), 1);
    delta_theta /= segments;
    for (var i = 0; i < segments; i++) {
        result.push(approximate_unit_arc(theta1, delta_theta));
        theta1 += delta_theta;
    }
    return result.map(function (curve) {
        for (var i = 0; i < curve.length; i += 2) {
            var x = curve[i + 0];
            var y = curve[i + 1];
            x *= rx;
            y *= ry;
            var xp = cos_phi * x - sin_phi * y;
            var yp = sin_phi * x + cos_phi * y;
            curve[i + 0] = xp + cc[0];
            curve[i + 1] = yp + cc[1];
        }
        return curve;
    });
}
