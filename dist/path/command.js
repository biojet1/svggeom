import { tCheck } from './index.js';
import { BoundingBox } from "../bbox";
import { Vector } from "../vector";
const { min, max, abs, PI, cos, sin, sqrt, acos, tan } = Math;
export class Command {
}
export class CommandLink extends Command {
    _prev;
    _to;
    static get digits() {
        return CommandLink.digits;
    }
    static set digits(n) {
        CommandLink.digits = n;
    }
    constructor(prev, to) {
        super();
        this._prev = prev;
        this._to = to;
    }
    get prev() {
        const { _prev } = this;
        if (_prev) {
            return _prev;
        }
        throw new Error('No prev');
    }
    get from() {
        const { _prev } = this;
        if (_prev) {
            return _prev.to;
        }
        throw new Error('No prev');
    }
    get to() {
        return this._to;
    }
    get first() {
        let cur = this;
        while (cur) {
            const _prev = cur._prev;
            if (_prev) {
                cur = _prev;
            }
            else {
                break;
            }
        }
        return cur;
    }
    get last_move() {
        for (let cur = this; cur; cur = cur._prev) {
            if (cur instanceof MoveCL) {
                return cur;
            }
        }
    }
    bbox() {
        return BoundingBox.not();
    }
    segment_len() {
        return this.length;
    }
    as_curve() {
        let { _prev } = this;
        if (_prev) {
            const newPrev = _prev.as_curve();
            if (newPrev !== _prev) {
                return this.with_prev(newPrev);
            }
        }
        return this;
    }
    move_to(p) {
        return new MoveCL(this, new Vector(p));
    }
    line_to(p) {
        return new LineCL(this, new Vector(p));
    }
    curve_to(c1, c2, p2) {
        return new CubicCL(this, new Vector(c1), new Vector(c2), new Vector(p2));
    }
    quad_to(c, p) {
        return new QuadCL(this, new Vector(c), new Vector(p));
    }
    M(p) {
        return this.move_to(p);
    }
    m(p) {
        return this.move_to(this.to.add(p));
    }
    Z() {
        const to = this.last_move?.to;
        if (to) {
            return new CloseCL(this, to);
        }
        return this;
    }
    z() {
        return this.Z();
    }
    L(p) {
        return this.line_to(p);
    }
    l(p) {
        return this.line_to(this.to.add(p));
    }
    H(n) {
        return this.line_to(this.to.with_x(n));
    }
    h(n) {
        return this.line_to(this.to.shift_x(n));
    }
    V(n) {
        return this.line_to(this.to.with_y(n));
    }
    v(n) {
        return this.line_to(this.to.shift_y(n));
    }
    Q(c, p) {
        return this.quad_to(c, p);
    }
    q(c, p) {
        const { to: rel } = this;
        return this.quad_to(rel.add(c), rel.add(p));
    }
    C(c1, c2, p2) {
        return this.curve_to(c1, c2, p2);
    }
    c(c1, c2, p2) {
        const { to: rel } = this;
        return this.curve_to(rel.add(c1), rel.add(c2), rel.add(p2));
    }
    S(c, p) {
        const { to } = this;
        if (this instanceof CubicCL) {
            return this.curve_to(this.c2.reflect_at(to), c, p);
        }
        else {
            return this.curve_to(to, c, p);
        }
    }
    s(c, p) {
        const { to } = this;
        if (this instanceof CubicCL) {
            return this.curve_to(this.c2.reflect_at(to), to.add(c), to.add(p));
        }
        else {
            return this.curve_to(to, to.add(c), to.add(p));
        }
    }
    T(p) {
        const { to } = this;
        if (this instanceof QuadCL) {
            return this.quad_to(this.p.reflect_at(to), p);
        }
        else {
            return this.quad_to(to, p);
        }
    }
    t(p) {
        const { to } = this;
        if (this instanceof QuadCL) {
            return this.quad_to(this.p.reflect_at(to), to.add(p));
        }
        else {
            return this.quad_to(to, to.add(p));
        }
    }
    A(rx, ry, φ, bigArc, sweep, p) {
        return new ArcCL(this, rx, ry, φ, bigArc, sweep, new Vector(p));
    }
    a(rx, ry, φ, bigArc, sweep, p) {
        const { to: rel } = this;
        return new ArcCL(this, rx, ry, φ, bigArc, sweep, rel.add(p));
    }
    static move_to(p) {
        return new MoveCL(undefined, new Vector(p));
    }
    static line_to(p) {
        return this.move_to([0, 0]).line_to(p);
    }
    static curve_to(c1, c2, p2) {
        return this.move_to([0, 0]).curve_to(c1, c2, p2);
    }
    static quad_to(c, p) {
        return this.move_to([0, 0]).quad_to(c, p);
    }
    static parse(d) {
        return parseCL(d, undefined);
    }
}
export class LineCL extends CommandLink {
    bbox() {
        const { to: [x2, y2], _prev, } = this;
        if (_prev) {
            const [x1, y1] = _prev.to;
            const [xmin, xmax] = [min(x1, x2), max(x1, x2)];
            const [ymin, ymax] = [min(y1, y2), max(y1, y2)];
            return BoundingBox.extrema(xmin, xmax, ymin, ymax);
        }
        return BoundingBox.not();
    }
    get length() {
        const { from, to } = this;
        return to.sub(from).abs();
    }
    point_at(t) {
        const { from, to } = this;
        return to.sub(from).mul(tCheck(t)).post_add(from);
    }
    slope_at(_) {
        const { from, to } = this;
        const vec = to.sub(from);
        return vec.div(vec.abs());
    }
    split_at(t) {
        const { to } = this;
        const c = this.point_at(t);
        return [new LineCL(this._prev, c), new LineCL(new MoveCL(undefined, c), to)];
    }
    _descs(opt) {
        const { to: [x, y], } = this;
        if (opt) {
            const { relative, short } = opt;
            const { _prev } = this;
            if (_prev) {
                const [sx, sy] = _prev.to;
                if (relative) {
                    if (short) {
                        if (sx === x) {
                            return ['v', y - sy];
                        }
                        else if (sy === y) {
                            return ['h', x - sx];
                        }
                    }
                    return ['l', x - sx, y - sy];
                }
                else if (short) {
                    if (sx === x) {
                        return ['V', y];
                    }
                    else if (sy === y) {
                        return ['H', x];
                    }
                }
            }
        }
        return ['L', x, y];
    }
    reversed(next) {
        const { to, _prev } = this;
        next || (next = new MoveCL(undefined, to));
        if (_prev) {
            const rev = new LineCL(next, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    transform(M) {
        const { to, _prev } = this;
        return new LineCL(_prev?.transform(M), to.transform(M));
    }
    with_prev(newPrev) {
        const { to } = this;
        return new LineCL(newPrev, to);
    }
}
export class MoveCL extends LineCL {
    _descs(opt) {
        const { to: [x, y], } = this;
        if (opt?.relative) {
            const { _prev } = this;
            if (_prev) {
                const [sx, sy] = _prev.to;
                return ['m', x - sx, y - sy];
            }
            return ['m', x, y];
        }
        return ['M', x, y];
    }
    split_at(t) {
        const { to } = this;
        const c = this.point_at(t);
        return [new MoveCL(this._prev, c), new MoveCL(new MoveCL(undefined, c), to)];
    }
    transform(M) {
        const { to, _prev } = this;
        return new MoveCL(_prev?.transform(M), to.transform(M));
    }
    reversed(next) {
        const { _prev } = this;
        if (_prev) {
            const seg = new MoveCL(next, _prev.to);
            return _prev.reversed(seg) ?? seg;
        }
        else {
            return next;
        }
    }
    with_prev(prev) {
        const { to } = this;
        return new MoveCL(prev, to);
    }
    segment_len() {
        return 0;
    }
}
export class CloseCL extends LineCL {
    split_at(t) {
        const { to } = this;
        const c = this.point_at(t);
        return [new LineCL(this._prev, c), new CloseCL(new MoveCL(undefined, c), to)];
    }
    transform(M) {
        const { to, _prev } = this;
        return new CloseCL(_prev?.transform(M), to.transform(M));
    }
    _descs(opt) {
        if (opt) {
            const { relative, close } = opt;
            if (close === false) {
                return super._descs(opt);
            }
            else if (relative) {
                return ['z'];
            }
        }
        return ['Z'];
    }
    reversed(next) {
        const { to, _prev } = this;
        next || (next = new MoveCL(undefined, to));
        if (_prev) {
            const rev = new LineCL(next, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    with_prev(prev) {
        const { to } = this;
        return new CloseCL(prev, to);
    }
}
import { quad_split_at, quad_slope_at, quad_point_at, quad_bbox } from './quadhelp.js';
import { quad_length } from './quadhelp.js';
export class QuadCL extends CommandLink {
    p;
    constructor(prev, p, to) {
        super(prev, to);
        this.p = p;
    }
    get _qpts() {
        const { from, p, to } = this;
        return [from, p, to];
    }
    get length() {
        return quad_length(this._qpts);
    }
    slope_at(t) {
        return quad_slope_at(this._qpts, tCheck(t));
    }
    point_at(t) {
        return quad_point_at(this._qpts, tCheck(t));
    }
    split_at(t) {
        const [a, b] = quad_split_at(this._qpts, tCheck(t));
        return [new QuadCL(this._prev, a[1], a[2]), new QuadCL(new MoveCL(undefined, b[0]), b[1], b[2])];
    }
    bbox() {
        const { _prev } = this;
        return _prev ? quad_bbox(this._qpts) : BoundingBox.not();
    }
    _descs(opt) {
        const { p: [x1, y1], to: [ex, ey], } = this;
        if (opt) {
            const { relative, smooth } = opt;
            const { p, _prev } = this;
            if (_prev) {
                const [sx, sy] = _prev.to;
                if (smooth && (_prev instanceof QuadCL ? _prev.p.reflect_at(_prev.to).close_to(p) : _prev.to.close_to(p))) {
                    return relative ? ['t', ex - sx, ey - sy] : ['T', ex, ey];
                }
                else if (relative) {
                    return ['q', x1 - sx, y1 - sy, ex - sx, ey - sy];
                }
            }
        }
        return ['Q', x1, y1, ex, ey];
    }
    reversed(next) {
        const { to, p, _prev } = this;
        next || (next = new MoveCL(undefined, to));
        if (_prev) {
            const rev = new QuadCL(next, p, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    transform(M) {
        const { p, to, _prev } = this;
        return new QuadCL(_prev?.transform(M), p.transform(M), to.transform(M));
    }
    with_prev(prev) {
        const { p, to } = this;
        return new QuadCL(prev, p, to);
    }
}
import { cubic_length, cubic_slope_at, cubic_point_at, cubic_box, cubic_split_at } from './cubichelp.js';
export class CubicCL extends CommandLink {
    c1;
    c2;
    constructor(prev, c1, c2, to) {
        super(prev, to);
        this.c1 = c1;
        this.c2 = c2;
    }
    get _cpts() {
        const { from, c1, c2, to } = this;
        return [from, c1, c2, to];
    }
    point_at(t) {
        return cubic_point_at(this._cpts, tCheck(t));
    }
    bbox() {
        const { _prev } = this;
        return _prev ? cubic_box(this._cpts) : BoundingBox.not();
    }
    slope_at(t) {
        return cubic_slope_at(this._cpts, tCheck(t));
    }
    split_at(t) {
        const { _prev, _cpts } = this;
        const [a, b] = cubic_split_at(_cpts, tCheck(t));
        return [
            new CubicCL(_prev, Vector.new(a[1]), Vector.new(a[2]), Vector.new(a[3])),
            new CubicCL(new MoveCL(undefined, Vector.new(b[0])), Vector.new(b[1]), Vector.new(b[2]), Vector.new(b[3]))
        ];
    }
    get length() {
        return cubic_length(this._cpts);
    }
    reversed(next) {
        const { to, c1, c2, _prev } = this;
        next || (next = new MoveCL(undefined, to));
        if (_prev) {
            const rev = new CubicCL(next, c2, c1, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    transform(M) {
        const { c1, c2, to, _prev } = this;
        return new CubicCL(_prev?.transform(M), c1.transform(M), c2.transform(M), to.transform(M));
    }
    _descs(opt) {
        const { c1: [x1, y1], c2: [x2, y2], to: [ex, ey], } = this;
        if (opt) {
            const { smooth, relative } = opt;
            const { c1, _prev } = this;
            if (_prev) {
                const { to: from } = _prev;
                const [sx, sy] = from;
                if (smooth && (_prev instanceof CubicCL ? _prev.c2.reflect_at(from).close_to(c1) : from.close_to(c1))) {
                    return relative ? ['s', x2 - sx, y2 - sy, ex - sx, ey - sy] : ['S', x2, y2, ex, ey];
                }
                else if (relative) {
                    return ['c', x1 - sx, y1 - sy, x2 - sx, y2 - sy, ex - sx, ey - sy];
                }
            }
        }
        return ['C', x1, y1, x2, y2, ex, ey];
    }
    with_prev(prev) {
        const { c1, c2, to } = this;
        return new CubicCL(prev, c1, c2, to);
    }
}
import { arc_bbox, arc_length, arc_point_at, arc_slope_at, arc_transform } from './archelp.js';
import { arc_params, arc_to_curve } from './archelp.js';
export class ArcCL extends CommandLink {
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
    constructor(prev, rx, ry, φ, bigArc, sweep, to) {
        if (!(isFinite(φ) && isFinite(rx) && isFinite(ry)))
            throw Error(`${JSON.stringify(arguments)}`);
        super(prev, to);
        const [x1, y1] = this.from;
        const [x2, y2] = this.to;
        [this.phi, this.rx, this.ry, this.sinφ, this.cosφ, this.cx, this.cy, this.rtheta, this.rdelta] = arc_params(x1, y1, rx, ry, φ, (this.bigArc = !!bigArc), (this.sweep = !!sweep), x2, y2);
    }
    bbox() {
        const { _prev } = this;
        return _prev ? arc_bbox(this) : BoundingBox.not();
    }
    get length() {
        return arc_length(this);
    }
    point_at(t) {
        return arc_point_at(this, tCheck(t));
    }
    slope_at(t) {
        return arc_slope_at(this, tCheck(t));
    }
    split_at(t) {
        const { rx, ry, phi, sweep, rdelta, to, _prev } = this;
        const deltaA = abs(rdelta);
        const mid = arc_point_at(this, tCheck(t));
        return [
            new ArcCL(_prev, rx, ry, phi, deltaA * t > PI, sweep, mid),
            new ArcCL(new MoveCL(undefined, mid), rx, ry, phi, deltaA * (1 - t) > PI, sweep, to),
        ];
    }
    transform(M) {
        const { bigArc, to, _prev } = this;
        const [rx, ry, phi, sweep] = arc_transform(this, M);
        return new ArcCL(_prev?.transform(M), rx, ry, phi, bigArc, sweep, to.transform(M));
    }
    reversed(next) {
        const { rx, ry, phi, bigArc, sweep, to, _prev } = this;
        next || (next = new MoveCL(undefined, to));
        if (_prev) {
            const rev = new ArcCL(next, rx, ry, phi, bigArc, !sweep, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    _descs(opt) {
        const { rx, ry, phi, sweep, bigArc, to: [x, y], } = this;
        if (opt?.relative) {
            const { _prev } = this;
            if (_prev) {
                const [sx, sy] = _prev.to;
                return ['a', rx, ry, phi, bigArc ? 1 : 0, sweep ? 1 : 0, x - sx, y - sy];
            }
        }
        return ['A', rx, ry, phi, bigArc ? 1 : 0, sweep ? 1 : 0, x, y];
    }
    as_curve() {
        let { _prev, to } = this;
        if (_prev) {
            const { rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta } = this;
            const segments = arc_to_curve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
            _prev = _prev.as_curve();
            if (segments.length === 0) {
                _prev = _prev.line_to(to);
            }
            else {
                for (const s of segments) {
                    _prev = _prev?.curve_to([s[2], s[3]], [s[4], s[5]], [s[6], s[7]]);
                }
            }
            return _prev;
        }
        return CommandLink.line_to(to);
    }
    with_prev(prev) {
        const { rx, ry, phi, sweep, bigArc, to } = this;
        return new ArcCL(prev, rx, ry, phi, bigArc, sweep, to);
    }
}
function parseCL(d, prev) {
    let mat;
    const dRE = /[\s,]*(?:([MmZzLlHhVvCcSsQqTtAa])|([-+]?[0-9]*\.?[0-9]+(?:[eE][-+]?[0-9]+)?))/y;
    const peek = function () {
        const i = dRE.lastIndex;
        const m = dRE.exec(d);
        dRE.lastIndex = i;
        return m;
    };
    const get = function () {
        const m = dRE.exec(d);
        return m;
    };
    const cmd = function () {
        const m = get();
        if (m) {
            const v = m[1];
            if (v) {
                return v;
            }
            throw new Error(`Command expected '${v}' '${d}'`);
        }
    };
    const num = function () {
        const v = get()?.[2];
        if (v) {
            return parseFloat(v);
        }
        throw new Error(`Number expected '${v}' '${d}'`);
    };
    const isNum = () => peek()?.[2];
    const vec = () => Vector.pos(num(), num());
    const first = CommandLink.move_to([0, 0]);
    let cur = prev ?? first;
    let command;
    while ((command = cmd())) {
        switch (command) {
            case 'M':
                cur = cur === first ? CommandLink.move_to(vec()) : cur.M(vec());
                while (isNum() && (cur = cur.L(vec())))
                    ;
                break;
            case 'm':
                cur = cur === first ? CommandLink.move_to(vec()) : cur.m(vec());
                while (isNum() && (cur = cur.l(vec())))
                    ;
                break;
            case 'Z':
            case 'z':
                cur === first || (cur = cur.Z());
                break;
            case 'L':
                while ((cur = cur.L(vec())) && isNum())
                    ;
                break;
            case 'l':
                while ((cur = cur.l(vec())) && isNum())
                    ;
                break;
            case 'H':
                while ((cur = cur.H(num())) && isNum())
                    ;
                break;
            case 'h':
                while ((cur = cur.h(num())) && isNum())
                    ;
                break;
            case 'V':
                while ((cur = cur.V(num())) && isNum())
                    ;
                break;
            case 'v':
                while ((cur = cur.v(num())) && isNum())
                    ;
                break;
            case 'Q':
                while ((cur = cur.Q(vec(), vec())) && isNum())
                    ;
                break;
            case 'q':
                while ((cur = cur.q(vec(), vec())) && isNum())
                    ;
                break;
            case 'C':
                while ((cur = cur.C(vec(), vec(), vec())) && isNum())
                    ;
                break;
            case 'c':
                while ((cur = cur.c(vec(), vec(), vec())) && isNum())
                    ;
                break;
            case 'S':
                while ((cur = cur.S(vec(), vec())) && isNum())
                    ;
                break;
            case 's':
                while ((cur = cur.s(vec(), vec())) && isNum())
                    ;
                break;
            case 'T':
                while ((cur = cur.T(vec())) && isNum())
                    ;
                break;
            case 't':
                while ((cur = cur.t(vec())) && isNum())
                    ;
                break;
            case 'A':
                while ((cur = cur.A(num(), num(), num(), num(), num(), vec())) && isNum())
                    ;
                break;
            case 'a':
                while ((cur = cur.a(num(), num(), num(), num(), num(), vec())) && isNum())
                    ;
                break;
            default:
                throw new Error(`Invalid path command ${command} from "${d}"`);
        }
    }
    return cur;
}
//# sourceMappingURL=command.js.map