import { Point } from '../point.js';
import { Box } from '../box.js';
import { Cubic } from './cubic.js';
export class Quadratic extends Cubic {
    c;
    constructor(start, control, end) {
        const p1 = Point.from(start);
        const c = Point.from(control);
        const p2 = Point.from(end);
        const c1 = p1.equals(c) ? p1 : p1.mul(1 / 3).add(c.mul(2 / 3));
        const c2 = p2.equals(c) ? p2 : c.mul(2 / 3).add(p2.mul(1 / 3));
        super(p1, c1, c2, p2);
        this.c = c;
    }
    slopeAt(t) {
        const { p1, c, p2 } = this;
        if (t >= 1) {
            return p2.sub(c);
        }
        else if (t <= 0) {
            return c.sub(p1);
        }
        if (c.equals(p1) || c.equals(p2)) {
            const vec = p2.sub(p1);
            return vec.div(vec.abs());
        }
        const a = c.sub(p1).mul(1 - t);
        const b = p2.sub(c).mul(t);
        return a.add(b).mul(2);
    }
    pointAt(t) {
        const { p1, c, p2 } = this;
        const v = 1 - t;
        return Point.at(v * v * p1.x + 2 * v * t * c.x + t * t * p2.x, v * v * p1.y + 2 * v * t * c.y + t * t * p2.y);
    }
    splitAt(t) {
        const { p1: { x: x1, y: y1 }, c: { x: cx, y: cy }, p2: { x: x2, y: y2 }, } = this;
        const mx1 = (1 - t) * x1 + t * cx;
        const mx2 = (1 - t) * cx + t * x2;
        const mxt = (1 - t) * mx1 + t * mx2;
        const my1 = (1 - t) * y1 + t * cy;
        const my2 = (1 - t) * cy + t * y2;
        const myt = (1 - t) * my1 + t * my2;
        return [
            new Quadratic(Point.at(x1, y1), Point.at(mx1, my1), Point.at(mxt, myt)),
            new Quadratic(Point.at(mxt, myt), Point.at(mx2, my2), Point.at(x2, y2)),
        ];
    }
    bbox() {
        const { p1, c, p2 } = this;
        const [x1, x2, x3] = [p1.x, c.x, p2.x];
        const [y1, y2, y3] = [p1.y, c.y, p2.y];
        const [xmin, xmax] = quadratic_extrema(x1, x2, x3);
        const [ymin, ymax] = quadratic_extrema(y1, y2, y3);
        return new Box([xmin, ymin, xmax - xmin, ymax - ymin]);
    }
    toPathFragment() {
        const { c, p2 } = this;
        return ['Q', c.x, c.y, p2.x, p2.y];
    }
    transform(M) {
        const { p1, c, p2 } = this;
        return new Quadratic(p1.transform(M), c.transform(M), p2.transform(M));
    }
    reversed() {
        const { p1, c, p2 } = this;
        return new Quadratic(p2, c, p1);
    }
}
function quadratic_extrema(a, b, c) {
    const atol = 1e-9;
    const cmin = Math.min(a, c);
    const cmax = Math.max(a, c);
    if (Math.abs(a + c - 2 * b) > atol) {
        const p = (a - b) / (a + c - 2 * b);
        if (p > 0 && p < 1) {
            const e = a * (1 - p) * (1 - p) + 2 * b * p * (1 - p) + c * p * p;
            return [Math.min(cmin, e), Math.max(cmax, e)];
        }
    }
    return [cmin, cmax];
}
