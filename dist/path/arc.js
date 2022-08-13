import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';
import { Line } from './line.js';
import { Cubic } from './cubic.js';
import { Matrix } from '../matrix.js';
import { segment_length, arcParams, arcToCurve } from '../util.js';
const { abs, atan, tan, cos, sin, PI, min, max } = Math;
export class Arc extends SegmentSE {
    rx;
    ry;
    phi;
    arc;
    sweep;
    cosφ;
    sinφ;
    rtheta;
    rdelta;
    cx;
    cy;
    constructor(start, end, rx, ry, φ, arc, sweep) {
        if (!(isFinite(φ) && isFinite(rx) && isFinite(ry)))
            throw Error(`${JSON.stringify(arguments)}`);
        super(start, end);
        const { x: x1, y: y1 } = this.start;
        const { x: x2, y: y2 } = this.end;
        [this.phi, this.rx, this.ry, this.sinφ, this.cosφ, this.cx, this.cy, this.rtheta, this.rdelta] =
            arcParams(x1, y1, rx, ry, φ, (this.arc = !!arc), (this.sweep = !!sweep), x2, y2);
    }
    static fromEndPoint(start, rx, ry, φ, arc, sweep, end) {
        if (!rx || !ry) {
            return new Line(start, end);
        }
        return new Arc(start, end, rx, ry, φ, arc, sweep);
    }
    static fromCenterForm(c, rx, ry, φ, θ, Δθ) {
        const cosφ = cos((φ / 180) * PI);
        const sinφ = sin((φ / 180) * PI);
        const m = Matrix.hexad(cosφ, sinφ, -sinφ, cosφ, 0, 0);
        const start = Vec.pos(rx * cos((θ / 180) * PI), ry * sin((θ / 180) * PI))
            .transform(m)
            .add(c);
        const end = Vec.pos(rx * cos(((θ + Δθ) / 180) * PI), ry * sin(((θ + Δθ) / 180) * PI))
            .transform(m)
            .add(c);
        const arc = abs(Δθ) > 180 ? 1 : 0;
        const sweep = Δθ > 0 ? 1 : 0;
        return new Arc(start, end, rx, ry, φ, arc, sweep);
    }
    clone() {
        return new Arc(this.start, this.end, this.rx, this.ry, this.phi, this.arc, this.sweep);
    }
    bbox() {
        return arcBBox(this);
    }
    get length() {
        return arcLength(this);
    }
    pointAt(t) {
        return arcPointAt(this, t);
    }
    splitAt(t) {
        const { rx, ry, phi, sweep, rdelta, start, end } = this;
        const deltaA = abs(rdelta);
        const mid = arcPointAt(this, t);
        return [
            new Arc(start, mid, rx, ry, phi, deltaA * t > PI, sweep),
            new Arc(mid, end, rx, ry, phi, deltaA * (1 - t) > PI, sweep),
        ];
    }
    toPathFragment() {
        return [
            'A',
            this.rx,
            this.ry,
            this.phi,
            this.arc ? 1 : 0,
            this.sweep ? 1 : 0,
            this.end.x,
            this.end.y,
        ];
    }
    slopeAt(t) {
        return arcSlopeAt(this, t);
    }
    transform(matrix) {
        const { arc, end, start } = this;
        const [rx, ry, phi, sweep] = arcTransform(this, matrix);
        return new Arc(start.transform(matrix), end.transform(matrix), rx, ry, phi, arc, sweep);
    }
    reversed() {
        const { arc, end, start, rx, ry, sweep, phi } = this;
        return new Arc(end, start, rx, ry, phi, arc, sweep ? 0 : 1);
    }
    asCubic() {
        const { rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta } = this;
        const segments = arcToCurve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
        if (segments.length === 0) {
            const { end, start } = this;
            return [new Line(start, end)];
        }
        else {
            return segments.map(function (s) {
                return new Cubic([s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]);
            });
        }
    }
}
function arcPointAt(arc, t) {
    const { start, end } = arc;
    if (start.equals(end)) {
        return start.clone();
    }
    else if (t <= 0) {
        return start;
    }
    else if (t >= 1) {
        return end;
    }
    const { rx, ry, cosφ, sinφ, rtheta, rdelta, cx, cy } = arc;
    const θ = rtheta + rdelta * t;
    const sinθ = sin(θ);
    const cosθ = cos(θ);
    try {
        return Vec.pos(rx * cosφ * cosθ - ry * sinφ * sinθ + cx, rx * sinφ * cosθ + ry * cosφ * sinθ + cy);
    }
    catch (err) {
        console.warn(rtheta, rdelta, rx, cosφ, cosθ, ry, sinφ, sinθ, cx, cy);
        throw err;
    }
}
function arcBBox(arc) {
    const { rx, ry, cosφ, sinφ, start, end, rdelta, rtheta, phi } = arc;
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
    const xtrema = [start.x, end.x];
    const ytrema = [start.y, end.y];
    function angle_inv(ang, k) {
        return (ang + PI * k - rtheta) / rdelta;
    }
    for (let k = -4; k < 5; ++k) {
        const tx = angle_inv(atan_x, k);
        const ty = angle_inv(atan_y, k);
        0 <= tx && tx <= 1 && xtrema.push(arcPointAt(arc, tx).x);
        0 <= ty && ty <= 1 && ytrema.push(arcPointAt(arc, ty).y);
    }
    const [xmin, xmax] = [min(...xtrema), max(...xtrema)];
    const [ymin, ymax] = [min(...ytrema), max(...ytrema)];
    return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
}
function arcLength(arc) {
    const { start, end } = arc;
    if (start.equals(end))
        return 0;
    return segment_length(arc, 0, 1, start, end);
}
function arcSlopeAt(arc, t) {
    const { rx, ry, cosφ, sinφ, rdelta, rtheta } = arc;
    const θ = rtheta + t * rdelta;
    const sinθ = sin(θ);
    const cosθ = cos(θ);
    const k = rdelta;
    return Vec.pos(-rx * cosφ * sinθ * k - ry * sinφ * cosθ * k, -rx * sinφ * sinθ * k + ry * cosφ * cosθ * k);
}
function arcTransform(self, matrix) {
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
function arcToCubic(self) {
    const { rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta } = self;
    return arcToCurve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
}
//# sourceMappingURL=arc.js.map