import { CommandLink } from "./command.js";
export declare class PathLS {
    _tail: CommandLink | undefined;
    constructor(tail: CommandLink | undefined);
    move_to(p: Iterable<number>): this;
    line_to(p: Iterable<number>): this;
    curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>): this;
    quad_to(c: Iterable<number>, p: Iterable<number>): this;
    static move_to(p: Iterable<number>): PathLS;
    static parse(d: string): PathLS;
}
