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
    point_along(d) {
        const { pos, dir } = this;
        return pos.add(Vector.polar(d, dir.radians));
    }
    delta(x, y) {
        return Pt(x, y).subtract(this.pos);
    }
    side(x, y) {
        const { pos, dir } = this;
        const [Ax, Ay] = pos;
        const [Bx, By] = pos.add(dir);
        const [X, Y] = Pt(x, y);
        const d = (Bx - Ax) * (Y - Ay) - (By - Ay) * (X - Ax);
        return d > 0 ? 1 : d < 0 ? -1 : 0;
    }
    distance_from_line(a, b) {
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
    nearest_point_of_line(a, b) {
        return this.pos.nearest_point_of_line(a, b);
    }
    intersect_of_line(a, b) {
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
    intersect_of_ray(r) {
        const { pos, dir } = this;
        return r.intersect_of_line(pos, pos.add(dir));
    }
    nearest_point_from_point(p) {
        const { pos, dir } = this;
        return Vector.new(p).nearest_point_of_line(pos, pos.add(dir));
    }
}
export class Ray extends VecRay {
    clone() {
        const { pos, dir } = this;
        return new Ray(pos, dir);
    }
    new_pos(v) {
        return new Ray(v, this.dir);
    }
    new_dir(v) {
        return new Ray(this.pos, v);
    }
    new_ray(p, a) {
        return new Ray(p, a);
    }
    with_dir(rad) {
        if (typeof rad === 'object') {
            return this.new_dir(Vector.pos(...rad));
        }
        else {
            return this.new_dir(Vector.radians(rad));
        }
    }
    with_h(h = 0) {
        const { v } = this;
        return this.new_dir(Vector.pos(h, v));
    }
    with_v(v = 0) {
        const { h } = this;
        return this.new_dir(Vector.pos(h, v));
    }
    with_x(x = 0) {
        const { pos } = this;
        return this.new_pos(pos.with_x(x));
    }
    with_y(y = 0) {
        const { pos } = this;
        return this.new_pos(pos.with_y(y));
    }
    with_z(z = 0) {
        const { pos } = this;
        return this.new_pos(pos.with_z(z));
    }
    shift_x(d) {
        return this.new_pos(this.pos.shift_x(d));
    }
    shift_y(d) {
        return this.new_pos(this.pos.shift_y(d));
    }
    shift_z(d) {
        return this.new_pos(this.pos.shift_z(d));
    }
    flip_x() {
        return this.new_pos(this.pos.flip_x());
    }
    flip_y() {
        return this.new_pos(this.pos.flip_y());
    }
    flip_z() {
        return this.new_pos(this.pos.flip_z());
    }
    goto(x, y) {
        return this.new_pos(Pt(x, y));
    }
    forward(d) {
        const { pos, dir } = this;
        return this.new_pos(dir.normalize().multiply(d).post_add(pos));
    }
    back(d) {
        if (d) {
            return this.forward(-d);
        }
        else {
            return this.new_dir(this.dir.multiply(-1));
        }
    }
    translate(x, y) {
        const { pos } = this;
        return this.new_pos(Pt(x, y).post_add(pos));
    }
    along(t, x, y) {
        const { pos } = this;
        return this.new_pos(Pt(x, y).subtract(pos).multiply(t).post_add(pos));
    }
    turn(rad) {
        if (typeof rad === 'object') {
            return this.new_dir(Vector.pos(...rad));
        }
        else {
            return this.new_dir(Vector.radians(rad));
        }
    }
    left(rad) {
        switch (rad) {
            case undefined:
                const { h, v } = this;
                return this.new_dir(Vector.pos(-v, h));
            default:
                return this.new_dir(this.dir.rotated(rad));
        }
    }
    right(rad) {
        if (rad === undefined) {
            const { h, v } = this;
            return this.new_dir(Vector.pos(v, -h));
        }
        else {
            return this.new_dir(this.dir.rotated(-rad));
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
        return this.new_dir(Pt(x, y).subtract(this.pos));
    }
    away(x, y) {
        return this.new_dir(this.pos.subtract(Pt(x, y)));
    }
    after(x, y) {
        const v = Pt(x, y);
        return this.new_ray(v, this.pos.subtract(v));
    }
    before(x, y) {
        const v = Pt(x, y);
        return this.new_ray(v, v.subtract(this.pos));
    }
    normal_to_side(a) {
        const s = this.side(a);
        const { dir: [x, y] } = this;
        if (s > 0) {
            return this.new_dir(Vector.pos(-y, x));
        }
        else if (s < 0) {
            return this.new_dir(Vector.pos(y, -x));
        }
        return this;
    }
    normal_to_line(a, b) {
        return this.new_dir(this.nearest_point_of_line(a, b).subtract(this.pos));
    }
    to_nearest_point_of_line(a, b) {
        return this.new_pos(this.nearest_point_of_line(a, b));
    }
    to_nearest_point_from_point(p) {
        const { pos, dir } = this;
        return this.new_pos(Ray.pos(p).nearest_point_of_line(pos, pos.add(dir)));
    }
    to_point_t(t, a, b) {
        return this.new_pos(Vector.subtract(b, a).multiply(t).add(a));
    }
    to_mid_point(a, b) {
        return this.to_point_t(0.5, a, b);
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
    new_pos(v) {
        return new RayL(v, this.dir, this);
    }
    new_dir(v) {
        return new RayL(this.pos, v, this);
    }
    new_ray(p, a) {
        return new RayL(p, a, this);
    }
}
//# sourceMappingURL=ray.js.map