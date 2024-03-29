import {Vec} from '../point.js';
import {Box} from '../box.js';
import {Segment, DescParams, tNorm, tCheck} from './index.js';
import {pickPos, pickNum} from './index.js';
import {parseLS} from './parser.js';
const {min, max, abs, PI, cos, sin, sqrt, acos, tan} = Math;
const tau = 2 * PI;
const epsilon = 1e-6;
const tauEpsilon = tau - epsilon;

let digits = 6;
function fmtN(n: number) {
	const v = n.toFixed(digits);
	return v.indexOf('.') < 0 ? v : v.replace(/0+$/g, '').replace(/\.$/g, '');
}

export abstract class SegmentLS extends Segment {
	_prev?: SegmentLS;
	protected readonly _to: Vec;
	static get digits() {
		return digits;
	}
	static set digits(n: number) {
		digits = n;
	}
	constructor(prev: SegmentLS | undefined, to: Vec) {
		super();
		this._prev = prev;
		this._to = to;
	}
	get prev() {
		const {_prev} = this;
		if (_prev) {
			return _prev;
		}
		throw new Error('No prev');
	}
	get from() {
		const {_prev} = this;
		if (_prev) {
			return _prev.to;
		}
		throw new Error('No prev');
	}
	get to() {
		return this._to;
	}
	get first(): SegmentLS | undefined {
		let cur: SegmentLS | undefined = this;
		while (cur) {
			const _prev: SegmentLS | undefined = cur._prev;
			if (_prev) {
				cur = _prev;
			} else {
				break;
			}
		}
		return cur;
	}
	get lastMove(): MoveLS | undefined {
		for (let cur: SegmentLS | undefined = this; cur; cur = cur._prev) {
			if (cur instanceof MoveLS) {
				return cur;
			}
		}
	}
	*enum() {
		for (let cur: SegmentLS | undefined = this; cur; cur = cur._prev) {
			yield cur;
		}
	}
	moveTo(...args: Vec[] | number[]) {
		return this.M(...args);
	}
	lineTo(...args: Vec[] | number[]) {
		return this.L(...args);
	}
	closePath(): SegmentLS {
		return this.Z();
	}
	bezierCurveTo(...args: Vec[] | number[]) {
		return this.C(...args);
	}
	quadraticCurveTo(...args: Vec[] | number[]) {
		return this.Q(...args);
	}
	M(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return new MoveLS(this, pos);
	}
	m(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return new MoveLS(this, this.to.add(pos));
	}
	Z(): SegmentLS {
		const to = this.lastMove?.to;
		if (to) {
			return new CloseLS(this, to);
		}
		return this;
	}
	z() {
		return this.Z();
	}
	L(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return new LineLS(this, pos);
	}
	l(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return new LineLS(this, this.to.add(pos));
	}
	H(n: number) {
		return new LineLS(this, this.to.withX(n));
	}
	h(n: number) {
		return new LineLS(this, this.to.shiftX(n));
	}
	V(n: number) {
		return new LineLS(this, this.to.withY(n));
	}
	v(n: number) {
		return new LineLS(this, this.to.shiftY(n));
	}
	Q(...args: Vec[] | number[]) {
		const [p, pE] = pickPos(args);
		return new QuadLS(this, p, pE);
	}
	q(...args: Vec[] | number[]) {
		const [p, pE] = pickPos(args);
		const {to: rel} = this;
		return new QuadLS(this, rel.add(p), rel.add(pE));
	}
	C(...args: Vec[] | number[]) {
		const [c1, c2, pE] = pickPos(args);
		return new CubicLS(this, c1, c2, pE);
	}
	c(...args: Vec[] | number[]) {
		const [c1, c2, pE] = pickPos(args);
		const {to: rel} = this;
		return new CubicLS(this, rel.add(c1), rel.add(c2), rel.add(pE));
	}
	S(...args: Vec[] | number[]): CubicLS {
		const [p2, pE] = pickPos(args);
		const {to} = this;
		if (this instanceof CubicLS) {
			return new CubicLS(this, this.c2.reflectAt(to), p2, pE);
		} else {
			return new CubicLS(this, to, p2, pE);
		}
	}
	s(...args: Vec[] | number[]): CubicLS {
		const [p2, pE] = pickPos(args);
		const {to} = this;
		if (this instanceof CubicLS) {
			return new CubicLS(this, this.c2.reflectAt(to), to.add(p2), to.add(pE));
		} else {
			return new CubicLS(this, to, to.add(p2), to.add(pE));
		}
	}
	T(...args: Vec[] | number[]): QuadLS {
		const [pE] = pickPos(args);
		const {to} = this;
		if (this instanceof QuadLS) {
			return new QuadLS(this, this.p.reflectAt(to), pE);
		} else {
			return new QuadLS(this, to, pE);
		}
	}
	t(...args: Vec[] | number[]): QuadLS {
		const [pE] = pickPos(args);
		const {to} = this;
		if (this instanceof QuadLS) {
			return new QuadLS(this, this.p.reflectAt(to), to.add(pE));
		} else {
			return new QuadLS(this, to, to.add(pE));
		}
	}

