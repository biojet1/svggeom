import { Vector } from './vector.js';
import { BoundingBox } from './bbox.js';
import { tNorm } from './path/index.js';

const { PI: pi, abs, sqrt, tan, acos, sin, cos } = Math;

function* pick(args: Vector[] | number[] | boolean[]) {
	for (const v of args) {
		if (typeof v == 'number') {
			yield +v;
		} else if (v) {
			if (v === true) {
				yield 1;
			} else {
				const [x, y] = v;
				yield x;
				yield y;
			}
		} else {
			yield 0;
		}
	}
}

const tau = 2 * pi,
	epsilon = 1e-6,
	tauEpsilon = tau - epsilon;
let digits = 6;

function fmtN(n: number) {
	const v = n.toFixed(digits);
	return v.indexOf('.') < 0 ? v : v.replace(/0+$/g, '').replace(/\.$/g, '');
}

class CanvasCompat {
	set fillStyle(_x: any) { }
	get fillStyle() {
		return 'red';
	}
	fill() {
		return this;
	}
	beginPath() {
		return this;
	}
}

export class PathDraw extends CanvasCompat {
	_x0?: number;
	_y0?: number;
	_x1?: number;
	_y1?: number;
	_ = '';
	static get digits() {
		return digits;
	}
	static set digits(n: number) {
		digits = n;
	}

	moveTo(...args: Vector[] | number[]) {
		const [x, y] = pick(args);
		this._ += `M${fmtN((this._x0 = this._x1 = +x))},${fmtN((this._y0 = this._y1 = +y))}`;
		return this;
	}

	lineTo(...args: Vector[] | number[]) {
		const [x, y] = pick(args);
		this._ += `L${fmtN((this._x1 = +x))},${fmtN((this._y1 = +y))}`;
		return this;
	}

	closePath() {
		if (typeof this._x1 !== 'undefined') {
			(this._x1 = this._x0), (this._y1 = this._y0);
			this._ += 'Z';
		}
		return this;
	}

	quadraticCurveTo(...args: Vector[] | number[]) {
		const [x1, y1, x, y] = pick(args);
		this._ += `Q${fmtN(x1)},${fmtN(y1)},${fmtN((this._x1 = +x))},${fmtN((this._y1 = +y))}`;
		return this;
	}

	bezierCurveTo(...args: Vector[] | number[]) {
		const [x1, y1, x2, y2, x, y] = pick(args);
		this._ += `C${fmtN(x1)},${fmtN(y1)},${fmtN(x2)},${fmtN(y2)},${fmtN((this._x1 = +x))},${fmtN((this._y1 = +y))}`;
		return this;
	}

