import { Vector } from './vector.js';

const { abs, sqrt, PI } = Math;
const TAU = PI * 2;

type NumOrVec = number | Iterable<number>;

function* pickXY(args: NumOrVec[]) {
	for (const v of args) {
		if (typeof v == 'number') {
			// console.warn(`pickXY number is depreciated`);
			throw new Error(`pickXY number is depreciated`);
			// yield v;
		} else {
			const [x, y] = v;
			yield x;
			yield y;
		}
	}
}

function Pt(x: NumOrVec, y?: number) {
	if (typeof x === 'object') {
		return Vector.pos(...x);
	} else {
		console.warn(`Pt number is depreciated`);
		throw new Error(`Pt number is depreciated`);
		// return Vector.pos(x, y);
	}
}

export class VecRay {
	readonly _pos: Vector;
	readonly _dir: Vector;

	constructor(pos: Vector, aim: Vector) {
		this._pos = pos;
		this._dir = aim;
	}
	// Query

	get x() {
		const [x,] = this.pos;
		return x;
	}

	get y() {
		const [x, y] = this.pos;
		return y;
	}

	get z() {
		const [x, y, z] = this.pos;
		return z;
	}

	get h() {
		const [x, y] = this.dir;
		return x;
	}

	get v() {
		const [x, y] = this.dir;
		return y;
	}

	get pos() {
		return this._pos;
	}

	get dir() {
		return this._dir;
	}

	*[Symbol.iterator](): Iterator<number> {
		yield* this.pos;
	}

	at() {
		return this.pos;
	}

	distance(x: NumOrVec, y?: number): number {
		return this.delta(x, y).abs();
	}

	point_along(d: number): Vector {
		const { pos, dir } = this;
		return pos.add(Vector.polar(d, dir.radians));
	}

	delta(x: NumOrVec, y?: number) {
		return Pt(x, y).subtract(this.pos);
	}

	side(x: NumOrVec, y?: number) {
		const { pos, dir } = this;
		const [Ax, Ay] = pos;
		const [Bx, By] = pos.add(dir);
		const [X, Y] = Pt(x, y);
		const d = (Bx - Ax) * (Y - Ay) - (By - Ay) * (X - Ax);
		return d > 0 ? 1 : d < 0 ? -1 : 0;
	}

	// Calc
	distance_from_line(a: Iterable<number>, b: Iterable<number>): number {
		const [x, y] = this.pos;
		const [x1, y1] = a;
		const [x2, y2] = b;
		const [dx, dy] = [x2 - x1, y2 - y1];

		if (dx && dy) {
			return abs(dx * (y1 - y) - dy * (x1 - x)) / sqrt(dx ** 2 + dy ** 2);
		} else if (dy) {
			return abs(x1 - x); // dx === 0
		} else if (dx) {
			return abs(y1 - y); // dy === 0
		}
		return NaN;
	}

	nearest_point_of_line(a: Iterable<number>, b: Iterable<number>): Vector {
		return this.pos.nearest_point_of_line(a, b);
	}

	intersect_of_line(a: Iterable<number>, b: Iterable<number>): Vector {
		const { pos, dir } = this;
		const [x1, y1] = a;
		const [x2, y2] = b;
		const [x3, y3] = pos;
		const [x4, y4] = pos.add(dir); // d
		const e1 = x1 * y2 - y1 * x2; // a.cross(b)
		const e2 = x3 * y4 - y3 * x4; // pos.cross(d)
		const dx = [x1 - x2, x3 - x4];
		const dy = [y1 - y2, y3 - y4];
		const d = dx[0] * dy[1] - dy[0] * dx[1];
		// if (d === 0) {
		// 	if (dx[0] === 0) {
		// 		// x1 == x2
		// 		if (dx[1] === 0) {
		// 			// x3 == x4
		// 			// parallel
		// 			// return NaN;
		// 		} else if (dy[0] === 0) {
		// 			// y1 == y2
		// 			// return NaN;
		// 		} else if (dy[1] === 0) {
		// 			// y3 == y4
		// 			// perpendicular?
		// 			// return Vector.pos(x1, y3);
		// 		}
		// 	} else if (dy[0] === 0) {
		// 	}
		// }
		return Vector.pos((e1 * dx[1] - dx[0] * e2) / d, (e1 * dy[1] - dy[0] * e2) / d);
	}

