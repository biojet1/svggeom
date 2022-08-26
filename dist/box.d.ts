import { Vec } from './point.js';
export declare class Box {
    protected _x: number;
    protected _y: number;
    protected _h: number;
    protected _w: number;
    private static _not;
    protected constructor(x: number, y: number, width: number, height: number);
    clone(): Box;
    get x(): number;
    get left(): number;
    get minX(): number;
    get y(): number;
    get top(): number;
    get minY(): number;
    get width(): number;
    get height(): number;
    get maxX(): number;
    get maxY(): number;
    get right(): number;
    get bottom(): number;
    get centerX(): number;
    get centerY(): number;
    get center(): Vec;
    withCenter(p: Iterable<number>): Box;
    withMinY(n: number): Box;
    withMinX(n: number): Box;
    merge(box: Box): Box;
    inflated(h: number, v?: number): Box;
    transform(m: any): Box;
    isValid(): boolean;
    isEmpty(): boolean;
    toArray(): number[];
    toString(): string;
    equals(other: Box, epsilon?: number): boolean;
    overlap(other: Box): Box;
    static not(): Box;
    private static _empty?;
    static empty(): Box;
    static fromExtrema(x1: number, x2: number, y1: number, y2: number): Box;
    static fromRect({ x, y, width, height }: {
        x?: number | undefined;
        y?: number | undefined;
        width?: number | undefined;
        height?: number | undefined;
    }): Box;
    static forRect(x: number, y: number, width: number, height: number): Box;
    static parse(s: string): Box;
    static merge(...args: Array<Box>): Box;
    static new(first?: number | number[] | [number[], number[]] | string | Box, y?: number, width?: number, height?: number): Box;
}
export declare class BoxMut extends Box {
    get x(): number;
    set x(value: number);
    get y(): number;
    set y(value: number);
    get width(): number;
    set width(value: number);
    get height(): number;
    set height(value: number);
    private reset;
    mergeSelf(box: Box): this;
    inflateSelf(h: number, v?: number): Box;
    sizeSelf(w: number, h?: number): Box;
    isValid(): boolean;
    copy(that: Box): this;
    static not(): BoxMut;
    static forRect(x: number, y: number, width: number, height: number): BoxMut;
}
