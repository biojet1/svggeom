import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE } from './index.js';

abstract class LineSegment extends SegmentSE {
	override bbox() {
		const {
			start: { x: p1x, y: p1y },
			end: { x: p2x, y: p2y },
		} = this;
		const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
		const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	override get length() {
		const { start, end } = this;
		return end.sub(start).abs();
	}
	override pointAt(t: number) {
		const { start, end } = this;
		return end.sub(start).mul(t).postAdd(start);
	}

	override slopeAt(t: number) {
		const { start, end } = this;
		const vec = end.sub(start);
		return vec.div(vec.abs());
	}

	override splitAt(t: number): [SegmentSE, SegmentSE] {
		const { start, end } = this;
		const c = this.pointAt(t);
		return [this.newFromTo(start, c), this.newFromTo(c, end)];
	}

	override transform(M: any) {
		const { start, end } = this;
		// return new Line(start.transform(M), end.transform(M));
		return this.newFromTo(start.transform(M), end.transform(M));
	}

	override reversed() {
		const { start, end } = this;
		return this.newFromTo(end, start);
	}

	override toPathFragment() {
		const {
			end: { x, y },
		} = this;

		return ['L', x, y];
	}

	abstract newFromTo(a: Vec, b: Vec): LineSegment;
}

export class Line extends LineSegment {

	constructor(start: Iterable<number>, end: Iterable<number>) {
		super(start, end);
	}

	newFromTo(a: Vec, b: Vec) {
		return new Line(a, b);
	}
}

export class Close extends Line {
	override toPathFragment() {
		return ['Z'];
	}

	override toPath() {
		return 'Z';
	}

	override newFromTo(a: Vec, b: Vec) {
		return new Close(a, b);
	}
}

export class Horizontal extends Line {}
export class Vertical extends Line {}
export { Line as LineSegment };

