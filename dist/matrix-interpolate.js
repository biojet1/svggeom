import { Matrix } from './matrix.js';
import { Vec } from './point.js';
export class MatrixInterpolate {
    static par(...arg) {
        return new Par(arg);
    }
    static seq(...arg) {
        return new Seq(arg);
    }
    static translate(x, y = 0) {
        return new Translate(x, y);
    }
    static scale(sx, sy) {
        return new Scale(sx, sy);
    }
    static rotate(θ) {
        return new Rotate(θ);
    }
    static weight(n) {
        return new Select().weight(n);
    }
    static anchor(x, y = 0) {
        return new Select().anchor(x, y);
    }
    static identity() {
        return new Identity();
    }
    static translateX(n) {
        return this.translate(n, 0);
    }
    static translateY(n) {
        return this.translate(0, n);
    }
    static scaleY(n) {
        return this.scale(1, n);
    }
    static scaleX(n) {
        return this.scale(n, 1);
    }
    static parse(...args) {
        const items = parse(args);
        return items && items.length > 1 ? new Seq(items) : items[0];
    }
    at(t, M) {
        throw new Error(`Not implemented`);
    }
}
function parse(args) {
    return args.map((item) => {
        let v, t;
        if (Array.isArray(item)) {
            t = new Par(parse(item));
        }
        else if (item instanceof Transform) {
            t = item;
        }
        else {
            if ((v = item.par)) {
                t = new Par(parse(v));
            }
            else if ((v = item.seq)) {
                t = new Seq(parse(v));
            }
            else if ((v = item.translate)) {
                if (Array.isArray(v)) {
                    t = new Translate(v[0], v[1]);
                }
                else {
                    t = new Translate(v);
                }
            }
            else if ((v = item.scale)) {
                if (Array.isArray(v)) {
                    t = new Scale(v[0], v[1]);
                }
                else {
                    t = new Scale(v);
                }
            }
            else if ((v = item.rotate)) {
                t = new Rotate(v);
            }
            else {
                throw new Error(`Unxepectd argument`);
            }
            if ((v = item.anchor)) {
                if (Array.isArray(v)) {
                    t._anchor = Vec.new(v[0], v[1]);
                }
                else {
                    t._anchor = v;
                }
            }
            if ((v = item.weight)) {
                t._weight = v;
            }
        }
        return t;
    });
}
class Transform {
    _weight;
    _anchor;
    weight(n) {
        this._weight = n;
        return this;
    }
    anchor(x, y = 0) {
        this._anchor = Vec.new(x, y);
        return this;
    }
    at(t, m) {
        throw new Error(`Not implemented`);
    }
}
const fromTo = function (t, a = 0, b = 1) {
    return a + (b - a) * t;
};
class Select extends Transform {
    new(v) {
        const { _weight, _anchor } = this;
        _weight && (v._weight = _weight);
        _anchor && (v._anchor = _anchor);
        return v;
    }
    translate(x, y = 0) {
        const t = new Translate(x, y);
        return this.new(t);
    }
    scale(n) {
        const t = new Scale(n);
        return this.new(t);
    }
    rotate(θ) {
        const t = new Rotate(θ);
        return this.new(t);
    }
}
class Translate extends Transform {
    _seg;
    constructor(x, y = 0) {
        super();
        if (x instanceof Segment) {
            this._seg = x;
        }
        else {
            this._seg = new Line(Vec.pos(0, 0), Vec.new(x, y));
        }
    }
    track(seg) {
        this._seg = seg;
    }
    at(t, m) {
        const { _seg } = this;
        const { x, y } = _seg.pointAt(t);
        return m.translate(x, y);
    }
}
class Scale extends Transform {
    n;
    constructor(sx, sy) {
        super();
        this.n = [sx, sy ?? sx];
    }
    at(t, m) {
        let { n: [sx, sy], _anchor: { x, y } = {}, } = this;
        sx = fromTo(t, 1, sx);
        sy = fromTo(t, 1, sy);
        if (x || y) {
            x = x ?? 0;
            y = y ?? 0;
            return m.translate(x, y).scale(sx, sy).translate(-x, -y);
        }
        return m.scale(sx, sy);
    }
}
class Compose extends Transform {
    comp;
    constructor(m) {
        super();
        this.comp = m.decompose();
    }
    at(t, m) {
        const { translateX, translateY, rotate, skewX, scaleX, scaleY } = this.comp;
        const m1 = (translateX || translateY) &&
            Matrix.translate(fromTo(t, 0, translateX), fromTo(t, 0, translateY));
        const m2 = rotate && Matrix.rotate(rotate);
        const m3 = !(scaleX == 1 && scaleY == 1) && Matrix.scale(scaleX, scaleY);
        for (const v of [m1, m2, m3]) {
            v && (m = m ? m.multiply(v) : v);
        }
        return m ?? Matrix.identity();
    }
}
class Rotate extends Transform {
    θ;
    constructor(θ) {
        super();
        this.θ = θ;
    }
    at(t, m) {
        let { θ, _anchor: { x, y } = {} } = this;
        θ = fromTo(t, 0, θ);
        if (x || y) {
            x = x ?? 0;
            y = y ?? 0;
            return m.translate(x, y).rotate(θ).translate(-x, -y);
        }
        return m.rotate(θ);
    }
}
class Identity extends Transform {
    at(t, m) {
        return m;
    }
}
class Transforms extends Transform {
    items;
    constructor(items) {
        super();
        this.items = items;
    }
}
class Seq extends Transforms {
    at(T, m) {
        const { items } = this;
        let w_total = 0;
        for (const { _weight = 1 } of items) {
            w_total += _weight;
        }
        let w_walk = 0;
        for (const tr of items) {
            const { _weight = 1 } = tr;
            const start = w_walk / w_total;
            const end = (w_walk + _weight) / w_total;
            if (T < start) {
                break;
            }
            else if (T >= end) {
                m = tr.at(1, m);
            }
            else {
                m = tr.at((T - start) / (_weight / w_total), m);
            }
            w_walk += _weight;
        }
        return m;
    }
}
class Par extends Transforms {
    at(T, m) {
        for (const tr of this.items) {
            m = tr.at(T, m);
        }
        return m;
    }
}
import { Cubic } from './path/cubic.js';
import { Line } from './path/line.js';
import { Segment } from './path/index.js';
export function cubicTrack(h1, h2, p1, p2) {
    if (!p2) {
        p2 = p1;
        p1 = Vec.pos(0, 0);
    }
    const d = p2.distance(p1);
    const c1 = p1.add(Vec.polar(h1.abs() * d, h1.angle));
    const c2 = h2 ? p2.add(Vec.polar(h2.abs() * d, h2.angle)) : p2;
    return new Cubic(p1, c1, c2, p2);
}
export function MInterp(m1, m2) {
    const d1 = m1.decompose();
    const d2 = m2.decompose();
    if (d1.translateX == d2.translateX) {
        if (d1.translateY == d2.translateY) {
        }
    }
    do {
        if (d1.scaleX == d2.scaleX) {
            if (d1.scaleY == d2.scaleY) {
                break;
            }
        }
    } while (0);
}
//# sourceMappingURL=matrix-interpolate.js.map