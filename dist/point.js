export class Point {
    x;
    y;
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        if (!(Number.isFinite(this.x) && Number.isFinite(this.y)))
            throw TypeError(`Not finite ${JSON.stringify(arguments)}`);
    }
    abs() {
        return Math.sqrt(this.absQuad());
    }
    absQuad() {
        const { x, y } = this;
        return x * x + y * y;
    }
    closeTo(p, eta = 1e-12) {
        return (this.equals(p) ||
            (Math.abs(this.x - p.x) < eta && Math.abs(this.y - p.y) < eta));
    }
    dot(p) {
        return this.x * p.x + this.y * p.y;
    }
    equals(p) {
        return p && (p === this || (this.x === p.x && this.y === p.y));
    }
    angleTo(p) {
        let sign = Math.sign(this.x * p.y - this.y * p.x);
        sign = sign || 1;
        let v = (this.dot(p) * 1000000) / (this.abs() * p.abs()) / 1000000;
        v = Math.acos(v);
        return sign * v;
    }
    normal() {
        return new Point(this.y, -this.x);
    }
    div(factor) {
        return new Point(this.x / factor, this.y / factor);
    }
    add(p) {
        return new Point(this.x + p.x, this.y + p.y);
    }
    sub(p) {
        return new Point(this.x - p.x, this.y - p.y);
    }
    mul(factor) {
        return new Point(this.x * factor, this.y * factor);
    }
    normalize() {
        const abs = this.abs();
        if (!abs)
            throw new Error("Can't normalize vector of zero length");
        return this.div(abs);
    }
    reflectAt(p) {
        return p.add(p.sub(this));
    }
    transform(matrix) {
        const { x, y } = this;
        const { a, b, c, d, e, f } = matrix;
        return new Point(a * x + c * y + e, b * x + d * y + f);
    }
    native() {
        return this;
    }
    clone() {
        return new Point(this.x, this.y);
    }
    toArray() {
        return [this.x, this.y];
    }
    toPath() {
        return ["M", this.x, this.y].join(" ");
    }
    toString() {
        return `Point(${this.x}, ${this.y})`;
    }
    static from(x, y) {
        if (typeof x == "number") {
            return new Point(x, y);
        }
        else if (Array.isArray(x)) {
            return new Point(...x);
        }
        else if (x) {
            return new Point(x.x, x.y);
        }
        else {
            return new Point();
        }
    }
    static at(x = 0, y = 0, z = 0) {
        return new Point(x, y, z);
    }
    static fromArray(v) {
        return new Point(...v);
    }
}
