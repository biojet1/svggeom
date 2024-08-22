import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Segment, tNorm, tCheck } from './index.js';
import { pickPos, pickNum } from './index.js';
import { parseLS } from './parser.js';
const { min, max, abs, PI, cos, sin, sqrt, acos, tan } = Math;
const tau = 2 * PI;
const epsilon = 1e-6;
const tauEpsilon = tau - epsilon;
let digits = 6;
function fmtN(n) {
    const v = n.toFixed(digits);
    return v.indexOf('.') < 0 ? v : v.replace(/0+$/g, '').replace(/\.$/g, '');
}
export class SegmentLS extends Segment {
    _prev;
    _to;
    static get digits() {
        return digits;
    }
    static set digits(n) {
        digits = n;
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
    get lastMove() {
        for (let cur = this; cur; cur = cur._prev) {
            if (cur instanceof MoveLS) {
                return cur;
            }
        }
    }
    *enum() {
        for (let cur = this; cur; cur = cur._prev) {
            yield cur;
        }
    }
    moveTo(...args) {
        return this.M(...args);
    }
    lineTo(...args) {
        return this.L(...args);
    }
    closePath() {
        return this.Z();
    }
    bezierCurveTo(...args) {
        return this.C(...args);
    }
    quadraticCurveTo(...args) {
        return this.Q(...args);
    }
    M(...args) {
        const [pos] = pickPos(args);
        return new MoveLS(this, pos);
    }
    m(...args) {
        const [pos] = pickPos(args);
        return new MoveLS(this, this.to.add(pos));
    }
    Z() {
        const to = this.lastMove?.to;
        if (to) {
            return new CloseLS(this, to);
        }
        return this;
    }
    z() {
        return this.Z();
    }
    L(...args) {
        const [pos] = pickPos(args);
        return new LineLS(this, pos);
    }
    l(...args) {
        const [pos] = pickPos(args);
        return new LineLS(this, this.to.add(pos));
    }
    H(n) {
        return new LineLS(this, this.to.withX(n));
    }
    h(n) {
        return new LineLS(this, this.to.shiftX(n));
    }
    V(n) {
        return new LineLS(this, this.to.withY(n));
    }
    v(n) {
        return new LineLS(this, this.to.shiftY(n));
    }
    Q(...args) {
        const [p, pE] = pickPos(args);
        return new QuadLS(this, p, pE);
    }
    q(...args) {
        const [p, pE] = pickPos(args);
        const { to: rel } = this;
        return new QuadLS(this, rel.add(p), rel.add(pE));
    }
    C(...args) {
        const [c1, c2, pE] = pickPos(args);
        return new CubicLS(this, c1, c2, pE);
    }
    c(...args) {
        const [c1, c2, pE] = pickPos(args);
        const { to: rel } = this;
        return new CubicLS(this, rel.add(c1), rel.add(c2), rel.add(pE));
    }
    S(...args) {
        const [p2, pE] = pickPos(args);
        const { to } = this;
        if (this instanceof CubicLS) {
            return new CubicLS(this, this.c2.reflectAt(to), p2, pE);
        }
        else {
            return new CubicLS(this, to, p2, pE);
        }
    }
    s(...args) {
        const [p2, pE] = pickPos(args);
        const { to } = this;
        if (this instanceof CubicLS) {
            return new CubicLS(this, this.c2.reflectAt(to), to.add(p2), to.add(pE));
        }
        else {
            return new CubicLS(this, to, to.add(p2), to.add(pE));
        }
    }
    T(...args) {
        const [pE] = pickPos(args);
        const { to } = this;
        if (this instanceof QuadLS) {
            return new QuadLS(this, this.p.reflectAt(to), pE);
        }
        else {
            return new QuadLS(this, to, pE);
        }
    }
    t(...args) {
        const [pE] = pickPos(args);
        const { to } = this;
        if (this instanceof QuadLS) {
            return new QuadLS(this, this.p.reflectAt(to), to.add(pE));
        }
        else {
            return new QuadLS(this, to, to.add(pE));
        }
    }
    A(rx, ry, φ, bigArc, sweep, ...args) {
        const [pE] = pickPos(args);
        return new ArcLS(this, rx, ry, φ, bigArc, sweep, pE);
    }
    a(rx, ry, φ, bigArc, sweep, ...args) {
        const [pE] = pickPos(args);
        const { to: rel } = this;
        return new ArcLS(this, rx, ry, φ, bigArc, sweep, rel.add(pE));
    }
    rect(...args) {
        const [xy, [w, h]] = pickPos(args);
        return this.M(xy).h(w).v(h).h(-w).z();
    }
    arc(...args) {
        const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
        return arcHelp(this, x, y, r, a0, a1, ccw);
    }
    arcd(...args) {
        const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
        return arcHelp(this, x, y, r, (a0 * PI) / 180, (a1 * PI) / 180, ccw);
    }
    arcTo(...args) {
        const [x1, y1, x2, y2, r] = pickNum(args);
        return arcToHelp(this, x1, y1, x2, y2, r);
    }
    toString() {
        return this.describe();
    }
    describe(opt) {
        const { _prev } = this;
        const [cmd, ...args] = this._descs(opt);
        const d = `${cmd}${args.map(v => fmtN(v)).join(',')}`;
        return _prev ? _prev.describe(opt) + d : d;
    }
    descArray(opt) {
        const { _prev } = this;
        if (_prev) {
            const a = _prev.descArray(opt);
            a.push(...this._descs(opt));
            return a;
        }
        else {
            return [...this._descs(opt)];
        }
    }
    cutAt(t) {
        return t < 0 ? this.splitAt(1 + t)[1] : this.splitAt(t)[0];
    }
    cropAt(t0, t1) {
        t0 = tNorm(t0);
        t1 = tNorm(t1);
        if (t0 <= 0) {
            if (t1 >= 1) {
                return this;
            }
            else if (t1 > 0) {
                return this.cutAt(t1);
            }
        }
        else if (t0 < 1) {
            if (t1 >= 1) {
                return this.cutAt(t0 - 1);
            }
            else if (t0 < t1) {
                return this.cutAt(t0 - 1).cutAt((t1 - t0) / (1 - t0));
            }
            else if (t0 > t1) {
                return this.cropAt(t1, t0);
            }
        }
        else if (t1 < 1) {
            return this.cropAt(t1, t0);
        }
    }
    pathLen() {
        const { _prev } = this;
        const len = this.segmentLen();
        return _prev ? _prev.pathLen() + len : len;
    }
    segmentLen() {
        return this.length;
    }
    bbox() {
        return Box.new();
    }
    withFarPrev(farPrev, newPrev) {
        const { _prev } = this;
        if (farPrev === this) {
            return newPrev;
        }
        else if (_prev) {
            return this.withPrev(_prev.withFarPrev(farPrev, newPrev));
        }
        else {
            throw new Error(`No prev`);
        }
    }
    withFarPrev3(farPrev, newPrev) {
        const { _prev } = this;
        if (farPrev === this) {
            return this.withPrev(newPrev);
        }
        else if (_prev) {
            return this.withPrev(_prev.withFarPrev3(farPrev, newPrev));
        }
        else {
            throw new Error(`No prev`);
        }
    }
    _asCubic() {
        let { _prev } = this;
        if (_prev) {
            const newPrev = _prev._asCubic();
            if (newPrev !== _prev) {
                return this.withPrev(newPrev);
            }
        }
        return this;
    }
    parse(d) {
        return parseLS(d, this);
    }
    static moveTo(...args) {
        const [pos] = pickPos(args);
        return new MoveLS(undefined, pos);
    }
    static lineTo(...args) {
        const [pos] = pickPos(args);
        return this.moveTo(Vec.new(0, 0)).lineTo(pos);
    }
    static bezierCurveTo(...args) {
        const [c1, c2, to] = pickPos(args);
        return this.moveTo(Vec.new(0, 0)).bezierCurveTo(c1, c2, to);
    }
    static quadraticCurveTo(...args) {
        const [p, to] = pickPos(args);
        return this.moveTo(Vec.new(0, 0)).quadraticCurveTo(p, to);
    }
    static parse(d) {
        return parseLS(d, undefined);
    }
    static arc(...args) {
        const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
        return arcHelp(undefined, x, y, r, a0, a1, ccw);
    }
    static arcd(...args) {
        const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
        return arcHelp(undefined, x, y, r, (a0 * PI) / 180, (a1 * PI) / 180, ccw);
    }
    static arcTo(...args) {
        const [x1, y1, x2, y2, r] = pickNum(args);
        return arcToHelp(undefined, x1, y1, x2, y2, r);
    }
    static rect(...args) {
        const [xy, [w, h]] = pickPos(args);
        return new MoveLS(undefined, xy).h(w).v(h).h(-w).z();
    }
}
export class LineLS extends SegmentLS {
    bbox() {
        const { to: [x2, y2], _prev, } = this;
        if (_prev) {
            const [x1, y1] = _prev.to;
            const [xmin, xmax] = [min(x1, x2), max(x1, x2)];
            const [ymin, ymax] = [min(y1, y2), max(y1, y2)];
            return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
        }
        return Box.new();
    }
    get length() {
        const { from, to } = this;
        return to.sub(from).abs();
    }
    pointAt(t) {
        const { from, to } = this;
        return to.sub(from).mul(tCheck(t)).post_add(from);
    }
    slopeAt(_) {
        const { from, to } = this;
        const vec = to.sub(from);
        return vec.div(vec.abs());
    }
    splitAt(t) {
        const { to } = this;
        const c = this.pointAt(t);
        return [new LineLS(this._prev, c), new LineLS(new MoveLS(undefined, c), to)];
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
        next || (next = new MoveLS(undefined, to));
        if (_prev) {
            const rev = new LineLS(next, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    transform(M) {
        const { to, _prev } = this;
        return new LineLS(_prev?.transform(M), to.transform(M));
    }
    withPrev(newPrev) {
        const { to } = this;
        return new LineLS(newPrev, to);
    }
}
export class MoveLS extends LineLS {
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
    splitAt(t) {
        const { to } = this;
        const c = this.pointAt(t);
        return [new MoveLS(this._prev, c), new MoveLS(new MoveLS(undefined, c), to)];
    }
    transform(M) {
        const { to, _prev } = this;
        return new MoveLS(_prev?.transform(M), to.transform(M));
    }
    reversed(next) {
        const { _prev } = this;
        if (_prev) {
            const seg = new MoveLS(next, _prev.to);
            return _prev.reversed(seg) ?? seg;
        }
        else {
            return next;
        }
    }
    withPrev(prev) {
        const { to } = this;
        return new MoveLS(prev, to);
    }
    segmentLen() {
        return 0;
    }
}
export class CloseLS extends LineLS {
    splitAt(t) {
        const { to } = this;
        const c = this.pointAt(t);
        return [new LineLS(this._prev, c), new CloseLS(new MoveLS(undefined, c), to)];
    }
    transform(M) {
        const { to, _prev } = this;
        return new CloseLS(_prev?.transform(M), to.transform(M));
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
        next || (next = new MoveLS(undefined, to));
        if (_prev) {
            const rev = new LineLS(next, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    withPrev(prev) {
        const { to } = this;
        return new CloseLS(prev, to);
    }
}
import { quadLength, quadSplitAt, quadSlopeAt, quadPointAt, quadBBox } from './quadratic.js';
export class QuadLS extends SegmentLS {
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
        return quadLength(this._qpts);
    }
    slopeAt(t) {
        return quadSlopeAt(this._qpts, tCheck(t));
    }
    pointAt(t) {
        return quadPointAt(this._qpts, tCheck(t));
    }
    splitAt(t) {
        const [a, b] = quadSplitAt(this._qpts, tCheck(t));
        return [new QuadLS(this._prev, a[1], a[2]), new QuadLS(new MoveLS(undefined, b[0]), b[1], b[2])];
    }
    bbox() {
        const { _prev } = this;
        return _prev ? quadBBox(this._qpts) : Box.new();
    }
    _descs(opt) {
        const { p: [x1, y1], to: [ex, ey], } = this;
        if (opt) {
            const { relative, smooth } = opt;
            const { p, _prev } = this;
            if (_prev) {
                const [sx, sy] = _prev.to;
                if (smooth && (_prev instanceof QuadLS ? _prev.p.reflectAt(_prev.to).closeTo(p) : _prev.to.closeTo(p))) {
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
        next || (next = new MoveLS(undefined, to));
        if (_prev) {
            const rev = new QuadLS(next, p, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    transform(M) {
        const { p, to, _prev } = this;
        return new QuadLS(_prev?.transform(M), p.transform(M), to.transform(M));
    }
    withPrev(prev) {
        const { p, to } = this;
        return new QuadLS(prev, p, to);
    }
}
import { cubicLength, cubicSlopeAt, cubicPointAt, cubicBox, cubicSplitAt } from './cubic.js';
export class CubicLS extends SegmentLS {
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
    pointAt(t) {
        return cubicPointAt(this._cpts, tCheck(t));
    }
    bbox() {
        const { _prev } = this;
        return _prev ? cubicBox(this._cpts) : Box.new();
    }
    slopeAt(t) {
        return cubicSlopeAt(this._cpts, tCheck(t));
    }
    splitAt(t) {
        const { _prev, _cpts } = this;
        const [a, b] = cubicSplitAt(_cpts, tCheck(t));
        return [new CubicLS(_prev, a[1], a[2], a[3]), new CubicLS(new MoveLS(undefined, b[0]), b[1], b[2], b[3])];
    }
    get length() {
        return cubicLength(this._cpts);
    }
    reversed(next) {
        const { to, c1, c2, _prev } = this;
        next || (next = new MoveLS(undefined, to));
        if (_prev) {
            const rev = new CubicLS(next, c2, c1, _prev.to);
            return _prev.reversed(rev) ?? rev;
        }
        else {
            return next;
        }
    }
    transform(M) {
        const { c1, c2, to, _prev } = this;
        return new CubicLS(_prev?.transform(M), c1.transform(M), c2.transform(M), to.transform(M));
    }
    _descs(opt) {
        const { c1: [x1, y1], c2: [x2, y2], to: [ex, ey], } = this;
        if (opt) {
            const { smooth, relative } = opt;
            const { c1, _prev } = this;
            if (_prev) {
                const { to: from } = _prev;
                const [sx, sy] = from;
                if (smooth && (_prev instanceof CubicLS ? _prev.c2.reflectAt(from).closeTo(c1) : from.closeTo(c1))) {
                    return relative ? ['s', x2 - sx, y2 - sy, ex - sx, ey - sy] : ['S', x2, y2, ex, ey];
                }
                else if (relative) {
                    return ['c', x1 - sx, y1 - sy, x2 - sx, y2 - sy, ex - sx, ey - sy];
                }
            }
        }
        return ['C', x1, y1, x2, y2, ex, ey];
    }
    withPrev(prev) {
        const { c1, c2, to } = this;
        return new CubicLS(prev, c1, c2, to);
    }
}
import { arcBBox, arcLength, arcPointAt, arcSlopeAt, arcTransform } from './arc.js';
import { arc_params, arc_to_curve } from './archelp.js';
export class ArcLS extends SegmentLS {
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
        return _prev ? arcBBox(this) : Box.new();
    }
    get length() {
        return arcLength(this);
    }
    pointAt(t) {
        return arcPointAt(this, tCheck(t));
    }
    slopeAt(t) {
        return arcSlopeAt(this, tCheck(t));
    }
    splitAt(t) {
        const { rx, ry, phi, sweep, rdelta, to, _prev } = this;
        const deltaA = abs(rdelta);
        const mid = arcPointAt(this, tCheck(t));
        return [
            new ArcLS(_prev, rx, ry, phi, deltaA * t > PI, sweep, mid),
            new ArcLS(new MoveLS(undefined, mid), rx, ry, phi, deltaA * (1 - t) > PI, sweep, to),
        ];
    }
    transform(M) {
        const { bigArc, to, _prev } = this;
        const [rx, ry, phi, sweep] = arcTransform(this, M);
        return new ArcLS(_prev?.transform(M), rx, ry, phi, bigArc, sweep, to.transform(M));
    }
    reversed(next) {
        const { rx, ry, phi, bigArc, sweep, to, _prev } = this;
        next || (next = new MoveLS(undefined, to));
        if (_prev) {
            const rev = new ArcLS(next, rx, ry, phi, bigArc, !sweep, _prev.to);
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
    _asCubic() {
        let { _prev, to } = this;
        if (_prev) {
            const { rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta } = this;
            const segments = arc_to_curve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
            _prev = _prev._asCubic();
            if (segments.length === 0) {
                _prev = _prev.lineTo(to);
            }
            else {
                for (const s of segments) {
                    _prev = _prev.bezierCurveTo(Vec.new(s[2], s[3]), Vec.new(s[4], s[5]), Vec.new(s[6], s[7]));
                }
            }
            return _prev;
        }
        return SegmentLS.lineTo(to);
    }
    withPrev(prev) {
        const { rx, ry, phi, sweep, bigArc, to } = this;
        return new ArcLS(prev, rx, ry, phi, bigArc, sweep, to);
    }
}
function arcHelp(cur, x, y, r, a0, a1, ccw) {
    const cw = ccw ? 0 : 1;
    const dx = r * cos(a0);
    const dy = r * sin(a0);
    const x0 = x + dx;
    const y0 = y + dy;
    if (r < 0) {
        throw new Error('negative radius: ' + r);
    }
    else if (!cur) {
        cur = new MoveLS(undefined, Vec.new(x0, y0));
    }
    else if (!cur.to.closeTo(Vec.new(x0, y0), epsilon)) {
        cur = cur.L(Vec.new(x0, y0));
    }
    let da = cw ? a1 - a0 : a0 - a1;
    if (!r) {
        return cur;
    }
    else if (da < 0) {
        da = (da % tau) + tau;
    }
    if (da > tauEpsilon) {
        return cur.A(r, r, 0, 1, cw, x - dx, y - dy).A(r, r, 0, 1, cw, x0, y0);
    }
    else if (da > epsilon) {
        return cur.A(r, r, 0, da >= PI, cw, x + r * cos(a1), y + r * sin(a1));
    }
    return cur;
}
function arcToHelp(cur, x1, y1, x2, y2, r) {
    const [x0, y0] = cur ? cur.to : [0, 0];
    const x21 = x2 - x1;
    const y21 = y2 - y1;
    const x01 = x0 - x1;
    const y01 = y0 - y1;
    const l01_2 = x01 * x01 + y01 * y01;
    if (r < 0) {
        throw new Error('negative radius: ' + r);
    }
    else if (!cur) {
        cur = new MoveLS(undefined, Vec.new(x1, y1));
    }
    else if (!(l01_2 > epsilon)) {
    }
    else if (!(abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
        cur = cur.L(Vec.new(x1, y1));
    }
    else {
        const x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = sqrt(l21_2), l01 = sqrt(l01_2), l = r * tan((PI - acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
        if (abs(t01 - 1) > epsilon) {
            cur = cur.L(Vec.new(x1 + t01 * x01, y1 + t01 * y01));
        }
        cur = cur.A(r, r, 0, 0, y01 * x20 > x01 * y20 ? 1 : 0, x1 + t21 * x21, y1 + t21 * y21);
    }
    return cur;
}
//# sourceMappingURL=linked.js.map