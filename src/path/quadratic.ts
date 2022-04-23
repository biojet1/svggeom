import {Vec} from '../point.js';
import {Box} from '../box.js';
import {Matrix} from '../matrix.js';
import {Segment} from './index.js';
import {Cubic} from './cubic.js';

export class Quadratic extends Cubic {
	readonly c: Vec;

	constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>) {
		const start = Vec.new(p1);
		const c = Vec.new(control);
		const end = Vec.new(p2);

		const c1 = start.equals(c) ? start : start.mul(1 / 3).add(c.mul(2 / 3));
		const c2 = end.equals(c) ? end : c.mul(2 / 3).add(end.mul(1 / 3));
		super(start, c1, c2, end);
		this.c = c;
	}

	slopeAt(t: number): Vec {
		const {start, c, end} = this;

		if (t >= 1) {
			return end.sub(c);
		} else if (t <= 0) {
			return c.sub(start);
		}

		if (c.equals(start) || c.equals(end)) {
			const vec = end.sub(start);
			return vec.div(vec.abs());
		}
		const a = c.sub(start).mul(1 - t);
		const b = end.sub(c).mul(t);
		return a.add(b).mul(2); // 1st derivative;
	}

	pointAt(t: number) {
		const {start, c, end} = this;
		const v = 1 - t;
		return Vec.at(v * v * start.x + 2 * v * t * c.x + t * t * end.x, v * v * start.y + 2 * v * t * c.y + t * t * end.y);
	}

	splitAt(t: number) {
		const {
			start: {x: x1, y: y1},
			c: {x: cx, y: cy},
			end: {x: x2, y: y2},
		} = this;
		const mx1 = (1 - t) * x1 + t * cx;
		const mx2 = (1 - t) * cx + t * x2;
		const mxt = (1 - t) * mx1 + t * mx2;

		const my1 = (1 - t) * y1 + t * cy;
		const my2 = (1 - t) * cy + t * y2;
		const myt = (1 - t) * my1 + t * my2;

		return [
			new Quadratic(Vec.at(x1, y1), Vec.at(mx1, my1), Vec.at(mxt, myt)),
			new Quadratic(Vec.at(mxt, myt), Vec.at(mx2, my2), Vec.at(x2, y2)),
		];
	}

	bbox() {
		const {start, c, end} = this;
		const [x1, x2, x3] = [start.x, c.x, end.x];
		const [y1, y2, y3] = [start.y, c.y, end.y];
		const [xmin, xmax] = quadratic_extrema(x1, x2, x3);
		const [ymin, ymax] = quadratic_extrema(y1, y2, y3);
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	toPathFragment() {
		const {c, end} = this;
		return ['Q', c.x, c.y, end.x, end.y];
	}

	transform(M: any) {
		const {start, c, end} = this;
		return new Quadratic(start.transform(M), c.transform(M), end.transform(M));
	}

	reversed() {
		const {start, c, end} = this;
		return new Quadratic(end, c, start);
	}
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
