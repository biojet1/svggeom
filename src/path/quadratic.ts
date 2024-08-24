import { Vector } from '../vector.js';
import { SegmentSE } from './segmentse.js';
import { quad_bbox, quad_length, quad_point_at, quad_slope_at, quad_split_at } from './quadhelp.js';

export class Quadratic extends SegmentSE {
	readonly c: Vector;

	constructor(p1: Iterable<number>, control: Iterable<number>, p2: Iterable<number>) {
		super(Vector.new(p1), Vector.new(p2));
		this.c = Vector.new(control);
	}
	private get _qpts(): Vector[] {
		const { from, c, to } = this;
		return [from, c, to];
	}
	override get length() {
		return quad_length(this._qpts);
	}
	override slopeAt(t: number): Vector {
		return quad_slope_at(this._qpts, t);
	}

	override pointAt(t: number) {
		return quad_point_at(this._qpts, t);
	}

	override splitAt(t: number): [SegmentSE, SegmentSE] {
		const [a, b] = quad_split_at(this._qpts, t);
		return [new Quadratic(a[0], a[1], a[2]), new Quadratic(b[0], b[1], b[2])];
	}

	override bbox() {
		return quad_bbox(this._qpts);
	}

	override toPathFragment() {
		const { c: [cx, cy], to: [x, y] } = this;
		return ['Q', cx, cy, x, y];
	}

	override transform(M: any) {
		const { from, c, to } = this;
		return new Quadratic(from.transform(M), c.transform(M), to.transform(M));
	}

	override reversed() {
		const { from, c, to } = this;
		return new Quadratic(to, c, from);
	}
}

