import { Vector } from '../vector.js';
import { BoundingBox } from '../bbox.js';
export interface DescParams {
    relative?: boolean;
    smooth?: boolean;
    short?: boolean;
    close?: boolean;
    dfix?: number;
}
export declare abstract class Segment {
    abstract get from(): Vector;
    abstract get to(): Vector;
    abstract get length(): number;
    abstract bbox(): BoundingBox;
    abstract pointAt(t: number): Vector;
    abstract slopeAt(t: number): Vector;
    get firstPoint(): Vector;
    get lastPoint(): Vector;
    toPath(): string;
    descArray(opt?: DescParams): (string | number)[];
    tangentAt(t: number): Vector;
    toPathFragment(opt?: DescParams): (string | number)[];
}
export declare abstract class SegmentSE extends Segment {
    private readonly _start;
    private readonly _end;
    constructor(from: Iterable<number>, to: Iterable<number>);
    get from(): Vector;
    get to(): Vector;
    abstract transform(M: any): SegmentSE;
    abstract reversed(): SegmentSE;
    abstract splitAt(t: number): [SegmentSE, SegmentSE];
    cutAt(t: number): SegmentSE;
    cropAt(t0: number, t1: number): SegmentSE | undefined;
}
export declare function tCheck(t: number): number;
export declare function tNorm(t: number): number;
export declare function pickPos(args: Vector[] | number[]): Generator<Vector, void, unknown>;
export declare function pickNum(args: Vector[] | number[]): Generator<number, void, unknown>;
