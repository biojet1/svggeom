import { Segment } from '../index.js';
import { Vector } from '../../vector.js';
export declare abstract class SegmentSE extends Segment {
    private readonly _start;
    private readonly _end;
    constructor(from: Iterable<number>, to: Iterable<number>);
    get from(): Vector;
    get to(): Vector;
    abstract transform(M: any): SegmentSE;
    abstract reversed(): SegmentSE;
    abstract split_at(t: number): [SegmentSE, SegmentSE];
    cutAt(t: number): SegmentSE;
    cropAt(t0: number, t1: number): SegmentSE | undefined;
}
