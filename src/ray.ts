import { Vec } from './point.js';

const { abs, sqrt, PI } = Math;
const TAU = PI * 2;

type NumOrVec = number | Iterable<number>;

function* pickXY(args: NumOrVec[]) {
	for (const v of args) {
		if (typeof v == 'number') {
			yield v;
		} else {
			const [x, y] = v;
			yield x;
			yield y;
		}
	}
}

function Pt(x: NumOrVec, y?: number) {
	if (typeof x === 'object') {
		return Vec.pos(...x);
	} else {
		return Vec.pos(x, y);
	}
}

export class VecRay {
	readonly _pos: Vec;
	readonly _dir: Vec;

	constructor(pos: Vec, aim: Vec) {
		this._pos = pos;
		this._dir = aim;
	}
	// Query

	get x() {
		return this._pos.x;
	}

	get y() {
		return this._pos.y;
	}

	get z() {
		return this._pos.z;
	}

	get h() {
		return this._dir.x;
	}

	get v() {
		return this._dir.y;
	}

	get pos() {
		return this._pos;
	}

	get dir() {
		return this._dir;
	}

	*[Symbol.iterator](): Iterator<number> {
		const { x, y, z } = this._pos;
		yield x;
		yield y;
		yield z;
	}

	at() {
		return this._pos.clone();
	}

	distance(x: NumOrVec, y?: number): number {
		return this.delta(x, y).abs();
	}

	pointAlong(d: number): Vec {
		const { pos, dir } = this;
		return pos.add(Vec.polar(d, dir.radians));
	}

