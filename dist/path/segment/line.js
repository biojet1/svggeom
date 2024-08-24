import { BoundingBox } from '../../bbox.js';
import { tNorm } from '../index.js';
import { SegmentSE } from './segmentse.js';
class LineSegment extends SegmentSE {
    bbox() {
        const { from: [p1x, p1y], to: [p2x, p2y], } = this;
        const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
        const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
        return BoundingBox.extrema(xmin, xmax, ymin, ymax);
    }
    get length() {
        const { from, to } = this;
        return to.sub(from).abs();
    }
    point_at(t) {
        const { from, to } = this;
        return to.sub(from).mul(tNorm(t)).post_add(from);
    }
    slope_at(t) {
        const { from, to } = this;
        const vec = to.sub(from);
        return vec.div(vec.abs());
    }
    split_at(t) {
        const { from, to } = this;
        const c = this.point_at(t);
        return [this.newFromTo(from, c), this.newFromTo(c, to)];
    }
    transform(M) {
        const { from, to } = this;
        return this.newFromTo(from.transform(M), to.transform(M));
    }
    reversed() {
        const { from, to } = this;
        return this.newFromTo(to, from);
    }
    toPathFragment(opt) {
        const { to: [x, y] } = this;
        return ['L', x, y];
    }
}
export class Line extends LineSegment {
    constructor(from, to) {
        super(from, to);
    }
    newFromTo(a, b) {
        return new Line(a, b);
    }
}
export class Close extends Line {
    toPathFragment() {
        return ['Z'];
    }
    toPath() {
        return 'Z';
    }
    newFromTo(a, b) {
        return new Close(a, b);
    }
}
export class Horizontal extends Line {
}
export class Vertical extends Line {
}
export { Line as LineSegment };
//# sourceMappingURL=line.js.map