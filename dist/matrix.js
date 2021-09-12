const radians = function (d) {
    return ((d % 360) * Math.PI) / 180;
};
export class Matrix {
    a;
    b;
    c;
    d;
    e;
    f;
    constructor(m = undefined) {
        if (m) {
            this.a = m[0];
            this.b = m[1];
            this.c = m[2];
            this.d = m[3];
            this.e = m[4];
            this.f = m[5];
        }
        else {
            this.a = this.d = 1;
            this.b = this.c = this.e = this.f = 0;
        }
        if (!(Number.isFinite(this.a) &&
            Number.isFinite(this.b) &&
            Number.isFinite(this.c) &&
            Number.isFinite(this.d) &&
            Number.isFinite(this.e) &&
            Number.isFinite(this.f)))
            throw Error(`${JSON.stringify(arguments)}`);
    }
    inverse() {
        const { a, d, b, c, e, f } = this;
        const det = a * d - b * c;
        if (!det)
            throw new Error("Cannot invert " + this);
        const na = d / det;
        const nb = -b / det;
        const nc = -c / det;
        const nd = a / det;
        const ne = -(na * e + nc * f);
        const nf = -(nb * e + nd * f);
        return Matrix.fromHexad(na, nb, nc, nd, ne, nf);
    }
    multiply(m) {
        const { a, d, b, c, e, f } = this;
        const { a: A, b: B, c: C, d: D, e: E, f: F } = m;
        return Matrix.fromHexad(a * A + c * B + e * 0, b * A + d * B + f * 0, a * C + c * D + e * 0, b * C + d * D + f * 0, a * E + c * F + e * 1, b * E + d * F + f * 1);
    }
    rotate(ang, x = 0, y = 0) {
        const θ = ((ang % 360) * Math.PI) / 180;
        const cosθ = Math.cos(θ);
        const sinθ = Math.sin(θ);
        return this.multiply(Matrix.fromHexad(cosθ, sinθ, -sinθ, cosθ, x ? -cosθ * x + sinθ * y + x : 0, y ? -sinθ * x - cosθ * y + y : 0));
    }
    scale(scaleX, scaleY = scaleX) {
        return this.multiply(Matrix.fromHexad(scaleX, 0, 0, scaleY, 0, 0));
    }
    skew(x, y) {
        return this.multiply(Matrix.fromHexad(1, Math.tan(radians(y)), Math.tan(radians(x)), 1, 0, 0));
    }
    skewX(x) {
        return this.skew(x, 0);
    }
    skewY(y) {
        return this.skew(0, y);
    }
    toString() {
        return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.e}, ${this.f})`;
    }
    translate(x = 0, y = 0) {
        return this.multiply(Matrix.fromHexad(1, 0, 0, 1, x, y));
    }
    translateY(v) {
        return this.translate(0, v);
    }
    translateX(v) {
        return this.translate(v, 0);
    }
    equals(other, epsilon = 0) {
        const { a, d, b, c, e, f } = this;
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
        var scaleX, scaleY, skewX;
        if ((scaleX = Math.sqrt(a * a + b * b)))
            (a /= scaleX), (b /= scaleX);
        if ((skewX = a * c + b * d))
            (c -= a * skewX), (d -= b * skewX);
        if ((scaleY = Math.sqrt(c * c + d * d)))
            (c /= scaleY), (d /= scaleY), (skewX /= scaleY);
        if (a * d < b * c)
            (a = -a), (b = -b), (skewX = -skewX), (scaleX = -scaleX);
        return {
            translateX: e,
            translateY: f,
            rotate: (Math.atan2(b, a) * 180) / Math.PI,
            skewX: (Math.atan(skewX) * 180) / Math.PI,
            scaleX: scaleX,
            scaleY: scaleY,
        };
    }
    toArray() {
        const { a, d, b, c, e, f } = this;
        return [a, b, c, d, e, f];
    }
    describe() {
        return Matrix.compose(this.decompose());
    }
    static compose(dec) {
        const { translateX, translateY, rotate, skewX, scaleX, scaleY } = dec;
        return `${translateX || translateY
            ? `translate(${translateX},${translateY})`
            : ""}${rotate ? `rotate(${rotate})` : ""}${skewX ? `skewX(${skewX})` : ""}${scaleX == 1 && scaleY == 1 ? "" : `scale(${scaleX},${scaleY})`}`;
    }
    static fromHexad(a = 1, b = 0, c = 0, d = 1, e = 0, f = 0) {
        return new Matrix([a, b, c, d, e, f]);
    }
    static fromArray(m) {
        return new Matrix(m);
    }
    static fromTransform(d) {
        d = d.trim();
        let m = new Matrix();
        if (d)
            for (const str of d
                .split(/\)\s*,?\s*/)
                .slice(0, -1)) {
                const kv = str.trim().split("(");
                const name = kv[0].trim();
                const args = kv[1].split(/[\s,]+/).map(function (str) {
                    return parseFloat(str.trim());
                });
                m =
                    name === "matrix"
                        ? m.multiply(Matrix.fromArray(args))
                        : m[name].apply(m, args);
            }
        return m;
    }
    static fromElement(node) {
        return Matrix.fromTransform(node.getAttribute("transform") || "");
    }
    static from(v) {
        if (Array.isArray(v)) {
            return Matrix.fromArray(v);
        }
        else if (!v) {
            return new Matrix();
        }
        else if (typeof v === "string") {
            return Matrix.fromTransform(v);
        }
        else if (v instanceof Matrix) {
            return v;
        }
        else {
            return Matrix.fromElement(v);
        }
    }
    static interpolate(A, B) {
        const a = Matrix.from(A).toArray();
        const b = Matrix.from(B).toArray();
        const n = a.length;
        return function (t) {
            let c = [0, 0, 0, 0, 0, 0];
            for (let i = 0; i < n; ++i)
                c[i] = a[i] === b[i] ? b[i] : a[i] * (1 - t) + b[i] * t;
            return Matrix.compose(Matrix.fromArray(c).decompose());
        };
    }
    static translate(x = 0, y = 0) {
        return Matrix.fromHexad(1, 0, 0, 1, x, y);
    }
    static translateY(v) {
        return Matrix.fromHexad(1, 0, 0, 1, 0, v);
    }
    static translateX(v) {
        return Matrix.fromHexad(1, 0, 0, 1, v, 0);
    }
}
function closeEnough(a, b, threshold = 1e-6) {
    return Math.abs(b - a) <= threshold;
}
