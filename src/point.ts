const { sqrt, abs, cos, sin, atan2, PI } = Math;
const TAU = PI * 2;

export class Vec {
	readonly x: number;
	readonly y: number;
	readonly z: number;

	private constructor(x: number = 0, y: number = 0, z: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		if (isNaN(x) || isNaN(y) || isNaN(z))
			throw TypeError(`Must be a number x=${x} y=${y} z=${z}`);
		// if (!(isFinite(x) && isFinite(y) && isFinite(z))) throw TypeError(`Not finite x=${x} y=${y} z=${z}`);
	}

	// **** Query methods ****

	get radians() {
		const [x, y] = this;
		let r = atan2(y, x);
		return r < 0 ? r + TAU : r;
	}
	get angle() {
		return this.radians;
	}
	get degrees() {
		return (this.radians * 180) / PI;
	}

	get grade() {
		return (this.degrees * 10) / 9;
	}

	abs_quad() {
		let r = 0;
		for (const n of this) {
			r += (n * n)
		}
		return r;
	}

	abs() {
		return sqrt(this.abs_quad());
	}

	closeTo(p: Iterable<number>, epsilon = 1e-12) {
		const i = p[Symbol.iterator]();
		for (const n of this) {
			const m = i.next().value;
			if (abs(n - m) >= epsilon) {
				return false;
			}
		}
		return true;
		// const [x1, y1, z1] = this;
		// const [x2, y2 = 0, z2 = 0] = p;
		// return abs(x1 - x2) < epsilon && abs(y1 - y2) < epsilon && abs(z1 - z2) < epsilon;
	}

	dot(p: Iterable<number>) {
		// const [x1, y1, z1] = this;
		// const [x2, y2 = 0, z2 = 0] = p;
		// return x1 * x2 + y1 * y2 + z1 * z2;
		let r = 0;
		const i = p[Symbol.iterator]();
		for (const n of this) {
			const m = i.next().value;
			r += (n * m)
		}
		return r;
	}

	cross(p: Iterable<number>) {
		const [a, b, c] = this;
		const [x, y = 0, z = 0] = p;
		return Vec.of(b * z - c * y, c * x - a * z, a * y - b * x);
	}

	equals(p: Iterable<number>): boolean {
		if (!p) {
			return false;
		} else if (p === this) {
			return true;
		} else {
			const A = this[Symbol.iterator]();
			const B = p[Symbol.iterator]();
			let a = A.next();
			let b = B.next();
			while (1) {
				if (a.done && b.done) {
					return true;
				} else if (!b.done && a.value == b.value) {
					a = A.next();
					b = B.next();
				} else {
					return false;
				}
			};
			return false;
		}
		// const [x1, y1, z1] = this;
		// const [x2, y2 = 0, z2 = 0] = p;
		// return x1 === x2 && y1 === y2 && z1 === z2;
	}

	angleTo(p: Iterable<number>) {
		// return p.sub(this).angle;
		return this.post_subtract(p).angle;
	}

	toString() {
		// const { x, y, z } = this;
		// return z ? `${x}, ${y}, ${z}` : `${x}, ${y}`;
		return this.toArray().join(', ')
	}

	toArray() {
		return [...this];
	}

	// Methods returning new Vec

	normal() {
		const { x, y, z } = this;
		return Vec.of(y, -x, z);
	}

	onlyX() {
		const { x } = this;
		return Vec.of(x, 0, 0);
	}

	onlyY() {
		const { y } = this;
		return Vec.of(0, y, 0);
	}

	onlyZ() {
		const { z } = this;
		return Vec.of(0, 0, z);
	}

	withX(x: number) {
		const { y, z } = this;
		return Vec.of(x, y, z);
	}

	withY(y: number) {
		const { x, z } = this;
		return Vec.of(x, y, z);
	}

	withZ(z: number) {
		const { y, x } = this;
		return Vec.of(x, y, z);
	}

	div(factor: number) {
		const { x, y, z } = this;
		return Vec.of(x / factor, y / factor, z / factor);
	}

