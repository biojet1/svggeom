import { Point } from './point.js';
export declare class Draw {
    _: string;
    _x0?: number;
    _y0?: number;
    _x1?: number;
    _y1?: number;
    constructor();
    moveTo(...args: Point[] | number[]): this;
    lineTo(...args: Point[] | number[]): this;
    closePath(): this;
    quadraticCurveTo(...args: Point[] | number[]): this;
    bezierCurveTo(...args: Point[] | number[]): this;
    arcTo(...args: Point[] | number[]): this;
    arcd(...args: Point[] | number[]): this | undefined;
    arc(...args: Point[] | number[]): this | undefined;
    rect(...args: Point[] | number[]): this;
    toString(): string;
    d(): string;
    text(options: {
        fontSize: number;
        font: Font;
        kerning?: boolean;
        tracking?: number;
        letterSpacing?: number;
    }, text: string, x?: number, y?: number, maxWidth?: number): this;
    static new(): Draw;
    static moveTo(): Draw;
    static lineTo(): Draw;
}
import { Font } from 'opentype.js';
