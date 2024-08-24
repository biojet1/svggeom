import { Vector } from './vector.js';
const { max, min, abs } = Math;
export class BoundingInterval extends Vector {
    constructor(p) {
        if (!p || typeof p == "number") {
            throw new TypeError(`Unexpected ${p}`);
        }
        let [min, max] = p;
        if (max == undefined) {
            max = min;
        }
        if (typeof min != "number" || typeof max != "number") {
            throw new TypeError(`Unexpected`);
        }
        super([min, max]);
    }
    get center() {
        const { size, minimum } = this;
        return minimum + (size / 2);
    }
    get size() {
        const { maximum, minimum } = this;
        return maximum - minimum;
    }
    get minimum() {
        const [min, _] = this;
        return min;
    }
    get maximum() {
        const [_, max] = this;
        return max;
    }
    merge(that) {
        if (this !== that) {
            const [a1, b1] = this;
            const [a2, b2] = that;
            return new BoundingInterval([Math.min(a1, a2), Math.max(b1, b2)]);
        }
        return that;
    }
    merge_self(that) {
        if (this !== that) {
            const [a, b] = that;
            this[0] = Math.min(this[0], a);
            this[1] = Math.max(this[0], b);
        }
        return this;
    }
    neg() {
        const [a, b] = this;
        return BoundingInterval.check([-a, -b]);
    }
    is_valid() {
        const [a, b] = this;
        return b >= a;
    }
    static check(p) {
        if (p) {
            let [min, max] = p;
            if (max == undefined) {
                max = min;
            }
            if (min > max) {
                return new BoundingInterval([max, min]);
            }
            else {
                return new BoundingInterval([min, max]);
            }
        }
        else {
            throw new Error(`Unexpected`);
        }
    }
}
export class BoundingBox extends Array {
    constructor(x, y) {
        super(new BoundingInterval(x ?? [Infinity, -Infinity]), new BoundingInterval(y ?? [Infinity, -Infinity]));
    }
    get _x() {
        return this[0];
    }
    get _y() {
        return this[1];
    }
    get y() {
        return this._y.minimum;
    }
    get x() {
        return this._x.minimum;
    }
    get width() {
        return this._x.size;
    }
    get height() {
        return this._y.size;
    }
    get top() {
        return this._y.minimum;
    }
    get min_y() {
        return this._y.minimum;
    }
    get left() {
        return this._x.minimum;
    }
    get min_x() {
        return this._x.minimum;
    }
    get bottom() {
        return this._y.maximum;
    }
    get max_y() {
        return this._y.maximum;
    }
    get right() {
        return this._x.maximum;
    }
    get max_x() {
        return this._x.maximum;
    }
    get center_x() {
        return this._x.center;
    }
    get center_y() {
        return this._y.center;
    }
    get diagonal_length() {
        const { width, height } = this;
        return (width * width + height * height) ** (0.5);
    }
    get center() {
        const [x, y] = this;
        return new Vector([x.center, y.center]);
    }
    get size() {
        const [x, y] = this;
        return new Vector([x.size, y.size]);
    }
    toString() {
        return [...this].map(v => `[${v.toString()}]`).join(", ");
    }
    dump() {
        return [...this].map(v => [...v]);
    }
    dump_rect() {
        const { left, top, width, height } = this;
        return [left, top, width, height];
    }
    merge(...args) {
        const bb = this.clone();
        for (const that of args) {
            if (this !== that) {
                bb.merge_self(that);
            }
        }
        return bb;
    }
    with_center(p) {
        const [cx, cy] = p;
        const { width: W, height: H } = this;
        return BoundingBox.rect(cx - W / 2, cy - H / 2, W, H);
    }
    with_size(p) {
        const [w, h] = p;
        const { left, top } = this;
        return BoundingBox.rect(left, top, w, h);
    }
    with_pos(p) {
        const [x, y] = p;
        const { width, height } = this;
        return BoundingBox.rect(x, y, width, height);
    }
    with_min_y(n) {
        const { left, width, height } = this;
        return BoundingBox.rect(left, n, width, height);
    }
    with_min_x(n) {
        const { top, width, height } = this;
        return BoundingBox.rect(n, top, width, height);
    }
    inflated(h, v) {
        v = v ?? h;
        const { left, top, width, height } = this;
        return BoundingBox.rect(left - h, top - v, h + width + h, v + height + v);
    }
    neg() {
        const [x, y] = this;
        return new BoundingBox(x.neg(), y.neg());
    }
    resize(delta_x, delta_y = undefined) {
        const [x, y] = this;
        const dy = delta_y ?? delta_x;
        return new BoundingBox([x.minimum - delta_x, x.maximum + delta_x], [y.minimum - dy, y.maximum + dy]);
    }
    merge_self(that) {
        const [x1, y1] = this;
        const [x2, y2] = that;
        this[0] = x1.merge(x2);
        this[1] = y1.merge(y2);
        return this;
    }
    equals(that, epsilon = 0) {
        if (!that) {
            return false;
        }
        else if (that === this) {
            return true;
        }
        else {
            return this.every((v, i) => v.equals(that[i], epsilon));
        }
    }
    is_valid() {
        return this.every(v => v.is_valid());
    }
    clone() {
        return new this.constructor(...this);
    }
    transform(m) {
        let xMin = Infinity;
        let xMax = -Infinity;
        let yMin = Infinity;
        let maxY = -Infinity;
        const { left, top, bottom, right } = this;
        [Vector.pos(left, top), Vector.pos(right, top), Vector.pos(left, bottom), Vector.pos(right, bottom)].forEach(function (p) {
            const [x, y] = p.transform(m);
            xMin = min(xMin, x);
            xMax = max(xMax, x);
            yMin = min(yMin, y);
            maxY = max(maxY, y);
        });
        return this.constructor.extrema(xMin, xMax, yMin, maxY);
    }
    overlap(other) {
        if (!this.is_valid()) {
            return other;
        }
        else if (!other.is_valid()) {
            return this;
        }
        else {
            const { min_x: xMin1, min_y: yMin1, max_x: xMax1, max_y: yMax1 } = this;
            const { min_x: xMin2, min_y: yMin2, max_x: xMax2, max_y: yMax2 } = other;
            const xMin = max(xMin1, xMin2);
            const xMax = min(xMax1, xMax2);
            if (xMax >= xMin) {
                const yMin = max(yMin1, yMin2);
                const yMax = min(yMax1, yMax2);
                if (yMax >= yMin) {
                    return BoundingBox.extrema(xMin, xMax, yMin, yMax);
                }
            }
        }
        return BoundingBox.not();
    }
    static not() {
        return new this();
    }
    static rect(x, y, width, height) {
        return new this([x, x + width], [y, y + height]);
    }
    static extrema(x1, x2, y1, y2) {
        return new this([x1, x2], [y1, y2]);
    }
    static check(x, y) {
        return new this(BoundingInterval.check(x), BoundingInterval.check(y));
    }
    static empty() {
        return this.rect(0, 0, 0, 0);
    }
    static new(first, y, width, height) {
        switch (typeof first) {
            case 'string': {
                return this.parse(first);
            }
            case 'number':
                return this.rect(first, arguments[1], arguments[2], arguments[3]);
            case 'undefined':
                return this.not();
            case 'object':
                if (first instanceof BoundingBox) {
                    return new BoundingBox(...first);
                }
                if (Array.isArray(first)) {
                    const x = first[0];
                    if (Array.isArray(x)) {
                        const [x1, x2] = first[0];
                        const [y1, y2] = first[1];
                        return this.extrema(x1, x2, y1, y2);
                    }
                    else {
                        return this.rect(first[0], first[1], first[2], first[3]);
                    }
                }
                else {
                }
            default:
                throw new TypeError(`Invalid box argument ${arguments}`);
        }
    }
    static parse(s) {
        const v = s.split(/[\s,]+/).map(parseFloat);
        return this.rect(v[0], v[1], v[2], v[3]);
    }
    static merge(...args) {
        const bb = new BoundingBox();
        for (const that of args) {
            bb.merge_self(that);
        }
        return bb;
    }
}
//# sourceMappingURL=bbox.js.map