import { Segment, tNorm } from '../index.js';
import { Vector } from '../../vector.js';


export abstract class SegmentSE extends Segment {
    private readonly _start: Vector;
    private readonly _end: Vector;

    constructor(from: Iterable<number>, to: Iterable<number>) {
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

    abstract transform(M: any): SegmentSE;
    abstract reversed(): SegmentSE;
    abstract split_at(t: number): [SegmentSE, SegmentSE];
    cutAt(t: number): SegmentSE {
        return t < 0 ? this.split_at(1 + t)[1] : this.split_at(t)[0];
    }
    cropAt(t0: number, t1: number): SegmentSE | undefined {
        t0 = tNorm(t0);
        t1 = tNorm(t1);
        if (t0 <= 0) {
            if (t1 >= 1) {
                return this;
            } else if (t1 > 0) {
                return this.cutAt(t1); // t1 < 1
            }
        } else if (t0 < 1) {
            if (t1 >= 1) {
                return this.cutAt(t0 - 1);
            } else if (t0 < t1) {
                return this.cutAt(t0 - 1).cutAt((t1 - t0) / (1 - t0));
            } else if (t0 > t1) {
                return this.cropAt(t1, t0); // t1 < 1
            }
        } else if (t1 < 1) {
            return this.cropAt(t1, t0); // t0 >= 1
        }
    }
}
