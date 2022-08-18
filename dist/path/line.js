import { Box } from '../box.js';
import { SegmentSE } from './index.js';
class LineSegment extends SegmentSE {
    bbox() {
        const { start: { x: p1x, y: p1y }, end: { x: p2x, y: p2y }, } = this;
        const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
        const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
        return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
    }
    get length() {
        const { start, end } = this;
        return end.sub(start).abs();
    }
    pointAt(t) {
        const { start, end } = this;
        return end.sub(start).mul(t).postAdd(start);
    }
    slopeAt(t) {
        const { start, end } = this;
        const vec = end.sub(start);
        return vec.div(vec.abs());
    }
    splitAt(t) {
        const { start, end } = this;
        const c = this.pointAt(t);
        return [this.newFromTo(start, c), this.newFromTo(c, end)];
    }
    transform(M) {
        const { start, end } = this;
        return this.newFromTo(start.transform(M), end.transform(M));
    }
    reversed() {
        const { start, end } = this;
        return this.newFromTo(end, start);
    }
    toPathFragment() {
        const { end: { x, y }, } = this;
        return ['L', x, y];
    }
}
export class Line extends LineSegment {
    constructor(start, end) {
        super(start, end);
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