	arcTo(...args: Vector[] | number[]) {
		const [x1, y1, x2, y2, r] = pick(args);

		// (x1 = +x1), (y1 = +y1), (x2 = +x2), (y2 = +y2), (r = +r);
		const x0 = this._x1 ?? 0,
			y0 = this._y1 ?? 0,
			x21 = x2 - x1,
			y21 = y2 - y1,
			x01 = x0 - x1,
			y01 = y0 - y1,
			l01_2 = x01 * x01 + y01 * y01;

		// Is the radius negative? Error.
		if (r < 0) throw new Error('negative radius: ' + r);

		// Is this path empty? Move to (x1,y1).
		if (this._x1 == null) {
			this._ += `M${fmtN((this._x1 = x1))},${fmtN((this._y1 = y1))}`;
		} else if (!(l01_2 > epsilon)) {
			// Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
		} else if (!(abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
			// Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
			// Equivalently, is (x1,y1) coincident with (x2,y2)?
			// Or, is the radius zero? Line to (x1,y1).
			this._ += `L${fmtN((this._x1 = x1))},${fmtN((this._y1 = y1))}`;
		} else {
			// Otherwise, draw an arc!
			const x20 = x2 - x0,
				y20 = y2 - y0,
				l21_2 = x21 * x21 + y21 * y21,
				l20_2 = x20 * x20 + y20 * y20,
				l21 = sqrt(l21_2),
				l01 = sqrt(l01_2),
				l = r * tan((pi - acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
				t01 = l / l01,
				t21 = l / l21;

			// If the start tangent is not coincident with (x0,y0), line to.
			if (abs(t01 - 1) > epsilon) {
				this._ += `L${fmtN(x1 + t01 * x01)},${fmtN(y1 + t01 * y01)}`;
			}

			this._ += `A${fmtN(r)},${fmtN(r)},0,0,${y01 * x20 > x01 * y20 ? 1 : 0},${fmtN((this._x1 = x1 + t21 * x21))},${fmtN(
				(this._y1 = y1 + t21 * y21)
			)}`;
		}
		return this;
	}
	arcd(...args: Vector[] | number[]) {
		const [x, y, r, a0, a1, ccw] = pick(args);
		return this.arc(x, y, r, (a0 * pi) / 180, (a1 * pi) / 180, ccw);
	}
	// qTo()
	arc(...args: Vector[] | number[]) {
		const [x, y, r, a0, a1, ccw] = pick(args);
		const { _x1, _y1 } = this;
		const cw = ccw ? 0 : 1;
		const dx = r * Math.cos(a0);
		const dy = r * Math.sin(a0);
		const x0 = x + dx;
		const y0 = y + dy;
		let da = cw ? a1 - a0 : a0 - a1;

		// Is the radius negative? Error.
		if (r < 0) throw new Error('negative radius: ' + r);

		// Is this path empty? Move to (x0,y0).
		if (_x1 == null) {
			this._ += `M${fmtN(x0)},${fmtN(y0)}`;
		}

		// Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
		else if (abs(_x1 - x0) > epsilon || abs((_y1 ?? 0) - y0) > epsilon) {
			this._ += `L${fmtN(x0)},${fmtN(y0)}`;
		}

		// Is this arc empty? We’re done.
		if (!r) return this;

		// Does the angle go the wrong way? Flip the direction.
		if (da < 0) da = (da % tau) + tau;

		// Is this a complete circle? PathDraw two arcs to complete the circle.
		if (da > tauEpsilon) {
			this._ +=
				`A${fmtN(r)},${fmtN(r)},0,1,${cw},${fmtN(x - dx)},${fmtN(y - dy)}` +
				`A${fmtN(r)},${fmtN(r)},0,1,${cw},${fmtN((this._x1 = x0))},${fmtN((this._y1 = y0))}`;
		}
		// Is this arc non-empty? PathDraw an arc!
		else if (da > epsilon) {
			this._ += `A${fmtN(r)},${fmtN(r)},0,${da >= pi ? 1 : 0},${cw},${fmtN((this._x1 = x + r * cos(a1)))},${fmtN(
				(this._y1 = y + r * sin(a1))
			)}`;
		}
		return this;
	}

	rect(...args: Vector[] | number[]) {
		const [x, y, w, h] = pick(args);
		this._ += `M${fmtN((this._x0 = this._x1 = +x))},${fmtN((this._y0 = this._y1 = +y))}h${+w}v${+h}h${-w}Z`;
		return this;
	}

	override toString() {
		return this._;
	}

	d() {
		return this._;
	}

	text(
		options: {
			fontSize: number;
			font: Font;
			kerning?: boolean;
			tracking?: number;
			letterSpacing?: number;
		},
		text: string
		// maxWidth?: number
	) {
		const { font, fontSize = 72, kerning, letterSpacing, tracking } = options;
		// const fontSize = options.fontSize || 72;
		//   const kerning = 'kerning' in options ? options.kerning : true;
		//   const letterSpacing = 'letterSpacing' in options ? options.letterSpacing : false;
		// const tracking = 'tracking' in options ? options.tracking : false;
		// const metrics = this.getMetrics(text, options);
		const { _x1, _y1 } = this;
		font.getPath(text, _x1 ?? 0, _y1 ?? 0, fontSize, {
			kerning,
			letterSpacing,
			tracking,
		}).draw(this as unknown as Parameters<Font["draw"]>[0]);
		return this;
	}

	static new() {
		return new PathDraw();
	}

	static moveTo() {
		return PathDraw.new().moveTo(...arguments);
	}

	static lineTo() {
		return PathDraw.new()
			.moveTo(0, 0)
			.lineTo(...arguments);
	}
}

import { Font /*, load, loadSync*/ } from 'opentype.js';
import { SegmentLS, MoveLS } from './path/linked.js';
import { DescParams } from './path/index.js';

const len_segm = new WeakMap<SegmentLS, number>();
const len_path = new WeakMap<SegmentLS, number>();

function lenPath(seg: SegmentLS) {
	let v = len_path.get(seg);
	if (v == null) {
		len_path.set(seg, (v = seg.pathLen()));
	}
	return v;
}

function lenSegm(seg: SegmentLS) {
	let v = len_segm.get(seg);
	if (v == null) {
		len_segm.set(seg, (v = seg.segmentLen()));
	}
	return v;
}

export class PathLS extends CanvasCompat {
	_tail: SegmentLS | undefined;
	constructor(tail: SegmentLS | undefined) {
		super();
		this._tail = tail;
	}

	moveTo(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).moveTo(...args);
		return this;
	}
	lineTo(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).lineTo(...args);
		return this;
	}
	bezierCurveTo(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).bezierCurveTo(...args);
		return this;
	}
	quadraticCurveTo(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).quadraticCurveTo(...args);
		return this;
	}
	arc(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).arc(...args);
		return this;
	}
	arcd(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).arcd(...args);
		return this;
	}

	arcTo(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).arcTo(...args);
		return this;
	}
	rect(...args: Vector[] | number[]) {
		const { _tail } = this;
		this._tail = (_tail ?? SegmentLS).rect(...args);
		return this;
	}
	closePath() {
		const { _tail } = this;
		if (_tail) {
			this._tail = _tail.closePath();
		}
		return this;
	}
	describe(opt?: DescParams) {
		return this._tail?.describe(opt) || '';
	}
	text(
		options: {
			fontSize: number;
			font: Font;
			kerning?: boolean;
			tracking?: number;
			letterSpacing?: number;
		},
		text: string
		// maxWidth?: number
	) {
		const { font, fontSize = 72, kerning, letterSpacing, tracking } = options;
		const [_x1, _y1] = this?._tail?.to ?? [0, 0];
		font.getPath(text, _x1, _y1, fontSize, {
			kerning,
			letterSpacing,
			tracking,
		}).draw(this as unknown as Parameters<Font["draw"]>[0]);
		return this;
	}
	segmentAtLength(T: number, clamp?: boolean): [SegmentLS | undefined, number, number] {
		let cur: SegmentLS | undefined = this._tail;
		if (cur) {
			return _segmentAtLen(cur, T, lenPath(cur), clamp);
		}
		return [undefined, NaN, NaN];
	}
	segmentAt(T: number): [SegmentLS | undefined, number] {
		let cur: SegmentLS | undefined = this._tail;
		if (cur) {
			const len = lenPath(cur);
			const [seg, n, N] = _segmentAtLen(cur, T * len, len);
			return [seg, N == 0 ? 0 : n / N];
		}
		return [undefined, NaN];
	}
	get length() {
		let cur: SegmentLS | undefined = this._tail;
		if (cur) {
			return lenPath(cur);
		}
		return 0;
	}
	get from() {
		return this._tail?.first?.to;
	}
	get to() {
		return this._tail?.to;
	}
	tangentAt(T: number) {
		const [seg, t] = this.segmentAt(T);
		if (seg) return seg.tangentAt(t);
	}

	slopeAt(T: number) {
		const [seg, t] = this.segmentAt(T);
		if (seg) return seg.slopeAt(t);
	}

	pointAt(T: number) {
		const [seg, t] = this.segmentAt(T);
		if (seg) return seg.pointAt(t);
	}
	pointAtLength(L: number, clamp?: boolean) {
		const [seg, n, N] = this.segmentAtLength(L, clamp);
		if (seg) return seg.pointAt(n / N);
	}

	bbox() {
		let b = BoundingBox.new();
		for (let cur: SegmentLS | undefined = this._tail; cur; cur = cur._prev) {
			b = b.merge(cur.bbox());
		}
		return b;
	}
	splitAt(T: number) {
		const { _tail } = this;
		if (_tail) {
			const [seg, t] = this.segmentAt(T);
			if (seg) {
				if (t == 0) {
					const { prev } = seg;
					return [new PathLS(prev), new PathLS(_tail.withFarPrev3(seg, SegmentLS.moveTo(prev?.to)))];
				} else if (t == 1) {
					return [new PathLS(seg), new PathLS(_tail.withFarPrev(seg, SegmentLS.moveTo(seg.to)))];
				}
				if (t < 0 || t > 1) {
					throw new Error();
				}
				let [a, b] = seg.splitAt(t);
				if (seg === _tail) {
					return [new PathLS(a), new PathLS(b)];
				} else {
					return [new PathLS(a), new PathLS(_tail.withFarPrev(seg, b))];
				}
			}
		}
		return [new PathLS(undefined), new PathLS(undefined)];
	}
	cutAt(T: number): PathLS {
		return T < 0 ? this.splitAt(1 + T)[1] : this.splitAt(T)[0];
	}
	cropAt(T0: number, T1: number = 1): PathLS {
		T0 = tNorm(T0);
		T1 = tNorm(T1);
		if (T0 <= 0) {
			if (T1 >= 1) {
				return this; // TODO: use clone
			} else if (T1 > 0) {
				return this.cutAt(T1);
			}
		} else if (T0 < 1) {
			if (T1 >= 1) {
				return this.cutAt(T0 - 1);
			} else if (T0 < T1) {
				return this.cutAt(T0 - 1).cutAt((T1 - T0) / (1 - T0));
			} else if (T0 > T1) {
				return this.cropAt(T1, T0);
			}
		} else if (T1 < 1) {
			// T0 >= 1
			return this.cropAt(T1, T0);
		}
		return new PathLS(undefined);
	}
	reversed(_next?: SegmentLS): PathLS {
		const { _tail } = this;
		if (_tail) {
			return new PathLS(_tail.reversed());
		}
		return this;
	}
	descArray(opt?: DescParams): (number | string)[] {
		return this?._tail?.descArray(opt) ?? [];
	}
	*enumSubPaths(opt?: DescParams) {
		const { _tail } = this;
		if (_tail) {
			yield* _subPaths(_tail);
		}
	}
	*[Symbol.iterator]() {
		let { _tail: cur } = this;
		for (; cur; cur = cur._prev) {
			yield cur;
		}
	}
	transform(M: any) {
		const { _tail } = this;
		if (_tail) {
			return new PathLS(_tail.transform(M));
		}
		return this;
	}

	get firstPoint() {
		return this.from;
	}

	get lastPoint() {
		return this.to;
	}
	get firstSegment() {
		let seg;
		for (let { _tail: cur } = this; cur; cur = cur._prev) {
			if (!(cur instanceof MoveLS)) {
				seg = cur;
			}
		}
		return seg;
	}
	get lastSegment() {
		for (let { _tail: cur } = this; cur; cur = cur._prev) {
			if (!(cur instanceof MoveLS)) {
				return cur;
			}
		}
	}
	override toString() {
		return this?._tail?.describe() ?? '';
	}
	d() {
		return this.describe();
	}
	static moveTo(...args: Vector[] | number[]) {
		return new PathLS(SegmentLS.moveTo(...args));
	}
	static parse(d: string) {
		return new PathLS(SegmentLS.parse(d));
	}
	static rect(...args: Vector[] | number[]) {
		return new PathLS(SegmentLS.rect(...args));
	}
	static get digits() {
		return SegmentLS.digits;
	}
	static set digits(n: number) {
		SegmentLS.digits = n;
	}
	static lineTo() {
		return PathLS.moveTo(0, 0).lineTo(...arguments);
	}
}

