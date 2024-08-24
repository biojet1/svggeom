import { BoundingBox } from '../bbox.js';
import { Vector } from '../vector.js';

export function cubic_extrema(s: number, a: number, b: number, e: number) {
    //  Returns the extreme value, given a set of bezier coordinates
    let [atol, cmin, cmax] = [1e-9, Math.min(s, e), Math.max(s, e)];
    const pd1 = a - s;
    const pd2 = b - a;
    const pd3 = e - b;

    function _is_bigger(point: number) {
        if (point > 0 && point < 1) {
            const pyx = s * (1 - point) * (1 - point) * (1 - point) +
                3 * a * point * (1 - point) * (1 - point) +
                3 * b * point * point * (1 - point) +
                e * point * point * point;
            return [Math.min(cmin, pyx), Math.max(cmax, pyx)];
        }
        return [cmin, cmax];
    }

    if (Math.abs(pd1 - 2 * pd2 + pd3) > atol) {
        if (pd2 * pd2 > pd1 * pd3) {
            const pds = Math.sqrt(pd2 * pd2 - pd1 * pd3);
            [cmin, cmax] = _is_bigger((pd1 - pd2 + pds) / (pd1 - 2 * pd2 + pd3));
            [cmin, cmax] = _is_bigger((pd1 - pd2 - pds) / (pd1 - 2 * pd2 + pd3));
        }
    } else if (Math.abs(pd2 - pd1) > atol) {
        [cmin, cmax] = _is_bigger(-pd1 / (2 * (pd2 - pd1)));
    }
    return [cmin, cmax];
} function split_at_scalar(
    z: number,
    from: number,
    a: number,
    b: number,
    to: number
): [[number, number, number, number], [number, number, number, number]] {
    const t = z * z * z * to - 3 * z * z * (z - 1) * b + 3 * z * (z - 1) * (z - 1) * a - (z - 1) * (z - 1) * (z - 1) * from;
    return [
        [from, z * a - (z - 1) * from, z * z * b - 2 * z * (z - 1) * a + (z - 1) * (z - 1) * from, t],
        [t, z * z * to - 2 * z * (z - 1) * b + (z - 1) * (z - 1) * a, z * to - (z - 1) * b, to],
    ];
}

export function cubic_box([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Vector[]) {
    const [xmin, xmax] = cubic_extrema(sx, x1, x2, ex);
    const [ymin, ymax] = cubic_extrema(sy, y1, y2, ey);
    return BoundingBox.extrema(xmin, xmax, ymin, ymax);
}
const { pow } = Math;
function cubic_flatness([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[]) {
    let ux = pow(3 * x1 - 2 * sx - ex, 2);
    let uy = pow(3 * y1 - 2 * sy - ey, 2);
    const vx = pow(3 * x2 - 2 * ex - sx, 2);
    const vy = pow(3 * y2 - 2 * ey - sy, 2);
    if (ux < vx) {
        ux = vx;
    }
    if (uy < vy) {
        uy = vy;
    }
    return ux + uy;
}

export function cubic_point_at([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], t: number) {
    const F = 1 - t;
    return Vector.new(
        F * F * F * sx + 3 * F * F * t * x1 + 3 * F * t * t * x2 + t * t * t * ex,
        F * F * F * sy + 3 * F * F * t * y1 + 3 * F * t * t * y2 + t * t * t * ey
    );
}

export function cubic_split_at([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]: Iterable<number>[], z: number): Vector[][] {
    const x = split_at_scalar(z, sx, x1, x2, ex);
    const y = split_at_scalar(z, sy, y1, y2, ey);
    return [
        [Vector.new(x[0][0], y[0][0]), Vector.new(x[0][1], y[0][1]), Vector.new(x[0][2], y[0][2]), Vector.new(x[0][3], y[0][3])],
        [Vector.new(x[1][0], y[1][0]), Vector.new(x[1][1], y[1][1]), Vector.new(x[1][2], y[1][2]), Vector.new(x[1][3], y[1][3])],
    ];
}
export function cubic_slope_at([from, c1, c2, to]: Vector[], t: number): Vector {
    if (t <= 0) {
        if (from.equals(c1)) {
            return c2.sub(from);
        }
        return c1.sub(from);
    } else if (t >= 1) {
        return to.sub(c2);
    }
    if (from.equals(c1)) {
        if (to.equals(c2)) {
            return to.sub(from);
        }
        if (t <= 0) {
            return c2.sub(from).mul(2);
        } else {
            const a = c2.sub(from).mul(2 * (1 - t));
            const b = to.sub(c2).mul(t);
            return a.add(b);
        }
    } else if (to.equals(c2)) {
        const a = c1.sub(from).mul(2 * (1 - t));
        const b = to.sub(c1).mul(t);
        return a.add(b);
    } else {
        const a = c1.sub(from).mul(3 * (1 - t) ** 2);
        const b = c2.sub(c1).mul(6 * (1 - t) * t);
        const c = to.sub(c2).mul(3 * t ** 2);
        return a.add(b).add(c);
    }
}

export function cubic_length(_cpts: Vector[]): number {
    if (cubic_flatness(_cpts) > 0.15) {
        const [a, b] = cubic_split_at(_cpts, 0.5);
        return cubic_length(a) + cubic_length(b);
    } else {
        const [from, , , to] = _cpts;
        return to.sub(from).abs();
    }
}

