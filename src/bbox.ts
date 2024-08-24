import { Vector } from './vector.js';
const { max, min, abs } = Math;
export class BoundingInterval extends Vector {
	constructor(p: Iterable<number>) {
		if (!p || typeof p == "number") {
			throw new TypeError(`Unexpected ${p}`);
		}
		if (p) {

			try {
				let [min, max] = p;
				if (max == undefined) {
					max = min;
				}
				// if (max < min) {
				// 	throw new Error(`Unexpected ${[min, max]}`);
				// }
				if (typeof min != "number" || typeof max != "number") {
					throw new TypeError(`Unexpected`);
				}
				super([min, max]);
			} finally {
				//	console.log("BoundingInterval constructor", p)

			}

		} else {
			throw new Error(`Unexpected`);
		}
	}
	get center() {
		const { size, minimum } = this;
		return minimum + (size / 2)
	}
	get size() {
		const { maximum, minimum } = this;
		return maximum - minimum
	}
	get minimum() {
		const [min, _] = this;
		return min
	}
	get maximum() {
		const [_, max] = this;
		return max
	}
	merge(that: BoundingInterval) {
		if (this !== that) {
			// if (that.is_valid()) {
			const [a1, b1] = this;
			const [a2, b2] = that;
			return new BoundingInterval([Math.min(a1, a2), Math.max(b1, b2)]);
			// }
		}
		return that;
	}
	merge_self(that: BoundingInterval) {
		if (this !== that) {
			// if (that.is_valid()) {
			const [a, b] = that;
			this[0] = Math.min(this[0], a);
			this[1] = Math.max(this[0], b);
			// }
		}
		return this;
	}

	neg() {
		const [a, b] = this;
		return new BoundingInterval([-a, -b]);
	}
	is_valid() {
		const [a, b] = this;
		return b >= a;
	}

	static check(p: Iterable<number>) {
		if (p) {
			let [min, max] = p;
			if (max == undefined) {
				max = min;
			}
			if (min > max) {
				return new BoundingInterval([max, min])
			} else {
				return new BoundingInterval([min, max])
			}
		} else {
			throw new Error(`Unexpected`);
		}
	}
}

export class BoundingBox extends Array<BoundingInterval> {
	// _x: BoundingInterval;
	// _y: BoundingInterval;

	constructor(x?: Iterable<number>, y?: Iterable<number>) {
		super(new BoundingInterval(x ?? [Infinity, -Infinity]), new BoundingInterval(y ?? [Infinity, -Infinity]));
	}
	get _x() {
		return this[0];
	}
	get _y() {
		return this[1];
	}
	// *[Symbol.iterator](): Iterator<BoundingInterval> {
	// 	const { _x: x, _y: y } = this;
	// 	yield x;
	// 	yield y;
	// }
	get width() {
		return this._x.size
	}
	get height() {
		return this._y.size
	}
	get top() {
		return this._y.minimum
	}
	get min_y() {
		return this._y.minimum
	}
	get left() {
		return this._x.minimum
	}
	get min_x() {
		return this._x.minimum
	}
	get bottom() {
		return this._y.maximum
	}
	get max_y() {
		return this._y.maximum
	}
	get right() {
		return this._x.maximum
	}
	get max_x() {
		return this._x.maximum
	}
	get center_x() {
		return this._x.center
	}
	get center_y() {
		return this._y.center
	}
	get diagonal_length() {
		const { width, height } = this;
		return (width * width + height * height) ** (0.5)
	}
	get center() {
		const [x, y] = this;
		return new Vector([x.center, y.center]);
	}
	get size() {
		const [x, y] = this;
		return new Vector([x.size, y.size]);
	}
	toString(): string {
		return [...this].map(v => `[${v.toString()}]`).join(", ")
	}
	dump() {
		return [...this].map(v => [...v])
	}

	merge(...args: BoundingBox[]) {
		const bb = this.clone();
		for (const that of args) {
			if (this !== that) {
				// if (!that.is_valid()) {
				// 	continue
				// }
				bb.merge_self(that);
			}
		}
		return bb;
	}
	with_center(p: Iterable<number>): BoundingBox {
		const [cx, cy] = p;
		const { width: W, height: H } = this;
		return BoundingBox.rect(cx - W / 2, cy - H / 2, W, H);
	}

