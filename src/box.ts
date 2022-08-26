import { Vec } from './point.js';
const { max, min, abs } = Math;

export class Box {
	protected _x: number;
	protected _y: number;
	protected _h: number;
	protected _w: number;
	private static _not: Box = new (class extends Box {
		// NoBox has no valid values so it cant be merged
		constructor() {
			super(NaN, NaN, NaN, NaN);
			Object.freeze(this);
		}
		override merge(box: Box): Box {
			return box;
		}
		override transform(m: any) {
			return this;
		}
		override isValid() {
			return false;
		}
	})();
	protected constructor(x: number, y: number, width: number, height: number) {
		this._x = x;
		this._y = y;
		this._w = width;
		this._h = height;
	}
	clone() {
		const { x, y, width, height } = this;

		return Box.forRect(x, y, width, height);
	}

	// private _notsup() {
	// 	return new Error(`Not Supported`);
	// }

	get x() {
		return this._x;
	}
	get left() {
		return this._x;
	}
	get minX() {
		return this._x;
	}
	get y() {
		return this._y;
	}
	get top() {
		return this._y;
	}
	get minY() {
		return this._y;
	}
	get width() {
		return this._w;
	}
	get height() {
		return this._h;
	}
	get maxX() {
		const { x, width } = this;
		return x + width;
	}
	get maxY() {
		const { y, height } = this;
		return y + height;
	}
	get right() {
		return this.maxX;
	}
	get bottom() {
		return this.maxY;
	}
	get centerX() {
		const { x, width } = this;
		return x + width / 2;
	}
	get centerY() {
		const { y, height } = this;
		return y + height / 2;
	}
	get center() {
		const { centerX, centerY } = this;
		return Vec.pos(centerX, centerY);
	}

	// set maxY(n: number) {
	// 	const {y} = this;
	// 	if (n < y) {
	// 		this.y = n;
	// 		this.height = y - n;
	// 	} else {
	// 		this.height = n - y;
	// 	}
	// }

	// set centerX(n: number) {
	// 	const {width} = this;
	// 	this.x = n - width / 2;
	// }

	// set centerY(n: number) {
	// 	const {height} = this;
	// 	this.y = n - height / 2;
	// }

	withCenter(p: Iterable<number>): Box {
		const [cx, cy] = p;
		const { width: W, height: H } = this;
		return Box.forRect(cx - W / 2, cy - H / 2, W, H);
	}

	withMinY(n: number): Box {
		const { x, width, height } = this;
		return Box.forRect(x, n, width, height);
	}

	withMinX(n: number): Box {
		const { y, width, height } = this;
		return Box.forRect(n, y, width, height);
	}

