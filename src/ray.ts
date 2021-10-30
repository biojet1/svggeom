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

	clone() {
		const ray = new Ray();
		ray._pos = this._pos;
		ray._head = this._head;
		return ray;
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

	distance(x: number | Point, y?: number) {
		return this.delta(x, y).abs();
	}

	delta(x: number | Point, y?: number) {
		return Po(x, y).sub(this.pos);
	}

	// def side(self, x, y=None):
	//     return self.delta(x, y).hypot()
	// def delta(self, x, y=None):
	//     if y is not None:
	//         pos = Vec2D(x, y)
	//     elif isinstance(x, Vec2D):
	//         pos = x
	//     elif isinstance(x, (tuple, list)):
	//         pos = Vec2D(*x)
	//     elif isinstance(x, self.__class__):
	//         pos = x._position
	//     return pos - self._position

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

	// Turn

	left(rad?: number) {
		if (rad) {
			this._head = this.head.rotate(rad);
		} else {
			const { h, v } = this;
			this._head = Point.at(-v, h);
		}
		return this;
	}

	leftd(deg: number) {
		switch (deg) {
			case 90:
				return this.left();
			case 180:
				return this.back();
		}
		return this.left((deg * TAU) / 360);
	}

	right(rad?: number) {
		// move turtle forward by specified distance
		if (rad) {
			this._head = this.head.rotate(-rad);
		} else {
			const { h, v } = this;
			this._head = Point.at(v, -h);
		}
		return this;
	}

	rightd(deg: number) {
		switch (deg) {
			case 90:
				return this.right();
			case 180:
				return this.back();
		}
		return this.right((deg * TAU) / 360);
	}

	// Aimed Move

	towards(x: number | Point, y?: number) {
		this._head = Po(x, y).sub(this.pos);
		return this;
	}

	away(x: number | Point, y?: number) {
		this._head = this.pos.sub(Po(x, y));
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
		const { x: x4, y: y4 } = pos.add(head);
		const e1 = x1 * y2 - y1 * x2;
		const e2 = x3 * y4 - y3 * x4;
		const dx = [x1 - x2, x3 - x4];
		const dy = [y1 - y2, y3 - y4];
		const d = dx[0] * dy[1] - dy[0] * dx[1];
		return Point.at(
			(e1 * dx[1] - dx[0] * e2) / d,
			(e1 * dy[1] - dy[0] * e2) / d
		);
	}

	// def to_intersect(self, p1, p2):
	//     x1, y1 = p1
	//     x2, y2 = p2
	//     x3, y3 = self.pos()
	//     x4, y4 = self.pos() + self.headingv()
	//     e1 = x1 * y2 - y1 * x2
	//     e2 = x3 * y4 - y3 * x4
	//     dx = ((x1 - x2), (x3 - x4))
	//     dy = ((y1 - y2), (y3 - y4))
	//     d = dx[0] * dy[1] - dy[0] * dx[1]
	//     self.goto((e1 * dx[1] - dx[0] * e2) / d, (e1 * dy[1] - dy[0] * e2) / d)
	//     return self

	toNearestPointOfLine(a: Point, b: Point) {
		this._pos = this.nearestPointOfLine(a, b);
		return this;
	}

	toNearestPointFromPoint(p: Point) {
		const { pos, head } = this;
		this._pos = Ray.new(p).nearestPointOfLine(pos, pos.add(head));
		return this;
	}

	toMidPoint(a: Point, b: Point) {
		return this.toPointT(0.5, a, b);
	}

	toPointT(t: number, a: Point, b: Point) {
		// const { pos, head } = this;
		// this._pos = b.sub(a).mul(t).add(a);
		// return this;
		return this.goto(b.sub(a).mul(t).add(a));
	}

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
