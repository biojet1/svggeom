import {Vec} from '../point.js';
import {Box} from '../box.js';

// interface ISegment {
// 	get start(): Vec;
// 	get end(): Vec;
// 	get length(): number;
// 	toPathFragment(): (string | number)[];
// 	bbox(): Box;
// 	pointAt(t: number): Vec;
// 	slopeAt(t: number): Vec;
// 	transform(M: any): Segment;
// 	reversed(): Segment;
// 	splitAt(t: number): Segment[];
// }

export abstract class Segment {
	abstract get start(): Vec;
	abstract get end(): Vec;
	abstract get length(): number;
	abstract toPathFragment(): (string | number)[];
	abstract bbox(): Box;
	abstract pointAt(t: number): Vec;
	abstract slopeAt(t: number): Vec;
	abstract transform(M: any): Segment;
	abstract reversed(): Segment;
	abstract splitAt(t: number): Segment[];

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

	cutAt(t: number): Segment {
		return t < 0 ? this.splitAt(-t)[1] : this.splitAt(t)[0];
	}

	tangentAt(t: number) {
		const vec = this.slopeAt(t);
		return vec.div(vec.abs());
	}

	cropAt(t0: number, t1: number): Segment | undefined {
		if (t0 <= 0) {
			if (t1 >= 1) {
				return this;
			} else if (t1 > 0) {
				return this.cutAt(t1); // t1 < 1
			}
		} else if (t0 < 1) {
			if (t1 >= 1) {
				return this.cutAt(-t0);
			} else if (t0 < t1) {
				return this.cutAt(-t0).cutAt((t1 - t0) / (1 - t0));
			} else if (t0 > t1) {
				return this.cropAt(t1, t0); // t1 < 1
			}
		} else if (t1 < 1) {
			return this.cropAt(t1, t0); // t0 >= 1
		}
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
}

export abstract class LinkedSegment extends Segment {
	private readonly _prev: LinkedSegment;
	private readonly _end: Vec;

	constructor(prev: LinkedSegment, end: Iterable<number>) {
		super();
		this._prev = prev;
		this._end = Vec.new(end);
	}

	get start() {
		return this._prev._end;
	}

	get end() {
		return this._end;
	}
}

