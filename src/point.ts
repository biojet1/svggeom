const { isFinite } = Number;
const { sqrt, abs, acos, sign, cos, sin, hypot } = Math;

export class Point {
	readonly x: number;
	readonly y: number;
	// [k: string]: number;
	// Initialize
	private constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		if (!(isFinite(this.x) && isFinite(this.y)))
			throw TypeError(`Not finite ${JSON.stringify(arguments)}`);
	}
	// Query methods

	abs() {
		return sqrt(this.absQuad());
	}

	absQuad() {
		const { x, y } = this;

		return x * x + y * y;
	}

	closeTo(p: Point, eta = 1e-12) {
		return (
			this.equals(p) ||
			(abs(this.x - p.x) < eta && abs(this.y - p.y) < eta)
		);
	}

	dot(p: Point) {
		return this.x * p.x + this.y * p.y;
	}

	equals(p: Point) {
		return p && (p === this || (this.x === p.x && this.y === p.y));
	}

	angleTo(p: Point) {
		let sig = sign(this.x * p.y - this.y * p.x);
		// return (
		// 	(sig || 1) *
		// 	acos(
		// 		Math.round((this.dot(p) / (this.abs() * p.abs())) * 1000000) / 1000000
		// 	)
		// );
		let v = (this.dot(p) * 1000000) / (this.abs() * p.abs()) / 1000000;
		// v = v < -1.0 ? PI : v > 1.0 ? 0 : acos(v);
		v = acos(v);
		// v = max(-1, min(1, v));
		return (sig || 1) * v;
	}

	// Methods returning new Point
	normal() {
		const { x, y } = this;
		return new Point(y, -x);
	}

	div(factor: number) {
		const { x, y } = this;
		return new Point(x / factor, y / factor);
	}

	add(p: Point) {
		const { x: x1, y: y1 } = this;
		const { x: x2, y: y2 } = p;
		return new Point(x1 + x2, y1 + y2);
	}

	sub(p: Point) {
		return new Point(this.x - p.x, this.y - p.y);
	}

	mul(factor: number) {
		return new Point(this.x * factor, this.y * factor);
	}

	normalize() {
		const abs = this.abs();
		if (!abs) throw new TypeError("Can't normalize vector of zero length");
		return this.div(abs);
	}

	reflectAt(p: Point) {
		return p.add(p.sub(this));
	}

	transform(matrix: any) {
		const { x, y } = this;
		const { a, b, c, d, e, f } = matrix;

		return new Point(a * x + c * y + e, b * x + d * y + f);
	}
	// def rotate(self, angle):
	//     """rotate self counterclockwise by angle"""
	//     # https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
	//     x, y = self[0], self[1]
	//     cs, sn = cos(angle), sin(angle)
	//     return self.__class__(x * cs - y * sn, x * sn + y * cs)

	rotate(rad: number) {
		const { x, y } = this;
		const [cs, sn] = [cos(rad), sin(rad)];
		return new Point(x * cs - y * sn, x * sn + y * cs);
	}

	// Misc methods

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

	final() {
		return Object.isFrozen(this) ? this : Object.freeze(this.clone());
	}
	mut() {
		return Object.isFrozen(this) ? this.clone() : this;
	}
	// static methods

	static new(x?: number[] | Point | number, y?: any) {
		if (typeof x == "number") {
			return new Point(x, y as number);
		} else if (Array.isArray(x)) {
			return new Point(...x);
		} else if (x) {
			return new Point(x.x, x.y);
		} else {
			return new Point();
		}
	}

	static at(x: number = 0, y: number = 0, z: number = 0) {
		return new Point(x, y, z);
	}

	static fromArray(v: number[]) {
		return new Point(...v);
	}
}

// export class PointMut extends Point {
// 	x: number;
// 	y: number;
// 	mulSelf(factor: number) {
// 		this.x *= factor;
// 		this.y *= factor;
// 		return this;
// 	}
// }
