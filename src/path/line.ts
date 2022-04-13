import {SegmentSE} from './index.js';
import {Vec} from '../point.js';
import {Box} from '../box.js';

export class Line extends SegmentSE {

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

	splitAt(t: number): SegmentSE[] {
		const {start, end} = this;
		const c = this.pointAt(t);
		return [new Line(start, c), new Line(c, end)];
	}

	transform(M: any) {
		const {start, end} = this;
		return new Line(start.transform(M), end.transform(M));
	}

	reversed() {
		const {start, end} = this;
		return new Line(end, start);
	}

	toPathFragment() {
		const {
			end: {x, y},
		} = this;

		return ['L', x, y];
	}
}

export class Close extends Line {
	toPathFragment() {
		return ['Z'];
	}

	toPath() {
		return 'Z';
	}

	transform(M: any) {
		const {start, end} = this;
		return new Close(start.transform(M), end.transform(M));
	}

	splitAt(t: number): SegmentSE[] {
		const {start, end} = this;
		const c = this.pointAt(t);
		return [new Line(start, c), new Line(c, end)];
	}
}

export class Horizontal extends Line {}
export class Vertical extends Line {}
export {Line as LineSegment};
