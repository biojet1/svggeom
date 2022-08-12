import { Vec } from './point.js';
export declare class Draw {
    _: string;
    _x0?: number;
    _y0?: number;
    _x1?: number;
    _y1?: number;
    constructor();
    moveTo(...args: Vec[] | number[]): this;
    lineTo(...args: Vec[] | number[]): this;
    closePath(): this;
    quadraticCurveTo(...args: Vec[] | number[]): this;
    bezierCurveTo(...args: Vec[] | number[]): this;
    arcTo(...args: Vec[] | number[]): this;
    arcd(...args: Vec[] | number[]): this | undefined;
    arc(...args: Vec[] | number[]): this | undefined;
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
    static new(): Draw;
    static moveTo(): Draw;
    static lineTo(): Draw;
}
import { Font } from 'opentype.js';
