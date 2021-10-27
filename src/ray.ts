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

	nearestPointOfLine(p1: Point, p2: Point) {
		const { x, y } = this._pos;
		const { x: x1, y: y1 } = p1;
		const { x: x2, y: y2 } = p2;
		const [dx, dy] = [x2 - x1, y2 - y1];
		if (dx && dy) {
			const m = dy / dx; // from: (y2-y1)/(x2-x1)
			const b = y1 - m * x1; // from: y=mx+b
			const a = -b * m; // from: m = -(a/b)
			const c = -(a * x1 + b * y1); // from: ax+by+c=0
			const d = a * a + b * b;
			const n = b * x - a * y;
			// console.log(a,b,c,d,m,n,dx,dy)
			// console.log((b * n - a * c) / d, (-a * n - b * c) / d)
			return Point.at((b * n - a * c) / d, (-a * n - b * c) / d);
		} else if (!dx) {
			return Point.at(x1, y);
		} else if (!dy) {
			return Point.at(x, y1);
		}
		return NaN;
	}
	nearestPointFromPoint(p: Point) {
		const A = new Ray();
		const { pos, head } = this;
		A.goto(p).nearestPointOfLine(pos, pos.add(head));
	}
	/*

    def nearest_point_from_point(self, p):
        q = self.pos()
        return self.__class__(p).nearest_point_of_line(q, q + self.headingv())

    def nearest_point_of_line(self, p1, p2):
        x, y = self.pos()
        dx, dy = p2[0] - p1[0], p2[1] - p1[1]
        if dx == 0:  # line is vertical
            assert dy != 0
            return Vec2D(p1[0], y)
        elif dy == 0:  # line is horizontal
            return Vec2D(x, p1[1])
        else:
            m = dy / dx  # from: (y2-y1)/(x2-x1)
            b = p1[1] - m * p1[0]  # from: y=mx+b
            a = -b * m  # from: m = -(a/b)
            c = -(a * p1[0] + b * p1[1])  # from: ax+by+c=0
            d = a * a + b * b
            n = b * x - a * y
            assert d != 0
            return Vec2D((b * n - a * c) / d, (-a * n - b * c) / d)


*/
}
