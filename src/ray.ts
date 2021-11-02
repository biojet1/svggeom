import { Point } from "./point.js";

const { abs, atan, tan, cos, sin, sqrt, acos, atan2, PI, ceil, max } = Math;
const TAU = PI * 2;

function Po(x: number | Point, y?: number) {
	if (typeof x === "object") {
		const { x: x1, y: y1 } = x;
		return Point.at(x1, y1);
	} else {
		return Point.at(x, y);
	}
}

export class Ray {
	_pos: Point;
	_head: Point;

	constructor() {
		this._pos = Point.at(0.0, 0.0);
		this._head = Point.at(1.0, 0.0);
	}

	// copy
	clone() {
		const ray = new Ray();
		ray._pos = this._pos;
		ray._head = this._head;
		return ray;
	}

	turned(rad: number | Point) {
		return Ray.goto(this._pos).turn(rad);
	}

	moved(x: number | Point, y?: number) {
		return Ray.goto(x, y).turn(this._head);
	}

	// Query

	get x() {
		return this._pos.x;
	}

	get y() {
		return this._pos.y;
	}

	get h() {
		return this._head.x;
	}

	get v() {
		return this._head.y;
	}

	get pos() {
		return this._pos;
	}

	get head() {
		return this._head;
	}

	get heading() {
		const { h, v } = this;
		const a = atan2(v, h);
		return a < 0 ? a + TAU : a;
	}

	get headingd() {
		return (this.heading * 180) / PI;
	}

	*[Symbol.iterator](): Iterator<number> {
		const { x, y, z } = this._pos;
		yield x;
		yield y;
		yield z;
	}

	distance(x: number | Point, y?: number) {
		return this.delta(x, y).abs();
	}

	delta(x: number | Point, y?: number) {
		return Po(x, y).sub(this.pos);
	}

	side(x: number | Point, y?: number) {
		const { pos, head } = this;
		const [Ax, Ay] = pos;
		const [Bx, By] = pos.add(head);
		const [X, Y] = Po(x, y);
		const d = (Bx - Ax) * (Y - Ay) - (By - Ay) * (X - Ax);
		return d > 0 ? 1 : d < 0 ? -1 : 0;
	}

	// Move

	forward(d: number) {
		// move turtle forward by specified distance
		const { pos, head } = this;
		this._pos = pos.add(head.mul(d));
		return this;
	}

	back(d?: number) {
		// move turtle forward by specified distance
		if (d) {
			this.forward(-d);
		} else {
			this._head = this.head.mul(-1);
		}
		return this;
	}

	goto(x: number | Point, y?: number) {
		this._pos = Po(x, y);
		return this;
	}

	reset() {
		this._pos = Point.at(0.0, 0.0);
		this._head = Point.at(1.0, 0.0);
		return this;
	}

	translate(x: number | Point, y?: number) {
		const { pos } = this;
		this._pos = pos.add(Po(x, y));
		return this;
	}

	along(t: number, x: number | Point, y?: number) {
		const { pos } = this;
		this._pos = pos.add(Po(x, y).sub(pos).mul(t));
		return this;
	}

	// Turn

	turn(rad: number | Point) {
		if (typeof rad === "object") {
			const { x: x1, y: y1 } = rad;
			this._head = Point.at(x1, y1);
		} else if (rad) {
			this._head = Point.radians(rad);
		}
		return this;
	}

	left(rad?: number) {
		if (rad) {
			this._head = this.head.rotated(rad);
		} else {
			const { h, v } = this;
			this._head = Point.at(-v, h);
		}
		return this;
	}

	leftd(deg: number) {
		// switch (deg) {
		// 	case 90:
		// 		return this.left();
		// 	case 180:
		// 		return this.back();
		// }
		return this.left((deg * TAU) / 360);
	}

	right(rad?: number) {
		// move turtle forward by specified distance
		if (rad) {
			this._head = this.head.rotated(-rad);
		} else {
			const { h, v } = this;
			this._head = Point.at(v, -h);
		}
		return this;
	}

