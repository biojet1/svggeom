import { Vec } from '../point.js';
import { Box } from '../box.js';
export class Cubic extends SegmentSE {
    c1;
    c2;
    t_value;
    constructor(start, c1, c2, end) {
        super(start, end);
        this.c1 = Vec.new(c1);
        this.c2 = Vec.new(c2);
    }
    new(start, c1, c2, end) {
        return new Cubic(start, c1, c2, end);
    }
    get _cpts() {
        const { start, c1, c2, end } = this;
        return [start, c1, c2, end];
    }
    bbox() {
        return cubicBox(this._cpts);
    }
    pointAt(t) {
        return cubicPointAt(this._cpts, t);
    }
    splitAt(z) {
        const [x, y] = cubicSplitAt(this._cpts, z);
        return [this.new(x[0], x[1], x[2], x[3]), this.new(y[0], y[1], y[2], y[3])];
    }
    get length() {
        return cubicLength(this._cpts);
    }
    slopeAt(t) {
        return cubicSlopeAt(this._cpts, t);
    }
    toPathFragment() {
        const { c1: { x: x1, y: y1 }, c2: { x: x2, y: y2 }, end: { x: x3, y: y3 }, } = this;
        return ['C', x1, y1, x2, y2, x3, y3];
    }
    transform(M) {
        const { start, c1, c2, end } = this;
        return this.new(start.transform(M), c1.transform(M), c2.transform(M), end.transform(M));
    }
    reversed() {
        const { start, c1, c2, end } = this;
        return this.new(end, c2, c1, start);
    }
}
function cubic_extrema(s, a, b, e) {
    let [atol, cmin, cmax] = [1e-9, Math.min(s, e), Math.max(s, e)];
    const pd1 = a - s;
    const pd2 = b - a;
    const pd3 = e - b;
    function _is_bigger(point) {
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
    }
    else if (Math.abs(pd2 - pd1) > atol) {
        [cmin, cmax] = _is_bigger(-pd1 / (2 * (pd2 - pd1)));
    }
    return [cmin, cmax];
}
export { Cubic as CubicSegment };
function splitAtScalar(z, start, a, b, end) {
    const t = z * z * z * end - 3 * z * z * (z - 1) * b + 3 * z * (z - 1) * (z - 1) * a - (z - 1) * (z - 1) * (z - 1) * start;
    return [
        [start, z * a - (z - 1) * start, z * z * b - 2 * z * (z - 1) * a + (z - 1) * (z - 1) * start, t],
        [t, z * z * end - 2 * z * (z - 1) * b + (z - 1) * (z - 1) * a, z * end - (z - 1) * b, end],
    ];
}
export function cubicBox([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]) {
    const [xmin, xmax] = cubic_extrema(sx, x1, x2, ex);
    const [ymin, ymax] = cubic_extrema(sy, y1, y2, ey);
    return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
}
const { pow } = Math;
function cubicFlatness([[sx, sy], [x1, y1], [x2, y2], [ex, ey]]) {
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
export function cubicPointAt([[sx, sy], [x1, y1], [x2, y2], [ex, ey]], t) {
    const F = 1 - t;
    return Vec.at(F * F * F * sx + 3 * F * F * t * x1 + 3 * F * t * t * x2 + t * t * t * ex, F * F * F * sy + 3 * F * F * t * y1 + 3 * F * t * t * y2 + t * t * t * ey);
}
export function cubicSplitAt([[sx, sy], [x1, y1], [x2, y2], [ex, ey]], z) {
    const x = splitAtScalar(z, sx, x1, x2, ex);
    const y = splitAtScalar(z, sy, y1, y2, ey);
    return [
        [Vec.pos(x[0][0], y[0][0]), Vec.pos(x[0][1], y[0][1]), Vec.pos(x[0][2], y[0][2]), Vec.pos(x[0][3], y[0][3])],
        [Vec.pos(x[1][0], y[1][0]), Vec.pos(x[1][1], y[1][1]), Vec.pos(x[1][2], y[1][2]), Vec.pos(x[1][3], y[1][3])],
    ];
}
export function cubicSlopeAt([start, c1, c2, end], t) {
    if (t <= 0) {
        if (start.equals(c1)) {
            return c2.sub(start);
        }
        return c1.sub(start);
    }
    else if (t >= 1) {
        return end.sub(c2);
    }
    if (start.equals(c1)) {
        if (end.equals(c2)) {
            return end.sub(start);
        }
        if (t <= 0) {
            return c2.sub(start).mul(2);
        }
        else {
            const a = c2.sub(start).mul(2 * (1 - t));
            const b = end.sub(c2).mul(t);
            return a.add(b);
        }
    }
    else if (end.equals(c2)) {
        const a = c1.sub(start).mul(2 * (1 - t));
        const b = end.sub(c1).mul(t);
        return a.add(b);
    }
    else {
        const a = c1.sub(start).mul(3 * (1 - t) ** 2);
        const b = c2.sub(c1).mul(6 * (1 - t) * t);
        const c = end.sub(c2).mul(3 * t ** 2);
        return a.add(b).add(c);
    }
}
export function cubicLength(_cpts) {
    if (cubicFlatness(_cpts) > 0.15) {
        const [a, b] = cubicSplitAt(_cpts, 0.5);
        return cubicLength(a) + cubicLength(b);
    }
    else {
        const [start, , , end] = _cpts;
        return end.sub(start).abs();
    }
}
import { SegmentSE } from './index.js';
//# sourceMappingURL=cubic.js.map