	A(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, ...args: Vec[] | number[]) {
		const [pE] = pickPos(args);
		return new ArcLS(this, rx, ry, φ, bigArc, sweep, pE);
	}

	a(rx: number, ry: number, φ: number, bigArc: boolean | number, sweep: boolean | number, ...args: Vec[] | number[]) {
		const [pE] = pickPos(args);
		const {to: rel} = this;
		return new ArcLS(this, rx, ry, φ, bigArc, sweep, rel.add(pE));
	}

	rect(...args: Vec[] | number[]) {
		const [xy, [w, h]] = pickPos(args);
		return this.M(xy).h(w).v(h).h(-w).z();
	}

	arc(...args: Vec[] | number[]): SegmentLS {
		const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
		return arcHelp(this, x, y, r, a0, a1, ccw);
	}
	arcd(...args: Vec[] | number[]): SegmentLS {
		const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
		return arcHelp(this, x, y, r, (a0 * PI) / 180, (a1 * PI) / 180, ccw);
	}
	arcTo(...args: Vec[] | number[]): SegmentLS {
		const [x1, y1, x2, y2, r] = pickNum(args);
		return arcToHelp(this, x1, y1, x2, y2, r);
	}

	override toString() {
		// return this.descArray()
		// 	.filter((v) => (typeof v == 'number' ? fmtN(v) : v))
		// 	.join(' ');
		return this.describe();
	}

	describe(opt?: DescParams): string {
		const {_prev} = this;
		const [cmd, ...args] = this._descs(opt);
		const d = `${cmd}${args.map(v => fmtN(v as number)).join(',')}`;
		return _prev ? _prev.describe(opt) + d : d;
	}

