import { Segment } from "./path/index.js";
import { Box } from "./box.js";
interface IDescOpt {
    relative?: boolean;
    close?: boolean | null;
    smooth?: boolean;
    short?: boolean;
}
export declare class Path {
    private _segs;
    private _length?;
    private _lengths?;
    private constructor();
    getTotalLength(): number;
    getBBox(): Box;
    get length(): number;
    bbox(): Box;
    private calcLength;
    private get lengths();
    get firstPoint(): import("./point.js").Point;
    get lastPoint(): import("./point.js").Point;
    segmentAt(T: number): [Segment | undefined, number, number];
    isContinuous(): boolean;
    isClosed(): boolean;
    tangentAt(T: number): import("./point.js").Point;
    slopeAt(T: number): import("./point.js").Point;
    pointAt(T: number): import("./point.js").Point;
    splitAt(T: number): Path[];
    cutAt(T: number): Path;
    cropAt(T0: number, T1?: number): Path;
    transform(M: any): Path;
    reversed(): Path;
    private enumDesc;
    descArray(params?: IDescOpt): any;
    describe(params?: IDescOpt): any;
    enumSubPaths(): {};
    static parse(d: string): Path;
    static new(v?: Segment[] | string | Segment | Path): Path;
}
import { Line, Close } from "./path/index.js";
import { Arc } from "./path/arc.js";
import { Cubic } from "./path/cubic.js";
import { Quadratic } from "./path/quadratic.js";
export { Line, Arc, Cubic, Quadratic, Segment, Close };
