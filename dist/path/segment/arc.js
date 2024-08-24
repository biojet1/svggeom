import { Vector } from '../../vector.js';
import { SegmentSE } from './segmentse.js';
import { Line } from './line.js';
import { Cubic } from './cubic.js';
import { Matrix } from '../../matrix.js';
import { arc_bbox, arc_length, arc_params, arc_point_at, arc_slope_at, arc_to_curve, arc_transform } from '../archelp.js';
const { abs, cos, sin, PI } = Math;
export class Arc extends SegmentSE {
    rx;
    ry;
    phi;
    bigArc;
    sweep;
    cosφ;
    sinφ;
    rtheta;
    rdelta;
    cx;
    cy;
    constructor(from, to, rx, ry, φ, bigArc, sweep) {
        if (!(isFinite(φ) && isFinite(rx) && isFinite(ry)))
            throw Error(`${JSON.stringify(arguments)}`);
        super(from, to);
        const [x1, y1] = this.from;
        const [x2, y2] = this.to;
        [
            this.phi,
            this.rx,
            this.ry,
            this.sinφ,
            this.cosφ,
            this.cx,
            this.cy,
            this.rtheta,
            this.rdelta,
        ] = arc_params(x1, y1, rx, ry, φ, (this.bigArc = !!bigArc), (this.sweep = !!sweep), x2, y2);
    }
    static fromEndPoint(from, rx, ry, φ, bigArc, sweep, to) {
        if (!rx || !ry) {
            return new Line(from, to);
        }
        return new Arc(from, to, rx, ry, φ, bigArc, sweep);
    }
    static fromCenterForm(c, rx, ry, φ, θ, Δθ) {
        const cosφ = cos((φ / 180) * PI);
        const sinφ = sin((φ / 180) * PI);
        const m = Matrix.matrix(cosφ, sinφ, -sinφ, cosφ, 0, 0);
        const from = Vector.new(rx * cos((θ / 180) * PI), ry * sin((θ / 180) * PI))
            .transform(m)
            .add(c);
        const to = Vector.new(rx * cos(((θ + Δθ) / 180) * PI), ry * sin(((θ + Δθ) / 180) * PI))
            .transform(m)
            .add(c);
        const bigArc = abs(Δθ) > 180 ? 1 : 0;
        const sweep = Δθ > 0 ? 1 : 0;
        return new Arc(from, to, rx, ry, φ, bigArc, sweep);
    }
    bbox() {
        return arc_bbox(this);
    }
    get length() {
        return arc_length(this);
    }
    point_at(t) {
        return arc_point_at(this, t);
    }
    slope_at(t) {
        return arc_slope_at(this, t);
    }
    split_at(t) {
        const { rx, ry, phi, sweep, rdelta, from, to } = this;
        const deltaA = abs(rdelta);
        const mid = arc_point_at(this, t);
        return [
            new Arc(from, mid, rx, ry, phi, deltaA * t > PI, sweep),
            new Arc(mid, to, rx, ry, phi, deltaA * (1 - t) > PI, sweep),
        ];
    }
    toPathFragment() {
        const { rx, ry, phi, sweep, bigArc, to: [x, y], } = this;
        return ['A', rx, ry, phi, bigArc ? 1 : 0, sweep ? 1 : 0, x, y];
    }
    transform(matrix) {
        const { bigArc, to, from } = this;
        const [rx, ry, phi, sweep] = arc_transform(this, matrix);
        return new Arc(from.transform(matrix), to.transform(matrix), rx, ry, phi, bigArc, sweep);
    }
    reversed() {
        const { bigArc, to, from, rx, ry, sweep, phi } = this;
        return new Arc(to, from, rx, ry, phi, bigArc, sweep ? 0 : 1);
    }
    asCubic() {
        const { rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta } = this;
        const segments = arc_to_curve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
        if (segments.length === 0) {
            const { to, from } = this;
            return [new Line(from, to)];
        }
        else {
            return segments.map(function (s) {
                return new Cubic([s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]);
            });
        }
    }
}
//# sourceMappingURL=arc.js.map