	intersect_of_ray(r: Ray): Vector {
		const { pos, dir } = this;
		return r.intersect_of_line(pos, pos.add(dir));
	}

	nearest_point_from_point(p: Iterable<number>): Vector {
		const { pos, dir } = this;
		return Vector.new(p).nearest_point_of_line(pos, pos.add(dir));
	}
}

export class Ray extends VecRay {
	clone() {
		const { pos, dir } = this;
		return new Ray(pos, dir);
	}

	protected new_pos(v: Vector) {
		return new Ray(v, this.dir);
	}

	protected new_dir(v: Vector) {
		return new Ray(this.pos, v);
	}

	protected new_ray(p: Vector, a: Vector) {
		return new Ray(p, a);
	}

	with_dir(rad: NumOrVec) {
		// turned with_dir
		if (typeof rad === 'object') {
			return this.new_dir(Vector.pos(...rad));
		} else {
			return this.new_dir(Vector.radians(rad));
		}
	}

	with_h(h = 0) {
		const { v } = this;
		return this.new_dir(Vector.pos(h, v));
	}

	with_v(v = 0) {
		const { h } = this;
		return this.new_dir(Vector.pos(h, v));
	}

	with_x(x = 0) {
		const { pos } = this;
		return this.new_pos(pos.with_x(x));
	}

	with_y(y = 0) {
		const { pos } = this;
		return this.new_pos(pos.with_y(y));
	}

	with_z(z = 0) {
		const { pos } = this;
		return this.new_pos(pos.with_z(z));
	}
	shift_x(d: number) {
		return this.new_pos(this.pos.shift_x(d));
	}

	shift_y(d: number) {
		return this.new_pos(this.pos.shift_y(d));
	}

	shift_z(d: number) {
		return this.new_pos(this.pos.shift_z(d));
	}

	flip_x() {
		return this.new_pos(this.pos.flip_x());
	}

	flip_y() {
		return this.new_pos(this.pos.flip_y());
	}

	flip_z() {
		return this.new_pos(this.pos.flip_z());
	}

	// Move
	goto(x: NumOrVec, y?: number) {
		return this.new_pos(Pt(x, y));
	}

	forward(d: number) {
		const { pos, dir } = this;
		return this.new_pos(dir.normalize().multiply(d).post_add(pos));
	}

	back(d?: number) {
		if (d) {
			return this.forward(-d);
		} else {
			return this.new_dir(this.dir.multiply(-1));
		}
	}

	translate(x: NumOrVec, y?: number) {
		const { pos } = this;
		return this.new_pos(Pt(x, y).post_add(pos));
	}

	along(t: number, x: NumOrVec, y?: number) {
		const { pos } = this;
		return this.new_pos(Pt(x, y).subtract(pos).multiply(t).post_add(pos));
	}

	// Turn

	turn(rad: NumOrVec) {
		// turned with_dir
		if (typeof rad === 'object') {
			return this.new_dir(Vector.pos(...rad));
		} else {
			return this.new_dir(Vector.radians(rad));
		}
	}

	left(rad?: number) {
		switch (rad) {
			case undefined:
				const { h, v } = this;
				return this.new_dir(Vector.pos(-v, h));
			default:
				return this.new_dir(this.dir.rotated(rad));
		}
	}

	right(rad?: number) {
		if (rad === undefined) {
			const { h, v } = this;
			return this.new_dir(Vector.pos(v, -h));
		} else {
			return this.new_dir(this.dir.rotated(-rad));
		}
	}

	turnd(deg: number) {
		return this.turn((deg * TAU) / 360);
	}

	leftd(deg: number) {
		// switch (deg) {
		// 	case 90:
		// 		return this.left();
		// 	case -90:
		// 		return this.right();
		// 	case 180:
		// 	case -180:
		// 		return this.back();
		// }
		return this.left((deg * TAU) / 360);
	}

