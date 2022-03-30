import {Vec} from './point.js';

export class Box {
	x: number;
	y: number;
	height: number;
	width: number;
	private static _not: Box = new (class extends Box {
		// NoBox has no valid values so it cant be merged
		constructor() {
			super(NaN, NaN, NaN, NaN);
			Object.freeze(this);
		}
		merge(box: Box): Box {
			return box;
		}
		transform(m: any) {
			return this;
		}
		isValid() {
			return false;
		}
	})();
	protected constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	clone() {
		const {x, y, width, height} = this;

		return new Box(x, y, width, height);
	}

	private _notsup() {
		return new Error(`Not Supported`);
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
		const {x, width} = this;
		return x + width;
	}
	get bottom() {
		return this.yMax;
	}

	get yMax() {
		const {y, height} = this;
		return y + height;
	}
	set yMax(n: number) {
		const {y} = this;
		if (n < y) {
			this.y = n;
			this.height = y - n;
		} else {
			this.height = n - y;
		}
	}

	get center() {
		const {centerX, centerY} = this;
		return Vec.pos(centerX, centerY);
	}

	get centerX() {
		const {x, width} = this;
		return x + width / 2;
	}

	set centerX(n: number) {
		const {width} = this;
		this.x = n - width / 2;
	}

	get centerY() {
		const {y, height} = this;
		return y + height / 2;
	}

	set centerY(n: number) {
		const {height} = this;
		this.y = n - height / 2;
	}
	mergeSelf(box: Box): Box {
		if (!this.isValid()) {
			return box;
		} else if (!box.isValid()) {
			return this;
		}

		// if (!box.isValid()) return Box.new(this);
		const {x: x1, y: y1, width: width1, height: height1} = this;
		const {x: x2, y: y2, width: width2, height: height2} = box;

		const x = Math.min(x1, x2);
		const y = Math.min(y1, y2);
		this.x = x;
		this.y = y;
		this.width = Math.max(x1 + width1, x2 + width2) - x;
		this.height = Math.max(y1 + height1, y2 + height2) - y;
		return this;
	}

	// Merge rect box with another, return a new instance
	merge(box: Box): Box {
		if (!this.isValid()) {
			return box;
		} else if (!box.isValid()) {
			return this;
		}

		// if (!box.isValid()) return Box.new(this);
		const {x: x1, y: y1, width: width1, height: height1} = this;
		const {x: x2, y: y2, width: width2, height: height2} = box;

		const x = Math.min(x1, x2);
		const y = Math.min(y1, y2);

		return new Box(x, y, Math.max(x1 + width1, x2 + width2) - x, Math.max(y1 + height1, y2 + height2) - y);
	}
	// translated
	// resized
	inflated(h: number, v?: number): Box {
		v = v ?? h;
		const {x, y, width, height} = this;
		return new Box(x - h, y - v, h + width + h, v + height + v);
	}
	transform(m: any) {
		let xMin = Infinity;
		let xMax = -Infinity;
		let yMin = Infinity;
		let yMax = -Infinity;
		// const {a, b, c, d, e, f} = matrix;
		const {x, y, bottom, right} = this;
		[Vec.pos(x, y), Vec.pos(right, y), Vec.pos(x, bottom), Vec.pos(right, bottom)].forEach(function (p) {
			// const [x0, y0] = p;
			// const x = a * x0 + c * y0 + e;
			// const y = b * x0 + d * y0 + f;
			const {x, y} = p.transform(m);
			xMin = Math.min(xMin, x);
			xMax = Math.max(xMax, x);
			yMin = Math.min(yMin, y);
			yMax = Math.max(yMax, y);
		});
		return Box.fromExtrema(xMin, xMax, yMin, yMax);
	}
	isValid() {
		return true;
	}
	toArray() {
		const {x, y, width, height} = this;
		return [x, y, width, height];
	}
	toString() {
		const {x, y, width, height} = this;
		return `${x}, ${y}, ${width}, ${height}`;
	}
	overlap(other: Box): Box {
		if (!this.isValid()) {
			return other;
		} else if (!other.isValid()) {
			return this;
		} else {
			const {xMin: xMin1, yMin: yMin1, xMax: xMax1, yMax: yMax1} = this;
			const {xMin: xMin2, yMin: yMin2, xMax: xMax2, yMax: yMax2} = other;
			const xMin = Math.max(xMin1, xMin2);
			const xMax = Math.min(xMax1, xMax2);
			if (xMax >= xMin) {
				const yMin = Math.max(yMin1, yMin2);
				const yMax = Math.min(yMax1, yMax2);
				if (yMax >= yMin) {
					return Box.fromExtrema(xMin, xMax, yMin, yMax);
				}
			}
		}
		return Box._not;
	}
	public static not() {
		return Box._not;
	}
	private static _empty?: Box;
	public static empty() {
		const {_empty} = Box;
		return _empty || (Box._empty = new Box(0, 0, 0, 0));
	}
	public static fromExtrema(x1: number, x2: number, y1: number, y2: number) {
		if (x1 > x2) [x1, x2] = [x2, x1];
		if (y1 > y2) [y1, y2] = [y2, y1];
		return this.fromRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1));
	}
	public static fromRect(x: number, y: number, width: number, height: number) {
		return new Box(x, y, width, height);
	}

	public static new(first?: number | number[] | [number[], number[]] | string | Box) {
		switch (typeof first) {
			case 'string': {
				const v = first.split(/[\s,]+/).map(parseFloat);
				return new Box(v[0], v[1], v[2], v[3]);
			}
			case 'number':
				return new Box(first, arguments[1], arguments[2], arguments[3]);
			case 'undefined':
				return Box._not;
			case 'object':
				if (Array.isArray(first)) {
					const x = first[0];
					if (Array.isArray(x)) {
						const [x1, x2] = first[0] as number[];
						const [y1, y2] = first[1] as number[];
						return Box.fromExtrema(x1 as number, x2 as number, y1 as number, y2 as number);
					} else {
						return new Box(first[0] as number, first[1] as number, first[2] as number, first[3] as number);
					}
				} else {
					const {left, x, top, y, width, height} = first;
					return new Box(left || x || 0, top || y || 0, width, height);
				}
			default:
				throw new TypeError(`Invalid box argument ${arguments}`);
		}
	}
	final() {
		return Object.isFrozen(this) ? this : Object.freeze(this.clone());
	}
	mut() {
		return Object.isFrozen(this) ? this.clone() : this;
	}
	freeze() {
		return Object.freeze(this);
	}
}

// export class BoxMut {
// 	x: number;
// 	y: number;
// 	height: number;
// 	width: number;

// 	constructor(x: number, y: number, width: number, height: number) {
// 		this.x = x;
// 		this.y = y;
// 		this.width = width;
// 		this.height = height;
// 	}
// }

// type BoxRO = Readonly<BoxMut>;

// export class BoxFin extends BoxRO {}