	rightd(deg: number) {
		// switch (deg) {
		// 	case 90:
		// 		return this.right();
		// 	case 180:
		// 		return this.back();
		// }
		return this.right((deg * TAU) / 360);
	}

	// Aimed Move

	towards(x: number | Point, y?: number) {
		// Po(x, y).subtractSelf(this.pos).normalizeSelf();
		this._head = Po(x, y).sub(this.pos).normalize();
		return this;
	}

	away(x: number | Point, y?: number) {
		this._head = this.pos.sub(Po(x, y)).normalize();
		return this;
	}

	after(x: number | Point, y?: number) {
		const v = Po(x, y);
		return this.away(v).goto(v);
	}

	before(x: number | Point, y?: number) {
		const v = Po(x, y);
		return this.towards(v).goto(v);
	}

	// Calc
	distanceFromLine(p1: Point, p2: Point) {
		const { x, y } = this._pos;
		const { x: x1, y: y1 } = p1;
		const { x: x2, y: y2 } = p2;
		const [dx, dy] = [x2 - x1, y2 - y1];

		if (dx && dy) {
			return abs(dx * (y1 - y) - dy * (x1 - x)) / sqrt(dx ** 2 + dy ** 2);
		} else if (!dy) {
			return abs(y1 - y); // dy === 0
		} else if (!dx) {
			return abs(x1 - x); // dx === 0
		}
		return NaN;
	}

	nearestPointOfLine(a: Point, b: Point) {
		const { pos } = this;
		const a_to_p = pos.sub(a); // a → p
		const a_to_b = b.sub(a); // a → b
		const t = a_to_p.dot(a_to_b) / a_to_b.absQuad();
		return a.add(a_to_b.mul(t));
		// return a.add(a_to_p.dot(a_to_b).div(a_to_p.abs()));
	}

	nearestPointFromPoint(p: Point) {
		const A = new Ray();
		const { pos, head } = this;
		return A.goto(p).nearestPointOfLine(pos, pos.add(head));
	}

	intersectOfLine(a: Point, b: Point) {
		const { pos, head } = this;
		const { x: x1, y: y1 } = a;
		const { x: x2, y: y2 } = b;
		const { x: x3, y: y3 } = pos;
		const { x: x4, y: y4 } = pos.add(head); // d
		const e1 = x1 * y2 - y1 * x2; // a.cross(b)
		const e2 = x3 * y4 - y3 * x4; // pos.cross(d)
		const dx = [x1 - x2, x3 - x4];
		const dy = [y1 - y2, y3 - y4];
		const d = dx[0] * dy[1] - dy[0] * dx[1];
		return Point.at(
			(e1 * dx[1] - dx[0] * e2) / d,
			(e1 * dy[1] - dy[0] * e2) / d
		);
	}

	toNearestPointOfLine(a: Point, b: Point) {
		this._pos = this.nearestPointOfLine(a, b);
		return this;
	}

	toNearestPointFromPoint(p: Point) {
		const { pos, head } = this;
		this._pos = Ray.new(p).nearestPointOfLine(pos, pos.add(head));
		return this;
	}

	normalToSide(a: Point) {
		const s = this.side(a);
		const { x, y } = this.head;
		if (s > 0) {
			this._head = Point.at(-y, x);
		} else if (s < 0) {
			this._head = Point.at(y, -x);
		}
		return this;
	}

	toMidPoint(a: Point, b: Point) {
		return this.toPointT(0.5, a, b);
	}

	toPointT(t: number, a: Point, b: Point) {
		return this.goto(b.sub(a).mul(t).add(a));
	}

	//////
	static new(x: number | Point, y?: number) {
		const A = new Ray();
		A._pos = Po(x, y);
		return A;
	}

	static towards(x: number | Point, y?: number) {
		return new Ray().towards(Po(x, y));
	}

	static away(x: number | Point, y?: number) {
		return new Ray().away(Po(x, y));
	}

	static goto(x: number | Point, y?: number) {
		return new Ray().goto(Po(x, y));
	}

	static after(x: number | Point, y?: number) {
		return new Ray().after(Po(x, y));
	}

	static before(x: number | Point, y?: number) {
		return new Ray().before(Po(x, y));
	}
}