	with_size(p: Iterable<number>): BoundingBox {
		const [w, h] = p;
		const { left, top } = this;
		return BoundingBox.rect(left, top, w, h);
	}

	with_pos(p: Iterable<number>): BoundingBox {
		const [x, y] = p;
		const { width, height } = this;
		return BoundingBox.rect(x, y, width, height);
	}

	with_min_y(n: number): BoundingBox {
		const { left, width, height } = this;
		return BoundingBox.rect(left, n, width, height);
	}

	with_min_x(n: number): BoundingBox {
		const { top, width, height } = this;
		return BoundingBox.rect(n, top, width, height);
	}

	inflated(h: number, v?: number): BoundingBox {
		v = v ?? h;
		const { left, top, width, height } = this;
		return BoundingBox.rect(left - h, top - v, h + width + h, v + height + v);
	}
	neg() {
		const [x, y] = this;
		return new BoundingBox(x.neg(), y.neg());
	}

	resize(delta_x: number, delta_y: number | undefined = undefined) {
		const [x, y] = this;
		const dy = delta_y ?? delta_x;
		return new BoundingBox(
			[x.minimum - delta_x, x.maximum + delta_x],
			[y.minimum - dy, y.maximum + dy]
		);
	}
	merge_self(that: BoundingBox) {
		// if (that.is_valid()) {
		const [x1, y1] = this;
		const [x2, y2] = that;
		this[0] = x1.merge(x2)
		this[1] = y1.merge(y2)
		// }
		return this;
	}
	equals(that: BoundingBox): boolean {
		if (!that) {
			return false;
		} else if (that === this) {
			return true;
		} else {
			return this._x.equals(that._x) && this._y.equals(that._y)
		}
	}
	is_valid() {
		return this._x.is_valid() && this._y.is_valid();
	}
	clone() {
		const { _x: x, _y: y } = this;
		return new BoundingBox(x, y);
	}
	transform(m: any) {
		let xMin = Infinity;
		let xMax = -Infinity;
		let yMin = Infinity;
		let maxY = -Infinity;
		const { left, top, bottom, right } = this;
		[Vector.pos(left, top), Vector.pos(right, top), Vector.pos(left, bottom), Vector.pos(right, bottom)].forEach(
			function (p) {
				const [x, y] = p.transform(m);
				xMin = min(xMin, x);
				xMax = max(xMax, x);
				yMin = min(yMin, y);
				maxY = max(maxY, y);
			}
		);
		return BoundingBox.extrema(xMin, xMax, yMin, maxY);
	}
	overlap(other: BoundingBox): BoundingBox {
		if (!this.is_valid()) {
			return other;
		} else if (!other.is_valid()) {
			return this;
		} else {
			const { min_x: xMin1, min_y: yMin1, max_x: xMax1, max_y: yMax1 } = this;
			const { min_x: xMin2, min_y: yMin2, max_x: xMax2, max_y: yMax2 } = other;
			const xMin = max(xMin1, xMin2);
			const xMax = min(xMax1, xMax2);
			if (xMax >= xMin) {
				const yMin = max(yMin1, yMin2);
				const yMax = min(yMax1, yMax2);
				if (yMax >= yMin) {
					return BoundingBox.extrema(xMin, xMax, yMin, yMax);
				}
			}
		}
		return BoundingBox.not();
	}
	//// 
	static not() {
		return new BoundingBox();
	}

	public static rect(x: number, y: number, width: number, height: number) {
		return new this([x, x + width], [y, y + height]);
	}
	public static extrema(x1: number, x2: number, y1: number, y2: number) {
		return new this([x1, x2], [y1, y2]);
	}
	public static check(x: Iterable<number>, y: Iterable<number>) {
		return new this(BoundingInterval.check(x), BoundingInterval.check(y));
	}