	delta(x: NumOrVec, y?: number) {
		return Pt(x, y).sub(this.pos);
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
	distanceFromLine(a: Iterable<number>, b: Iterable<number>): number {
		const { x, y } = this._pos;
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

	nearestPointOfLine(a: Iterable<number>, b: Iterable<number>): Vec {
		return this.pos.nearestPointOfLine(a, b);
	}

	intersectOfLine(a: Iterable<number>, b: Iterable<number>): Vec {
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
		if (d === 0) {
			if (dx[0] === 0) {
				// x1 == x2
				if (dx[1] === 0) {
					// x3 == x4
					// parallel
					// return NaN;
				} else if (dy[0] === 0) {
					// y1 == y2
					// return NaN;
				} else if (dy[1] === 0) {
					// y3 == y4
					// perpendicular?
					// return Vec.pos(x1, y3);
				}
			} else if (dy[0] === 0) {
			}
		}
		return Vec.pos((e1 * dx[1] - dx[0] * e2) / d, (e1 * dy[1] - dy[0] * e2) / d);
	}

	intersectOfRay(r: Iterable<number>): Vec {
		const { pos, dir } = this;
		return this.intersectOfLine(pos, pos.add(dir));
	}

	nearestPointFromPoint(p: Iterable<number>): Vec {
		const { pos, dir } = this;
		return Vec.new(p).nearestPointOfLine(pos, pos.add(dir));
	}
}

export class Ray extends VecRay {
	clone() {
		const { _pos, _dir } = this;
		return new Ray(_pos, _dir);
	}

	private _Pos(v: Vec) {
		return new Ray(v, this._dir);
	}

	private _Dir(v: Vec) {
		return new Ray(this._pos, v);
	}

	private _Set(p: Vec, a: Vec) {
		return new Ray(p, a);
	}

	withDir(rad: NumOrVec) {
		// turned withDir
		if (typeof rad === 'object') {
			return this._Dir(Vec.pos(...rad));
		} else {
			return this._Dir(Vec.radians(rad));
		}
	}

	withH(h = 0) {
		const { v, pos } = this;
		return new Ray(pos, Vec.pos(h, v));
	}

	withV(v = 0) {
		const { h, pos } = this;
		return new Ray(pos, Vec.pos(h, v));
	}

	withX(x = 0) {
		const { pos, dir } = this;
		return new Ray(pos.withX(x), dir);
	}

	withY(y = 0) {
		const { pos, dir } = this;
		return new Ray(pos.withY(y), dir);
	}

	withZ(z = 0) {
		const { pos, dir } = this;
		return new Ray(pos.withY(z), dir);
	}
	shiftX(d: number) {
		return this._Pos(this.pos.shiftX(d));
	}

	shiftY(d: number) {
		return this._Pos(this.pos.shiftY(d));
	}

	shiftZ(d: number) {
		return this._Pos(this.pos.shiftZ(d));
	}

	flipX() {
		return this._Pos(this.pos.flipX());
	}

	flipY() {
		return this._Pos(this.pos.flipY());
	}

	flipZ() {
		return this._Pos(this.pos.flipZ());
	}

	// Move
	goto(x: NumOrVec, y?: number) {
		return this._Pos(Pt(x, y));
	}

	forward(d: number) {
		const { pos, dir } = this;
		return this._Pos(dir.normalize().mul(d).postAdd(pos));
	}

	back(d?: number) {
		if (d) {
			return this.forward(-d);
		} else {
			return this._Dir(this.dir.mul(-1));
		}
	}

	translate(x: NumOrVec, y?: number) {
		const { pos } = this;
		return this._Pos(Pt(x, y).postAdd(pos));
	}

	along(t: number, x: NumOrVec, y?: number) {
		const { pos } = this;
		return this._Pos(Pt(x, y).sub(pos).mul(t).postAdd(pos));
	}

	// Turn

	turn(rad: NumOrVec) {
		// turned withDir
		if (typeof rad === 'object') {
			return this._Dir(Vec.pos(...rad));
		} else {
			return this._Dir(Vec.radians(rad));
		}
	}

	left(rad?: number) {
		switch (rad) {
			case undefined:
				const { h, v } = this;
				return this._Dir(Vec.pos(-v, h));
			default:
				return this._Dir(this.dir.rotated(rad));
		}
	}

	right(rad?: number) {
		if (rad === undefined) {
			const { h, v } = this;
			return this._Dir(Vec.pos(v, -h));
		} else {
			return this._Dir(this.dir.rotated(-rad));
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
		return this._Dir(Pt(x, y).sub(this.pos));
	}

	away(x: NumOrVec, y?: number) {
		return this._Dir(this.pos.sub(Pt(x, y)));
	}

	after(x: NumOrVec, y?: number) {
		const v = Pt(x, y);
		return this._Set(v, this.pos.sub(v));
	}

	before(x: NumOrVec, y?: number) {
		const v = Pt(x, y);
		return this._Set(v, v.sub(this.pos));
	}

	// Calc Aim

	normalToSide(a: Iterable<number>) {
		const s = this.side(a);
		const {
			dir: { x, y },
		} = this;
		if (s > 0) {
			return this._Dir(Vec.pos(-y, x));
		} else if (s < 0) {
			return this._Dir(Vec.pos(y, -x));
		}
		return this;
	}

	normalToLine(a: Iterable<number>, b: Iterable<number>) {
		return this._Dir(this.nearestPointOfLine(a, b).sub(this.pos));
	}

	// Calc Move

	toNearestPointOfLine(a: Iterable<number>, b: Iterable<number>) {
		return this._Pos(this.nearestPointOfLine(a, b));
	}

	toNearestPointFromPoint(p: Iterable<number>) {
		const { pos, dir } = this;
		return this._Pos(Ray.pos(p).nearestPointOfLine(pos, pos.add(dir)));
	}

	toPointT(t: number, a: Iterable<number>, b: Iterable<number>) {
		return this._Pos(Vec.subtract(b, a).mul(t).add(a));
	}

	toMidPoint(a: Iterable<number>, b: Iterable<number>) {
		return this.toPointT(0.5, a, b);
	}

	////// contructors
	static new(...args: NumOrVec[]) {
		const [x = 0, y = 0, h = 1, v = 0] = pickXY(args);
		return new this(Vec.pos(x, y), Vec.pos(h, v));
	}

	static pos(x: NumOrVec, y?: number) {
		return new this(Pt(x, y), Vec.pos(1, 0));
	}

	static at(x: NumOrVec, y?: number) {
		return new this(Pt(x, y), Vec.pos(1, 0));
	}

	static dir(x: NumOrVec, y?: number) {
		return new this(Vec.pos(1, 0), Pt(x, y));
	}

	static towards(x: NumOrVec, y?: number) {
		return this.new().towards(Pt(x, y));
	}

	static away(x: NumOrVec, y?: number) {
		return this.new().away(Pt(x, y));
	}

	static after(x: NumOrVec, y?: number) {
		return this.new().after(Pt(x, y));
	}

	static before(x: NumOrVec, y?: number) {
		return this.new().before(Pt(x, y));
	}

	static fromLine(a: Iterable<number>, b: Iterable<number>) {
		return this.pos(a).towards(b);
	}

	static get home() {
		return new this(Vec.pos(0, 0), Vec.pos(1, 0));
	}
}
