const { sqrt, abs, tan, cos, sin, atan, atan2, PI } = Math;
const { isFinite } = Number;
const radians = function (d) {
    return ((d % 360) * PI) / 180;
};
const _cat = function (m, n) {
    const { a, b, c, d, e, f } = m;
    const { a: A, b: B, c: C, d: D, e: E, f: F } = n;
    return [
        a * A + c * B + e * 0,
        b * A + d * B + f * 0,
        a * C + c * D + e * 0,
        b * C + d * D + f * 0,
        a * E + c * F + e * 1,
        b * E + d * F + f * 1,
    ];
};
const _inv = function (m) {
    const { a, b, c, d, e, f } = m;
    const det = a * d - b * c;
    if (!det)
        throw new Error('Cannot invert ' + m);
    const na = d / det;
    const nb = -b / det;
    const nc = -c / det;
    const nd = a / det;
    const ne = -(na * e + nc * f);
    const nf = -(nb * e + nd * f);
    return [na, nb, nc, nd, ne, nf];
};
export class Matrix {
    a;
    b;
    c;
    d;
    e;
    f;
    constructor(M = []) {
        const [a = 1, b = 0, c = 0, d = 1, e = 0, f = 0] = M;
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        if (!(isFinite(a) &&
            isFinite(b) &&
            isFinite(c) &&
            isFinite(d) &&
            isFinite(e) &&
            isFinite(f)))
            throw TypeError(`${JSON.stringify(arguments)}`);
    }
    get isIdentity() {
        const { a, b, c, d, e, f } = this;
        return a === 1 && b === 0 && c === 0 && d === 1 && e === 0 && f === 0;
    }
    get is2D() {
        return true;
    }
    toString() {
        const { a, b, c, d, e, f } = this;
        return `matrix(${a} ${b} ${c} ${d} ${e} ${f})`;
    }
    clone() {
        const { a, b, c, d, e, f } = this;
        return new Matrix([a, b, c, d, e, f]);
    }
    equals(other, epsilon = 0) {
        const { a, b, c, d, e, f } = this;
        const { a: A, b: B, c: C, d: D, e: E, f: F } = other;
        return (other === this ||
            (closeEnough(a, A, epsilon) &&
                closeEnough(b, B, epsilon) &&
                closeEnough(c, C, epsilon) &&
                closeEnough(d, D, epsilon) &&
                closeEnough(e, E, epsilon) &&
                closeEnough(f, F, epsilon)));
    }
    isURT(epsilon = 1e-15) {
        const { a, d, b, c } = this;
        return a - d <= epsilon && b + c <= epsilon;
    }
    decompose() {
        let { a, d, b, c } = this;
        const { e, f } = this;
        let scaleX, scaleY, skewX;
        if ((scaleX = sqrt(a * a + b * b)))
            (a /= scaleX), (b /= scaleX);
        if ((skewX = a * c + b * d))
            (c -= a * skewX), (d -= b * skewX);
        if ((scaleY = sqrt(c * c + d * d)))
            (c /= scaleY), (d /= scaleY), (skewX /= scaleY);
        if (a * d < b * c)
            (a = -a), (b = -b), (skewX = -skewX), (scaleX = -scaleX);
        return {
            translateX: e,
            translateY: f,
            rotate: (atan2(b, a) * 180) / PI,
            skewX: (atan(skewX) * 180) / PI,
            scaleX: scaleX,
            scaleY: scaleY,
            toString: function () {
                const { translateX, translateY, rotate, skewX, scaleX, scaleY } = this;
                return `${translateX || translateY ? `translate(${translateX} ${translateY})` : ''}${rotate ? `rotate(${rotate})` : ''}${skewX ? `skewX(${skewX})` : ''}${scaleX == 1 && scaleY == 1
                    ? ''
                    : `scale(${scaleX}${scaleX == scaleY ? '' : ' ' + scaleY})`}`;
            },
        };
    }
    toArray() {
        const { a, b, c, d, e, f } = this;
        return [a, b, c, d, e, f];
    }
    describe() {
        return this.decompose().toString();
    }
    _set_hexad(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
    }
    _hexad(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        return new Matrix([a, b, c, d, e, f]);
    }
    _catSelf(m) {
        return this._set_hexad(..._cat(this, m));
    }
    _postCatSelf(m) {
        return this._set_hexad(..._cat(m, this));
    }
    _cat(m) {
        return this._hexad(..._cat(this, m));
    }
    _postCat(m) {
        return this._hexad(..._cat(m, this));
    }
    inverse() {
        return this._hexad(..._inv(this));
    }
    cat(m) {
        return this._cat(m);
    }
    multiply(m) {
        return this._cat(m);
    }
    postCat(m) {
        return this._postCat(m);
    }
    translate(x = 0, y = 0) {
        return this._cat(Matrix.hexad(1, 0, 0, 1, x, y));
    }
    translateY(v) {
        return this.translate(0, v);
    }
    translateX(v) {
        return this.translate(v, 0);
    }
    scale(scaleX, scaleY) {
        return this._cat(Matrix.hexad(scaleX, 0, 0, scaleY ?? scaleX, 0, 0));
    }
    rotate(ang, x = 0, y = 0) {
        const θ = ((ang % 360) * PI) / 180;
        const cosθ = cos(θ);
        const sinθ = sin(θ);
        return this._cat(Matrix.hexad(cosθ, sinθ, -sinθ, cosθ, x ? -cosθ * x + sinθ * y + x : 0, y ? -sinθ * x - cosθ * y + y : 0));
    }
    skew(x, y) {
        return this._cat(Matrix.hexad(1, tan(radians(y)), tan(radians(x)), 1, 0, 0));
    }
    skewX(x) {
        return this.skew(x, 0);
    }
    skewY(y) {
        return this.skew(0, y);
    }
    static hexad(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        return new this([a, b, c, d, e, f]);
    }
    static fromArray(m) {
        return new this(m);
    }
    static parse(d) {
        let m = new this();
        if (d)
            for (const str of d.split(/\)\s*,?\s*/).slice(0, -1)) {
                const kv = str.trim().split('(');
                const name = kv[0].trim();
                const args = kv[1].split(/[\s,]+/).map(function (str) {
                    return parseFloat(str.trim());
                });
                switch (name) {
                    case 'matrix':
                        m._catSelf(this.fromArray(args));
                        break;
                    case 'translate':
                        m._catSelf(this.translate(args[0], args[1]));
                        break;
                    case 'translateX':
                        m._catSelf(this.translateX(args[0]));
                        break;
                    case 'translateY':
                        m._catSelf(this.translateY(args[0]));
                        break;
                    case 'scale':
                        m._catSelf(this.scale(args[0], args[1]));
                        break;
                    case 'rotate':
                        m._catSelf(this.rotate(args[0], args[1], args[2]));
                        break;
                    case 'skewX':
                        m._catSelf(this.skewX(args[0]));
                        break;
                    case 'skewY':
                        m._catSelf(this.skewY(args[0]));
                        break;
                    default:
                        throw new Error(`Unexpected transform '${name}'`);
                }
            }
        return m;
    }
    static fromElement(node) {
        return this.parse(node.getAttribute('transform') || '');
    }
    static new(first) {
        switch (typeof first) {
            case 'string':
                return this.parse(first);
            case 'number':
                return this.hexad(first, arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
            case 'undefined':
                return new Matrix();
            case 'object':
                if (Array.isArray(first)) {
                    return this.fromArray(first);
                }
                else if (first.nodeType === 1) {
                    return this.fromElement(first);
                }
                else {
                    const { a, b, c, d, e, f } = first;
                    return this.hexad(a, b, c, d, e, f);
                }
            default:
                throw new TypeError(`Invalid matrix argument ${Array.from(arguments)}`);
        }
    }
    static interpolate(A, B, opt) {
        const a = this.new(A).toArray();
        const b = this.new(B).toArray();
        const n = a.length;
        const klass = this;
        return function (t) {
            let c = [0, 0, 0, 0, 0, 0];
            for (let i = 0; i < n; ++i)
                c[i] = a[i] === b[i] ? b[i] : a[i] * (1 - t) + b[i] * t;
            return klass.fromArray(c);
        };
    }
    static translate(x = 0, y = 0) {
        return this.hexad(1, 0, 0, 1, x, y);
    }
    static translateY(v) {
        return this.hexad(1, 0, 0, 1, 0, v);
    }
    static translateX(v) {
        return this.hexad(1, 0, 0, 1, v, 0);
    }
    static skew(x, y) {
        return this.hexad(1, tan(radians(y)), tan(radians(x)), 1, 0, 0);
    }
    static skewX(x) {
        return this.skew(x, 0);
    }
    static skewY(y) {
        return this.skew(0, y);
    }
    static rotate(ang, x = 0, y = 0) {
        const θ = ((ang % 360) * PI) / 180;
        const cosθ = cos(θ);
        const sinθ = sin(θ);
        return this.hexad(cosθ, sinθ, -sinθ, cosθ, x ? -cosθ * x + sinθ * y + x : 0, y ? -sinθ * x - cosθ * y + y : 0);
    }
    static scale(scaleX, scaleY) {
        return this.hexad(scaleX, 0, 0, scaleY ?? scaleX, 0, 0);
    }
    static identity() {
        return new this();
    }
}
function closeEnough(a, b, threshold = 1e-6) {
    return abs(b - a) <= threshold;
}
export class MatrixMut extends Matrix {
    setHexad(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.e = e;
        this.f = f;
        return this;
    }
    invertSelf() {
        return this.setHexad(..._inv(this));
    }
    catSelf(m) {
        return this._catSelf(m);
    }
    postCatSelf(m) {
        return this._postCatSelf(m);
    }
}
//# sourceMappingURL=matrix.js.map