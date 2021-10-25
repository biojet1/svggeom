import { Point } from "../point.js";
import { Box } from "../box.js";
import { Segment } from "./index.js";
import { Matrix } from "../matrix.js";
import { Cubic } from "./cubic.js";

export class Quadratic extends Cubic {
	readonly c: Point;

	constructor(prev: Segment, p: Point, control: Point | number[]) {
		const p1 = prev.p2;
		const c = Point.new(control);
		const p2 = Point.new(p);

		const c1 = p1.equals(c) ? p1 : p1.mul(1 / 3).add(c.mul(2 / 3));
		const c2 = p2.equals(c) ? p2 : c.mul(2 / 3).add(p2.mul(1 / 3));
		super(prev, p2, c1, c2);
		this.c = c;
	}

	slopeAt(t: number): Point {
		const { p1, c, p2 } = this;

		if (t >= 1) {
			return p2.sub(c);
		} else if (t <= 0) {
			return c.sub(p1);
		}

		if (c.equals(p1) || c.equals(p2)) {
			const vec = p2.sub(p1);
			return vec.div(vec.abs());
		}
		const a = c.sub(p1).mul(1 - t);
		const b = p2.sub(c).mul(t);
		return a.add(b).mul(2); // 1st derivative;
	}

	pointAt(t: number) {
		const { p1, c, p2 } = this;
		const v = 1 - t;
		return Point.at(
			v * v * p1.x + 2 * v * t * c.x + t * t * p2.x,
			v * v * p1.y + 2 * v * t * c.y + t * t * p2.y
		);
		//  return (1 - t)**2*self.start + 2*(1 - t)*t*self.control + t**2*self.end
	}

	splitAt(t: number, next?: Segment) {
		const {
			p1: { x: x1, y: y1 },
			c: { x: cx, y: cy },
			p2: { x: x2, y: y2 },
			prev,
			p2,
		} = this;

		const mx1 = (1 - t) * x1 + t * cx;
		const mx2 = (1 - t) * cx + t * x2;
		const mxt = (1 - t) * mx1 + t * mx2;

		const my1 = (1 - t) * y1 + t * cy;
		const my2 = (1 - t) * cy + t * y2;
		const myt = (1 - t) * my1 + t * my2;

		const a = new Quadratic(prev, Point.at(mxt, myt), Point.at(mx1, my1));
		const b = new Quadratic(a, p2, Point.at(mx2, my2));

		if (next) {
			next.prev = b;
		}
		return [a, b];
	}

	bbox() {
		const { p1, c, p2 } = this;
		const [x1, x2, x3] = [p1.x, c.x, p2.x];
		const [y1, y2, y3] = [p1.y, c.y, p2.y];
		const [xmin, xmax] = quadratic_extrema(x1, x2, x3);
		const [ymin, ymax] = quadratic_extrema(y1, y2, y3);
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	toPathFragment() {
		const { c, p2 } = this;
		return ["Q", c.x, c.y, p2.x, p2.y];
	}
	// transform(M: any) {
	// 	const { p1, c, p2 } = this;
	// 	return new Quadratic(p1.transform(M), c.transform(M), p2.transform(M));
	// }

	// reversed() {
	// 	const { p1, c, p2 } = this;
	// 	return new Quadratic(p2, c, p1);
	// }
}

function quadratic_extrema(a: number, b: number, c: number) {
	const atol = 1e-9;
	const cmin = Math.min(a, c);
	const cmax = Math.max(a, c);

	if (Math.abs(a + c - 2 * b) > atol) {
		const p = (a - b) / (a + c - 2 * b);
		if (p > 0 && p < 1) {
			const e = a * (1 - p) * (1 - p) + 2 * b * p * (1 - p) + c * p * p;
			return [Math.min(cmin, e), Math.max(cmax, e)];
		}
	}
	return [cmin, cmax];
}
