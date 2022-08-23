import {Vec} from './point.js';
import {Box} from './box.js';

const {PI: pi, abs, sqrt, tan, acos, sin, cos} = Math;

function* pick(args: Vec[] | number[] | boolean[]) {
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

export class PathDraw {
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

	moveTo(...args: Vec[] | number[]) {
		const [x, y] = pick(args);
		this._ += `M${fmtN((this._x0 = this._x1 = +x))},${fmtN((this._y0 = this._y1 = +y))}`;
		return this;
	}

	lineTo(...args: Vec[] | number[]) {
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

	quadraticCurveTo(...args: Vec[] | number[]) {
		const [x1, y1, x, y] = pick(args);
		this._ += `Q${fmtN(x1)},${fmtN(y1)},${fmtN((this._x1 = +x))},${fmtN((this._y1 = +y))}`;
		return this;
	}

	bezierCurveTo(...args: Vec[] | number[]) {
		const [x1, y1, x2, y2, x, y] = pick(args);
		this._ += `C${fmtN(x1)},${fmtN(y1)},${fmtN(x2)},${fmtN(y2)},${fmtN((this._x1 = +x))},${fmtN((this._y1 = +y))}`;
		return this;
	}

	arcTo(...args: Vec[] | number[]) {
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
	arcd(...args: Vec[] | number[]) {
		const [x, y, r, a0, a1, ccw] = pick(args);
		return this.arc(x, y, r, (a0 * pi) / 180, (a1 * pi) / 180, ccw);
	}
	// qTo()
	arc(...args: Vec[] | number[]) {
		const [x, y, r, a0, a1, ccw] = pick(args);
		const {_x1, _y1} = this;
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

	rect(...args: Vec[] | number[]) {
		const [x, y, w, h] = pick(args);
		this._ += `M${fmtN((this._x0 = this._x1 = +x))},${fmtN((this._y0 = this._y1 = +y))}h${+w}v${+h}h${-w}Z`;
		return this;
	}

	toString() {
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
		text: string,
		maxWidth?: number
	) {
		const {font, fontSize = 72, kerning, letterSpacing, tracking} = options;
		// const fontSize = options.fontSize || 72;
		//   const kerning = 'kerning' in options ? options.kerning : true;
		//   const letterSpacing = 'letterSpacing' in options ? options.letterSpacing : false;
		// const tracking = 'tracking' in options ? options.tracking : false;
		// const metrics = this.getMetrics(text, options);
		const {_x1, _y1} = this;
		font.getPath(text, _x1 ?? 0, _y1 ?? 0, fontSize, {
			kerning,
			letterSpacing,
			tracking,
		}).draw(this);
		return this;
	}
	// CanvasRenderingContext2D compat

	set fillStyle(x: any) {}
	get fillStyle() {
		return 'red';
	}
	fill() {}
	beginPath() {
		// this._ = '';
	}

	static new() {
		return new PathDraw();
	}

	static moveTo() {
		return PathDraw.new().moveTo(...arguments);
	}

	static lineTo() {
		return PathDraw.new().lineTo(...arguments);
	}
}

import {Font /*, load, loadSync*/} from 'opentype.js';
import {SegmentLS} from './path/linked.js';
import {DParams} from './path.js';

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

export class PathLS {
	_tail: SegmentLS | undefined;
	constructor(tail: SegmentLS | undefined) {
		this._tail = tail;
	}

	moveTo(...args: Vec[] | number[]) {
		const {_tail} = this;
		this._tail = (_tail ?? SegmentLS).moveTo(...args);
		return this;
	}
	lineTo(...args: Vec[] | number[]) {
		const {_tail} = this;
		this._tail = (_tail ?? SegmentLS).lineTo(...args);
		return this;
	}
	bezierCurveTo(...args: Vec[] | number[]) {
		const {_tail} = this;
		this._tail = (_tail ?? SegmentLS).bezierCurveTo(...args);
		return this;
	}
	quadraticCurveTo(...args: Vec[] | number[]) {
		const {_tail} = this;
		this._tail = (_tail ?? SegmentLS).quadraticCurveTo(...args);
		return this;
	}
	arc(...args: Vec[] | number[]) {
		const {_tail} = this;
		this._tail = (_tail ?? SegmentLS).arc(...args);
		return this;
	}
	arcTo(...args: Vec[] | number[]) {
		const {_tail} = this;
		this._tail = (_tail ?? SegmentLS).arcTo(...args);
		return this;
	}
	rect(...args: Vec[] | number[]) {
		const {_tail} = this;
		this._tail = (_tail ?? SegmentLS).rect(...args);
		return this;
	}

	// arc(...args: Vec[] | number[]) : SegmentLS {

	closePath() {
		const {_tail} = this;
		if (_tail) {
			this._tail = _tail.closePath();
		}
		return this;
	}
	toString() {
		return this._tail?.toString() || '';
	}
	describe(opt: DParams) {
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
		text: string,
		maxWidth?: number
	) {
		const {font, fontSize = 72, kerning, letterSpacing, tracking} = options;
		const [_x1, _y1] = this?._tail?.end ?? [0, 0];
		font.getPath(text, _x1, _y1, fontSize, {
			kerning,
			letterSpacing,
			tracking,
		}).draw(this);
		return this;
	}
	segmentAtLength(T: number): [SegmentLS | undefined, number, number] {
		let cur: SegmentLS | undefined = this._tail;
		if (cur) {
			return _segmentAtLen(cur, T, lenPath(cur));
		}
		return [undefined, NaN, NaN];
	}
	segmentAt(T: number): [SegmentLS | undefined, number] {
		let cur: SegmentLS | undefined = this._tail;
		if (cur) {
			const len = lenPath(cur);
			const [seg, n, N] = _segmentAtLen(cur, T * len, len);
			return [seg, n / N];
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
	pointAtLength(L: number) {
		const [seg, n, N] = this.segmentAtLength(L);
		if (seg) return seg.pointAt(n / N);
	}
	bbox() {
		let b = Box.new();
		for (let cur: SegmentLS | undefined = this._tail; cur; cur = cur._prev) {
			b = b.merge(cur.bbox());
		}
		return b;
	}
	splitAt(T: number) {
		const {_tail} = this;
		if (_tail) {
			const [seg, t] = this.segmentAt(T);
			if (seg) {
				let [a, b] = seg.splitAt(t);
				if (seg === _tail) {
					return [new PathLS(a), new PathLS(b)];
				} else {
					return [new PathLS(a), new PathLS(_tail.withFarPrev(seg, SegmentLS.moveTo(a.end)))];
				}
			}
		}
		return [new PathLS(undefined), new PathLS(undefined)];
	}
	cutAt(T: number): PathLS {
		const [a, b] = this.splitAt(T);
		return T < 0 ? b : a;
	}
	cropAt(T0: number, T1: number = 1): PathLS {
		// SegmentSE method
		if (T0 <= 0) {
			if (T1 >= 1) {
				return this; // TODO: use clone
			} else if (T1 > 0) {
				return this.cutAt(T1);
			}
		} else if (T0 < 1) {
			if (T1 >= 1) {
				return this.cutAt(-T0);
			} else if (T0 < T1) {
				return this.cutAt(-T0).cutAt((T1 - T0) / (1 - T0));
			} else if (T0 > T1) {
				return this.cropAt(T1, T0);
			}
		} else if (T1 < 1) {
			// T0 >= 1
			return this.cropAt(T1, T0);
		}
		return new PathLS(undefined);
	}
	// CanvasRenderingContext2D compat

	set fillStyle(x: any) {}
	get fillStyle() {
		return 'red';
	}
	fill() {
		return this;
	}
	beginPath() {
		return this;
	}

	static moveTo(...args: Vec[] | number[]) {
		return new PathLS(SegmentLS.moveTo(...args));
	}
	static parse(d: string) {
		return new PathLS(SegmentLS.parse(d));
	}
	static rect(...args: Vec[] | number[]) {
		return new PathLS(SegmentLS.rect(...args));
	}
	static get digits() {
		return SegmentLS.digits;
	}
	static set digits(n: number) {
		SegmentLS.digits = n;
	}
}

function _segmentAtLen(cur: SegmentLS | undefined, lenP: number, LEN: number): [SegmentLS | undefined, number, number] {
	if (cur) {
		if (lenP < 0) {
			lenP = LEN + (lenP % LEN);
		}
		if (lenP > LEN) {
			if (0 == (lenP = lenP % LEN)) {
				lenP = LEN;
			}
		}
		let end = LEN;
		do {
			const lenS = lenSegm(cur);
			if (lenS > 0) {
				const lenT = lenP - (end -= lenS);
				if (lenT >= 0) {
					return [cur, lenT, lenS];
				}
			}
		} while ((cur = cur._prev));
	}
	return [undefined, NaN, NaN];
}
