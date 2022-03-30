import {Vec} from '../point.js';
import {Box} from '../box.js';
import {Segment} from './index.js';
import {Matrix} from '../matrix.js';
// import assert from "assert";

export class Cubic extends Segment {
	readonly c1: Vec;
	readonly c2: Vec;
	// readonly p1: Vec;
	// readonly p2: Vec;
	t_value?: number;
	constructor(p1: Vec | number[], c1: Vec | number[], c2: Vec | number[], p2: Vec | number[]) {
		super(Vec.new(p1), Vec.new(p2));

		// this.p1 = Vec.new(p1);
		this.c1 = Vec.new(c1);
		this.c2 = Vec.new(c2);
		// this.p2 = Vec.new(p2);
	}
	// static fromQuad(
	// 	start: Vec | number[],
	// 	control: Vec | number[],
	// 	end: Vec | number[]
	// ) {
	// 	// const p1 = Vec.new(start);
	// 	// const c = Vec.new(control);
	// 	// const p2 = Vec.new(end);

	// 	// const c1 = p1.equals(c) ? p1 : p1.mul(1 / 3).add(c.mul(2 / 3));
	// 	// const c2 = p2.equals(c) ? p2 : c.mul(2 / 3).add(p2.mul(1 / 3));
	// 	// return new Cubic(p1, c1, c2, p2);
	// 	return new Quadratic(start, control, end);
	// }

	// static fromArc(
	// 	p1: Vec,
	// 	p2: Vec,
	// 	rx: number,
	// 	ry: number,
	// 	φ: number,
	// 	arc: number,
	// 	sweep: number
	// ) {
	// 	const v = arcToCubic(p1.x, p1.y, rx, ry, φ, arc, sweep, p2.x, p2.y, 0);
	// }