	rightd(deg: number) {
		// switch (deg) {
		// 	case 90:
		// 		return this.right();
		// 	case -90:
		// 		return this.left();
		// 	case 180:
		// 	case -180:
		// 		return this.back();
		// }
		return this.right((deg * TAU) / 360);
	}

	// Aimed Move

	towards(x: NumOrVec, y?: number) {
		return this.new_dir(Pt(x, y).subtract(this.pos));
	}

	away(x: NumOrVec, y?: number) {
		return this.new_dir(this.pos.subtract(Pt(x, y)));
	}

	after(x: NumOrVec, y?: number) {
		const v = Pt(x, y);
		return this.new_ray(v, this.pos.subtract(v));
	}

	before(x: NumOrVec, y?: number) {
		const v = Pt(x, y);
		return this.new_ray(v, v.subtract(this.pos));
	}

	// Calc Aim

	normal_to_side(a: Iterable<number>) {
		const s = this.side(a);
		const { dir: [x, y] } = this;
		if (s > 0) {
			return this.new_dir(Vector.pos(-y, x));
		} else if (s < 0) {
			return this.new_dir(Vector.pos(y, -x));
		}
		return this;
	}

	normal_to_line(a: Iterable<number>, b: Iterable<number>) {
		return this.new_dir(this.nearest_point_of_line(a, b).subtract(this.pos));
	}

	// Calc Move

	to_nearest_point_of_line(a: Iterable<number>, b: Iterable<number>) {
		return this.new_pos(this.nearest_point_of_line(a, b));
	}

	to_nearest_point_from_point(p: Iterable<number>) {
		const { pos, dir } = this;
		return this.new_pos(Ray.pos(p).nearest_point_of_line(pos, pos.add(dir)));
	}

	to_point_t(t: number, a: Iterable<number>, b: Iterable<number>) {
		return this.new_pos(Vector.subtract(b, a).multiply(t).add(a));
	}

	to_mid_point(a: Iterable<number>, b: Iterable<number>) {
		return this.to_point_t(0.5, a, b);
	}

	////// constructors
	static new(...args: NumOrVec[]) {
		const [x = 0, y = 0, h = 1, v = 0] = pickXY(args);
		return new this(Vector.pos(x, y), Vector.pos(h, v));
	}

	static pos(x: NumOrVec, y?: number) {
		return new this(Pt(x, y), Vector.pos(1, 0));
	}

	static at(x: NumOrVec, y?: number) {
		return new this(Pt(x, y), Vector.pos(1, 0));
	}

	static dir(rad: NumOrVec) {
		if (typeof rad === 'object') {
			return new this(Vector.pos(0, 0), Vector.pos(...rad));
		} else {
			return new this(Vector.pos(0, 0), Vector.radians(rad));
		}
	}

	static towards(x: NumOrVec, y?: number) {
		return this.home.towards(Pt(x, y));
	}

	static away(x: NumOrVec, y?: number) {
		return this.home.away(Pt(x, y));
	}

	static after(x: NumOrVec, y?: number) {
		return this.home.after(Pt(x, y));
	}

	static before(x: NumOrVec, y?: number) {
		return this.home.before(Pt(x, y));
	}

	static get home() {
		return new this(Vector.pos(0, 0), Vector.pos(1, 0));
	}
}

export class LinkedRay extends Ray {
	_prev: Ray | undefined;
	constructor(pos: Vector, dir: Vector, ray?: Ray) {
		super(pos, dir);
		this._prev = ray;
	}
	prev() {
		return this._prev;
	}
	protected override new_pos(v: Vector): LinkedRay {
		return new LinkedRay(v, this.dir, this);
	}
	protected override new_dir(v: Vector): LinkedRay {
		return new LinkedRay(this.pos, v, this);
	}
	protected override new_ray(p: Vector, a: Vector): LinkedRay {
		return new LinkedRay(p, a, this);
	}
}
