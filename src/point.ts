const { sqrt, abs, acos, sign, cos, sin, hypot, atan2, PI } = Math;
const TAU = PI * 2;

export class Point {
	readonly x: number;
	readonly y: number;
	readonly z: number;

	private constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		if (!(isFinite(this.x) && isFinite(this.y)))
			throw TypeError(`Not finite ${JSON.stringify(arguments)}`);
	}

	// Query methods

	get angle() {
		return this.radians;
	}

	get radians() {
		const { x, y } = this;
		let r = atan2(y, x);
		return r < 0 ? r + TAU : r;
	}

	get degrees() {
		return (this.radians * 180) / PI;
	}

	get grade() {
		return (this.degrees * 10) / 9;
	}

	abs() {
		return sqrt(this.absQuad());
		// const { x, y } = this;
		// return hypot(x, y);
	}

	absQuad() {
		const { x, y, z } = this;
		return x * x + y * y + z * z;
	}

	closeTo(p: Point, epsilon = 1e-12) {
		const { x: x1, y: y1 } = this;
		const { x: x2, y: y2 } = p;
		return abs(x1 - x2) < epsilon && abs(y1 - y2) < epsilon;
	}

	dot(p: Point) {
		const { x: x1, y: y1 } = this;
		const { x: x2, y: y2 } = p;
		return x1 * x2 + y1 * y2;
	}

	cross(p: Point) {
		const { x: x1, y: y1 } = this;
		const { x: x2, y: y2 } = p;
		return x1 * y2 - y1 * x2;
	}

	equals(p: Point) {
		return p && (p === this || (this.x === p.x && this.y === p.y));
	}

	angleTo(p: Point) {
		return p.sub(this).angle;
	}

	toString() {
		const { x, y, z } = this;
		return z ? `${x}, ${y}, ${z}` : `${x}, ${y}`;
	}

	toArray() {
		const { x, y, z } = this;
		return [x, y, z];
	}

	// Methods returning new Point

	normal() {
		const { x, y, z } = this;
		return new Point(y, -x, z);
	}

	div(factor: number) {
		const { x, y, z } = this;
		return new Point(x / factor, y / factor, z / factor);
	}

	add(p: Point) {
		const { x: x1, y: y1, z: z1 } = this;
		const { x: x2, y: y2, z: z2 } = p;
		return new Point(x1 + x2, y1 + y2, z1 + z2);
	}

	sub(p: Point) {
		const { x: x1, y: y1, z: z1 } = this;
		const { x: x2, y: y2, z: z2 } = p;
		return new Point(x1 - x2, y1 - y2, z1 - z2);
	}

	mul(factor: number) {
		const { x, y, z } = this;
		return new Point(x * factor, y * factor, z * factor);
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

	rotated(rad: number) {
		const { x, y } = this;
		const [cs, sn] = [cos(rad), sin(rad)];
		return new Point(x * cs - y * sn, x * sn + y * cs);
	}

	clone() {
		return new Point(...this);
	}

	// Modify self methods

	// divideSelf(factor: number) {
	// 	const { x, y, z } = this;
	// 	this.x = x / factor;
	// 	this.y = y / factor;
	// 	this.z = z / factor;
	// 	return this;
	// }

	// Misc methods

	*[Symbol.iterator](): Iterator<number> {
		const { x, y, z } = this;
		yield x;
		yield y;
		yield z;
	}

	final() {
		return Object.isFrozen(this) ? this : Object.freeze(this.clone());
	}

	mut() {
		return Object.isFrozen(this) ? this.clone() : this;
	}
	// static methods

	static new(x?: number[] | Point | number, y?: number, z?: number) {
		if (typeof x == "number") {
			return new Point(x, y as number);
		// } else if (Array.isArray(x)) {
		// 	return new Point(...x);
		} else if (x) {
			return new Point(...x);
		// } else if (x) {
		// 	const { x, y, z } = x;
		// 	return new Point(x, y, z);
		// } else if (x) {
		// 	const [ x, y, z ] = x;
		// 	return new Point(x, y ?? 0, z ?? 0);
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

	static fromPolar(radius: number = 1, theta: number = 0) {
		return Point.polar(radius, theta);
	}

	static polar(radius: number = 1, theta: number = 0, phi: number = 0) {
		return radius
			? new Point(radius * cos(theta), radius * sin(theta))
			: new Point();
	}

	static radians(n: number) {
		return Point.polar(1, n);
	}

	static degrees(n: number) {
		return Point.radians((n * PI) / 180);
	}

	static grade(n: number) {
		return Point.degrees((n * 9) / 10);
	}
}

export const Vector = Point;
export const Vec = Point;
