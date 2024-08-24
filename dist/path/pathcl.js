import { CommandLink } from "./command.js";
export class PathLS {
    _tail;
    constructor(tail) {
        this._tail = tail;
    }
    move_to(p) {
        this._tail = (this._tail ?? CommandLink).move_to(p);
        return this;
    }
    line_to(p) {
        this._tail = (this._tail ?? CommandLink).line_to(p);
        return this;
    }
    curve_to(c1, c2, p2) {
        this._tail = (this._tail ?? CommandLink).curve_to(c1, c2, p2);
        return this;
    }
    quad_to(c, p) {
        this._tail = (this._tail ?? CommandLink).quad_to(c, p);
        return this;
    }
    static move_to(p) {
        return new PathLS(CommandLink.move_to(p));
    }
    static parse(d) {
        return new PathLS(CommandLink.parse(d));
    }
}
//# sourceMappingURL=pathcl.js.map