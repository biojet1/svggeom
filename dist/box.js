import { Vec } from './point.js';
const { max, min, abs } = Math;
export class Box {
    _x;
    _y;
    _h;
    _w;
    static _not = new (class extends Box {
        constructor() {
            super(NaN, NaN, NaN, NaN);
            Object.freeze(this);
        }
        merge(box) {
            return box;
        }
        transform(m) {
            return this;
        }
        isValid() {
            return false;
        }
    })();
    constructor(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._w = width;
        this._h = height;
    }
    clone() {
        const { x, y, width, height } = this;
        return Box.forRect(x, y, width, height);
    }
    get x() {
        return this._x;
    }
    get left() {
        return this._x;
    }
    get minX() {
        return this._x;
    }
    get y() {
        return this._y;
    }
    get top() {
        return this._y;
    }
    get minY() {
        return this._y;
    }
    get width() {
        return this._w;
    }
    get height() {
        return this._h;
    }
    get maxX() {
        const { x, width } = this;
        return x + width;
    }
    get maxY() {
        const { y, height } = this;
        return y + height;
    }
    get right() {
        return this.maxX;
    }
    get bottom() {
        return this.maxY;
    }
    get centerX() {
        const { x, width } = this;
        return x + width / 2;
    }
    get centerY() {
        const { y, height } = this;
        return y + height / 2;
    }
    get center() {
        const { centerX, centerY } = this;
        return Vec.new(centerX, centerY);
    }
    withCenter(p) {
        const [cx, cy] = p;
        const { width: W, height: H } = this;
        return Box.forRect(cx - W / 2, cy - H / 2, W, H);
    }
    withSize(p) {
        const [w, h] = p;
        const { x, y } = this;
        return Box.forRect(x, y, w, h);
    }
    withPos(p) {
        const [x, y] = p;
        const { width, height } = this;
        return Box.forRect(x, y, width, height);
    }
    withMinY(n) {
        const { x, width, height } = this;
        return Box.forRect(x, n, width, height);
    }
    withMinX(n) {
        const { y, width, height } = this;
        return Box.forRect(n, y, width, height);
    }
    merge(box) {
        if (!this.isValid()) {
            return box;
        }
        else if (!box.isValid()) {
            return this;
        }
        const { minX: xMin1, minY: yMin1, maxX: xMax1, maxY: yMax1 } = this;
        const { minX: xMin2, minY: yMin2, maxX: xMax2, maxY: yMax2 } = box;
        return Box.fromExtrema(min(xMin1, xMin2), max(xMax1, xMax2), min(yMin1, yMin2), max(yMax1, yMax2));
    }
    inflated(h, v) {
        v = v ?? h;
        const { x, y, width, height } = this;
        return Box.forRect(x - h, y - v, h + width + h, v + height + v);
    }
    transform(m) {
        let xMin = Infinity;
        let xMax = -Infinity;
        let yMin = Infinity;
        let maxY = -Infinity;
        const { x, y, bottom, right } = this;
        [Vec.new(x, y), Vec.new(right, y), Vec.new(x, bottom), Vec.new(right, bottom)].forEach(function (p) {
            const [x, y] = p.transform(m);
            xMin = min(xMin, x);
            xMax = max(xMax, x);
            yMin = min(yMin, y);
            maxY = max(maxY, y);
        });
        return Box.fromExtrema(xMin, xMax, yMin, maxY);
    }
    isValid() {
        const { x, y, width, height } = this;
        return isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height);
    }
    isEmpty() {
        const { x, y, width, height } = this;
        return x == 0 || y == 0 || width == 0 || height == 0;
    }
    toArray() {
        const { x, y, width, height } = this;
        return [x, y, width, height];
    }
    toString() {
        const { x, y, width, height } = this;
        return `${x}, ${y}, ${width}, ${height}`;
    }
    equals(other, epsilon = 0) {
        if (other === this) {
            return true;
        }
        const { x: x1, y: y1, width: width1, height: height1 } = this;
        const { x: x2, y: y2, width: width2, height: height2 } = other;
        return (closeEnough(x1, x2, epsilon) &&
            closeEnough(y1, y2, epsilon) &&
            closeEnough(width1, width2, epsilon) &&
            closeEnough(height1, height2, epsilon));
    }
    overlap(other) {
        if (!this.isValid()) {
            return other;
        }
        else if (!other.isValid()) {
            return this;
        }
        else {
            const { minX: xMin1, minY: yMin1, maxX: xMax1, maxY: yMax1 } = this;
            const { minX: xMin2, minY: yMin2, maxX: xMax2, maxY: yMax2 } = other;
            const xMin = max(xMin1, xMin2);
            const xMax = min(xMax1, xMax2);
            if (xMax >= xMin) {
                const yMin = max(yMin1, yMin2);
                const yMax = min(yMax1, yMax2);
                if (yMax >= yMin) {
                    return Box.fromExtrema(xMin, xMax, yMin, yMax);
                }
            }
        }
        return Box._not;
    }
    static not() {
        return this._not;
    }
    static _empty;
    static empty() {
        const { _empty } = Box;
        return _empty || (Box._empty = Box.forRect(0, 0, 0, 0));
    }
    static fromExtrema(x1, x2, y1, y2) {
        if (x1 > x2)
            [x1, x2] = [x2, x1];
        if (y1 > y2)
            [y1, y2] = [y2, y1];
        return this.forRect(x1, y1, abs(x2 - x1), abs(y2 - y1));
    }
    static fromRect({ x = 0, y = 0, width = 0, height = 0 }) {
        return this.forRect(x, y, width, height);
    }
    static forRect(x, y, width, height) {
        return new this(x, y, width, height);
    }
    static parse(s) {
        const v = s.split(/[\s,]+/).map(parseFloat);
        return this.forRect(v[0], v[1], v[2], v[3]);
    }
    static merge(...args) {
        let x = Box.not();
        for (const b of args) {
            x = b.merge(x);
        }
        return x;
    }
    static new(first, y, width, height) {
        switch (typeof first) {
            case 'string': {
                return this.parse(first);
            }
            case 'number':
                return this.forRect(first, arguments[1], arguments[2], arguments[3]);
            case 'undefined':
                return this.not();
            case 'object':
                if (Array.isArray(first)) {
                    const x = first[0];
                    if (Array.isArray(x)) {
                        const [x1, x2] = first[0];
                        const [y1, y2] = first[1];
                        return this.fromExtrema(x1, x2, y1, y2);
                    }
                    else {
                        return this.forRect(first[0], first[1], first[2], first[3]);
                    }
                }
                else {
                    const { left, x, top, y, width, height } = first;
                    return this.forRect(left || x || 0, top || y || 0, width, height);
                }
            default:
                throw new TypeError(`Invalid box argument ${arguments}`);
        }
    }
}
export class BoxMut extends Box {
    get x() {
        return this._x;
    }
    set x(value) {
        this._x = value;
    }
    get y() {
        return this._y;
    }
    set y(value) {
        this._y = value;
    }
    get width() {
        return this._w;
    }
    set width(value) {
        this._w = value;
    }
    get height() {
        return this._h;
    }
    set height(value) {
        this._h = value;
    }
    reset(x, y, width, height) {
        this._x = x;
        this._y = y;
        this._w = width;
        this._h = height;
        return this;
    }
    mergeSelf(box) {
        if (!this.isValid()) {
            return this.copy(box);
        }
        else if (!box.isValid()) {
            return this;
        }
        else {
            const { x: x1, y: y1, width: width1, height: height1 } = this;
            const { x: x2, y: y2, width: width2, height: height2 } = box;
            const x = min(x1, x2);
            const y = min(y1, y2);
            return this.reset(x, y, max(x1 + width1, x2 + width2) - x, max(y1 + height1, y2 + height2) - y);
        }
    }
    inflateSelf(h, v) {
        v = v ?? h;
        const { x, y, width, height } = this;
        return this.reset(x - h, y - v, h + width + h, v + height + v);
    }
    sizeSelf(w, h) {
        const { x, y, width, height } = this;
        return this.reset(x, y, w ?? width, h ?? height);
    }
    isValid() {
        const { x, y, width, height } = this;
        return !(isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height));
    }
    copy(that) {
        const { x, y, width, height } = that;
        this._x = x;
        this._y = y;
        this._w = width;
        this._h = height;
        return this;
    }
    static not() {
        return new BoxMut(NaN, NaN, NaN, NaN);
    }
    static forRect(x, y, width, height) {
        return new this(x, y, width, height);
    }
}
function closeEnough(a, b, threshold = 1e-6) {
    return abs(b - a) <= threshold;
}
//# sourceMappingURL=box.js.map