import { BoundingBox } from "../bbox.js";
import { CommandLink, MoveCL } from "./command.js";
import { tNorm } from "./index.js";
export class PathCL {
    _tail;
    constructor(tail) {
        this._tail = tail;
    }
    get length() {
        let cur = this._tail;
        if (cur) {
            return path_length(cur);
        }
        return 0;
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
    arc_centered_at(c, radius, startAngle, endAngle, counterclockwise = false) {
        this._tail = (this._tail ?? CommandLink).arc_centered_at(c, radius, startAngle, endAngle, counterclockwise);
        return this;
    }
    arc_tangent_to(p1, p2, r) {
        this._tail = (this._tail ?? CommandLink).arc_tangent_to(p1, p2, r);
        return this;
    }
    rect(x, y, w, h) {
        this._tail = (this._tail ?? CommandLink).rect(x, y, w, h);
        return this;
    }
    close() {
        const { _tail } = this;
        if (_tail) {
            this._tail = _tail.close();
        }
        return this;
    }
    set fillStyle(_x) { }
    get fillStyle() {
        return 'red';
    }
    fill() {
        return this;
    }
    beginPath() {
        return this;
    }
    lineTo(x, y) {
        return this.line_to([x, y]);
    }
    moveTo(x, y) {
        return this.move_to([x, y]);
    }
    closePath() {
        return this.close();
    }
    quadraticCurveTo(cx, cy, px, py) {
        return this.quad_to([cx, cy], [px, py]);
    }
    bezierCurveTo(cx1, cy1, cx2, cy2, px2, py2) {
        return this.curve_to([cx1, cy1], [cx2, cy2], [px2, py2]);
    }
    arc(x, y, radius, startAngle, endAngle, counterclockwise = false) {
        return this.arc_centered_at([x, y], radius, startAngle, endAngle, counterclockwise);
    }
    arcTo(x1, y1, x2, y2, radius) {
        return this.arc_tangent_to([x1, y1], [x2, y2], radius);
    }
    arcd(x, y, radius, startAngle, endAngle, counterclockwise = false) {
        return this.arc(x, y, radius, (startAngle * Math.PI) / 180, (endAngle * Math.PI) / 180, counterclockwise);
    }
    text(options, text) {
        const { font, fontSize = 72, kerning, letterSpacing, tracking } = options;
        const [_x1, _y1] = this?._tail?.to ?? [0, 0];
        font.getPath(text, _x1, _y1, fontSize, {
            kerning,
            letterSpacing,
            tracking,
        }).draw(this);
        return this;
    }
    describe(opt) {
        return this._tail?.describe(opt) || '';
    }
    toString() {
        return this.describe();
    }
    segment_at_length(T, clamp) {
        let cur = this._tail;
        if (cur) {
            return segment_at_length(cur, T, path_length(cur), clamp);
        }
        return [undefined, NaN, NaN];
    }
    segment_at(T) {
        let cur = this._tail;
        if (cur) {
            const len = path_length(cur);
            const [seg, n, N] = segment_at_length(cur, T * len, len);
            return [seg, N == 0 ? 0 : n / N];
        }
        return [undefined, NaN];
    }
    tangent_at(T) {
        const [seg, t] = this.segment_at(T);
        if (seg)
            return seg.tangent_at(t);
    }
    slope_at(T) {
        const [seg, t] = this.segment_at(T);
        if (seg)
            return seg.slope_at(t);
    }
    point_at(T) {
        const [seg, t] = this.segment_at(T);
        if (seg)
            return seg.point_at(t);
    }
    point_at_length(L, clamp) {
        const [seg, n, N] = this.segment_at_length(L, clamp);
        if (seg)
            return seg.point_at(n / N);
    }
    bbox() {
        let b = BoundingBox.not();
        for (let cur = this._tail; cur; cur = cur._prev) {
            b = b.merge(cur.bbox());
        }
        return b;
    }
    split_at(T) {
        const { _tail } = this;
        if (_tail) {
            const [seg, t] = this.segment_at(T);
            if (seg) {
                if (t == 0) {
                    const { prev } = seg;
                    return [new PathCL(prev), new PathCL(_tail.with_far_prev_3(seg, CommandLink.move_to(prev?.to)))];
                }
                else if (t == 1) {
                    return [new PathCL(seg), new PathCL(_tail.with_far_prev(seg, CommandLink.move_to(seg.to)))];
                }
                if (t < 0 || t > 1) {
                    throw new Error();
                }
                let [a, b] = seg.split_at(t);
                if (seg === _tail) {
                    return [new PathCL(a), new PathCL(b)];
                }
                else {
                    return [new PathCL(a), new PathCL(_tail.with_far_prev(seg, b))];
                }
            }
        }
        return [new PathCL(undefined), new PathCL(undefined)];
    }
    cut_at(T) {
        return T < 0 ? this.split_at(1 + T)[1] : this.split_at(T)[0];
    }
    crop_at(T0, T1 = 1) {
        T0 = tNorm(T0);
        T1 = tNorm(T1);
        if (T0 <= 0) {
            if (T1 >= 1) {
                return this;
            }
            else if (T1 > 0) {
                return this.cut_at(T1);
            }
        }
        else if (T0 < 1) {
            if (T1 >= 1) {
                return this.cut_at(T0 - 1);
            }
            else if (T0 < T1) {
                return this.cut_at(T0 - 1).cut_at((T1 - T0) / (1 - T0));
            }
            else if (T0 > T1) {
                return this.crop_at(T1, T0);
            }
        }
        else if (T1 < 1) {
            return this.crop_at(T1, T0);
        }
        return new PathCL(undefined);
    }
    reversed(_next) {
        const { _tail } = this;
        if (_tail) {
            return new PathCL(_tail.reversed());
        }
        return this;
    }
    terms(opt) {
        return this?._tail?.terms(opt) ?? [];
    }
    static lineTo(x, y) {
        return this.move_to([0, 0]).line_to([x, y]);
    }
    static move_to(p) {
        return new this(CommandLink.move_to(p));
    }
    static parse(d) {
        return new this(CommandLink.parse(d));
    }
    static rect(x, y, w, h) {
        return (new this(undefined)).rect(x, y, w, h);
    }
    static get digits() {
        return CommandLink.digits;
    }
    static set digits(n) {
        CommandLink.digits = n;
    }
}
const len_segment_map = new WeakMap();
const len_path_map = new WeakMap();
function path_length(seg) {
    let v = len_path_map.get(seg);
    if (v == null) {
        len_path_map.set(seg, (v = seg.path_len()));
    }
    return v;
}
function segment_length(seg) {
    let v = len_segment_map.get(seg);
    if (v == null) {
        len_segment_map.set(seg, (v = seg.segment_len()));
    }
    return v;
}
function segment_at_length(cur, lenP, LEN, clamp) {
    S1: if (cur) {
        if (lenP < 0) {
            if (clamp) {
                lenP = 0;
            }
            else {
                lenP = LEN + (lenP % LEN);
            }
        }
        if (lenP == 0) {
            let last;
            do {
                if (!(cur instanceof MoveCL)) {
                    last = cur;
                }
            } while ((cur = cur._prev));
            if (last) {
                return [last, 0, segment_length(last)];
            }
            break S1;
        }
        else if (lenP > LEN) {
            if (clamp) {
                lenP = LEN;
            }
            else if (0 == (lenP = lenP % LEN)) {
                lenP = LEN;
            }
        }
        let to = LEN;
        do {
            if (cur instanceof MoveCL) {
            }
            else {
                const lenS = segment_length(cur);
                if (lenS >= 0) {
                    const lenT = lenP - (to -= lenS);
                    if (lenT >= 0) {
                        return [cur, lenT, lenS];
                    }
                }
            }
        } while ((cur = cur._prev));
    }
    return [undefined, NaN, NaN];
}
function* enum_sub_paths(cur) {
    let tail;
    for (; cur; cur = cur._prev) {
        if (cur instanceof MoveCL) {
            if (tail) {
                if (tail === cur) {
                    throw new Error();
                }
                else {
                    yield tail.with_far_prev_3(cur, undefined);
                }
                tail = undefined;
            }
        }
        else if (!tail) {
            tail = cur;
        }
    }
    if (tail) {
        yield tail;
    }
}
export { CommandLink };
//# sourceMappingURL=pathcl.js.map