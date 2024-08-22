import { Vector } from '../vector.js';
export class Segment {
    get firstPoint() {
        return this.from;
    }
    get lastPoint() {
        return this.to;
    }
    toPath() {
        const { x, y } = this.from;
        return ['M', x, y].concat(this.toPathFragment()).join(' ');
    }
    descArray(opt) {
        const { x, y } = this.from;
        return ['M', x, y].concat(this.toPathFragment(opt));
    }
    tangentAt(t) {
        const vec = this.slopeAt(t);
        return vec.div(vec.abs());
    }
    toPathFragment(opt) {
        throw new Error('NOTIMPL');
    }
}
export class SegmentSE extends Segment {
    _start;
    _end;
    constructor(from, to) {
        super();
        this._start = Vector.new(from);
        this._end = Vector.new(to);
    }
    get from() {
        return this._start;
    }
    get to() {
        return this._end;
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
}
export function tCheck(t) {
    if (t > 1) {
        return 1;
    }
    else if (t < 0) {
        return 0;
    }
    return t;
}
export function tNorm(t) {
    if (t < 0) {
        t = 1 + (t % 1);
    }
    else if (t > 1) {
        if (0 == (t = t % 1)) {
            t = 1;
        }
    }
    return t;
}
export function* pickPos(args) {
    let n = undefined;
    for (const v of args) {
        if (typeof v == 'number') {
            if (n == undefined) {
                n = v;
            }
            else {
                yield Vector.new(n, v);
                n = undefined;
            }
        }
        else if (n != undefined) {
            throw new Error(`n == ${n}`);
        }
        else if (v instanceof Vector) {
            yield v;
        }
        else {
            yield Vector.new(v);
        }
    }
}
export function* pickNum(args) {
    for (const v of args) {
        switch (typeof v) {
            case 'number':
                yield v;
                break;
            case 'boolean':
            case 'string':
                yield v ? 1 : 0;
                break;
            default:
                if (v) {
                    const [x, y] = v;
                    yield x;
                    yield y;
                }
                else {
                    yield 0;
                }
        }
    }
}
//# sourceMappingURL=index.js.map