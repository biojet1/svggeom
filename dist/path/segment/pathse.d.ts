import { BoundingBox } from '../../bbox.js';
import { DescParams } from '../index.js';
export declare class PathSE {
    static digits: number;
    private _segs;
    private _length?;
    private _lengths?;
    private constructor();
    getTotalLength(): number | undefined;
    getBBox(): BoundingBox;
    tangent_at(T: number): import("../../vector.js").Vector | undefined;
    slope_at(T: number): import("../../vector.js").Vector | undefined;
    point_at(T: number): import("../../vector.js").Vector | undefined;
    bbox(): BoundingBox;
    split_at(T: number): PathSE[] | undefined;
    cut_at(T: number): PathSE;
    crop_at(T0: number, T1?: number): PathSE;
    transform(M: any): PathSE;
    reversed(): PathSE;
    get length(): number | undefined;
    get totalLength(): number | undefined;
    point_at_length(L: number): 0 | import("../../vector.js").Vector | undefined;
    [Symbol.iterator](): IterableIterator<SegmentSE>;
    private calcLength;
    private get lengths();
    get start_point(): import("../../vector.js").Vector | undefined;
    get firstSegment(): SegmentSE | undefined;
    get end_point(): import("../../vector.js").Vector | undefined;
    get from(): import("../../vector.js").Vector | undefined;
    get to(): import("../../vector.js").Vector | undefined;
    get lastSegment(): SegmentSE | undefined;
    segment_at(T: number): [SegmentSE | undefined, number, number];
    isContinuous(): boolean;
    isClosed(): boolean;
    private enumDesc;
    terms(params?: DescParams): (string | 0 | 1)[];
    describe(params?: DescParams): string;
    toString(): string;
    enumSubPaths(): Generator<PathSE, void, unknown>;
    static parse(d: string): PathSE;
    static new(v?: SegmentSE[] | string | SegmentSE | PathSE): PathSE;
}
import { Line } from './line.js';
import { Arc } from './arc.js';
import { Cubic } from './cubic.js';
import { Quadratic } from './quadratic.js';
import { dSplit } from './parser.js';
import { SegmentSE } from './segmentse.js';
export { Arc, Quadratic, Line, Cubic, dSplit };
