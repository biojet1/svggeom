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
			super(NaN, NaN, NaN, NaN);
		}
		merge(box: Box): Box {
			return box === this ? this : Box.new(box);
		}

		transform(m: any) {
			return this;
		}
		isValid() {
			return false;
		}
	})();
	private constructor(x: number, y: number, width: number, height: number) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		// // if (arguments.length <= 0) {
		// // 	this.x = this.y = this.width = this.height = NaN;
		// // 	return Box._not;
		// // }
		// // const base = [0, 0, 0, 0];
		// // const v =
		// // 	typeof source === "string"
		// // 		? source.split(/[\s,]+/).map(parseFloat)
		// // 		: Array.isArray(source)
		// // 		? source
		// // 		: typeof source === "object"
		// // 		? [
		// // 				source.left != null ? source.left : source.x,
		// // 				source.top != null ? source.top : source.y,
		// // 				source.width,
		// // 				source.height,
		// // 		  ]
		// // 		: arguments.length === 4
		// // 		? [].slice.call(arguments)
		// // 		: base;
		// if (arguments.length <= 0) {
		// 	this.x = this.y = this.width = this.height = NaN;
		// 	return Box._not;
		// } else if (typeof source === "string") {
		// 	const v = source.split(/[\s,]+/).map(parseFloat);
		// 	this.x = v[0];
		// 	this.y = v[1];
		// 	this.width = v[2];
		// 	this.height = v[3];
		// } else if (Array.isArray(source)) {
		// 	this.x = source[0];
		// 	this.y = source[1];
		// 	this.width = source[2];
		// 	this.height = source[3];
		// } else if (typeof source === "object") {
		// 	this.x = source.left || source.x || 0;
		// 	this.y = source.top || source.y || 0;
		// 	this.width = source.width;
		// 	this.height = source.height;
		// } else {
		// 	throw new TypeError(`Invalid box argument ${arguments}`);
		// }
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
		if (!box.isValid()) return Box.new(this);

		const x = Math.min(this.x, box.x);
		const y = Math.min(this.y, box.y);

		return new Box(
			x,
			y,
			Math.max(this.x + this.width, box.x + box.width) - x,
			Math.max(this.y + this.height, box.y + box.height) - y
		);
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
		return new Box(x, y, width, height);
	}

	public static new(first: number | number[] | string | Box) {
		switch (typeof first) {
			case "string": {
				const v = first.split(/[\s,]+/).map(parseFloat);
				return new Box(v[0], v[1], v[2], v[3]);
			}
			case "number":
				return new Box(first, arguments[1], arguments[2], arguments[3]);
			case "undefined":
				return Box._not;
			case "object":
				if (Array.isArray(first)) {
					return new Box(first[0], first[1], first[2], first[3]);
				} else {
					const { left, x, top, y, width, height } = first;
					return new Box(left || x || 0, top || y || 0, width, height);
				}
			default:
				throw new TypeError(`Invalid box argument ${arguments}`);
		}
		// if (arguments.length <= 0) {
		// 	return Box._not;
		// } else if (typeof arguments[0] === "string") {
		// 	const v = source.split(/[\s,]+/).map(parseFloat);
		// 	return new Box(v[0], v[1], v[2], v[3]);
		// } else if (typeof arguments[0] === "number") {

		// } else if (Array.isArray(source)) {
		// 	return new Box(source[0], source[1], source[2], source[3]);
		// } else if (typeof source === "object") {
		// 	this.x = source.left || source.x || 0;
		// 	this.y = source.top || source.y || 0;
		// 	this.width = source.width;
		// 	this.height = source.height;
		// } else {
		// 	throw new TypeError(`Invalid box argument ${arguments}`);
		// }
	}
}
