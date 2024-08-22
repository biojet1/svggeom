const { sqrt, abs, cos, sin, atan2, PI } = Math;
const TAU = PI * 2;

export class Vec extends Float64Array {

	get x() {
		return this[0];
	}
	get y() {
		return this[1];
	}
	get z() {
		return this[2];
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
			if (!isFinite(n)) {
				throw new Error(`{this}`)
			}
			r += (n * n)
		}
		return r;
	}

	abs() {
		return sqrt(this.abs_quad());
	}

	close_to(p: Iterable<number>, epsilon = 1e-12) {
		const i = p[Symbol.iterator]();
		for (const n of this) {
			if (!isFinite(n)) {
				throw new Error(`{this}`)
			}
			const m = i.next().value;
			if (!isFinite(m)) {
				throw new Error(`{this}`)
			}
			if (abs(n - m) >= epsilon) {
				return false;
			}
		}
		return true;
	}

	dot(p: Iterable<number>) {
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
		return Vec.vec(b * z - c * y, c * x - a * z, a * y - b * x);
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
	}

	angle_to(p: Iterable<number>) {
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
		const [x, y, z] = this;
		return Vec.vec(y, -x, z);
	}



	div(factor: number) {
		return Vec.vec(...[...this].map(v => v / factor));
	}

	mul(factor: number) {
		return Vec.vec(...[...this].map(v => v * factor));
	}

	add(that: Iterable<number>) {
		const I = that[Symbol.iterator]();
		return new Vec(this.map((v, i) => v + (I.next().value ?? 0)));
	}

	sub(that: Iterable<number>) {
		const I = that[Symbol.iterator]();
		return new Vec(this.map((v, i) => v - (I.next().value ?? 0)));
	}

	// subtract, divide, multiply
	post_subtract(that: Iterable<number> | Vec) {
		const I = that[Symbol.iterator]();
		return new Vec(this.map((v, i) => (I.next().value ?? 0) - v));
	}


	post_add(that: Iterable<number>) {
		const I = that[Symbol.iterator]();
		return new Vec(this.map((v, i) => (I.next().value ?? 0) + v));
	}




	distance(p: Iterable<number>): number {
		return this.sub(p).abs();
	}

	normalize() {
		const abs = this.abs();
		if (!abs) throw new TypeError(`Can't normalize vector of zero length [${this}]`);
		return this.div(abs);
	}

	reflect_at(p: Iterable<number>) {
		// return p.add(p.sub(this));
		return this.post_subtract(p).post_add(p);
	}

	transform(matrix: any) {
		const [x, y] = this;
		const { a, b, c, d, e, f } = matrix;

		return Vec.vec(a * x + c * y + e, b * x + d * y + f);
	}

	flip_x() {
		return new Vec(this.map((v, i) => (i == 0 ? -v : v)));
	}

	flip_y() {
		return new Vec(this.map((v, i) => (i == 1 ? -v : v)));
	}

	flip_z() {
		return new Vec(this.map((v, i) => (i == 2 ? -v : v)));
	}

	shift_x(d: number) {
		return new Vec(this.map((v, i) => (i == 0 ? v + d : v)));
	}

	shift_y(d: number) {
		return new Vec(this.map((v, i) => (i == 1 ? v + d : v)));
	}

	shift_z(d: number) {
		return new Vec(this.map((v, i) => (i == 2 ? v + d : v)));
	}
	only_x() {
		return new Vec(this.map((v, i) => (i == 0 ? v : 0)));
	}

	only_y() {
		return new Vec(this.map((v, i) => (i == 1 ? v : 0)));
	}

	only_z() {
		return new Vec(this.map((v, i) => (i == 2 ? v : 0)));
	}

	with_x(n: number) {
		return new Vec(this.map((v, i) => (i == 0 ? n : v)));
	}

	with_y(n: number) {
		return new Vec(this.map((v, i) => (i == 1 ? n : v)));
	}

	with_z(n: number) {
		return new Vec(this.map((v, i) => (i == 2 ? n : v)));
	}
	rotated(rad: number) {
		const [x, y, z] = this;
		const [cs, sn] = [cos(rad), sin(rad)];
		return Vec.vec(x * cs - y * sn, x * sn + y * cs, z);
	}

	clone() {
		return Vec.vec(...this);
	}

	nearest_point_of_line(a: Iterable<number>, b: Iterable<number>): Vec {
		const a_to_p = this.sub(a); // a → p
		const a_to_b = Vec.subtract(b, a); // a → b
		const t = a_to_p.dot(a_to_b) / a_to_b.abs_quad();
		return a_to_b.mul(t).post_add(a);
	}
	// Modify self methods

	// Misc methods

	// *[Symbol.iterator](): Iterator<number> {
	// 	const { a, b, c } = this;
	// 	yield a;
	// 	yield b;
	// 	yield c;
	// }

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
				return this.vec(x, y ?? 0, z ?? 0);
			case 'string':
				return this.parse(x);
			default:
				if (x) {
					return this.pos(...x);
				} else {
					return new this();
				}
		}
	}
	private static vec(...nums: number[]) {
		for (const n of nums) {
			if (!isFinite(n)) {
				throw new TypeError(`must be finite ${nums}`)
			}
		}
		return new this(nums);
	}
	static pos(x: number = 0, y: number = 0, z: number = 0) {
		return this.vec(x, y, z);
	}


	static polar(radius: number = 1, ϕ: number = 0, ϴ?: number) {
		if (ϴ == null) {
			return radius ? this.vec(radius * cos(ϕ), radius * sin(ϕ), 0) : this.vec(0, 0, 0);
		} else {
			// http://www.kwon3d.com/theory/crdsys/polar.html
			const sinϴ = sin(ϴ);
			return radius
				? this.vec(radius * cos(ϕ) * sinϴ, radius * sin(ϕ) * sinϴ, radius * cos(ϴ))
				: this.vec(0, 0, 0);
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
				return this.vec(0, r, 0);
			case -90:
			case 270:
				return this.vec(0, -r, 0);
			case 180:
			case -180:
				return this.vec(-r, 0, 0);
		}
		return this.radians((ϴ * PI) / 180, r);
	}

	static grade(n: number, r: number = 1) {
		return this.degrees((n * 9) / 10, r);
	}

	static add(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return this.vec(x1 + x2, y1 + y2, z1 + z2);
	}

	static subtract(a: Iterable<number>, b: Iterable<number>) {
		const [x1, y1 = 0, z1 = 0] = a;
		const [x2, y2 = 0, z2 = 0] = b;
		return this.vec(x1 - x2, y1 - y2, z1 - z2);
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
