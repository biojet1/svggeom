const {sqrt, abs, acos, sign, cos, sin, hypot, atan2, PI} = Math;
const TAU = PI * 2;

export class Point {
	readonly x: number;
	readonly y: number;
	readonly z: number;

	private constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		if (!(isFinite(this.x) && isFinite(this.y))) throw TypeError(`Not finite ${JSON.stringify(arguments)}`);
	}

	// Query methods

	get angle() {
		return this.radians;
	}

	get radians() {
		const {x, y} = this;
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
		const {x, y, z} = this;
		return x * x + y * y + z * z;
	}

	closeTo(p: Iterable<number>, epsilon = 1e-12) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return abs(x1 - x2) < epsilon && abs(y1 - y2) < epsilon && abs(z1 - z2) < epsilon;
	}

	dot(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return x1 * x2 + y1 * y2;
	}

	cross(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return x1 * y2 - y1 * x2;
	}

	equals(p: Iterable<number>) {
		if (!p) {
			return false;
		} else if (p === this) {
			return true;
		}
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return x1 === x2 && y1 === y2 && z1 === z2;
	}

	angleTo(p: Iterable<number>) {
		// return p.sub(this).angle;
		return this.postSubtract(p).angle;
	}

	toString() {
		const {x, y, z} = this;
		return z ? `${x}, ${y}, ${z}` : `${x}, ${y}`;
	}

	toArray() {
		const {x, y, z} = this;
		return [x, y, z];
	}

	// Methods returning new Point

	normal() {
		const {x, y, z} = this;
		return new Point(y, -x, z);
	}

	xpart() {
		const {x} = this;
		return new Point(x, 0, 0);
	}

	ypart() {
		const {y} = this;
		return new Point(0, y, 0);
	}

	zpart() {
		const {z} = this;
		return new Point(0, 0, z);
	}

	div(factor: number) {
		const {x, y, z} = this;
		return new Point(x / factor, y / factor, z / factor);
	}

	add(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return new Point(x1 + x2, y1 + y2, z1 + z2);
	}

	sub(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return new Point(x1 - x2, y1 - y2, z1 - z2);
	}

	postSubtract(p: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = p;
		const [x2, y2, z2] = this;
		return new Point(x1 - x2, y1 - y2, z1 - z2);
	}

	postAdd(p: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = p;
		const [x2, y2, z2] = this;
		return new Point(x1 + x2, y1 + y2, z1 + z2);
	}

	mul(factor: number) {
		const {x, y, z} = this;
		return new Point(x * factor, y * factor, z * factor);
	}

	normalize() {
		const abs = this.abs();
		if (!abs) throw new TypeError("Can't normalize vector of zero length");
		return this.div(abs);
	}

	reflectAt(p: Iterable<number>) {
		// return p.add(p.sub(this));
		return this.postSubtract(p).postAdd(p);
	}

	transform(matrix: any) {
		const {x, y} = this;
		const {a, b, c, d, e, f} = matrix;

		return new Point(a * x + c * y + e, b * x + d * y + f);
	}
	// def rotate(self, angle):
	//     """rotate self counterclockwise by angle"""
	//     # https://stackoverflow.com/questions/4780119/2d-euclidean-vector-rotations
	//     x, y = self[0], self[1]
	//     cs, sn = cos(angle), sin(angle)
	//     return self.__class__(x * cs - y * sn, x * sn + y * cs)

	rotated(rad: number) {
		const {x, y, z} = this;
		const [cs, sn] = [cos(rad), sin(rad)];
		return new Point(x * cs - y * sn, x * sn + y * cs, z);
	}

	clone() {
		return new Point(...this);
	}

	nearestPointOfLine(a: Iterable<number>, b: Iterable<number>): Point {
		const a_to_p = this.sub(a); // a → p
		const a_to_b = Point.subtract(b, a); // a → b
		const t = a_to_p.dot(a_to_b) / a_to_b.absQuad();
		return a_to_b.mul(t).postAdd(a);
	}
	// Modify self methods

	// divideSelf(factor: number) {
	// 	const { x, y, z } = this;
	// 	this.x = x / factor;
	// 	this.y = y / factor;
	// 	this.z = z / factor;
	// 	return this;
	// }
	// isolateX

	// Misc methods

	*[Symbol.iterator](): Iterator<number> {
		const {x, y, z} = this;
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

	static new(x?: number[] | Iterable<number> | number, y?: number, z?: number) {
		if (typeof x == 'number') {
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

	// static fromArray(v: number[]) {
	// 	return new Point(...v);
	// }

	// static fromPolar(radius: number = 1, theta: number = 0) {
	// 	return Point.polar(radius, theta);
	// }

	static polar(radius: number = 1, theta: number = 0, phi: number = 0) {
		return radius ? new Point(radius * cos(theta), radius * sin(theta)) : new Point();
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

	static add(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return new Point(x1 + x2, y1 + y2, z1 + z2);
	}

	static subtract(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return new Point(x1 - x2, y1 - y2, z1 - z2);
	}


}

export const Vector = Point;
export const Vec = Point;
