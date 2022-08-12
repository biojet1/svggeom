import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Segment } from './index.js';
export declare abstract class PathLS extends Segment {
    protected _prev?: PathLS;
    private readonly _end;
    constructor(prev: PathLS | undefined, end: Iterable<number>);
    get start(): Vec;
    get end(): Vec;
    get first(): PathLS | undefined;
    get prevMove(): MoveLS | undefined;
    enum(): Generator<PathLS, void, unknown>;
    moveTo(pos: Vec): MoveLS;
    lineTo(pos: Vec): LineLS;
    closePath(): PathLS;
    bezierCurveTo(...args: Vec[] | number[]): CubicLS;
    toString(): string;
    abstract d(): string;
    private enumDesc;
    static moveTo(pos: Vec): MoveLS;
    static lineTo(pos: Vec): LineLS;
}
export declare class LineLS extends PathLS {
    bbox(): Box;
    get length(): number;
    pointAt(t: number): Vec;
    slopeAt(t: number): Vec;
    d(): string;
}
export declare class MoveLS extends LineLS {
    d(): string;
}
export declare class CloseLS extends LineLS {
    d(): string;
}
import { CubicLS } from './cubic.js';
