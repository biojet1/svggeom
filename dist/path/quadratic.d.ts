import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';
export declare class Quadratic extends SegmentSE {
    readonly c: Vec;
    constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>);
    private get _qpts();
    get length(): number;
    slopeAt(t: number): Vec;
    pointAt(t: number): Vec;
    splitAt(t: number): Quadratic[];
    bbox(): Box;
    toPathFragment(): (string | number)[];
    transform(M: any): Quadratic;
    reversed(): Quadratic;
}
