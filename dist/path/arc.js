import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment, Line } from "./index.js";
import { Cubic } from "./cubic.js";
import { Matrix } from "../matrix.js";
import { a2c } from "./a2c.js";
const { PI } = Math;
export class Arc extends Segment {
    rx;
    ry;
    phi;
    arc;
    sweep;
    cosφ;
    sinφ;
    cen;
    rtheta;
    rdelta;
    constructor(p1, p2, rx, ry, φ, arc, sweep) {
        p1 = Point.from(p1);
        p2 = Point.from(p2);
        if (!(Number.isFinite(φ) && Number.isFinite(rx) && Number.isFinite(ry)))
            throw Error(`${JSON.stringify(arguments)}`);
        const ec = pointOnEllipticalArc(p1, rx, ry, φ, !!arc, !!sweep, p2, 1);
        if (!rx || !ry) {
            console.log([rx, ry], φ, [arc, sweep], p1, p2);
            throw new Error("Not an ellipse");
        }
        super(p1, p2);
        this.phi = φ;
        this.arc = arc ? 1 : 0;
        this.sweep = sweep ? 1 : 0;
        φ = ((φ % 360) + 360) % 360;
        rx = Math.abs(rx);
        ry = Math.abs(ry);
        const φrad = (φ * PI) / 180;
        const cosφ = Math.cos(φrad);
        const sinφ = Math.sin(φrad);
        const rotM = Matrix.fromHexad(cosφ, -sinφ, sinφ, cosφ, 0, 0);
        const p1ˈ = Point.at((p1.x - p2.x) / 2, (p1.y - p2.y) / 2).transform(rotM);
        const rxSq = rx ** 2;
        const rySq = ry ** 2;
        const ratio = p1ˈ.x ** 2 / rxSq + p1ˈ.y ** 2 / rySq;
        if (ratio > 1) {
            rx = Math.sqrt(ratio) * rx;
            ry = Math.sqrt(ratio) * ry;
        }
        const divisor1 = rxSq * p1ˈ.y ** 2;
        const divisor2 = rySq * p1ˈ.x ** 2;
        const dividend = rxSq * rySq - divisor1 - divisor2;
        const v1 = dividend / (divisor1 + divisor2);
        const mult = v1 <= 0 ? 0 : Math.sqrt(v1);
        let cenˈ = Point.at((rx * p1ˈ.y) / ry, (-ry * p1ˈ.x) / rx).mul(mult);
        if (this.arc === this.sweep)
            cenˈ = cenˈ.mul(-1);
        const cen = cenˈ
            .transform(rotM)
            .add(Point.at((p1.x + p2.x) / 2, (p1.y + p2.y) / 2));
        const anglePoint = Point.at((p1ˈ.x - cenˈ.x) / rx, (p1ˈ.y - cenˈ.y) / ry);
        const θ = Point.at(1, 0).angleTo(anglePoint);
        if (!(Number.isFinite(θ) && Number.isFinite(rx) && Number.isFinite(ry)))
            throw Error(`${anglePoint}: ${θ}`);
        let Δθ = anglePoint.angleTo(Point.at((-p1ˈ.x - cenˈ.x) / rx, (-p1ˈ.y - cenˈ.y) / ry));
        Δθ = Δθ % (2 * PI);
        if (!sweep && Δθ > 0)
            Δθ -= 2 * PI;
        if (sweep && Δθ < 0)
            Δθ += 2 * PI;
        this.rx = rx;
        this.ry = ry;
        this.cen = cen;
        this.cosφ = cosφ;
        this.sinφ = sinφ;
        this.rtheta = θ;
        this.rdelta = Δθ;
    }
    static fromEndPoint(p1, rx, ry, φ, arc, sweep, p2) {
        if (!rx || !ry) {
            return new Line(p1, p2);
        }
        p1 = Point.from(p1);
        p2 = Point.from(p2);
        return new Arc(p1, p2, rx, ry, φ, arc, sweep);
    }
    static fromCenterForm(c, rx, ry, φ, θ, Δθ) {
        const cosφ = Math.cos((φ / 180) * PI);
        const sinφ = Math.sin((φ / 180) * PI);
        const m = Matrix.fromHexad(cosφ, sinφ, -sinφ, cosφ, 0, 0);
        const p1 = Point.at(rx * Math.cos((θ / 180) * PI), ry * Math.sin((θ / 180) * PI))
            .transform(m)
            .add(c);
        const p2 = Point.at(rx * Math.cos(((θ + Δθ) / 180) * PI), ry * Math.sin(((θ + Δθ) / 180) * PI))
            .transform(m)
            .add(c);
        const arc = Math.abs(Δθ) > 180 ? 1 : 0;
        const sweep = Δθ > 0 ? 1 : 0;
        return new Arc(p1, p2, rx, ry, φ, arc, sweep);
    }
    bbox() {
        const { rx, ry, cosφ, sinφ, p1, p2, rdelta, rtheta, phi } = this;
        const { PI } = Math;
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
            const tanφ = Math.tan(phi);
            atan_x = Math.atan(-(ry / rx) * tanφ);
            atan_y = Math.atan(ry / rx / tanφ);
        }
        const xtrema = [p1.x, p2.x];
        const ytrema = [p1.y, p2.y];
        function angle_inv(ang, k) {
            return (ang + PI * k - rtheta) / rdelta;
        }
        for (let k = -4; k < 5; ++k) {
            const tx = angle_inv(atan_x, k);
            const ty = angle_inv(atan_y, k);
            0 <= tx && tx <= 1 && xtrema.push(this.pointAt(tx).x);
            0 <= ty && ty <= 1 && ytrema.push(this.pointAt(ty).y);
        }
        const [xmin, xmax] = [Math.min(...xtrema), Math.max(...xtrema)];
        const [ymin, ymax] = [Math.min(...ytrema), Math.max(...ytrema)];
        return new Box([xmin, ymin, xmax - xmin, ymax - ymin]);
    }
    clone() {
        return new Arc(this.p1, this.p2, this.rx, this.ry, this.phi, this.arc, this.sweep);
    }
    length() {
        const { p1, p2 } = this;
        if (p1.equals(p2))
            return 0;
        return segment_length(this, 0, 1, p1, p2);
    }
    pointAt(t) {
        const { p1, p2 } = this;
        if (p1.equals(p2)) {
            return p1.clone();
        }
        else if (t <= 0) {
            return p1;
        }
        else if (t >= 1) {
            return p2;
        }
        const { rx, ry, cosφ, sinφ, rtheta, rdelta, cen } = this;
        const θ = (((180 * rtheta + 180 * rdelta * t) / PI) * PI) / 180;
        const sinθ = Math.sin(θ);
        const cosθ = Math.cos(θ);
        return Point.at(rx * cosφ * cosθ - ry * sinφ * sinθ + cen.x, rx * sinφ * cosθ + ry * cosφ * sinθ + cen.y);
    }
    splitAt(t) {
        const { rx, ry, phi, sweep, rdelta, p1, p2 } = this;
        const deltaA = Math.abs(rdelta);
        const delta1 = deltaA * t;
        const delta2 = deltaA * (1 - t);
        const pT = this.pointAt(t);
        return [
            new Arc(p1, pT, rx, ry, phi, delta1 > PI, sweep),
            new Arc(pT, p2, rx, ry, phi, delta2 > PI, sweep),
        ];
    }
    toPathFragment() {
        return [
            "A",
            this.rx,
            this.ry,
            this.phi,
            this.arc,
            this.sweep,
            this.p2.x,
            this.p2.y,
        ];
    }
    slopeAt(t) {
        const { rx, ry, cosφ, sinφ, rdelta, rtheta } = this;
        const θ = rtheta + t * rdelta;
        const sinθ = Math.sin(θ);
        const cosθ = Math.cos(θ);
        const k = rdelta;
        return Point.at(-rx * cosφ * sinθ * k - ry * sinφ * cosθ * k, -rx * sinφ * sinθ * k + ry * cosφ * cosθ * k);
    }
    transform(matrix) {
        const { arc, p2, p1 } = this;
        let { rx, ry, sweep, phi } = this;
        const p1ˈ = p1.transform(matrix);
        const p2_ = p2.transform(matrix);
        const { rotate, scaleX, scaleY, skewX } = matrix.decompose();
        if (scaleX == scaleY && scaleX != 1) {
            rx *= scaleX;
            ry *= scaleX;
        }
        OUT: if (rotate || skewX || scaleX != 1 || scaleY != 1) {
            phi = (((phi + rotate) % 360) + 360) % 360;
            const M = matrix;
            const { a, c, b, d } = M;
            const detT = a * d - b * c;
            const detT2 = detT * detT;
            if (!rx || !ry || !detT2)
                break OUT;
            const A = (d ** 2 / rx ** 2 + c ** 2 / ry ** 2) / detT2;
            const B = -((d * b) / rx ** 2 + (c * a) / ry ** 2) / detT2;
            const D = (b ** 2 / rx ** 2 + a ** 2 / ry ** 2) / detT2;
            const theta = Math.atan2(-2 * B, D - A) / 2;
            const DA = D - A;
            const l2 = 4 * B ** 2 + DA ** 2;
            const delta = l2
                ? (0.5 * (-DA * DA - 4 * B * B)) / Math.sqrt(l2)
                : 0;
            const half = (A + D) / 2;
            if (detT < 0) {
                sweep = sweep ? 0 : 1;
            }
        }
        return new Arc(p1ˈ, p2_, rx, ry, phi, arc, sweep);
    }
    reversed() {
        const { arc, p2, p1, rx, ry, sweep, phi } = this;
        return new Arc(p2, p1, rx, ry, phi, arc, sweep ? 0 : 1);
    }
    asCubic() {
        const { arc, p2: { x: x2, y: y2 }, p1: { x: x1, y: y1 }, rx, ry, sweep, phi, } = this;
        const segments = a2c(x1, y1, x2, y2, arc, sweep, rx, ry, phi);
        if (segments.length === 0) {
            return [new Line([x1, y1], [x2, y2])];
        }
        else {
            return segments.map(function (s) {
                return new Cubic([s[0], s[1]], [s[2], s[3]], [s[4], s[5]], [s[6], s[7]]);
            });
        }
    }
}
const LENGTH_MIN_DEPTH = 17;
const LENGTH_ERROR = 1e-12;
function segment_length(curve, start, end, start_point, end_point, error = LENGTH_ERROR, min_depth = LENGTH_MIN_DEPTH, depth = 0) {
    const mid = (start + end) / 2;
    const mid_point = curve.pointAt(mid);
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
function pointOnEllipticalArc(p0, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, p1, t) {
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    xAxisRotation = mod(xAxisRotation, 360);
    const xAxisRotationRadians = toRadians(xAxisRotation);
    if (p0.x === p1.x && p0.y === p1.y) {
        return { x: p0.x, y: p0.y, ellipticalArcAngle: 0 };
    }
    if (rx === 0 || ry === 0) {
        return { x: 0, y: 0, ellipticalArcAngle: 0 };
    }
    const dx = (p0.x - p1.x) / 2;
    const dy = (p0.y - p1.y) / 2;
    const transformedPoint = {
        x: Math.cos(xAxisRotationRadians) * dx +
            Math.sin(xAxisRotationRadians) * dy,
        y: -Math.sin(xAxisRotationRadians) * dx +
            Math.cos(xAxisRotationRadians) * dy,
    };
    const radiiCheck = Math.pow(transformedPoint.x, 2) / Math.pow(rx, 2) +
        Math.pow(transformedPoint.y, 2) / Math.pow(ry, 2);
    if (radiiCheck > 1) {
        rx = Math.sqrt(radiiCheck) * rx;
        ry = Math.sqrt(radiiCheck) * ry;
    }
    const cSquareNumerator = Math.pow(rx, 2) * Math.pow(ry, 2) -
        Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) -
        Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    const cSquareRootDenom = Math.pow(rx, 2) * Math.pow(transformedPoint.y, 2) +
        Math.pow(ry, 2) * Math.pow(transformedPoint.x, 2);
    let cRadicand = cSquareNumerator / cSquareRootDenom;
    cRadicand = cRadicand < 0 ? 0 : cRadicand;
    const cCoef = (largeArcFlag !== sweepFlag ? 1 : -1) * Math.sqrt(cRadicand);
    const transformedCenter = {
        x: cCoef * ((rx * transformedPoint.y) / ry),
        y: cCoef * (-(ry * transformedPoint.x) / rx),
    };
    const center = {
        x: Math.cos(xAxisRotationRadians) * transformedCenter.x -
            Math.sin(xAxisRotationRadians) * transformedCenter.y +
            (p0.x + p1.x) / 2,
        y: Math.sin(xAxisRotationRadians) * transformedCenter.x +
            Math.cos(xAxisRotationRadians) * transformedCenter.y +
            (p0.y + p1.y) / 2,
    };
    const startVector = {
        x: (transformedPoint.x - transformedCenter.x) / rx,
        y: (transformedPoint.y - transformedCenter.y) / ry,
    };
    const startAngle = angleBetween({
        x: 1,
        y: 0,
    }, startVector);
    const endVector = {
        x: (-transformedPoint.x - transformedCenter.x) / rx,
        y: (-transformedPoint.y - transformedCenter.y) / ry,
    };
    let sweepAngle = angleBetween(startVector, endVector);
    if (!sweepFlag && sweepAngle > 0) {
        sweepAngle -= 2 * PI;
    }
    else if (sweepFlag && sweepAngle < 0) {
        sweepAngle += 2 * PI;
    }
    sweepAngle %= 2 * PI;
    const angle = startAngle + sweepAngle * t;
    const ellipseComponentX = rx * Math.cos(angle);
    const ellipseComponentY = ry * Math.sin(angle);
    const point = {
        x: Math.cos(xAxisRotationRadians) * ellipseComponentX -
            Math.sin(xAxisRotationRadians) * ellipseComponentY +
            center.x,
        y: Math.sin(xAxisRotationRadians) * ellipseComponentX +
            Math.cos(xAxisRotationRadians) * ellipseComponentY +
            center.y,
        ellipticalArcStartAngle: startAngle,
        ellipticalArcEndAngle: startAngle + sweepAngle,
        ellipticalArcAngle: angle,
        ellipticalArcCenter: center,
        resultantRx: rx,
        resultantRy: ry,
        transformedPoint: transformedPoint,
    };
    return point;
}
const mod = (x, m) => {
    return ((x % m) + m) % m;
};
const toRadians = (angle) => {
    return angle * (PI / 180);
};
const distance = (p0, p1) => {
    return Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
};
const clamp = (val, min, max) => {
    return Math.min(Math.max(val, min), max);
};
const angleBetween = (v0, v1) => {
    const p = v0.x * v1.x + v0.y * v1.y;
    const n = Math.sqrt((Math.pow(v0.x, 2) + Math.pow(v0.y, 2)) *
        (Math.pow(v1.x, 2) + Math.pow(v1.y, 2)));
    const sign = v0.x * v1.y - v0.y * v1.x < 0 ? -1 : 1;
    const angle = sign * Math.acos(p / n);
    return angle;
};
