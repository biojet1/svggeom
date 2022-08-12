import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';
export declare class Cubic extends SegmentSE {
    readonly c1: Vec;
    readonly c2: Vec;
    t_value?: number;
    constructor(start: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>);
    new(start: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>): Cubic;
    private get _cpts();
    bbox(): Box;
    pointAt(t: number): Vec;
    splitAt(z: number): Cubic[];
    get length(): number;
    lengthAt(t?: number): number;
    slopeAt(t: number): Vec;
    toPathFragment(): (string | number)[];
    transform(M: any): Cubic;
    reversed(): Cubic;
}
export { Cubic as CubicSegment };
import { PathLS } from './linked.js';
export declare class CubicLS extends PathLS {
    readonly c1: Vec;
    readonly c2: Vec;
    t_value?: number;
    constructor(prev: PathLS | undefined, c1: Iterable<number>, c2: Iterable<number>, end: Iterable<number>);
    private get _cpts();
    pointAt(t: number): Vec;
    bbox(): Box;
    slopeAt(t: number): Vec;
    splitAt(t: number): CubicLS[];
    lengthAt(t?: number): number;
    get length(): number;
    reversed(): CubicLS;
    transform(M: any): CubicLS;
    d(): string;
}
