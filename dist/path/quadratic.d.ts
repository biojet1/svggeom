import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Cubic } from './cubic.js';
export declare class Quadratic extends Cubic {
    readonly c: Vec;
    constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>);
    slopeAt(t: number): Vec;
    pointAt(t: number): Vec;
    splitAt(t: number): Quadratic[];
    bbox(): Box;
    toPathFragment(): (string | number)[];
    transform(M: any): Quadratic;
    reversed(): Quadratic;
}
