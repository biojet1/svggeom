import { Vector } from '../../vector.js';
export class Cubic extends SegmentSE {
    c1;
    c2;
    t_value;
    constructor(from, c1, c2, to) {
        super(from, to);
        this.c1 = Vector.new(c1);
        this.c2 = Vector.new(c2);
    }
    new(from, c1, c2, to) {
        return new Cubic(from, c1, c2, to);
    }
    get _cpts() {
        const { from, c1, c2, to } = this;
        return [from, c1, c2, to];
    }
    bbox() {
        return cubic_box(this._cpts);
    }
    point_at(t) {
        return cubic_point_at(this._cpts, t);
    }
    split_at(z) {
        const [x, y] = cubic_split_at(this._cpts, z);
        return [this.new(x[0], x[1], x[2], x[3]), this.new(y[0], y[1], y[2], y[3])];
    }
    get length() {
        return cubic_length(this._cpts);
    }
    slope_at(t) {
        return cubic_slope_at(this._cpts, t);
    }
    toPathFragment() {
        const { c1: [x1, y1], c2: [x2, y2], to: [x3, y3], } = this;
        return ['C', x1, y1, x2, y2, x3, y3];
    }
    transform(M) {
        const { from, c1, c2, to } = this;
        return this.new(from.transform(M), c1.transform(M), c2.transform(M), to.transform(M));
    }
    reversed() {
        const { from, c1, c2, to } = this;
        return this.new(to, c2, c1, from);
    }
}
export { Cubic as CubicSegment };
import { SegmentSE } from './segmentse.js';
import { cubic_box, cubic_length, cubic_point_at, cubic_slope_at, cubic_split_at } from '../cubichelp.js';
//# sourceMappingURL=cubic.js.map