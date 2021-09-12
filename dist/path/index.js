import { Point } from '../point.js';
import { Box } from '../box.js';
export class Segment {
    p1;
    p2;
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }
    toPath() {
        return ['M', this.p1.x, this.p1.y].concat(this.toPathFragment()).join(' ');
    }
    cutAt(t) {
        return t < 0 ? this.splitAt(-t)[1] : this.splitAt(t)[0];
    }
    tangentAt(t) {
        const vec = this.slopeAt(t);
        return vec.div(vec.abs());
    }
    cropAt(t0, t1) {
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
                return this.cutAt(-t0);
            }
            else if (t0 < t1) {
                return this.cutAt(-t0).cutAt((t1 - t0) / (1 - t0));
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
export class Line extends Segment {
    constructor(p1, p2) {
        super(Point.from(p1), Point.from(p2));
    }
    bbox() {
        const { p1: { x: p1x, y: p1y }, p2: { x: p2x, y: p2y }, } = this;
        const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
        const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
        return new Box([xmin, ymin, xmax - xmin, ymax - ymin]);
    }
    length() {
        return this.p2.sub(this.p1).abs();
    }
    pointAt(t) {
        const { p1, p2 } = this;
        return p1.add(p2.sub(p1).mul(t));
    }
    toPathFragment() {
        const { p2: { x, y }, } = this;
        return ['L', x, y];
    }
    slopeAt(t) {
        const vec = this.p2.sub(this.p1);
        return vec.div(vec.abs());
    }
    transform(M) {
        const { p1, p2 } = this;
        return new Line(p1.transform(M), p2.transform(M));
    }
    splitAt(t) {
        const { p1, p2 } = this;
        const c = this.pointAt(t);
        return [new Line(p1, c), new Line(c, p2)];
    }
    reversed() {
        const { p1, p2 } = this;
        return new Line(p2, p1);
    }
}
export class Close extends Line {
    toPathFragment() {
        return ['Z'];
    }
    toPath() {
        return 'Z';
    }
    transform(M) {
        const { p1, p2 } = this;
        return new Close(p1.transform(M), p2.transform(M));
    }
    splitAt(t) {
        const { p1, p2 } = this;
        const c = this.pointAt(t);
        return [new Line(p1, c), new Close(c, p2)];
    }
}
export class Horizontal extends Line {
}
export class Vertical extends Line {
}