	override descArray(opt?: DescParams): (number | string)[] {
		const {_prev} = this;
		if (_prev) {
			const a = _prev.descArray(opt);
			a.push(...this._descs(opt));
			return a;
		} else {
			return [...this._descs(opt)];
		}
	}
	cutAt(t: number) {
		return t < 0 ? this.splitAt(1 + t)[1] : this.splitAt(t)[0];
	}
	cropAt(t0: number, t1: number): SegmentLS | undefined {
		t0 = tNorm(t0);
		t1 = tNorm(t1);
		if (t0 <= 0) {
			if (t1 >= 1) {
				return this;
			} else if (t1 > 0) {
				return this.cutAt(t1); // t1 < 1
			}
		} else if (t0 < 1) {
			if (t1 >= 1) {
				return this.cutAt(t0 - 1);
			} else if (t0 < t1) {
				return this.cutAt(t0 - 1).cutAt((t1 - t0) / (1 - t0));
			} else if (t0 > t1) {
				return this.cropAt(t1, t0); // t1 < 1
			}
		} else if (t1 < 1) {
			return this.cropAt(t1, t0); // t0 >= 1
		}
	}
	pathLen(): number {
		const {_prev} = this;
		const len = this.segmentLen();
		return _prev ? _prev.pathLen() + len : len;
	}
	segmentLen() {
		return this.length;
	}
	override bbox() {
		return Box.new();
	}
	withFarPrev(farPrev: SegmentLS, newPrev: SegmentLS): SegmentLS {
		const {_prev} = this;
		if (farPrev === this) {
			return newPrev;
		} else if (_prev) {
			return this.withPrev(_prev.withFarPrev(farPrev, newPrev));
		} else {
			throw new Error(`No prev`);
		}
	}
	withFarPrev3(farPrev: SegmentLS, newPrev: SegmentLS | undefined): SegmentLS | undefined {
		const {_prev} = this;
		if (farPrev === this) {
			return this.withPrev(newPrev);
		} else if (_prev) {
			return this.withPrev(_prev.withFarPrev3(farPrev, newPrev));
		} else {
			throw new Error(`No prev`);
		}
	}
	// subPaths(): SegmentLS {
	// 	if(this instanceof MoveLS || !_prev){
	// 		// push
	// 		this.withPrev(undefined);
	// 	}
	// 	const {_prev} = this;
	// 	if (_prev) {
	// 		return this.withPrev(_prev.subPaths());
	// 	} else {
	// 		// push
	// 		throw new Error(`No prev`);
	// 	}
	// }
	_asCubic(): SegmentLS {
		let {_prev} = this;
		if (_prev) {
			const newPrev = _prev._asCubic();
			if (newPrev !== _prev) {
				return this.withPrev(newPrev);
			}
		}
		return this;
	}
	// arcsAsCubics(): SegmentLS {
	// 	for (let cur: SegmentLS | undefined = this; cur; ) {
	// 		if (cur instanceof ArcLS) {
	// 			return cur._asCubic();
	// 		}
	// 		const _prev: SegmentLS | undefined = cur._prev;
	// 		if (_prev) {
	// 			cur = _prev;
	// 		} else {
	// 			break;
	// 		}
	// 	}
	// 	return this;
	// }
	abstract _descs(opt?: DescParams): (number | string)[];
	abstract splitAt(t: number): [SegmentLS, SegmentLS];
	abstract transform(M: any): SegmentLS;
	abstract reversed(next?: SegmentLS): SegmentLS | undefined;
	abstract withPrev(prev: SegmentLS | undefined): SegmentLS;
	parse(d: string) {
		return parseLS(d, this);
	}
	static moveTo(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return new MoveLS(undefined, pos);
	}
	static lineTo(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return this.moveTo(Vec.pos(0, 0)).lineTo(pos);
	}
	static bezierCurveTo(...args: Vec[] | number[]) {
		const [c1, c2, to] = pickPos(args);
		return this.moveTo(Vec.pos(0, 0)).bezierCurveTo(c1, c2, to);
	}
	static quadraticCurveTo(...args: Vec[] | number[]) {
		const [p, to] = pickPos(args);
		return this.moveTo(Vec.pos(0, 0)).quadraticCurveTo(p, to);
	}
	static parse(d: string) {
		return parseLS(d, undefined);
	}
	static arc(...args: Vec[] | number[]): SegmentLS {
		const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
		return arcHelp(undefined, x, y, r, a0, a1, ccw);
	}
	static arcd(...args: Vec[] | number[]): SegmentLS {
		const [x, y, r, a0, a1, ccw = 0] = pickNum(args);
		return arcHelp(undefined, x, y, r, (a0 * PI) / 180, (a1 * PI) / 180, ccw);
	}
	static arcTo(...args: Vec[] | number[]): SegmentLS {
		const [x1, y1, x2, y2, r] = pickNum(args);
		return arcToHelp(undefined, x1, y1, x2, y2, r);
	}
	static rect(...args: Vec[] | number[]) {
		const [xy, [w, h]] = pickPos(args);
		return new MoveLS(undefined, xy).h(w).v(h).h(-w).z();
	}
}

