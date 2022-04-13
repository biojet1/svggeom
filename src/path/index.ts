import {Vec} from '../point.js';
import {Box} from '../box.js';

export abstract class Segment {
	readonly p1: Vec;
	readonly p2: Vec;
	abstract get length(): number;
	abstract toPathFragment(): (string | number)[];
	abstract bbox(): Box;
	abstract pointAt(t: number): Vec;
	abstract slopeAt(t: number): Vec;
	abstract transform(M: any): Segment;
	abstract reversed(): Segment;
	abstract splitAt(t: number): Segment[];
	constructor(p1: Vec, p2: Vec) {
		this.p1 = p1;
		this.p2 = p2;
	}

	get firstPoint() {
		return this.p1;
	}

	get lastPoint() {
		return this.p2;
	}

	toPath(): string {
		return ['M', this.p1.x, this.p1.y].concat(this.toPathFragment()).join(' ');
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

