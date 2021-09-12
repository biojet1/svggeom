import { Point } from "./point.js";

export class Box {
	// readonly bottom: number;
	// readonly left: number;
	// readonly right: number;
	// readonly top: number;
	readonly x: number;
	readonly y: number;
	readonly height: number;
	readonly width: number;
	private static _not = new (class extends Box {
		// NoBox has no valid values so it cant be merged
		constructor() {
			super([NaN, NaN, NaN, NaN]);
		}
		merge(box: Box): Box {
			return box === this ? this : new Box(box);
		}

		transform(m: any) {
			return this;
		}
		isValid() {
			return false;
		}
	})();
	constructor(source: string | number[] | Box) {
		if (arguments.length <= 0) {
			this.x = this.y = this.width = this.height = NaN;
			return Box._not;
		}
		const base = [0, 0, 0, 0];
		const v =
			typeof source === "string"
				? source.split(/[\s,]+/).map(parseFloat)
				: Array.isArray(source)
				? source
				: typeof source === "object"
				? [
						source.left != null ? source.left : source.x,
						source.top != null ? source.top : source.y,
						source.width,
						source.height,
				  ]
				: arguments.length === 4
				? [].slice.call(arguments)
				: base;

		this.x = v[0];
		this.y = v[1];
		this.width = v[2];
		this.height = v[3];
	}
	get left() {
		return this.x;
	}
	get xMin() {
		return this.x;
	}
	get top() {
		return this.y;
	}
	get yMin() {
		return this.y;
	}
	get right() {
		return this.xMax;
	}
	get xMax() {
		const { x, width } = this;
		return x + width;
	}
	get bottom() {
		return this.yMax;
	}
	get yMax() {
		const { y, height } = this;
		return y + height;
	}

	get centerX() {
		const { x, width } = this;
		return x + width / 2;
	}
	get centerY() {
		const { y, height } = this;
		return y + height / 2;
	}

	// Merge rect box with another, return a new instance
	merge(box: Box): Box {
		if (!box.isValid()) return new Box(this);

		const x = Math.min(this.x, box.x);
		const y = Math.min(this.y, box.y);

		return new Box([
			x,
			y,
			Math.max(this.x + this.width, box.x + box.width) - x,
			Math.max(this.y + this.height, box.y + box.height) - y,
		]);
	}

	transform(m: any) {
		let xMin = Infinity;
		let xMax = -Infinity;
		let yMin = Infinity;
		let yMax = -Infinity;
		// const {a, b, c, d, e, f} = matrix;
		const { x, y, bottom, right } = this;
		[
			Point.at(x, y),
			Point.at(right, y),
			Point.at(x, bottom),
			Point.at(right, bottom),
		].forEach(function (p) {
			// const [x0, y0] = p;
			// const x = a * x0 + c * y0 + e;
			// const y = b * x0 + d * y0 + f;
			const { x, y } = p.transform(m);
			xMin = Math.min(xMin, x);
			xMax = Math.max(xMax, x);
			yMin = Math.min(yMin, y);
			yMax = Math.max(yMax, y);
		});
		// return new Box([xMin, yMin, xMax - xMin, yMax - yMin]);
		return Box.fromExtrema(xMin, xMax, yMin, yMax);
	}
	isValid() {
		return true;
	}
	public static not() {
		return Box._not;
	}
	public static fromExtrema(x1: number, x2: number, y1: number, y2: number) {
		if (x1 > x2) [x1, x2] = [x2, x1];
		if (y1 > y2) [y1, y2] = [y2, y1];
		return this.fromRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1));
	}
	public static fromRect(
		x: number,
		y: number,
		width: number,
		height: number
	) {
		return new Box([x, y, width, height]);
	}
}

export class Interval {
	readonly min: number;
	readonly max: number;

	constructor(min: number | number[] | Interval, max: number = 0) {
		const { length } = arguments;
		if (length <= 0) {
			this.min = 0;
			this.max = 0;
		} else if (typeof min === "number") {
			this.min = min;
			this.max = max;
		} else if (Array.isArray(min)) {
			this.min = min[0];
			this.max = min[1];
		} else {
			this.min = min.min;
			this.max = min.max;
		}
	}

	get center() {
		const { min, max } = this;
		return min + (max - min) / 2;
	}
	get size() {
		const { min, max } = this;
		return max - min;
	}
	contains(v: number) {
		const { min, max } = this;
		return max <= v && v <= max;
	}
	equals(other: Interval) {
		return this.max == other.max && this.min == other.min;
	}
	isValid() {
		return true;
	}
	merge(other: Interval) {
		if (!other.isValid()) {
			return new Interval(this);
		}
		return new Interval(
			Math.min(this.min, other.min),
			Math.max(this.max, other.max)
		);
	}
}
