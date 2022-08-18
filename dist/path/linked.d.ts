import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Segment, DescParams } from './index.js';
export declare abstract class SegmentLS extends Segment {
    protected _prev?: SegmentLS;
    private readonly _end;
    set digits(n: number);
    constructor(prev: SegmentLS | undefined, end: Vec);
    get prev(): SegmentLS;
    get start(): Vec;
    get end(): Vec;
    get first(): SegmentLS | undefined;
    get lastMove(): MoveLS | undefined;
    enum(): Generator<SegmentLS, void, unknown>;
    moveTo(...args: Vec[] | number[]): MoveLS;
    lineTo(...args: Vec[] | number[]): LineLS;
    closePath(): SegmentLS;
    bezierCurveTo(...args: Vec[] | number[]): CubicLS;
    quadraticCurveTo(...args: Vec[] | number[]): QuadLS;
    M(...args: Vec[] | number[]): MoveLS;
    m(...args: Vec[] | number[]): MoveLS;
    Z(): SegmentLS;
    z(): SegmentLS;
    L(...args: Vec[] | number[]): LineLS;
    l(...args: Vec[] | number[]): LineLS;
    H(n: number): LineLS;
    h(n: number): LineLS;
    V(n: number): LineLS;
    v(n: number): LineLS;
    Q(...args: Vec[] | number[]): QuadLS;
    q(...args: Vec[] | number[]): QuadLS;
    C(...args: Vec[] | number[]): CubicLS;
    c(...args: Vec[] | number[]): CubicLS;
    S(...args: Vec[] | number[]): CubicLS;
    s(...args: Vec[] | number[]): CubicLS;
    T(...args: Vec[] | number[]): QuadLS;
    t(...args: Vec[] | number[]): QuadLS;
    A(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, ...args: Vec[] | number[]): ArcLS;
    a(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, ...args: Vec[] | number[]): ArcLS;
    toString(): string;
    describe(opt?: DescParams): string;
    descArray(opt?: DescParams): (number | string)[];
    cutAt(t: number): SegmentLS;
    cropAt(t0: number, t1: number): SegmentLS | undefined;
    rect(...args: Vec[] | number[]): SegmentLS;
    arc(...args: Vec[] | number[]): SegmentLS;
    arcTo(...args: Vec[] | number[]): SegmentLS;
    abstract _descs(opt?: DescParams): (number | string)[];
    abstract splitAt(t: number): [SegmentLS, SegmentLS];
    abstract transform(M: any): SegmentLS;
    abstract reversed(next?: SegmentLS): SegmentLS | undefined;
    static moveTo(...args: Vec[] | number[]): MoveLS;
    static lineTo(...args: Vec[] | number[]): LineLS;
    static bezierCurveTo(...args: Vec[] | number[]): CubicLS;
    static quadraticCurveTo(...args: Vec[] | number[]): QuadLS;
    static parse(d: string): MoveLS;
    static arc(...args: Vec[] | number[]): SegmentLS;
    static arcTo(...args: Vec[] | number[]): SegmentLS;
}
export declare class LineLS extends SegmentLS {
    bbox(): Box;
    get length(): number;
    pointAt(t: number): Vec;
    slopeAt(_: number): Vec;
    splitAt(t: number): [SegmentLS, SegmentLS];
    _descs(opt?: DescParams): (string | number)[];
    reversed(next?: SegmentLS): SegmentLS | undefined;
    transform(M: any): LineLS;
}
export declare class MoveLS extends LineLS {
    _descs(opt?: DescParams): (string | number)[];
    splitAt(t: number): [SegmentLS, SegmentLS];
    transform(M: any): MoveLS;
    reversed(next?: SegmentLS): SegmentLS | undefined;
}
export declare class CloseLS extends LineLS {
    splitAt(t: number): [SegmentLS, SegmentLS];
    transform(M: any): CloseLS;
    _descs(opt?: DescParams): string[];
}
export declare class QuadLS extends SegmentLS {
    readonly p: Vec;
    constructor(prev: SegmentLS | undefined, p: Vec, end: Vec);
    private get _qpts();
    get length(): number;
    slopeAt(t: number): Vec;
    pointAt(t: number): Vec;
    splitAt(t: number): [SegmentLS, SegmentLS];
    bbox(): Box;
    _descs(opt?: DescParams): (string | number)[];
    reversed(next?: SegmentLS): SegmentLS | undefined;
    transform(M: any): QuadLS;
}
export declare class CubicLS extends SegmentLS {
    readonly c1: Vec;
    readonly c2: Vec;
    constructor(prev: SegmentLS | undefined, c1: Vec, c2: Vec, end: Vec);
    private get _cpts();
    pointAt(t: number): Vec;
    bbox(): Box;
    slopeAt(t: number): Vec;
    splitAt(t: number): [SegmentLS, SegmentLS];
    get length(): number;
    reversed(next?: SegmentLS): SegmentLS | undefined;
    transform(M: any): CubicLS;
    _descs(opt?: DescParams): (string | number)[];
}
export declare class ArcLS extends SegmentLS {
    readonly rx: number;
    readonly ry: number;
    readonly phi: number;
    readonly bigArc: boolean;
    readonly sweep: boolean;
    readonly cosφ: number;
    readonly sinφ: number;
    readonly rtheta: number;
    readonly rdelta: number;
    readonly cx: number;
    readonly cy: number;
    constructor(prev: SegmentLS | undefined, rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, end: Vec);
    bbox(): Box;
    get length(): number;
    pointAt(t: number): Vec;
    slopeAt(t: number): Vec;
    splitAt(t: number): [SegmentLS, SegmentLS];
    transform(M: any): ArcLS;
    reversed(next?: SegmentLS): SegmentLS | undefined;
    _descs(opt?: DescParams): (string | number)[];
}