export class LineLS extends SegmentLS {
	override bbox() {
		const {
			to: [x2, y2],
			_prev,
		} = this;
		if (_prev) {
			const [x1, y1] = _prev.to;
			const [xmin, xmax] = [min(x1, x2), max(x1, x2)];
			const [ymin, ymax] = [min(y1, y2), max(y1, y2)];
			return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
		}
		return Box.new();
	}
	override get length() {
		const {from, to} = this;
		return to.sub(from).abs();
	}
	override pointAt(t: number) {
		const {from, to} = this;
		return to.sub(from).mul(tCheck(t)).postAdd(from);
	}
	override slopeAt(_: number) {
		const {from, to} = this;
		const vec = to.sub(from);
		return vec.div(vec.abs());
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const {to} = this;
		const c = this.pointAt(t);
		return [new LineLS(this._prev, c), new LineLS(new MoveLS(undefined, c), to)];
	}
	override _descs(opt?: DescParams) {
		const {
			to: [x, y],
		} = this;
		if (opt) {
			const {relative, short} = opt;
			const {_prev} = this;
			if (_prev) {
				const [sx, sy] = _prev.to;
				if (relative) {
					if (short) {
						if (sx === x) {
							return ['v', y - sy];
						} else if (sy === y) {
							return ['h', x - sx];
						}
					}
					return ['l', x - sx, y - sy];
				} else if (short) {
					if (sx === x) {
						return ['V', y];
					} else if (sy === y) {
						return ['H', x];
					}
				}
			}
		}

		return ['L', x, y];
	}
	override reversed(next?: SegmentLS): SegmentLS | undefined {
		const {to, _prev} = this;
		next || (next = new MoveLS(undefined, to));
		if (_prev) {
			const rev = new LineLS(next, _prev.to);
			return _prev.reversed(rev) ?? rev;
		} else {
			return next;
		}
	}
	override transform(M: any) {
		const {to, _prev} = this;
		return new LineLS(_prev?.transform(M), to.transform(M));
	}
	override withPrev(newPrev: SegmentLS | undefined) {
		const {to} = this;
		return new LineLS(newPrev, to);
	}
}
export class MoveLS extends LineLS {
	override _descs(opt?: DescParams) {
		const {
			to: [x, y],
		} = this;

		if (opt?.relative) {
			const {_prev} = this;
			if (_prev) {
				const [sx, sy] = _prev.to;
				return ['m', x - sx, y - sy];
			}
			return ['m', x, y];
		}

		return ['M', x, y];
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const {to} = this;
		const c = this.pointAt(t);
		return [new MoveLS(this._prev, c), new MoveLS(new MoveLS(undefined, c), to)];
	}
	override transform(M: any) {
		const {to, _prev} = this;
		return new MoveLS(_prev?.transform(M), to.transform(M));
	}
	override reversed(next?: SegmentLS): SegmentLS | undefined {
		const {_prev} = this;
		if (_prev) {
			const seg = new MoveLS(next, _prev.to);
			return _prev.reversed(seg) ?? seg;
		} else {
			return next;
		}
	}
	override withPrev(prev: SegmentLS | undefined) {
		const {to} = this;
		return new MoveLS(prev, to);
	}
	override segmentLen() {
		return 0;
	}
}
export class CloseLS extends LineLS {
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const {to} = this;
		const c = this.pointAt(t);
		return [new LineLS(this._prev, c), new CloseLS(new MoveLS(undefined, c), to)];
	}
	override transform(M: any) {
		const {to, _prev} = this;
		return new CloseLS(_prev?.transform(M), to.transform(M));
	}
	override _descs(opt?: DescParams) {
		if (opt) {
			const {relative, close} = opt;
			if (close === false) {
				return super._descs(opt);
			} else if (relative) {
				return ['z'];
			}
		}
		return ['Z'];
	}
	override reversed(next?: SegmentLS): SegmentLS | undefined {
		const {to, _prev} = this;
		next || (next = new MoveLS(undefined, to));
		if (_prev) {
			const rev = new LineLS(next, _prev.to);
			return _prev.reversed(rev) ?? rev;
		} else {
			return next;
		}
	}
	override withPrev(prev: SegmentLS | undefined) {
		const {to} = this;
		return new CloseLS(prev, to);
	}
}
import {quadLength, quadSplitAt, quadSlopeAt, quadPointAt, quadBBox} from './quadratic.js';
export class QuadLS extends SegmentLS {
	readonly p: Vec;
	constructor(prev: SegmentLS | undefined, p: Vec, to: Vec) {
		super(prev, to);
		this.p = p;
	}
	private get _qpts(): Vec[] {
		const {from, p, to} = this;
		return [from, p, to];
	}
	override get length() {
		return quadLength(this._qpts);
	}
	override slopeAt(t: number): Vec {
		return quadSlopeAt(this._qpts, tCheck(t));
	}
	override pointAt(t: number) {
		return quadPointAt(this._qpts, tCheck(t));
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const [a, b] = quadSplitAt(this._qpts, tCheck(t));
		return [new QuadLS(this._prev, a[1], a[2]), new QuadLS(new MoveLS(undefined, b[0]), b[1], b[2])];
	}
	override bbox() {
		const {_prev} = this;
		return _prev ? quadBBox(this._qpts) : Box.new();
	}
	override _descs(opt?: DescParams) {
		const {
			p: {x: x1, y: y1},
			to: {x: ex, y: ey},
		} = this;
		if (opt) {
			const {relative, smooth} = opt;
			const {p, _prev} = this;
			if (_prev) {
				const [sx, sy] = _prev.to;
				if (smooth && (_prev instanceof QuadLS ? _prev.p.reflectAt(_prev.to).closeTo(p) : _prev.to.closeTo(p))) {
					return relative ? ['t', ex - sx, ey - sy] : ['T', ex, ey];
				} else if (relative) {
					return ['q', x1 - sx, y1 - sy, ex - sx, ey - sy];
				}
			}
		}
		return ['Q', x1, y1, ex, ey];
	}
	override reversed(next?: SegmentLS): SegmentLS | undefined {
		const {to, p, _prev} = this;
		next || (next = new MoveLS(undefined, to));
		if (_prev) {
			const rev = new QuadLS(next, p, _prev.to);
			return _prev.reversed(rev) ?? rev;
		} else {
			return next;
		}
	}
	override transform(M: any) {
		const {p, to, _prev} = this;
		return new QuadLS(_prev?.transform(M), p.transform(M), to.transform(M));
	}
	override withPrev(prev: SegmentLS | undefined) {
		const {p, to} = this;
		return new QuadLS(prev, p, to);
	}
}
import {cubicLength, cubicSlopeAt, cubicPointAt, cubicBox, cubicSplitAt} from './cubic.js';
export class CubicLS extends SegmentLS {
	readonly c1: Vec;
	readonly c2: Vec;
	constructor(prev: SegmentLS | undefined, c1: Vec, c2: Vec, to: Vec) {
		super(prev, to);
		this.c1 = c1;
		this.c2 = c2;
	}
	private get _cpts(): Vec[] {
		const {from, c1, c2, to} = this;
		return [from, c1, c2, to];
	}
	/////
	override pointAt(t: number) {
		return cubicPointAt(this._cpts, tCheck(t));
	}
	override bbox() {
		const {_prev} = this;
		return _prev ? cubicBox(this._cpts) : Box.new();
	}
	override slopeAt(t: number): Vec {
		return cubicSlopeAt(this._cpts, tCheck(t));
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const {_prev, _cpts} = this;
		const [a, b] = cubicSplitAt(_cpts, tCheck(t));
		return [new CubicLS(_prev, a[1], a[2], a[3]), new CubicLS(new MoveLS(undefined, b[0]), b[1], b[2], b[3])];
	}
	override get length() {
		return cubicLength(this._cpts);
	}
	override reversed(next?: SegmentLS): SegmentLS | undefined {
		const {to, c1, c2, _prev} = this;
		next || (next = new MoveLS(undefined, to));
		if (_prev) {
			const rev = new CubicLS(next, c2, c1, _prev.to);
			return _prev.reversed(rev) ?? rev;
		} else {
			return next;
		}
	}
	override transform(M: any) {
		const {c1, c2, to, _prev} = this;
		return new CubicLS(_prev?.transform(M), c1.transform(M), c2.transform(M), to.transform(M));
	}
	override _descs(opt?: DescParams) {
		const {
			c1: [x1, y1],
			c2: [x2, y2],
			to: [ex, ey],
		} = this;

		if (opt) {
			const {smooth, relative} = opt;
			const {c1, _prev} = this;
			if (_prev) {
				const {to: from} = _prev;
				const [sx, sy] = from;
				if (smooth && (_prev instanceof CubicLS ? _prev.c2.reflectAt(from).closeTo(c1) : from.closeTo(c1))) {
					return relative ? ['s', x2 - sx, y2 - sy, ex - sx, ey - sy] : ['S', x2, y2, ex, ey];
				} else if (relative) {
					return ['c', x1 - sx, y1 - sy, x2 - sx, y2 - sy, ex - sx, ey - sy];
				}
			}
		}
		return ['C', x1, y1, x2, y2, ex, ey];
	}
	override withPrev(prev: SegmentLS | undefined) {
		const {c1, c2, to} = this;
		return new CubicLS(prev, c1, c2, to);
	}
}

