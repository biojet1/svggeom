import { Vector } from '../vector.js';
import { SegmentSE } from './segmentse.js';
import { quad_bbox, quad_length, quad_point_at, quad_slope_at, quad_split_at } from './quadhelp.js';
export class Quadratic extends SegmentSE {
    c;
    constructor(p1, control, p2) {
        super(Vector.new(p1), Vector.new(p2));
        this.c = Vector.new(control);
    }
    get _qpts() {
        const { from, c, to } = this;
        return [from, c, to];
    }
    get length() {
        return quad_length(this._qpts);
    }
    slopeAt(t) {
        return quad_slope_at(this._qpts, t);
    }
    pointAt(t) {
        return quad_point_at(this._qpts, t);
    }
    splitAt(t) {
        const [a, b] = quad_split_at(this._qpts, t);
        return [new Quadratic(a[0], a[1], a[2]), new Quadratic(b[0], b[1], b[2])];
    }
    bbox() {
        return quad_bbox(this._qpts);
    }
    toPathFragment() {
        const { c: [cx, cy], to: [x, y] } = this;
        return ['Q', cx, cy, x, y];
    }
    transform(M) {
        const { from, c, to } = this;
        return new Quadratic(from.transform(M), c.transform(M), to.transform(M));
    }
    reversed() {
        const { from, c, to } = this;
        return new Quadratic(to, c, from);
    }
}
//# sourceMappingURL=quadratic.js.map