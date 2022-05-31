import { Vec } from '../point.js';
export class Segment {
    get firstPoint() {
        return this.start;
    }
    get lastPoint() {
        return this.end;
    }
    toPath() {
        const { x, y } = this.start;
        return ['M', x, y].concat(this.toPathFragment()).join(' ');
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
export class SegmentSE extends Segment {
    _start;
    _end;
    constructor(start, end) {
        super();
        this._start = Vec.new(start);
        this._end = Vec.new(end);
    }
    get start() {
        return this._start;
    }
    get end() {
        return this._end;
    }
}
export class LinkedSegment extends Segment {
    _prev;
    _end;
    constructor(prev, end) {
        super();
        this._prev = prev;
        this._end = Vec.new(end);
    }
    get start() {
        return this._prev._end;
    }
    get end() {
        return this._end;
    }
}
//# sourceMappingURL=index.js.map