import {arcBBox, arcLength, arcPointAt, arcSlopeAt, arcTransform} from './arc.js';
import {arcParams, arcToCurve} from '../util.js';
export class ArcLS extends SegmentLS {
	readonly rx: number;
	readonly ry: number;
	readonly phi: number;
	readonly bigArc: boolean;
	readonly sweep: boolean;
	//
	readonly cosφ: number;
	readonly sinφ: number;
	readonly rtheta: number;
	readonly rdelta: number;
	readonly cx: number;
	readonly cy: number;
	constructor(
		prev: SegmentLS | undefined,
		rx: number,
		ry: number,
		φ: number,
		bigArc: boolean | number,
		sweep: boolean | number,
		to: Vec
	) {
		if (!(isFinite(φ) && isFinite(rx) && isFinite(ry))) throw Error(`${JSON.stringify(arguments)}`);
		super(prev, to);
		const {x: x1, y: y1} = this.from;
		const {x: x2, y: y2} = this.to;
		[this.phi, this.rx, this.ry, this.sinφ, this.cosφ, this.cx, this.cy, this.rtheta, this.rdelta] = arcParams(
			x1,
			y1,
			rx,
			ry,
			φ,
			(this.bigArc = !!bigArc),
			(this.sweep = !!sweep),
			x2,
			y2
		);
	}
	override bbox() {
		const {_prev} = this;
		return _prev ? arcBBox(this) : Box.new();
	}
	override get length() {
		return arcLength(this);
	}
	override pointAt(t: number) {
		return arcPointAt(this, tCheck(t));
	}
	override slopeAt(t: number): Vec {
		return arcSlopeAt(this, tCheck(t));
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const {rx, ry, phi, sweep, rdelta, to, _prev} = this;
		const deltaA = abs(rdelta);
		const mid = arcPointAt(this, tCheck(t));
		return [
			new ArcLS(_prev, rx, ry, phi, deltaA * t > PI, sweep, mid),
			new ArcLS(new MoveLS(undefined, mid), rx, ry, phi, deltaA * (1 - t) > PI, sweep, to),
		];
	}
	override transform(M: any) {
		const {bigArc, to, _prev} = this;
		const [rx, ry, phi, sweep] = arcTransform(this, M);
		return new ArcLS(_prev?.transform(M), rx, ry, phi, bigArc, sweep, to.transform(M));
	}
	override reversed(next?: SegmentLS): SegmentLS | undefined {
		const {rx, ry, phi, bigArc, sweep, to, _prev} = this;
		next || (next = new MoveLS(undefined, to));
		if (_prev) {
			const rev = new ArcLS(next, rx, ry, phi, bigArc, !sweep, _prev.to);
			return _prev.reversed(rev) ?? rev;
		} else {
			return next;
		}
	}

