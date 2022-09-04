import { Vec } from '../point.js';
import { Box } from '../box.js';
export interface DescParams {
    relative?: boolean;
    smooth?: boolean;
    short?: boolean;
    close?: boolean;
    dfix?: number;
}
export declare abstract class Segment {
    abstract get from(): Vec;
    abstract get to(): Vec;
    abstract get length(): number;
    abstract bbox(): Box;
    abstract pointAt(t: number): Vec;
    abstract slopeAt(t: number): Vec;
    get firstPoint(): Vec;
    get lastPoint(): Vec;
    toPath(): string;
    descArray(opt?: DescParams): (string | number)[];
    tangentAt(t: number): Vec;
    toPathFragment(opt?: DescParams): (string | number)[];
}
export declare abstract class SegmentSE extends Segment {
    private readonly _start;
    private readonly _end;
    constructor(from: Iterable<number>, to: Iterable<number>);
    get from(): Vec;
    get to(): Vec;
    abstract transform(M: any): SegmentSE;
    abstract reversed(): SegmentSE;
    abstract splitAt(t: number): [SegmentSE, SegmentSE];
    cutAt(t: number): SegmentSE;
    cropAt(t0: number, t1: number): SegmentSE | undefined;
}
export declare function tCheck(t: number): number;
export declare function tNorm(t: number): number;
export declare function pickPos(args: Vec[] | number[]): Generator<Vec, void, unknown>;
export declare function pickNum(args: Vec[] | number[]): Generator<number, void, unknown>;
