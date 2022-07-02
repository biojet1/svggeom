function* pick(args) {
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
const { PI: pi, abs, sqrt, tan, acos, sin, cos } = Math;
const tau = 2 * pi, epsilon = 1e-6, tauEpsilon = tau - epsilon;
export class Draw {
    _;
    _x0;
    _y0;
    _x1;
    _y1;
    constructor() {
        this._ = '';
    }
    moveTo(...args) {
        const [x, y] = pick(args);
        this._ += 'M' + (this._x0 = this._x1 = +x) + ',' + (this._y0 = this._y1 = +y);
        return this;
    }
    lineTo(...args) {
        const [x, y] = pick(args);
        this._ += 'L' + (this._x1 = +x) + ',' + (this._y1 = +y);
        return this;
    }
    closePath() {
        if (typeof this._x1 !== 'undefined') {
            (this._x1 = this._x0), (this._y1 = this._y0);
            this._ += 'Z';
        }
        return this;
    }
    quadraticCurveTo(...args) {
        const [x1, y1, x, y] = pick(args);
        this._ += 'Q' + +x1 + ',' + +y1 + ',' + (this._x1 = +x) + ',' + (this._y1 = +y);
        return this;
    }
    bezierCurveTo(...args) {
        const [x1, y1, x2, y2, x, y] = pick(args);
        this._ +=
            'C' + +x1 + ',' + +y1 + ',' + +x2 + ',' + +y2 + ',' + (this._x1 = +x) + ',' + (this._y1 = +y);
        return this;
    }
    arcTo(...args) {
        const [x1, y1, x2, y2, r] = pick(args);
        const x0 = this._x1 ?? 0, y0 = this._y1 ?? 0, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
        if (r < 0)
            throw new Error('negative radius: ' + r);
        if (this._x1 === null) {
            this._ += 'M' + (this._x1 = x1) + ',' + (this._y1 = y1);
        }
        else if (!(l01_2 > epsilon)) {
        }
        else if (!(abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
            this._ += 'L' + (this._x1 = x1) + ',' + (this._y1 = y1);
        }
        else {
            const x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = sqrt(l21_2), l01 = sqrt(l01_2), l = r * tan((pi - acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
            if (abs(t01 - 1) > epsilon) {
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
        const [x, y, r, a0, a1, ccw] = pick(args);
        return this.arc(x, y, r, (a0 * pi) / 180, (a1 * pi) / 180, ccw);
    }
    arc(...args) {
        const [x, y, r, a0, a1, ccw] = pick(args);
        const { _x1, _y1 } = this;
        const dx = r * cos(a0), dy = r * sin(a0), x0 = x + dx, y0 = y + dy, cw = 1 ^ ccw;
        let da = ccw ? a0 - a1 : a1 - a0;
        if (r < 0)
            throw new Error('negative radius: ' + r);
        if (typeof _x1 === 'undefined') {
            this._ += 'M' + x0 + ',' + y0;
        }
        else if (abs(_x1 - x0) > epsilon || abs((_y1 ?? 0) - y0) > epsilon) {
            this._ += 'L' + x0 + ',' + y0;
        }
        if (!r)
            return;
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
                    (this._x1 = x + r * cos(a1)) +
                    ',' +
                    (this._y1 = y + r * sin(a1));
        }
        return this;
    }
    rect(...args) {
        const [x, y, w, h] = pick(args);
        this._ +=
            'M' +
                (this._x0 = this._x1 = +x) +
                ',' +
                (this._y0 = this._y1 = +y) +
                'h' +
                +w +
                'v' +
                +h +
                'h' +
                -w +
                'Z';
        return this;
    }
    toString() {
        return this._;
    }
    d() {
        return this._;
    }
    static new() {
        return new Draw();
    }
    static moveTo() {
        return Draw.new().moveTo(...arguments);
    }
    static lineTo() {
        return Draw.new().lineTo(...arguments);
    }
}
//# sourceMappingURL=draw.js.map