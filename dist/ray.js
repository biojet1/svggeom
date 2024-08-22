import { Vector } from './vector.js';
const { abs, sqrt, PI } = Math;
const TAU = PI * 2;
function* pickXY(args) {
    for (const v of args) {
        if (typeof v == 'number') {
            yield v;
        }
        else {
            const [x, y] = v;
            yield x;
            yield y;
        }
    }
}
function Pt(x, y) {
    if (typeof x === 'object') {
        return Vector.pos(...x);
    }
    else {
        return Vector.pos(x, y);
    }
}
export class VecRay {
    _pos;
    _dir;
    constructor(pos, aim) {
        this._pos = pos;
        this._dir = aim;
    }
    get x() {
        const [x,] = this.pos;
        return x;
    }
    get y() {
        const [x, y] = this.pos;
        return y;
    }
    get z() {
        const [x, y, z] = this.pos;
        return z;
    }
    get h() {
        const [x, y] = this.dir;
        return x;
    }
    get v() {
        const [x, y] = this.dir;
        return y;
    }
    get pos() {
        return this._pos;
    }
    get dir() {
        return this._dir;
    }
    *[Symbol.iterator]() {
        yield* this.pos;
    }
    at() {
        return this.pos;
    }
    distance(x, y) {
        return this.delta(x, y).abs();
    }
    pointAlong(d) {
        const { pos, dir } = this;
        return pos.add(Vector.polar(d, dir.radians));
    }
    delta(x, y) {
        return Pt(x, y).sub(this.pos);
    }
    side(x, y) {
        const { pos, dir } = this;
        const [Ax, Ay] = pos;
        const [Bx, By] = pos.add(dir);
        const [X, Y] = Pt(x, y);
        const d = (Bx - Ax) * (Y - Ay) - (By - Ay) * (X - Ax);
        return d > 0 ? 1 : d < 0 ? -1 : 0;
    }
    distanceFromLine(a, b) {
        const [x, y] = this.pos;
        const [x1, y1] = a;
        const [x2, y2] = b;
        const [dx, dy] = [x2 - x1, y2 - y1];
        if (dx && dy) {
            return abs(dx * (y1 - y) - dy * (x1 - x)) / sqrt(dx ** 2 + dy ** 2);
        }
        else if (dy) {
            return abs(x1 - x);
        }
        else if (dx) {
            return abs(y1 - y);
        }
        return NaN;
    }
    nearestPointOfLine(a, b) {
        return this.pos.nearest_point_of_line(a, b);
    }
    intersectOfLine(a, b) {
        const { pos, dir } = this;
        const [x1, y1] = a;
        const [x2, y2] = b;
        const [x3, y3] = pos;
        const [x4, y4] = pos.add(dir);
        const e1 = x1 * y2 - y1 * x2;
        const e2 = x3 * y4 - y3 * x4;
        const dx = [x1 - x2, x3 - x4];
        const dy = [y1 - y2, y3 - y4];
        const d = dx[0] * dy[1] - dy[0] * dx[1];
        return Vector.pos((e1 * dx[1] - dx[0] * e2) / d, (e1 * dy[1] - dy[0] * e2) / d);
    }
    intersectOfRay(r) {
        const { pos, dir } = this;
        return r.intersectOfLine(pos, pos.add(dir));
    }
    nearestPointFromPoint(p) {
        const { pos, dir } = this;
        return Vector.new(p).nearest_point_of_line(pos, pos.add(dir));
    }
}
export class Ray extends VecRay {
    clone() {
        const { pos, dir } = this;
        return new Ray(pos, dir);
    }
    _Pos(v) {
        return new Ray(v, this.dir);
    }
    _Dir(v) {
        return new Ray(this.pos, v);
    }
    _Set(p, a) {
        return new Ray(p, a);
    }
    withDir(rad) {
        if (typeof rad === 'object') {
            return this._Dir(Vector.pos(...rad));
        }
        else {
            return this._Dir(Vector.radians(rad));
        }
    }
    withH(h = 0) {
        const { v } = this;
        return this._Dir(Vector.pos(h, v));
    }
    withV(v = 0) {
        const { h } = this;
        return this._Dir(Vector.pos(h, v));
    }
    withX(x = 0) {
        const { pos } = this;
        return this._Pos(pos.with_x(x));
    }
    withY(y = 0) {
        const { pos } = this;
        return this._Pos(pos.with_y(y));
    }
    withZ(z = 0) {
        const { pos } = this;
        return this._Pos(pos.with_z(z));
    }
    shiftX(d) {
        return this._Pos(this.pos.shift_x(d));
    }
    shiftY(d) {
        return this._Pos(this.pos.shift_y(d));
    }
    shiftZ(d) {
        return this._Pos(this.pos.shift_z(d));
    }
    flipX() {
        return this._Pos(this.pos.flip_x());
    }
    flipY() {
        return this._Pos(this.pos.flip_y());
    }
    flipZ() {
        return this._Pos(this.pos.flip_z());
    }
    goto(x, y) {
        return this._Pos(Pt(x, y));
    }
    forward(d) {
        const { pos, dir } = this;
        return this._Pos(dir.normalize().mul(d).post_add(pos));
    }
    back(d) {
        if (d) {
            return this.forward(-d);
        }
        else {
            return this._Dir(this.dir.mul(-1));
        }
    }
    translate(x, y) {
        const { pos } = this;
        return this._Pos(Pt(x, y).post_add(pos));
    }
    along(t, x, y) {
        const { pos } = this;
        return this._Pos(Pt(x, y).sub(pos).mul(t).post_add(pos));
    }
    turn(rad) {
        if (typeof rad === 'object') {
            return this._Dir(Vector.pos(...rad));
        }
        else {
            return this._Dir(Vector.radians(rad));
        }
    }
    left(rad) {
        switch (rad) {
            case undefined:
                const { h, v } = this;
                return this._Dir(Vector.pos(-v, h));
            default:
                return this._Dir(this.dir.rotated(rad));
        }
    }
    right(rad) {
        if (rad === undefined) {
            const { h, v } = this;
            return this._Dir(Vector.pos(v, -h));
        }
        else {
            return this._Dir(this.dir.rotated(-rad));
        }
    }
    turnd(deg) {
        return this.turn((deg * TAU) / 360);
    }
    leftd(deg) {
        return this.left((deg * TAU) / 360);
    }
    rightd(deg) {
        return this.right((deg * TAU) / 360);
    }
    towards(x, y) {
        return this._Dir(Pt(x, y).sub(this.pos));
    }
    away(x, y) {
        return this._Dir(this.pos.sub(Pt(x, y)));
    }
    after(x, y) {
        const v = Pt(x, y);
        return this._Set(v, this.pos.sub(v));
    }
    before(x, y) {
        const v = Pt(x, y);
        return this._Set(v, v.sub(this.pos));
    }
    normalToSide(a) {
        const s = this.side(a);
        const { dir: [x, y] } = this;
        if (s > 0) {
            return this._Dir(Vector.pos(-y, x));
        }
        else if (s < 0) {
            return this._Dir(Vector.pos(y, -x));
        }
        return this;
    }
    normalToLine(a, b) {
        return this._Dir(this.nearestPointOfLine(a, b).sub(this.pos));
    }
    toNearestPointOfLine(a, b) {
        return this._Pos(this.nearestPointOfLine(a, b));
    }
    toNearestPointFromPoint(p) {
        const { pos, dir } = this;
        return this._Pos(Ray.pos(p).nearestPointOfLine(pos, pos.add(dir)));
    }
    toPointT(t, a, b) {
        return this._Pos(Vector.subtract(b, a).mul(t).add(a));
    }
    toMidPoint(a, b) {
        return this.toPointT(0.5, a, b);
    }
    static new(...args) {
        const [x = 0, y = 0, h = 1, v = 0] = pickXY(args);
        return new this(Vector.pos(x, y), Vector.pos(h, v));
    }
    static pos(x, y) {
        return new this(Pt(x, y), Vector.pos(1, 0));
    }
    static at(x, y) {
        return new this(Pt(x, y), Vector.pos(1, 0));
    }
    static dir(rad) {
        if (typeof rad === 'object') {
            return new this(Vector.pos(0, 0), Vector.pos(...rad));
        }
        else {
            return new this(Vector.pos(0, 0), Vector.radians(rad));
        }
    }
    static towards(x, y) {
        return this.new().towards(Pt(x, y));
    }
    static away(x, y) {
        return this.new().away(Pt(x, y));
    }
    static after(x, y) {
        return this.new().after(Pt(x, y));
    }
    static before(x, y) {
        return this.new().before(Pt(x, y));
    }
    static get home() {
        return new this(Vector.pos(0, 0), Vector.pos(1, 0));
    }
}
export class RayL extends Ray {
    _prev;
    constructor(pos, dir, ray) {
        super(pos, dir);
        this._prev = ray;
    }
    prev() {
        return this._prev;
    }
    _Pos(v) {
        return new RayL(v, this.dir, this);
    }
    _Dir(v) {
        return new RayL(this.pos, v, this);
    }
    _Set(p, a) {
        return new RayL(p, a, this);
    }
}
//# sourceMappingURL=ray.js.map