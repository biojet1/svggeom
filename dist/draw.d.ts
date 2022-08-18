import { Vec } from './point.js';
export declare class PathDraw {
    _x0?: number;
    _y0?: number;
    _x1?: number;
    _y1?: number;
    _: string;
    beginPath(): void;
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
    }, text: string, x?: number, y?: number, maxWidth?: number): this;
    static new(): PathDraw;
    static moveTo(): PathDraw;
    static lineTo(): PathDraw;
}
import { Font } from 'opentype.js';
import { SegmentLS } from './path/linked.js';
import { DParams } from './path.js';
export declare class PathLS {
    _tail: SegmentLS;
    constructor(tail: SegmentLS);
    beginPath(): this;
    moveTo(...args: Vec[] | number[]): this;
    lineTo(...args: Vec[] | number[]): this;
    bezierCurveTo(...args: Vec[] | number[]): this;
    quadraticCurveTo(...args: Vec[] | number[]): this;
    arc(...args: Vec[] | number[]): this;
    arcTo(...args: Vec[] | number[]): this;
    rect(...args: Vec[] | number[]): this;
    closePath(): this;
    toString(): string;
    describe(opt: DParams): string;
    static moveTo(...args: Vec[] | number[]): PathLS;
    static parse(d: string): import("./path/linked.js").MoveLS;
}
