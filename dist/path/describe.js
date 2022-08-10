const pi = Math.PI, tau = 2 * pi, epsilon = 1e-6, tauEpsilon = tau - epsilon;
function* pickXY(args) {
    for (const v of args) {
        if (typeof v == 'number') {
            yield v;
        }
        else {
            const [x, y] = v;
            yield x;
            yield y;
        }
    }
}
function Pt(x, y) {
    if (typeof x === 'object') {
        return [...x];
    }
    else {
        return [x, y];
    }
}
class Data {
    _prev;
    _p2;
    constructor(p, prev) {
        this._p2 = p;
        prev ?? (this._prev = prev);
    }
    get p2() {
        return this._p2;
    }
    get p1() {
        return this._prev?._p2;
    }
    anchor() {
        let { _prev } = this;
        for (; _prev; _prev = _prev._prev) {
            if (_prev instanceof MoveData) {
                return _prev;
            }
        }
        return _prev;
    }
}
class LineData extends Data {
    format() {
        const [x, y] = this.p2;
        return `L${x},${y}`;
    }
}
class MoveData extends Data {
    format() {
        const [x, y] = this.p2;
        return `M${x},${y}`;
    }
}
export class PathData {
    _x0;
    _y0;
    _x1;
    _y1;
    _ = '';
    static moveTo(a, b) {
        return new this().moveTo(a, b);
    }
    moveTo(a, b) {
        const [x = 0, y = 0] = Pt(a, b);
        this._ += 'M' + (this._x0 = this._x1 = +x) + ',' + (this._y0 = this._y1 = +y);
        return this;
    }
    closePath() {
        const { _x1 = null } = this;
        if (_x1 !== null) {
            (this._x1 = this._x0), (this._y1 = this._y0);
            this._ += 'Z';
        }
        return this;
    }
    lineTo(a, b) {
        const [x = 0, y = 0] = Pt(a, b);
        this._ += 'L' + (this._x1 = +x) + ',' + (this._y1 = +y);
        return this;
    }
    quadraticCurveTo(...args) {
        const [x1 = 0, y1 = 0, x = 0, y = 0] = pickXY(args);
        this._ += 'Q' + +x1 + ',' + +y1 + ',' + (this._x1 = +x) + ',' + (this._y1 = +y);
        return this;
    }
    bezierCurveTo(...args) {
        const [x1, y1, x2, y2, x, y] = pickXY(args);
        this._ += 'C' + +x1 + ',' + +y1 + ',' + +x2 + ',' + +y2 + ',' + (this._x1 = +x) + ',' + (this._y1 = +y);
        return this;
    }
    rect(...args) {
        const [x, y, w, h] = pickXY(args);
        this._ += 'M' + (this._x0 = this._x1 = +x) + ',' + (this._y0 = this._y1 = +y) + 'h' + +w + 'v' + +h + 'h' + -w + 'Z';
        return this;
    }
    arcTo(...args) {
        let [x1, y1, x2, y2, r] = pickXY(args);
        (x1 = +x1), (y1 = +y1), (x2 = +x2), (y2 = +y2), (r = +r);
        var x0 = this._x1 ?? 0, y0 = this._y1 ?? 0, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
        if (r < 0)
            throw new Error('negative radius: ' + r);
        if (this._x1 === null) {
            this._ += 'M' + (this._x1 = x1) + ',' + (this._y1 = y1);
        }
        else if (!(l01_2 > epsilon)) {
        }
        else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
            this._ += 'L' + (this._x1 = x1) + ',' + (this._y1 = y1);
        }
        else {
            var x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
            if (Math.abs(t01 - 1) > epsilon) {
                this._ += 'L' + (x1 + t01 * x01) + ',' + (y1 + t01 * y01);
            }
            this._ +=
                'A' +
                    r +
                    ',' +
                    r +
                    ',0,0,' +
                    +(y01 * x20 > x01 * y20) +
                    ',' +
                    (this._x1 = x1 + t21 * x21) +
                    ',' +
                    (this._y1 = y1 + t21 * y21);
        }
        return this;
    }
    arcd(...args) {
        const [x, y, r, a0, a1, ccw] = pickXY(args);
        return this.arc(x, y, r, (a0 * pi) / 180, (a1 * pi) / 180, ccw);
    }
    arc(...args) {
        let [x, y, r, a0, a1, ccw] = pickXY(args);
        (x = +x), (y = +y), (r = +r), (ccw = !!ccw ? 1 : 0);
        var dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x + dx, y0 = y + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
        if (r < 0)
            throw new Error('negative radius: ' + r);
        if (this._x1 === undefined) {
            console.warn(dx);
            this._ += 'M' + x0 + ',' + y0;
        }
        else if (Math.abs((this._x1 ?? 0) - x0) > epsilon || Math.abs((this._y1 ?? 0) - y0) > epsilon) {
            this._ += 'L' + x0 + ',' + y0;
        }
        if (!r)
            return this;
        if (da < 0)
            da = (da % tau) + tau;
        if (da > tauEpsilon) {
            this._ +=
                'A' +
                    r +
                    ',' +
                    r +
                    ',0,1,' +
                    cw +
                    ',' +
                    (x - dx) +
                    ',' +
                    (y - dy) +
                    'A' +
                    r +
                    ',' +
                    r +
                    ',0,1,' +
                    cw +
                    ',' +
                    (this._x1 = x0) +
                    ',' +
                    (this._y1 = y0);
        }
        else if (da > epsilon) {
            this._ +=
                'A' +
                    r +
                    ',' +
                    r +
                    ',0,' +
                    +(da >= pi) +
                    ',' +
                    cw +
                    ',' +
                    (this._x1 = x + r * Math.cos(a1)) +
                    ',' +
                    (this._y1 = y + r * Math.sin(a1));
        }
        return this;
    }
    toString() {
        return this._;
    }
}
//# sourceMappingURL=describe.js.map