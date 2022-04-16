import {SegmentSE, Segment} from './index.js';
import {Vec} from '../point.js';
import {Box} from '../box.js';

abstract class LineSegment extends Segment {
	bbox() {
		const {
			start: {x: p1x, y: p1y},
			end: {x: p2x, y: p2y},
		} = this;
		const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
		const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	get length() {
		const {start, end} = this;
		return end.sub(start).abs();
	}
	pointAt(t: number) {
		const {start, end} = this;
		return end.sub(start).mul(t).postAdd(start);
	}

	slopeAt(t: number) {
		const {start, end} = this;
		const vec = end.sub(start);
		return vec.div(vec.abs());
	}

	splitAt(t: number): Segment[] {
		const {start, end} = this;
		const c = this.pointAt(t);
		return [this.newFromTo(start, c), this.newFromTo(c, end)];
	}

	transform(M: any) {
		const {start, end} = this;
		// return new Line(start.transform(M), end.transform(M));
		return this.newFromTo(start.transform(M), end.transform(M));
	}

	reversed() {
		const {start, end} = this;
		return this.newFromTo(end, start);
	}

	toPathFragment() {
		const {
			end: {x, y},
		} = this;

		return ['L', x, y];
	}

	abstract newFromTo(a: Vec, b: Vec): LineSegment;
}

export class Line extends LineSegment {
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
	newFromTo(a: Vec, b: Vec) {
		return new Line(a, b);
	}
}

// export class Line extends SegmentSE {
// 	bbox() {
// 		const {
// 			start: {x: p1x, y: p1y},
// 			end: {x: p2x, y: p2y},
// 		} = this;
// 		const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
// 		const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
// 		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
// 	}

// 	get length() {
// 		const {start, end} = this;
// 		return end.sub(start).abs();
// 	}
// 	pointAt(t: number) {
// 		const {start, end} = this;
// 		return end.sub(start).mul(t).postAdd(start);
// 	}

// 	slopeAt(t: number) {
// 		const {start, end} = this;
// 		const vec = end.sub(start);
// 		return vec.div(vec.abs());
// 	}

// 	splitAt(t: number): SegmentSE[] {
// 		const {start, end} = this;
// 		const c = this.pointAt(t);
// 		return [new Line(start, c), new Line(c, end)];
// 	}

// 	transform(M: any) {
// 		const {start, end} = this;
// 		return new Line(start.transform(M), end.transform(M));
// 	}

// 	reversed() {
// 		const {start, end} = this;
// 		return new Line(end, start);
// 	}

// 	toPathFragment() {
// 		const {
// 			end: {x, y},
// 		} = this;

// 		return ['L', x, y];
// 	}
// }

export class Close extends Line {
	toPathFragment() {
		return ['Z'];
	}

	toPath() {
		return 'Z';
	}

	// transform(M: any) {
	// 	const {start, end} = this;
	// 	return new Close(start.transform(M), end.transform(M));
	// }

	// splitAt(t: number): SegmentSE[] {
	// 	const {start, end} = this;
	// 	const c = this.pointAt(t);
	// 	return [new Line(start, c), new Line(c, end)];
	// }

	newFromTo(a: Vec, b: Vec) {
		return new Close(a, b);
	}
}

export class Horizontal extends Line {}
export class Vertical extends Line {}
export {Line as LineSegment};