	public static new(
		first?: number | number[] | [number[], number[]] | string | BoundingBox,
		y?: number,
		width?: number,
		height?: number
	) {
		switch (typeof first) {
			case 'string': {
				return this.parse(first);
			}
			case 'number':
				return this.rect(first, arguments[1], arguments[2], arguments[3]);
			case 'undefined':
				return this.not();
			case 'object':
				if (first instanceof BoundingBox) {
					return new BoundingBox(...first);
				}

				if (Array.isArray(first)) {
					const x = first[0];
					if (Array.isArray(x)) {
						const [x1, x2] = first[0] as number[];
						const [y1, y2] = first[1] as number[];
						return this.extrema(
							x1 as number,
							x2 as number,
							y1 as number,
							y2 as number
						);
					} else {
						return this.rect(
							first[0] as number,
							first[1] as number,
							first[2] as number,
							first[3] as number
						);
					}
				} else {


				}
			default:
				throw new TypeError(`Invalid box argument ${arguments}`);
		}
	}
	public static parse(s: string) {
		const v = s.split(/[\s,]+/).map(parseFloat);
		return this.rect(v[0], v[1], v[2], v[3]);
	}
	public static merge(...args: BoundingBox[]) {
		const bb = new BoundingBox();
		for (const that of args) {
			bb.merge_self(that);
		}
		return bb;
	}

}

// export class BoundingBox {
// 	protected _x: number;
// 	protected _y: number;
// 	protected _h: number;
// 	protected _w: number;
// 	private static _not: BoundingBox = new (class extends BoundingBox {
// 		// NoBox has no valid values so it cant be merged
// 		constructor() {
// 			super(NaN, NaN, NaN, NaN);
// 			Object.freeze(this);
// 		}
// 		override merge(box: BoundingBox): BoundingBox {
// 			return box;
// 		}
// 		override transform(m: any) {
// 			return this;
// 		}
// 		override is_valid() {
// 			return false;
// 		}
// 	})();
// 	protected constructor(x: number, y: number, width: number, height: number) {
// 		this._x = x;
// 		this._y = y;
// 		this._w = width;
// 		this._h = height;
// 	}
// 	clone() {
// 		const { x, y, width, height } = this;

// 		return BoundingBox.rect(x, y, width, height);
// 	}

// 	get x() {
// 		return this._x;
// 	}
// 	get left() {
// 		return this._x;
// 	}
// 	get minX() {
// 		return this._x;
// 	}
// 	get y() {
// 		return this._y;
// 	}
// 	get top() {
// 		return this._y;
// 	}
// 	get minY() {
// 		return this._y;
// 	}
// 	get width() {
// 		return this._w;
// 	}
// 	get height() {
// 		return this._h;
// 	}
// 	get maxX() {
// 		const { x, width } = this;
// 		return x + width;
// 	}
// 	get maxY() {
// 		const { y, height } = this;
// 		return y + height;
// 	}
// 	get right() {
// 		return this.maxX;
// 	}
// 	get bottom() {
// 		return this.maxY;
// 	}
// 	get centerX() {
// 		const { x, width } = this;
// 		return x + width / 2;
// 	}
// 	get centerY() {
// 		const { y, height } = this;
// 		return y + height / 2;
// 	}
// 	get center() {
// 		const { centerX, centerY } = this;
// 		return Vector.new(centerX, centerY);
// 	}

// 	withCenter(p: Iterable<number>): BoundingBox {
// 		const [cx, cy] = p;
// 		const { width: W, height: H } = this;
// 		return BoundingBox.rect(cx - W / 2, cy - H / 2, W, H);
// 	}

// 	withSize(p: Iterable<number>): BoundingBox {
// 		const [w, h] = p;
// 		const { x, y } = this;
// 		return BoundingBox.rect(x, y, w, h);
// 	}

// 	withPos(p: Iterable<number>): BoundingBox {
// 		const [x, y] = p;
// 		const { width, height } = this;
// 		return BoundingBox.rect(x, y, width, height);
// 	}

// 	withMinY(n: number): BoundingBox {
// 		const { x, width, height } = this;
// 		return BoundingBox.rect(x, n, width, height);
// 	}

// 	withMinX(n: number): BoundingBox {
// 		const { y, width, height } = this;
// 		return BoundingBox.rect(n, y, width, height);
// 	}

// 	// Merge rect box with another, return a new instance
// 	merge(box: BoundingBox): BoundingBox {
// 		if (!this.is_valid()) {
// 			return box;
// 		} else if (!box.is_valid()) {
// 			return this;
// 		}

// 		// if (!box.is_valid()) return BoundingBox.new(this);
// 		// const { x: x1, y: y1, width: width1, height: height1 } = this;
// 		// const { x: x2, y: y2, width: width2, height: height2 } = box;

// 		// const x = min(x1, x2);
// 		// const y = min(y1, y2);

