import { Vector } from '../vector.js';
export class Segment {
    tangent_at(t) {
        const vec = this.slope_at(t);
        return vec.div(vec.abs());
    }
    toPath() {
        const { x, y } = this.from;
        return ['M', x, y].concat(this.toPathFragment()).join(' ');
    }
    descArray(opt) {
        const { x, y } = this.from;
        return ['M', x, y].concat(this.toPathFragment(opt));
    }
    toPathFragment(opt) {
        throw new Error('NOTIMPL');
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