function _segmentAtLen(
	cur: SegmentLS | undefined,
	lenP: number,
	LEN: number,
	clamp?: boolean
): [SegmentLS | undefined, number, number] {
	S1: if (cur) {
		if (lenP < 0) {
			if (clamp) {
				lenP = 0;
			} else {
				lenP = LEN + (lenP % LEN);
			}
		}
		if (lenP == 0) {
			let last: SegmentLS | undefined;
			do {
				if (!(cur instanceof MoveLS)) {
					last = cur;
				}
			} while ((cur = cur._prev));

			if (last) {
				return [last, 0, lenSegm(last)];
			}
			break S1;
		} else if (lenP > LEN) {
			if (clamp) {
				lenP = LEN;
			} else if (0 == (lenP = lenP % LEN)) {
				lenP = LEN;
			}
		}
		let to = LEN;
		do {
			if (cur instanceof MoveLS) {
				// pass
			} else {
				const lenS = lenSegm(cur);
				if (lenS >= 0) {
					const lenT = lenP - (to -= lenS);
					if (lenT >= 0) {
						return [cur, lenT, lenS];
					}
				}
			}
		} while ((cur = cur._prev));
	}
	return [undefined, NaN, NaN];
}

function* _subPaths(cur: SegmentLS | undefined) {
	let tail: undefined | SegmentLS;
	for (; cur; cur = cur._prev) {
		if (cur instanceof MoveLS) {
			if (tail) {
				if (tail === cur) {
					throw new Error();
				} else {
					yield tail.withFarPrev3(cur, undefined);
				}
				tail = undefined;
			}
		} else if (!tail) {
			tail = cur;
		}
	}
	if (tail) {
		yield tail;
	}
}
