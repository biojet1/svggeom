const { sqrt, abs, cos, sin, atan2, PI } = Math;
const TAU = PI * 2;
export class Vec {
    x;
    y;
    z;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        if (isNaN(x) || isNaN(y) || isNaN(z))
            throw TypeError(`Must be a number x=${x} y=${y} z=${z}`);
    }
    get angle() {
        return this.radians;
    }
    get radians() {
        const { x, y } = this;
        let r = atan2(y, x);
        return r < 0 ? r + TAU : r;
    }
    get degrees() {
        return (this.radians * 180) / PI;
    }
    get grade() {
        return (this.degrees * 10) / 9;
    }
    absQuad() {
        const { x, y, z } = this;
        return x * x + y * y + z * z;
    }
    abs() {
        return sqrt(this.absQuad());
    }
    closeTo(p, epsilon = 1e-12) {
        const [x1, y1, z1] = this;
        const [x2, y2 = 0, z2 = 0] = p;
        return abs(x1 - x2) < epsilon && abs(y1 - y2) < epsilon && abs(z1 - z2) < epsilon;
    }
    dot(p) {
        const [x1, y1, z1] = this;
        const [x2, y2 = 0, z2 = 0] = p;
        return x1 * x2 + y1 * y2 + z1 * z2;
    }
    cross(p) {
        const [a, b, c] = this;
        const [x, y = 0, z = 0] = p;
        return new Vec(b * z - c * y, c * x - a * z, a * y - b * x);
    }
    equals(p) {
        if (!p) {
            return false;
        }
        else if (p === this) {
            return true;
        }
        const [x1, y1, z1] = this;
        const [x2, y2 = 0, z2 = 0] = p;
        return x1 === x2 && y1 === y2 && z1 === z2;
    }
    angleTo(p) {
        return this.postSubtract(p).angle;
    }
    toString() {
        const { x, y, z } = this;
        return z ? `${x}, ${y}, ${z}` : `${x}, ${y}`;
    }
    toArray() {
        const { x, y, z } = this;
        return [x, y, z];
    }
    normal() {
        const { x, y, z } = this;
        return new Vec(y, -x, z);
    }
    onlyX() {
        const { x } = this;
        return new Vec(x, 0, 0);
    }
    onlyY() {
        const { y } = this;
        return new Vec(0, y, 0);
    }
    onlyZ() {
        const { z } = this;
        return new Vec(0, 0, z);
    }
    withX(x) {
        const { y, z } = this;
        return new Vec(x, y, z);
    }
    withY(y) {
        const { x, z } = this;
        return new Vec(x, y, z);
    }
    withZ(z) {
        const { y, x } = this;
        return new Vec(x, y, z);
    }
    div(factor) {
        const { x, y, z } = this;
        return new Vec(x / factor, y / factor, z / factor);
    }
    add(p) {
        const [x1, y1, z1] = this;
        const [x2, y2, z2 = 0] = p;
        return new Vec(x1 + x2, y1 + y2, z1 + z2);
    }
    sub(p) {
        const [x1, y1, z1] = this;
        const [x2, y2, z2 = 0] = p;
        return new Vec(x1 - x2, y1 - y2, z1 - z2);
    }
    postSubtract(p) {
        const [x1, y1 = 0, z1 = 0] = p;
        const [x2, y2, z2] = this;
        return new Vec(x1 - x2, y1 - y2, z1 - z2);
    }
    postAdd(p) {
        const [x1, y1 = 0, z1 = 0] = p;
        const [x2, y2, z2] = this;
        return new Vec(x1 + x2, y1 + y2, z1 + z2);
    }
    mul(factor) {
        const { x, y, z } = this;
        return new Vec(x * factor, y * factor, z * factor);
    }
    distance(p) {
        return this.sub(p).abs();
    }
    normalize() {
        const abs = this.abs();
        if (!abs)
            throw new TypeError(`Can't normalize vector of zero length [${this}]`);
        return this.div(abs);
    }
    reflectAt(p) {
        return this.postSubtract(p).postAdd(p);
    }
    transform(matrix) {
        const { x, y } = this;
        const { a, b, c, d, e, f } = matrix;
        return new Vec(a * x + c * y + e, b * x + d * y + f);
    }
    flipX() {
        const { x, y, z } = this;
        return new Vec(-x, y, z);
    }
    flipY() {
        const { x, y, z } = this;
        return new Vec(x, -y, z);
    }
    flipZ() {
        const { x, y, z } = this;
        return new Vec(x, y, -z);
    }
    shiftX(d) {
        const { x, y, z } = this;
        return new Vec(x + d, y, z);
    }
    shiftY(d) {
        const { x, y, z } = this;
        return new Vec(x, y + d, z);
    }
    shiftZ(d) {
        const { x, y, z } = this;
        return new Vec(x, y, z + d);
    }
    rotated(rad) {
        const { x, y, z } = this;
        const [cs, sn] = [cos(rad), sin(rad)];
        return new Vec(x * cs - y * sn, x * sn + y * cs, z);
    }
    clone() {
        return new Vec(...this);
    }
    nearestPointOfLine(a, b) {
        const a_to_p = this.sub(a);
        const a_to_b = Vec.subtract(b, a);
        const t = a_to_p.dot(a_to_b) / a_to_b.absQuad();
        return a_to_b.mul(t).postAdd(a);
    }
    *[Symbol.iterator]() {
        const { x, y, z } = this;
        yield x;
        yield y;
        yield z;
    }
    final() {
        return Object.isFrozen(this) ? this : Object.freeze(this.clone());
    }
    mut() {
        return Object.isFrozen(this) ? this.clone() : this;
    }
    static new(x, y, z) {
        switch (typeof x) {
            case 'number':
                return new this(x, y, z);
            case 'string':
                return this.parse(x);
            default:
                if (x) {
                    return new this(...x);
                }
                else {
                    return new this();
                }
        }
    }
    static at(x = 0, y = 0, z = 0) {
        return new this(x, y, z);
    }
    static pos(x = 0, y = 0, z = 0) {
        return new this(x, y, z);
    }
    static polar(radius = 1, ϕ = 0, ϴ) {
        if (ϴ == null) {
            return radius ? new this(radius * cos(ϕ), radius * sin(ϕ)) : new this();
        }
        else {
            const sinϴ = sin(ϴ);
            return radius
                ? new this(radius * cos(ϕ) * sinϴ, radius * sin(ϕ) * sinϴ, radius * cos(ϴ))
                : new this();
        }
    }
    static radians(n, r = 1) {
        return this.polar(r, n);
    }
    static degrees(ϴ, r = 1) {
        switch (ϴ) {
            case 90:
            case -270:
                return new this(0, r, 0);
            case -90:
            case 270:
                return new this(0, -r, 0);
            case 180:
            case -180:
                return new this(-r, 0, 0);
        }
        return this.radians((ϴ * PI) / 180, r);
    }
    static grade(n) {
        return this.degrees((n * 9) / 10);
    }
    static add(a, b) {
        const [x1, y1 = 0, z1 = 0] = a;
        const [x2, y2 = 0, z2 = 0] = b;
        return new this(x1 + x2, y1 + y2, z1 + z2);
    }
    static subtract(a, b) {
        const [x1, y1 = 0, z1 = 0] = a;
        const [x2, y2 = 0, z2 = 0] = b;
        return new this(x1 - x2, y1 - y2, z1 - z2);
    }
    static parse(s) {
        const a = s.split(/\</);
        if (a.length > 1) {
            const [r, ϴ] = a.map(v => parseFloat(v.trim()));
            return this.degrees(ϴ, r);
        }
        return this.pos(...s.split(/(?:\s|\,)\s*/).map(v => parseFloat(v.trim() || '0')));
    }
}
//# sourceMappingURL=point.js.map