	// Merge rect box with another, return a new instance
	merge(box: Box): Box {
		if (!this.isValid()) {
			return box;
		} else if (!box.isValid()) {
			return this;
		}

		// if (!box.isValid()) return Box.new(this);
		// const { x: x1, y: y1, width: width1, height: height1 } = this;
		// const { x: x2, y: y2, width: width2, height: height2 } = box;

		// const x = min(x1, x2);
		// const y = min(y1, y2);

		// return Box.forRect(x, y, max(x1 + width1, x2 + width2) - x, max(y1 + height1, y2 + height2) - y);

		const { minX: xMin1, minY: yMin1, maxX: xMax1, maxY: yMax1 } = this;
		const { minX: xMin2, minY: yMin2, maxX: xMax2, maxY: yMax2 } = box;
		return Box.fromExtrema(
			min(xMin1, xMin2),
			max(xMax1, xMax2),
			min(yMin1, yMin2),
			max(yMax1, yMax2),
		);
	}
	// translated
	// resized
	inflated(h: number, v?: number): Box {
		v = v ?? h;
		const { x, y, width, height } = this;
		return Box.forRect(x - h, y - v, h + width + h, v + height + v);
	}
	transform(m: any) {
		let xMin = Infinity;
		let xMax = -Infinity;
		let yMin = Infinity;
		let maxY = -Infinity;
		// const {a, b, c, d, e, f} = matrix;
		const { x, y, bottom, right } = this;
		[Vec.pos(x, y), Vec.pos(right, y), Vec.pos(x, bottom), Vec.pos(right, bottom)].forEach(
			function (p) {
				const { x, y } = p.transform(m);
				xMin = min(xMin, x);
				xMax = max(xMax, x);
				yMin = min(yMin, y);
				maxY = max(maxY, y);
			},
		);
		return Box.fromExtrema(xMin, xMax, yMin, maxY);
	}
	isValid() {
		return true;
		// const { x, y, width, height } = this;
		// return x == null || y == null || width == null || height == null;
	}
	isEmpty() {
		const { x, y, width, height } = this;
		return x == 0 || y == 0 || width == 0 || height == 0;
	}
	toArray() {
		const { x, y, width, height } = this;
		return [x, y, width, height];
	}
	toString() {
		const { x, y, width, height } = this;
		return `${x}, ${y}, ${width}, ${height}`;
	}
	equals(other: Box, epsilon = 0) {
		if (other === this) {
			return true;
		}
		const { x: x1, y: y1, width: width1, height: height1 } = this;
		const { x: x2, y: y2, width: width2, height: height2 } = other;
		return (
			closeEnough(x1, x2, epsilon) &&
			closeEnough(y1, y2, epsilon) &&
			closeEnough(width1, width2, epsilon) &&
			closeEnough(height1, height2, epsilon)
		);
	}
	overlap(other: Box): Box {
		if (!this.isValid()) {
			return other;
		} else if (!other.isValid()) {
			return this;
		} else {
			const { minX: xMin1, minY: yMin1, maxX: xMax1, maxY: yMax1 } = this;
			const { minX: xMin2, minY: yMin2, maxX: xMax2, maxY: yMax2 } = other;
			const xMin = max(xMin1, xMin2);
			const xMax = min(xMax1, xMax2);
			if (xMax >= xMin) {
				const yMin = max(yMin1, yMin2);
				const yMax = min(yMax1, yMax2);
				if (yMax >= yMin) {
					return Box.fromExtrema(xMin, xMax, yMin, yMax);
				}
			}
		}
		return Box._not;
	}
	public static not() {
		return this._not;
	}
	private static _empty?: Box;
	public static empty() {
		const { _empty } = Box;
		return _empty || (Box._empty = Box.forRect(0, 0, 0, 0));
	}
	public static fromExtrema(x1: number, x2: number, y1: number, y2: number) {
		if (x1 > x2) [x1, x2] = [x2, x1];
		if (y1 > y2) [y1, y2] = [y2, y1];
		return this.forRect(x1, y1, abs(x2 - x1), abs(y2 - y1));
	}
	public static fromRect({ x = 0, y = 0, width = 0, height = 0 }) {
		// https://developer.mozilla.org/en-US/docs/Web/API/DOMRect/fromRect
		return this.forRect(x, y, width, height);
	}
	public static forRect(x: number, y: number, width: number, height: number) {
		return new this(x, y, width, height);
	}
	public static parse(s: string) {
		const v = s.split(/[\s,]+/).map(parseFloat);
		return this.forRect(v[0], v[1], v[2], v[3]);
	}
	public static merge(...args: Array<Box>) {
		let x = Box.not();
		for (const b of args) {
			x = b.merge(x);
		}
		return x;
	}
	public static new(
		first?: number | number[] | [number[], number[]] | string | Box,
		y?: number,
		width?: number,
		height?: number,
	) {
		switch (typeof first) {
			case 'string': {
				return this.parse(first);
			}
			case 'number':
				return this.forRect(first, arguments[1], arguments[2], arguments[3]);
			case 'undefined':
				return this.not();
			case 'object':
				if (Array.isArray(first)) {
					const x = first[0];
					if (Array.isArray(x)) {
						const [x1, x2] = first[0] as number[];
						const [y1, y2] = first[1] as number[];
						return this.fromExtrema(x1 as number, x2 as number, y1 as number, y2 as number);
					} else {
						return this.forRect(
							first[0] as number,
							first[1] as number,
							first[2] as number,
							first[3] as number,
						);
					}
				} else {
					const { left, x, top, y, width, height } = first;
					return this.forRect(left || x || 0, top || y || 0, width, height);
				}
			default:
				throw new TypeError(`Invalid box argument ${arguments}`);
		}
	}
}

export class BoxMut extends Box {
	override get x() {
		return this._x;
	}

	override set x(value: number) {
		this._x = value;
	}

	override get y() {
		return this._y;
	}

	override set y(value: number) {
		this._y = value;
	}

	override get width() {
		return this._w;
	}

	override set width(value: number) {
		this._w = value;
	}

	override get height() {
		return this._h;
	}

	override set height(value: number) {
		this._h = value;
	}

	private reset(x: number, y: number, width: number, height: number) {
		this._x = x;
		this._y = y;
		this._w = width;
		this._h = height;
		return this;
	}

	mergeSelf(box: Box): this {
		if (!this.isValid()) {
			return this.copy(box);
		} else if (!box.isValid()) {
			return this;
		} else {
			const { x: x1, y: y1, width: width1, height: height1 } = this;
			const { x: x2, y: y2, width: width2, height: height2 } = box;
			const x = min(x1, x2);
			const y = min(y1, y2);
			return this.reset(
				x,
				y,
				max(x1 + width1, x2 + width2) - x,
				max(y1 + height1, y2 + height2) - y,
			);
		}
	}

	inflateSelf(h: number, v?: number): Box {
		v = v ?? h;
		const { x, y, width, height } = this;
		return this.reset(x - h, y - v, h + width + h, v + height + v);
	}

	sizeSelf(w: number, h?: number): Box {
		const { x, y, width, height } = this;
		return this.reset(x, y, w ?? width, h ?? height);
	}

	override isValid() {
		const { x, y, width, height } = this;
		return !(isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height));
	}

	copy(that: Box) {
		const { x, y, width, height } = that;
		this._x = x;
		this._y = y;
		this._w = width;
		this._h = height;
		return this;
	}

	public static not() {
		return new BoxMut(NaN, NaN, NaN, NaN);
	}

	public static override forRect(x: number, y: number, width: number, height: number) {
		return new BoxMut(x, y, width, height);
	}
}

function closeEnough(a: number, b: number, threshold = 1e-6) {
	return abs(b - a) <= threshold;
}
