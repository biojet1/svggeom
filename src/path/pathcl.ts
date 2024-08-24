import { CommandLink } from "./command.js";

export class PathLS {
    _tail: CommandLink | undefined;
    constructor(tail: CommandLink | undefined) {
        this._tail = tail;
    }
    move_to(p: Iterable<number>) {
        this._tail = (this._tail ?? CommandLink).move_to(p);
        return this;
    }
    line_to(p: Iterable<number>) {
        this._tail = (this._tail ?? CommandLink).line_to(p);
        return this;
    }
    curve_to(c1: Iterable<number>, c2: Iterable<number>, p2: Iterable<number>) {
        this._tail = (this._tail ?? CommandLink).curve_to(c1, c2, p2);
        return this;
    }
    quad_to(c: Iterable<number>, p: Iterable<number>) {
        this._tail = (this._tail ?? CommandLink).quad_to(c, p);
        return this;
    }
    static move_to(p: Iterable<number>) {
        return new PathLS(CommandLink.move_to(p));
    }
    static parse(d: string) {
        return new PathLS(CommandLink.parse(d));
    }
}