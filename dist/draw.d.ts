import { Vec } from './point.js';
import { Box } from './box.js';
declare class CanvasCompat {
    set fillStyle(x: any);
    get fillStyle(): any;
    fill(): this;
    beginPath(): this;
}
export declare class PathDraw extends CanvasCompat {
    _x0?: number;
    _y0?: number;
    _x1?: number;
    _y1?: number;
    _: string;
    static get digits(): number;
    static set digits(n: number);
    moveTo(...args: Vec[] | number[]): this;
    lineTo(...args: Vec[] | number[]): this;
    closePath(): this;
    quadraticCurveTo(...args: Vec[] | number[]): this;
    bezierCurveTo(...args: Vec[] | number[]): this;
    arcTo(...args: Vec[] | number[]): this;
    arcd(...args: Vec[] | number[]): this;
    arc(...args: Vec[] | number[]): this;
    rect(...args: Vec[] | number[]): this;
    toString(): string;
    d(): string;
    text(options: {
        fontSize: number;
        font: Font;
        kerning?: boolean;
        tracking?: number;
        letterSpacing?: number;
    }, text: string): this;
    static new(): PathDraw;
    static moveTo(): PathDraw;
    static lineTo(): PathDraw;
}
import { Font } from 'opentype.js';
import { SegmentLS } from './path/linked.js';
import { DescParams } from './path/index.js';
export declare class PathLS extends CanvasCompat {
    _tail: SegmentLS | undefined;
    constructor(tail: SegmentLS | undefined);
    moveTo(...args: Vec[] | number[]): this;
    lineTo(...args: Vec[] | number[]): this;
    bezierCurveTo(...args: Vec[] | number[]): this;
    quadraticCurveTo(...args: Vec[] | number[]): this;
    arc(...args: Vec[] | number[]): this;
    arcd(...args: Vec[] | number[]): this;
    arcTo(...args: Vec[] | number[]): this;
    rect(...args: Vec[] | number[]): this;
    closePath(): this;
    describe(opt?: DescParams): string;
    text(options: {
        fontSize: number;
        font: Font;
        kerning?: boolean;
        tracking?: number;
        letterSpacing?: number;
    }, text: string): this;
    segmentAtLength(T: number): [SegmentLS | undefined, number, number];
    segmentAt(T: number): [SegmentLS | undefined, number];
    get length(): number;
    get start(): Vec | undefined;
    get end(): Vec | undefined;
    tangentAt(T: number): Vec | undefined;
    slopeAt(T: number): Vec | undefined;
    pointAt(T: number): Vec | undefined;
    pointAtLength(L: number): Vec | undefined;
    bbox(): Box;
    splitAt(T: number): PathLS[];
    cutAt(T: number): PathLS;
    cropAt(T0: number, T1?: number): PathLS;
    reversed(next?: SegmentLS): PathLS;
    descArray(opt?: DescParams): (number | string)[];
    get firstPoint(): Vec | undefined;
    get lastPoint(): Vec | undefined;
    toString(): string;
    d(): string;
    static moveTo(...args: Vec[] | number[]): PathLS;
    static parse(d: string): PathLS;
    static rect(...args: Vec[] | number[]): PathLS;
    static get digits(): number;
    static set digits(n: number);
    static lineTo(): PathLS;
}
export {};
