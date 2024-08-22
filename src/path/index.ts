import { Vector } from '../vector.js';
import { BoundingBox } from '../bbox.js';

export interface DescParams {
	relative?: boolean;
	smooth?: boolean;
	short?: boolean;
	close?: boolean;
	dfix?: number;
}

export abstract class Segment {
	abstract get from(): Vector;
	abstract get to(): Vector;
	abstract get length(): number;
	abstract bbox(): BoundingBox;
	abstract pointAt(t: number): Vector;
	abstract slopeAt(t: number): Vector;

	get firstPoint() {
		return this.from;
	}

	get lastPoint() {
		return this.to;
	}

	toPath(): string {
		const { x, y } = this.from;
		return ['M', x, y].concat(this.toPathFragment()).join(' ');
	}
	descArray(opt?: DescParams): (string | number)[] {
		const { x, y } = this.from;
		return ['M', x, y].concat(this.toPathFragment(opt));
	}
	tangentAt(t: number) {
		const vec = this.slopeAt(t);
		return vec.div(vec.abs());
	}
	toPathFragment(opt?: DescParams): (string | number)[] {
		throw new Error('NOTIMPL');
	}
}

export abstract class SegmentSE extends Segment {
	private readonly _start: Vector;
	private readonly _end: Vector;

	constructor(from: Iterable<number>, to: Iterable<number>) {
		super();
		this._start = Vector.new(from);
		this._end = Vector.new(to);
	}

	get from() {
		return this._start;
	}

	get to() {
		return this._end;
	}

	abstract transform(M: any): SegmentSE;
	abstract reversed(): SegmentSE;
	abstract splitAt(t: number): [SegmentSE, SegmentSE];
	cutAt(t: number): SegmentSE {
		return t < 0 ? this.splitAt(1 + t)[1] : this.splitAt(t)[0];
	}
	cropAt(t0: number, t1: number): SegmentSE | undefined {
		t0 = tNorm(t0);
		t1 = tNorm(t1);
		if (t0 <= 0) {
			if (t1 >= 1) {
				return this;
			} else if (t1 > 0) {
				return this.cutAt(t1); // t1 < 1
			}
		} else if (t0 < 1) {
			if (t1 >= 1) {
				return this.cutAt(t0 - 1);
			} else if (t0 < t1) {
				return this.cutAt(t0 - 1).cutAt((t1 - t0) / (1 - t0));
			} else if (t0 > t1) {
				return this.cropAt(t1, t0); // t1 < 1
			}
		} else if (t1 < 1) {
			return this.cropAt(t1, t0); // t0 >= 1
		}
	}
}

export function tCheck(t: number) {
	if (t > 1) {
		return 1;
	} else if (t < 0) {
		return 0;
	}
	// if (t < 0 || t > 1) {
	// 	throw new RangeError(`"t" must be between 0 and 1 (${t})`);
	// }
	return t;
}

export function tNorm(t: number) {
	if (t < 0) {
		t = 1 + (t % 1);
	} else if (t > 1) {
		if (0 == (t = t % 1)) {
			t = 1;
		}
	}
	return t;
}

export function* pickPos(args: Vector[] | number[]) {
	let n: number | undefined = undefined;
	for (const v of args) {
		if (typeof v == 'number') {
			if (n == undefined) {
				n = v;
			} else {
				yield Vector.new(n, v);
				n = undefined;
			}
		} else if (n != undefined) {
			throw new Error(`n == ${n}`);
		} else if (v instanceof Vector) {
			yield v;
		} else {
			yield Vector.new(v);
		}
	}
}

export function* pickNum(args: Vector[] | number[]) {
	for (const v of args) {
		switch (typeof v) {
			case 'number':
				yield v;
				break;
			case 'boolean':
			case 'string':
				yield v ? 1 : 0;
				break;
			default:
				if (v) {
					const [x, y] = v;
					yield x;
					yield y;
				} else {
					yield 0;
				}
		}
	}
}