// 		// return BoundingBox.forRect(x, y, max(x1 + width1, x2 + width2) - x, max(y1 + height1, y2 + height2) - y);

// 		const { minX: xMin1, minY: yMin1, maxX: xMax1, maxY: yMax1 } = this;
// 		const { minX: xMin2, minY: yMin2, maxX: xMax2, maxY: yMax2 } = box;
// 		return BoundingBox.extrema(
// 			min(xMin1, xMin2),
// 			max(xMax1, xMax2),
// 			min(yMin1, yMin2),
// 			max(yMax1, yMax2)
// 		);
// 	}
// 	// translated
// 	// resized
// 	inflated(h: number, v?: number): BoundingBox {
// 		v = v ?? h;
// 		const { x, y, width, height } = this;
// 		return BoundingBox.rect(x - h, y - v, h + width + h, v + height + v);
// 	}
// 	transform(m: any) {
// 		let xMin = Infinity;
// 		let xMax = -Infinity;
// 		let yMin = Infinity;
// 		let maxY = -Infinity;
// 		// const {a, b, c, d, e, f} = matrix;
// 		const { x, y, bottom, right } = this;
// 		[Vector.new(x, y), Vector.new(right, y), Vector.new(x, bottom), Vector.new(right, bottom)].forEach(
// 			function (p) {
// 				const [x, y] = p.transform(m);
// 				xMin = min(xMin, x);
// 				xMax = max(xMax, x);
// 				yMin = min(yMin, y);
// 				maxY = max(maxY, y);
// 			}
// 		);
// 		return BoundingBox.extrema(xMin, xMax, yMin, maxY);
// 	}
// 	is_valid() {
// 		const { x, y, width, height } = this;
// 		return isFinite(x) && isFinite(y) && isFinite(width) && isFinite(height);
// 	}
// 	isEmpty() {
// 		const { x, y, width, height } = this;
// 		return x == 0 || y == 0 || width == 0 || height == 0;
// 	}
// 	toArray() {
// 		const { x, y, width, height } = this;
// 		return [x, y, width, height];
// 	}
// 	toString() {
// 		const { x, y, width, height } = this;
// 		return `${x}, ${y}, ${width}, ${height}`;
// 	}
// 	equals(other: BoundingBox, epsilon = 0) {
// 		if (other === this) {
// 			return true;
// 		}
// 		const { x: x1, y: y1, width: width1, height: height1 } = this;
// 		const { x: x2, y: y2, width: width2, height: height2 } = other;
// 		return (
// 			closeEnough(x1, x2, epsilon) &&
// 			closeEnough(y1, y2, epsilon) &&
// 			closeEnough(width1, width2, epsilon) &&
// 			closeEnough(height1, height2, epsilon)
// 		);
// 	}
// 	overlap(other: BoundingBox): BoundingBox {
// 		if (!this.is_valid()) {
// 			return other;
// 		} else if (!other.is_valid()) {
// 			return this;
// 		} else {
// 			const { minX: xMin1, minY: yMin1, maxX: xMax1, maxY: yMax1 } = this;
// 			const { minX: xMin2, minY: yMin2, maxX: xMax2, maxY: yMax2 } = other;
// 			const xMin = max(xMin1, xMin2);
// 			const xMax = min(xMax1, xMax2);
// 			if (xMax >= xMin) {
// 				const yMin = max(yMin1, yMin2);
// 				const yMax = min(yMax1, yMax2);
// 				if (yMax >= yMin) {
// 					return BoundingBox.extrema(xMin, xMax, yMin, yMax);
// 				}
// 			}
// 		}
// 		return BoundingBox._not;
// 	}
// 	public static not() {
// 		return this._not;
// 	}
// 	private static _empty?: BoundingBox;
// 	public static empty() {
// 		const { _empty } = BoundingBox;
// 		return _empty || (BoundingBox._empty = BoundingBox.rect(0, 0, 0, 0));
// 	}
// 	public static extrema(x1: number, x2: number, y1: number, y2: number) {
// 		if (x1 > x2) [x1, x2] = [x2, x1];
// 		if (y1 > y2) [y1, y2] = [y2, y1];
// 		return this.rect(x1, y1, abs(x2 - x1), abs(y2 - y1));
// 	}
// 	public static fromRect({ x = 0, y = 0, width = 0, height = 0 }) {
// 		// https://developer.mozilla.org/en-US/docs/Web/API/DOMRect/fromRect
// 		return this.rect(x, y, width, height);
// 	}
// 	public static rect(x: number, y: number, width: number, height: number) {
// 		return new this(x, y, width, height);
// 	}
// 	public static parse(s: string) {
// 		const v = s.split(/[\s,]+/).map(parseFloat);
// 		return this.rect(v[0], v[1], v[2], v[3]);
// 	}
// 	public static merge(...args: Array<BoundingBox>) {
// 		let x = BoundingBox.not();
// 		for (const b of args) {
// 			x = b.merge(x);
// 		}
// 		return x;
// 	}
// 	public static new(
// 		first?: number | number[] | [number[], number[]] | string | BoundingBox,
// 		y?: number,
// 		width?: number,
// 		height?: number
// 	) {
// 		switch (typeof first) {
// 			case 'string': {
// 				return this.parse(first);
// 			}
// 			case 'number':
// 				return this.rect(first, arguments[1], arguments[2], arguments[3]);
// 			case 'undefined':
// 				return this.not();
// 			case 'object':
// 				if (Array.isArray(first)) {
// 					const x = first[0];
// 					if (Array.isArray(x)) {
// 						const [x1, x2] = first[0] as number[];
// 						const [y1, y2] = first[1] as number[];
// 						return this.extrema(
// 							x1 as number,
// 							x2 as number,
// 							y1 as number,
// 							y2 as number
// 						);
// 					} else {
// 						return this.rect(
// 							first[0] as number,
// 							first[1] as number,
// 							first[2] as number,
// 							first[3] as number
// 						);
// 					}
// 				} else {
// 					const { left, x, top, y, width, height } = first;
// 					return this.rect(left || x || 0, top || y || 0, width, height);
// 				}
// 			default:
// 				throw new TypeError(`Invalid box argument ${arguments}`);
// 		}
// 	}
// }

