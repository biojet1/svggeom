import { Vec } from '../point.js';
import { Box } from '../box.js';

export abstract class Segment {
	abstract get start(): Vec;
	abstract get end(): Vec;
	abstract get length(): number;
	abstract bbox(): Box;
	abstract pointAt(t: number): Vec;
	abstract slopeAt(t: number): Vec;
	transform(M: any): Segment {
		throw new Error('NOTIMPL');
	}
	toPathFragment(): (string | number)[] {
		throw new Error('NOTIMPL');
	}

	reversed(): Segment {
		throw new Error('NOTIMPL');
	}

	splitAt(t: number): Segment[] {
		throw new Error('NOTIMPL');
	}

	get firstPoint() {
		return this.start;
	}

	get lastPoint() {
		return this.end;
	}

	toPath(): string {
		const { x, y } = this.start;
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