	override _descs(opt?: DescParams) {
		const {
			rx,
			ry,
			phi,
			sweep,
			bigArc,
			to: [x, y],
		} = this;
		if (opt?.relative) {
			const {_prev} = this;
			if (_prev) {
				const [sx, sy] = _prev.to;
				return ['a', rx, ry, phi, bigArc ? 1 : 0, sweep ? 1 : 0, x - sx, y - sy];
			}
		}

		return ['A', rx, ry, phi, bigArc ? 1 : 0, sweep ? 1 : 0, x, y];
	}
	override _asCubic() {
		let {_prev, to} = this;
		if (_prev) {
			const {rx, ry, cx, cy, cosφ, sinφ, rdelta, rtheta} = this;
			const segments = arcToCurve(rx, ry, cx, cy, sinφ, cosφ, rtheta, rdelta);
			_prev = _prev._asCubic();
			if (segments.length === 0) {
				// Degenerated arcs can be ignored by renderer, but should not be dropped
				// to avoid collisions with `S A S` and so on. Replace with empty line.
				_prev = _prev.lineTo(to);
			} else {
				for (const s of segments) {
					_prev = _prev.bezierCurveTo(Vec.pos(s[2], s[3]), Vec.pos(s[4], s[5]), Vec.pos(s[6], s[7]));
				}
			}
			return _prev;
		}
		return SegmentLS.lineTo(to);
	}