// export class BoxMut extends BoundingBox {
// 	override get x() {
// 		return this._x;
// 	}

// 	override set x(value: number) {
// 		this._x = value;
// 	}

// 	override get y() {
// 		return this._y;
// 	}

// 	override set y(value: number) {
// 		this._y = value;
// 	}

// 	override get width() {
// 		return this._w;
// 	}

// 	override set width(value: number) {
// 		this._w = value;
// 	}

// 	override get height() {
// 		return this._h;
// 	}

// 	override set height(value: number) {
// 		this._h = value;
// 	}

// 	private reset(x: number, y: number, width: number, height: number) {
// 		this._x = x;
// 		this._y = y;
// 		this._w = width;
// 		this._h = height;
// 		return this;
// 	}

// 	mergeSelf(box: BoundingBox): this {
// 		if (!this.is_valid()) {
// 			return this.copy(box);
// 		} else if (!box.is_valid()) {
// 			return this;
// 		} else {
// 			const { x: x1, y: y1, width: width1, height: height1 } = this;
// 			const { x: x2, y: y2, width: width2, height: height2 } = box;
// 			const x = min(x1, x2);
// 			const y = min(y1, y2);
// 			return this.reset(
// 				x,
// 				y,
// 				max(x1 + width1, x2 + width2) - x,
// 				max(y1 + height1, y2 + height2) - y
// 			);
// 		}
// 	}

// 	inflateSelf(h: number, v?: number): BoundingBox {
// 		v = v ?? h;
// 		const { x, y, width, height } = this;
// 		return this.reset(x - h, y - v, h + width + h, v + height + v);
// 	}

// 	sizeSelf(w: number, h?: number): BoundingBox {
// 		const { x, y, width, height } = this;
// 		return this.reset(x, y, w ?? width, h ?? height);
// 	}

// 	override is_valid() {
// 		const { x, y, width, height } = this;
// 		return !(isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height));
// 	}

// 	copy(that: BoundingBox) {
// 		const { x, y, width, height } = that;
// 		this._x = x;
// 		this._y = y;
// 		this._w = width;
// 		this._h = height;
// 		return this;
// 	}

// 	public static not() {
// 		return new BoxMut(NaN, NaN, NaN, NaN);
// 	}

// 	public static override rect(x: number, y: number, width: number, height: number) {
// 		return new this(x, y, width, height);
// 	}
// }

// function closeEnough(a: number, b: number, threshold = 1e-6) {
// 	return abs(b - a) <= threshold;
// }