	bbox() {
		const {p1, c1, c2, p2} = this;
		const [xmin, xmax] = cubic_extrema(p1.x, c1.x, c2.x, p2.x);
		const [ymin, ymax] = cubic_extrema(p1.y, c1.y, c2.y, p2.y);
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	flatness() {
		let ux = Math.pow(3 * this.c1.x - 2 * this.p1.x - this.p2.x, 2);
		let uy = Math.pow(3 * this.c1.y - 2 * this.p1.y - this.p2.y, 2);
		const vx = Math.pow(3 * this.c2.x - 2 * this.p2.x - this.p1.x, 2);
		const vy = Math.pow(3 * this.c2.y - 2 * this.p2.y - this.p1.y, 2);
		if (ux < vx) {
			ux = vx;
		}
		if (uy < vy) {
			uy = vy;
		}
		return ux + uy;
	}
	get length() {
		return this.lengthAt();
	}
	lengthAt(t = 1) {
		const curves = this.splitAt(t)[0].makeFlat(t);
		let length = 0;
		for (let i = 0, len = curves.length; i < len; ++i) {
			length += curves[i].p2.sub(curves[i].p1).abs();
		}
		return length;
	}
	makeFlat(t: number): Cubic[] {
		if (this.flatness() > 0.15) {
			return this.splitAt(0.5)
				.map(function (el) {
					return el.makeFlat(t * 0.5);
				})
				.reduce(function (last, current) {
					return last.concat(current);
				}, []);
		} else {
			this.t_value = t;
			return [this];
		}
	}
	pointAt(t: number) {
		const {p1, c1, c2, p2} = this;
		// if (p1.equals(c1)) {
		// 	return new Vec(
		// 		(1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * c2.x + t * t * p2.x,
		// 		(1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * c2.y + t * t * p2.y
		// 	);
		// }
		const F = 1 - t;
		return Vec.at(
			F * F * F * p1.x + 3 * F * F * t * c1.x + 3 * F * t * t * c2.x + t * t * t * p2.x,
			F * F * F * p1.y + 3 * F * F * t * c1.y + 3 * F * t * t * c2.y + t * t * t * p2.y
		);
	}

	splitAt(z: number) {
		const {p1, c1, c2, p2} = this;
		const x = this.splitAtScalar(z, p1.x, c1.x, c2.x, p2.x);
		const y = this.splitAtScalar(z, p1.y, c1.y, c2.y, p2.y);
		// const x = this.splitAtScalar(z, "x");
		// const y = this.splitAtScalar(z, "y");
		const a = new Cubic(
			Vec.at(x[0][0], y[0][0]),
			Vec.at(x[0][1], y[0][1]),
			Vec.at(x[0][2], y[0][2]),
			Vec.at(x[0][3], y[0][3])
		);
		const b = new Cubic(
			Vec.at(x[1][0], y[1][0]),
			Vec.at(x[1][1], y[1][1]),
			Vec.at(x[1][2], y[1][2]),
			Vec.at(x[1][3], y[1][3])
		);
		return [a, b];
	}

	splitAtScalar(
		z: number,
		p1: number,
		p2: number,
		p3: number,
		p4: number
	): [[number, number, number, number], [number, number, number, number]] {
		// const p1 = this.p1[p];
		// const p2 = this.c1[p];
		// const p3 = this.c2[p];
		// const p4 = this.p2[p];
		const t =
			z * z * z * p4 - 3 * z * z * (z - 1) * p3 + 3 * z * (z - 1) * (z - 1) * p2 - (z - 1) * (z - 1) * (z - 1) * p1;
		return [
			[p1, z * p2 - (z - 1) * p1, z * z * p3 - 2 * z * (z - 1) * p2 + (z - 1) * (z - 1) * p1, t],
			[t, z * z * p4 - 2 * z * (z - 1) * p3 + (z - 1) * (z - 1) * p2, z * p4 - (z - 1) * p3, p4],
		];
	}
	toPathFragment() {
		const {
			c1: {x: x1, y: y1},
			c2: {x: x2, y: y2},
			p2: {x: x3, y: y3},
		} = this;
		return ['C', x1, y1, x2, y2, x3, y3];
	}

	slopeAt(t: number): Vec {
		const {p1, c1, c2, p2} = this;
		let d1; // 1st derivative
		if (t <= 0) {
			return c1.sub(p1);
		} else if (t >= 1) {
			return p2.sub(c2);
		}
		if (p1.equals(c1)) {
			if (p2.equals(c2)) {
				return p2.sub(p1);
			}
			if (t <= 0) {
				return c2.sub(p1).mul(2);
			} else {
				const a = c2.sub(p1).mul(2 * (1 - t));
				const b = p2.sub(c2).mul(t);
				return a.add(b);
			}
		} else if (p2.equals(c2)) {
			const a = c1.sub(p1).mul(2 * (1 - t));
			const b = p2.sub(c1).mul(t);
			return a.add(b);
		} else {
			const a = c1.sub(p1).mul(3 * (1 - t) ** 2);
			const b = c2.sub(c1).mul(6 * (1 - t) * t);
			const c = p2.sub(c2).mul(3 * t ** 2);
			return a.add(b).add(c);
		}
	}
	transform(M: any) {
		const {p1, c1, c2, p2} = this;
		return new Cubic(p1.transform(M), c1.transform(M), c2.transform(M), p2.transform(M));
	}
	reversed() {
		const {p1, c1, c2, p2} = this;
		return new Cubic(p2, c2, c1, p1);
	}
}

function cubic_extrema(s: number, a: number, b: number, e: number) {
	//  Returns the extreme value, given a set of bezier coordinates
	let [atol, cmin, cmax] = [1e-9, Math.min(s, e), Math.max(s, e)];
	const pd1 = a - s;
	const pd2 = b - a;
	const pd3 = e - b;

	function _is_bigger(point: number) {
		if (point > 0 && point < 1) {
			const pyx =
				s * (1 - point) * (1 - point) * (1 - point) +
				3 * a * point * (1 - point) * (1 - point) +
				3 * b * point * point * (1 - point) +
				e * point * point * point;
			return [Math.min(cmin, pyx), Math.max(cmax, pyx)];
		}
		return [cmin, cmax];
	}

	if (Math.abs(pd1 - 2 * pd2 + pd3) > atol) {
		if (pd2 * pd2 > pd1 * pd3) {
			const pds = Math.sqrt(pd2 * pd2 - pd1 * pd3);
			[cmin, cmax] = _is_bigger((pd1 - pd2 + pds) / (pd1 - 2 * pd2 + pd3));
			[cmin, cmax] = _is_bigger((pd1 - pd2 - pds) / (pd1 - 2 * pd2 + pd3));
		}
	} else if (Math.abs(pd2 - pd1) > atol) {
		[cmin, cmax] = _is_bigger(-pd1 / (2 * (pd2 - pd1)));
	}
	return [cmin, cmax];
}

export {Cubic as CubicSegment};
