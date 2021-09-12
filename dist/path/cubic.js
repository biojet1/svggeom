import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment } from "./index.js";
export class Cubic extends Segment {
    c1;
    c2;
    t_value;
    constructor(p1, c1, c2, p2) {
        super(Point.from(p1), Point.from(p2));
        this.c1 = Point.from(c1);
        this.c2 = Point.from(c2);
    }
    bbox() {
        const { p1, c1, c2, p2 } = this;
        const [xmin, xmax] = cubic_extrema(p1.x, c1.x, c2.x, p2.x);
        const [ymin, ymax] = cubic_extrema(p1.y, c1.y, c2.y, p2.y);
        return new Box([xmin, ymin, xmax - xmin, ymax - ymin]);
    }
    flatness() {
        let ux = Math.pow(3 * this.c1.x - 2 * this.p1.x - this.p2.x, 2);
        let uy = Math.pow(3 * this.c1.y - 2 * this.p1.y - this.p2.y, 2);
        const vx = Math.pow(3 * this.c2.x - 2 * this.p2.x - this.p1.x, 2);
        const vy = Math.pow(3 * this.c2.y - 2 * this.p2.y - this.p1.y, 2);
        if (ux < vx) {
            ux = vx;
        }
        if (uy < vy) {
            uy = vy;
        }
        return ux + uy;
    }
    length() {
        return this.lengthAt();
    }
    lengthAt(t = 1) {
        const curves = this.splitAt(t)[0].makeFlat(t);
        let length = 0;
        for (let i = 0, len = curves.length; i < len; ++i) {
            length += curves[i].p2.sub(curves[i].p1).abs();
        }
        return length;
    }
    makeFlat(t) {
        if (this.flatness() > 0.15) {
            return this.splitAt(0.5)
                .map(function (el) {
                return el.makeFlat(t * 0.5);
            })
                .reduce(function (last, current) {
                return last.concat(current);
            }, []);
        }
        else {
            this.t_value = t;
            return [this];
        }
    }
    pointAt(t) {
        const { p1, c1, c2, p2 } = this;
        const F = 1 - t;
        return Point.at(F * F * F * p1.x +
            3 * F * F * t * c1.x +
            3 * F * t * t * c2.x +
            t * t * t * p2.x, F * F * F * p1.y +
            3 * F * F * t * c1.y +
            3 * F * t * t * c2.y +
            t * t * t * p2.y);
    }
    splitAt(z) {
        const { p1, c1, c2, p2 } = this;
        const x = this.splitAtScalar(z, p1.x, c1.x, c2.x, p2.x);
        const y = this.splitAtScalar(z, p1.y, c1.y, c2.y, p2.y);
        const a = new Cubic(Point.at(x[0][0], y[0][0]), Point.at(x[0][1], y[0][1]), Point.at(x[0][2], y[0][2]), Point.at(x[0][3], y[0][3]));
        const b = new Cubic(Point.at(x[1][0], y[1][0]), Point.at(x[1][1], y[1][1]), Point.at(x[1][2], y[1][2]), Point.at(x[1][3], y[1][3]));
        return [a, b];
    }
    splitAtScalar(z, p1, p2, p3, p4) {
        const t = z * z * z * p4 -
            3 * z * z * (z - 1) * p3 +
            3 * z * (z - 1) * (z - 1) * p2 -
            (z - 1) * (z - 1) * (z - 1) * p1;
        return [
            [
                p1,
                z * p2 - (z - 1) * p1,
                z * z * p3 - 2 * z * (z - 1) * p2 + (z - 1) * (z - 1) * p1,
                t,
            ],
            [
                t,
                z * z * p4 - 2 * z * (z - 1) * p3 + (z - 1) * (z - 1) * p2,
                z * p4 - (z - 1) * p3,
                p4,
            ],
        ];
    }
    toPathFragment() {
        const { c1: { x: x1, y: y1 }, c2: { x: x2, y: y2 }, p2: { x: x3, y: y3 }, } = this;
        return ["C", x1, y1, x2, y2, x3, y3];
    }
    slopeAt(t) {
        const { p1, c1, c2, p2 } = this;
        let d1;
        if (t <= 0) {
            return c1.sub(p1);
        }
        else if (t >= 1) {
            return p2.sub(c2);
        }
        if (p1.equals(c1)) {
            if (p2.equals(c2)) {
                return p2.sub(p1);
            }
            if (t <= 0) {
                return c2.sub(p1).mul(2);
            }
            else {
                const a = c2.sub(p1).mul(2 * (1 - t));
                const b = p2.sub(c2).mul(t);
                return a.add(b);
            }
        }
        else if (p2.equals(c2)) {
            const a = c1.sub(p1).mul(2 * (1 - t));
            const b = p2.sub(c1).mul(t);
            return a.add(b);
        }
        else {
            const a = c1.sub(p1).mul(3 * (1 - t) ** 2);
            const b = c2.sub(c1).mul(6 * (1 - t) * t);
            const c = p2.sub(c2).mul(3 * t ** 2);
            return a.add(b).add(c);
        }
    }
    transform(M) {
        const { p1, c1, c2, p2 } = this;
        return new Cubic(p1.transform(M), c1.transform(M), c2.transform(M), p2.transform(M));
    }
    reversed() {
        const { p1, c1, c2, p2 } = this;
        return new Cubic(p2, c2, c1, p1);
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
