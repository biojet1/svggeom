import {Point} from '../point.js';
import {Box} from '../box.js';

export abstract class Segment {
	readonly p1: Point;
	readonly p2: Point;
	abstract get length(): number;
	abstract toPathFragment(): (string | number)[];
	abstract bbox(): Box;
	abstract pointAt(t: number): Point;
	abstract slopeAt(t: number): Point;
	abstract transform(M: any): Segment;
	abstract reversed(): Segment;

	abstract splitAt(t: number): Segment[];
	constructor(p1: Point, p2: Point) {
		this.p1 = p1;
		this.p2 = p2;
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
	cropAt(t0: number, t1: number): Segment|undefined {
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

export class Line extends Segment {
	constructor(p1: Point | number[], p2: Point | number[]) {
		super(Point.new(p1), Point.new(p2));
	}

	bbox() {
		const {
			p1: {x: p1x, y: p1y},
			p2: {x: p2x, y: p2y},
		} = this;
		const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
		const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	get length() {
		return this.p2.sub(this.p1).abs();
	}

	pointAt(t: number) {
		const {p1, p2} = this;

		return p1.add(p2.sub(p1).mul(t));
	}

	toPathFragment() {
		const {
			p2: {x, y},
		} = this;

		return ['L', x, y];
	}

	slopeAt(t: number) {
		const vec = this.p2.sub(this.p1);
		return vec.div(vec.abs());
	}

	transform(M: any) {
		const {p1, p2} = this;
		return new Line(p1.transform(M), p2.transform(M));
	}

	splitAt(t: number) {
		const {p1, p2} = this;
		const c = this.pointAt(t);
		return [new Line(p1, c), new Line(c, p2)];
	}
	reversed() {
		const {p1, p2} = this;
		return new Line(p2, p1);
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
		const {p1, p2} = this;
		return new Close(p1.transform(M), p2.transform(M));
	}

	splitAt(t: number) {
		const {p1, p2} = this;
		const c = this.pointAt(t);
		return [new Line(p1, c), new Close(c, p2)];
	}
}
export class Horizontal extends Line {}
export class Vertical extends Line {}
