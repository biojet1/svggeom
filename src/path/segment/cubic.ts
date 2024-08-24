import { Vector } from '../../vector.js';

export class Cubic extends SegmentSE {
	readonly c1: Vector;
	readonly c2: Vector;
	t_value?: number;

	constructor(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>) {
		super(from, to);
		this.c1 = Vector.new(c1);
		this.c2 = Vector.new(c2);
	}

	new(from: Iterable<number>, c1: Iterable<number>, c2: Iterable<number>, to: Iterable<number>) {
		return new Cubic(from, c1, c2, to);
	}
	private get _cpts(): Vector[] {
		const { from, c1, c2, to } = this;
		return [from, c1, c2, to];
	}
	//////

	override bbox() {
		return cubic_box(this._cpts);
	}
	override point_at(t: number) {
		return cubic_point_at(this._cpts, t);
	}
	override split_at(z: number): [SegmentSE, SegmentSE] {
		const [x, y] = cubic_split_at(this._cpts, z);
		return [this.new(x[0], x[1], x[2], x[3]), this.new(y[0], y[1], y[2], y[3])];
	}
	//////
	override get length() {
		return cubic_length(this._cpts);
	}
	// lengthAt(t = 1) {
	// 	return cubicLengthAt(this._cpts, t);
	// }
	override slope_at(t: number): Vector {
		return cubic_slope_at(this._cpts, t);
	}

	override toPathFragment() {
		const {
			c1: [x1, y1],
			c2: [x2, y2],
			to: [x3, y3],
		} = this;
		return ['C', x1, y1, x2, y2, x3, y3];
	}

	override transform(M: any) {
		const { from, c1, c2, to } = this;
		return this.new(from.transform(M), c1.transform(M), c2.transform(M), to.transform(M));
	}
	override reversed() {
		const { from, c1, c2, to } = this;
		return this.new(to, c2, c1, from);
	}
}

export { Cubic as CubicSegment };

import { SegmentSE } from './segmentse.js';
import { cubic_box, cubic_length, cubic_point_at, cubic_slope_at, cubic_split_at } from '../cubichelp.js';
