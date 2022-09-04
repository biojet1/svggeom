import { Vec } from '../point.js';
import { Box } from '../box.js';
import { SegmentSE, tNorm, DescParams } from './index.js';

abstract class LineSegment extends SegmentSE {
	override bbox() {
		const {
			from: { x: p1x, y: p1y },
			to: { x: p2x, y: p2y },
		} = this;
		const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
		const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	override get length() {
		const { from, to } = this;
		return to.sub(from).abs();
	}
	override pointAt(t: number) {
		const { from, to } = this;
		return to.sub(from).mul(tNorm(t)).postAdd(from);
	}

	override slopeAt(t: number) {
		const { from, to } = this;
		const vec = to.sub(from);
		return vec.div(vec.abs());
	}

	override splitAt(t: number): [SegmentSE, SegmentSE] {
		const { from, to } = this;
		const c = this.pointAt(t);
		return [this.newFromTo(from, c), this.newFromTo(c, to)];
	}

	override transform(M: any) {
		const { from, to } = this;
		// return new Line(from.transform(M), to.transform(M));
		return this.newFromTo(from.transform(M), to.transform(M));
	}

	override reversed() {
		const { from, to } = this;
		return this.newFromTo(to, from);
	}

	override toPathFragment(opt?: DescParams) {
		const {
			to: { x, y },
		} = this;

		return ['L', x, y];
	}

	abstract newFromTo(a: Vec, b: Vec): LineSegment;
}

export class Line extends LineSegment {

	constructor(from: Iterable<number>, to: Iterable<number>) {
		super(from, to);
	}

	override newFromTo(a: Vec, b: Vec) {
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

