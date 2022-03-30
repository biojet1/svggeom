const {sqrt, abs, acos, sign, cos, sin, hypot, atan2, PI} = Math;
const TAU = PI * 2;

export class Vec {
	readonly x: number;
	readonly y: number;
	readonly z: number;

	private constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		if (isNaN(x) || isNaN(y) || isNaN(z)) throw TypeError(`Must be a number x=${x} y=${y} z=${z}`);
		// if (!(isFinite(x) && isFinite(y) && isFinite(z))) throw TypeError(`Not finite x=${x} y=${y} z=${z}`);
	}

	// **** Query methods ****

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

	absQuad() {
		const {x, y, z} = this;
		return x * x + y * y + z * z;
	}

	abs() {
		return sqrt(this.absQuad());
		// const { x, y } = this;
		// return hypot(x, y);
	}

	closeTo(p: Iterable<number>, epsilon = 1e-12) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return abs(x1 - x2) < epsilon && abs(y1 - y2) < epsilon && abs(z1 - z2) < epsilon;
	}

	dot(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return x1 * x2 + y1 * y2 + z1 * z2;
	}

	cross(p: Iterable<number>) {
		const [a, b, c] = this;
		const [x, y = 0, z = 0] = p;
		return new Vec(b * z - c * y, c * x - a * z, a * y - b * x);
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

	// Methods returning new Vec

	normal() {
		const {x, y, z} = this;
		return new Vec(y, -x, z);
	}

	onlyX() {
		const {x} = this;
		return new Vec(x, 0, 0);
	}

	onlyY() {
		const {y} = this;
		return new Vec(0, y, 0);
	}

	onlyZ() {
		const {z} = this;
		return new Vec(0, 0, z);
	}

	withX(x: number) {
		const {y, z} = this;
		return new Vec(x, y, z);
	}

	withY(y: number) {
		const {x, z} = this;
		return new Vec(x, y, z);
	}

	withZ(z: number) {
		const {y, x} = this;
		return new Vec(x, y, z);
	}

	div(factor: number) {
		const {x, y, z} = this;
		return new Vec(x / factor, y / factor, z / factor);
	}

	add(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return new Vec(x1 + x2, y1 + y2, z1 + z2);
	}

	sub(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2 = 0, z2 = 0] = p;
		return new Vec(x1 - x2, y1 - y2, z1 - z2);
	}

	postSubtract(p: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = p;
		const [x2, y2, z2] = this;
		return new Vec(x1 - x2, y1 - y2, z1 - z2);
	}

	postAdd(p: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = p;
		const [x2, y2, z2] = this;
		return new Vec(x1 + x2, y1 + y2, z1 + z2);
	}

	mul(factor: number) {
		const {x, y, z} = this;
		return new Vec(x * factor, y * factor, z * factor);
	}

	distance(p: Iterable<number>): number {
		return this.sub(p).abs();
	}

	normalize() {
		const abs = this.abs();
		if (!abs) throw new TypeError(`Can't normalize vector of zero length [${this}]`);
		return this.div(abs);
		// const {x, y, z} = this;
		// if(x){
		// 	if(y==0,)
		// }
		// return x * x + y * y + z * z;
	}

	reflectAt(p: Iterable<number>) {
		// return p.add(p.sub(this));
		return this.postSubtract(p).postAdd(p);
	}

	transform(matrix: any) {
		const {x, y} = this;
		const {a, b, c, d, e, f} = matrix;

		return new Vec(a * x + c * y + e, b * x + d * y + f);
	}

	flipX(d: number) {
		const {x, y, z} = this;
		return new Vec(-x, y, z);
	}

	flipY(d: number) {
		const {x, y, z} = this;
		return new Vec(x, -y, z);
	}

	flipZ(d: number) {
		const {x, y, z} = this;
		return new Vec(x, y, -z);
	}

	shiftX(d: number) {
		const {x, y, z} = this;
		return new Vec(x + d, y, z);
	}

	shiftY(d: number) {
		const {x, y, z} = this;
		return new Vec(x, y + d, z);
	}

	shiftZ(d: number) {
		const {x, y, z} = this;
		return new Vec(x, y, z + d);
	}

	rotated(rad: number) {
		const {x, y, z} = this;
		const [cs, sn] = [cos(rad), sin(rad)];
		return new Vec(x * cs - y * sn, x * sn + y * cs, z);
	}

	clone() {
		return new Vec(...this);
	}

	nearestPointOfLine(a: Iterable<number>, b: Iterable<number>): Vec {
		const a_to_p = this.sub(a); // a → p
		const a_to_b = Vec.subtract(b, a); // a → b
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
	//***** static methods ****

	static new(x?: number[] | Iterable<number> | number, y?: number, z?: number) {
		if (typeof x == 'number') {
			return new this(x, y as number, z as number);
		} else if (x) {
			return new this(...x);
		} else {
			return new this();
		}
	}

	static at(x: number = 0, y: number = 0, z: number = 0) {
		return new this(x, y, z);
	}

	static pos(x: number = 0, y: number = 0, z: number = 0) {
		return new this(x, y, z);
	}

	static polar(radius: number = 1, theta: number = 0, phi: number = 0) {
		return radius ? new this(radius * cos(theta), radius * sin(theta)) : new this();
	}

	static radians(n: number) {
		return this.polar(1, n);
	}

	static degrees(n: number) {
		switch (n) {
			// case 0:
			// 	return new this(1, 0, 0);
			case 90:
			case -270:
				return new this(0, 1, 0);
			case -90:
			case 270:
				return new this(0, -1, 0);
			case 180:
			case -180:
				return new this(-1, 0, 0);
		}
		return this.radians((n * PI) / 180);
	}

	static grade(n: number) {
		return this.degrees((n * 9) / 10);
	}

	static add(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return new this(x1 + x2, y1 + y2, z1 + z2);
	}

	static subtract(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return new this(x1 - x2, y1 - y2, z1 - z2);
	}
}

export {Vec as Point};