	add(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2, z2 = 0] = p;
		return Vec.of(x1 + x2, y1 + y2, z1 + z2);
	}

	sub(p: Iterable<number>) {
		const [x1, y1, z1] = this;
		const [x2, y2, z2 = 0] = p;
		return Vec.of(x1 - x2, y1 - y2, z1 - z2);
	}

	// subtract, divide, multiply

	post_subtract(p: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = p;
		const [x2, y2, z2] = this;
		return Vec.of(x1 - x2, y1 - y2, z1 - z2);
	}

	postAdd(p: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = p;
		const [x2, y2, z2] = this;
		return Vec.of(x1 + x2, y1 + y2, z1 + z2);
	}

	mul(factor: number) {
		const { x, y, z } = this;
		return Vec.of(x * factor, y * factor, z * factor);
	}

	distance(p: Iterable<number>): number {
		return this.sub(p).abs();
	}

	normalize() {
		const abs = this.abs();
		if (!abs) throw new TypeError(`Can't normalize vector of zero length [${this}]`);
		return this.div(abs);
	}

	reflectAt(p: Iterable<number>) {
		// return p.add(p.sub(this));
		return this.post_subtract(p).postAdd(p);
	}

	transform(matrix: any) {
		const { x, y } = this;
		const { a, b, c, d, e, f } = matrix;

		return Vec.of(a * x + c * y + e, b * x + d * y + f);
	}

	flipX() {
		const { x, y, z } = this;
		return Vec.of(-x, y, z);
	}

	flipY() {
		const { x, y, z } = this;
		return Vec.of(x, -y, z);
	}

	flipZ() {
		const { x, y, z } = this;
		return Vec.of(x, y, -z);
	}

	shiftX(d: number) {
		const { x, y, z } = this;
		return Vec.of(x + d, y, z);
	}

	shiftY(d: number) {
		const { x, y, z } = this;
		return Vec.of(x, y + d, z);
	}

	shiftZ(d: number) {
		const { x, y, z } = this;
		return Vec.of(x, y, z + d);
	}

	rotated(rad: number) {
		const { x, y, z } = this;
		const [cs, sn] = [cos(rad), sin(rad)];
		return Vec.of(x * cs - y * sn, x * sn + y * cs, z);
	}

	clone() {
		return Vec.of(...this);
	}

	nearestPointOfLine(a: Iterable<number>, b: Iterable<number>): Vec {
		const a_to_p = this.sub(a); // a → p
		const a_to_b = Vec.subtract(b, a); // a → b
		const t = a_to_p.dot(a_to_b) / a_to_b.abs_quad();
		return a_to_b.mul(t).postAdd(a);
	}
	// Modify self methods

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
	//***** static methods ****

	static new(x?: number[] | Iterable<number> | number | string, y?: number, z?: number) {
		switch (typeof x) {
			case 'number':
				return new this(x, y as number, z as number);
			case 'string':
				return this.parse(x);
			default:
				if (x) {
					return new this(...x);
				} else {
					return new this();
				}
		}
	}
	private static of(...nums: number[]) {
		return new this(...nums);
	}

	static polar(radius: number = 1, ϕ: number = 0, ϴ?: number) {
		if (ϴ == null) {
			return radius ? this.of(radius * cos(ϕ), radius * sin(ϕ)) : this.of(0, 0, 0);
		} else {
			// http://www.kwon3d.com/theory/crdsys/polar.html
			const sinϴ = sin(ϴ);
			return radius
				? this.of(radius * cos(ϕ) * sinϴ, radius * sin(ϕ) * sinϴ, radius * cos(ϴ))
				: this.of(0, 0, 0);
		}
	}

	static radians(n: number, r: number = 1) {
		return this.polar(r, n);
	}

	static degrees(ϴ: number, r: number = 1) {
		switch (ϴ) {
			// case 0:
			// 	return this.of(1, 0, 0);
			case 90:
			case -270:
				return this.of(0, r, 0);
			case -90:
			case 270:
				return this.of(0, -r, 0);
			case 180:
			case -180:
				return this.of(-r, 0, 0);
		}
		return this.radians((ϴ * PI) / 180, r);
	}

	static grade(n: number, r: number = 1) {
		return this.degrees((n * 9) / 10, r);
	}

	static add(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return this.of(x1 + x2, y1 + y2, z1 + z2);
	}

	static subtract(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return this.of(x1 - x2, y1 - y2, z1 - z2);
	}

	static parse(s: string): Vec {
		const a = s.split(/\</);
		if (a.length > 1) {
			const [r, ϴ] = a.map(v => parseFloat(v.trim()));
			return this.degrees(ϴ, r);
		}
		return this.new(...s.split(/(?:\s|\,)\s*/).map(v => parseFloat(v.trim() || '0')));
	}
}

// export { Vec as Point };
