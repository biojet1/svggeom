import {Vec} from '../point.js';
import {Box} from '../box.js';

export interface DescParams {
	relative?: boolean;
	smooth?: boolean;
	short?: boolean;
	close?: boolean;
	dfix?: number;
}

export abstract class Segment {
	abstract get start(): Vec;
	abstract get end(): Vec;
	abstract get length(): number;
	abstract bbox(): Box;
	abstract pointAt(t: number): Vec;
	abstract slopeAt(t: number): Vec;

	get firstPoint() {
		return this.start;
	}

	get lastPoint() {
		return this.end;
	}

	toPath(): string {
		const {x, y} = this.start;
		return ['M', x, y].concat(this.toPathFragment()).join(' ');
	}
	descArray(opt?: DescParams): (string | number)[] {
		const {x, y} = this.start;
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
	private readonly _start: Vec;
	private readonly _end: Vec;

	constructor(start: Iterable<number>, end: Iterable<number>) {
		super();
		this._start = Vec.new(start);
		this._end = Vec.new(end);
	}

	get start() {
		return this._start;
	}

	get end() {
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