	override withPrev(prev: SegmentLS | undefined) {
		const {rx, ry, phi, sweep, bigArc, to} = this;
		return new ArcLS(prev, rx, ry, phi, bigArc, sweep, to);
	}
}

function arcHelp(cur: SegmentLS | undefined, x: number, y: number, r: number, a0: number, a1: number, ccw: number) {
	const cw = ccw ? 0 : 1;
	const dx = r * cos(a0);
	const dy = r * sin(a0);
	const x0 = x + dx;
	const y0 = y + dy;
	if (r < 0) {
		// Is the radius negative? Error.
		throw new Error('negative radius: ' + r);
	} else if (!cur) {
		cur = new MoveLS(undefined, Vec.pos(x0, y0));
	} else if (!cur.to.closeTo(Vec.pos(x0, y0), epsilon)) {
		// Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
		cur = cur.L(Vec.pos(x0, y0));
	}
	let da = cw ? a1 - a0 : a0 - a1;
	// Is this arc empty? We’re done.
	if (!r) {
		return cur;
	} else if (da < 0) {
		da = (da % tau) + tau;
	}
	if (da > tauEpsilon) {
		// Is this a complete circle? PathDraw two arcs to complete the circle.
		return cur.A(r, r, 0, 1, cw, x - dx, y - dy).A(r, r, 0, 1, cw, x0, y0);
	} else if (da > epsilon) {
		// Is this arc non-empty? PathDraw an arc!
		return cur.A(r, r, 0, da >= PI, cw, x + r * cos(a1), y + r * sin(a1));
	}
	return cur;
}

function arcToHelp(cur: SegmentLS | undefined, x1: number, y1: number, x2: number, y2: number, r: number) {
	// (x1 = +x1), (y1 = +y1), (x2 = +x2), (y2 = +y2), (r = +r);
	const [x0, y0] = cur ? cur.to : [0, 0];
	const x21 = x2 - x1;
	const y21 = y2 - y1;
	const x01 = x0 - x1;
	const y01 = y0 - y1;
	const l01_2 = x01 * x01 + y01 * y01;

	// Is the radius negative? Error.
	if (r < 0) {
		throw new Error('negative radius: ' + r);
	} else if (!cur) {
		// Is this path empty? Move to (x1,y1).
		cur = new MoveLS(undefined, Vec.pos(x1, y1));
	} else if (!(l01_2 > epsilon)) {
		// Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
	} else if (!(abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
		// Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
		// Equivalently, is (x1,y1) coincident with (x2,y2)?
		// Or, is the radius zero? Line to (x1,y1).
		cur = cur.L(Vec.pos(x1, y1));
	} else {
		// Otherwise, draw an arc!
		const x20 = x2 - x0,
			y20 = y2 - y0,
			l21_2 = x21 * x21 + y21 * y21,
			l20_2 = x20 * x20 + y20 * y20,
			l21 = sqrt(l21_2),
			l01 = sqrt(l01_2),
			l = r * tan((PI - acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
			t01 = l / l01,
			t21 = l / l21;

		// If the start tangent is not coincident with (x0,y0), line to.
		if (abs(t01 - 1) > epsilon) {
			cur = cur.L(Vec.pos(x1 + t01 * x01, y1 + t01 * y01));
		}
		cur = cur.A(r, r, 0, 0, y01 * x20 > x01 * y20 ? 1 : 0, x1 + t21 * x21, y1 + t21 * y21);
		// this._ += `A${fmtN(r)},${fmtN(r)},0,0,${y01 * x20 > x01 * y20 ? 1 : 0},${fmtN(
		// 	(this._x1 = x1 + t21 * x21),
		// )},${fmtN((this._y1 = y1 + t21 * y21))}`;
	}
	return cur;
}
