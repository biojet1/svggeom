import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Segment } from './index.js';
import { parseLS } from './parser.js';

function fmtN(n: number) {
	const v = n.toFixed(SegmentLS.digits);
	return v.indexOf('.') < 0 ? v : v.replace(/0+$/g, '').replace(/\.$/g, '');
}
export abstract class SegmentLS extends Segment {
	protected _prev?: SegmentLS;
	private readonly _end: Vec;
	static digits = 5;
	constructor(prev: SegmentLS | undefined, end: Vec) {
		super();
		this._prev = prev;
		this._end = end;
	}
	get prev() {
		const { _prev } = this;
		if (_prev) {
			return _prev;
		}
		throw new Error('No prev');
	}
	get start() {
		const { _prev } = this;
		if (_prev) {
			return _prev._end;
		}
		throw new Error('No prev');
	}
	get end() {
		return this._end;
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
	get prevMove(): MoveLS | undefined {
		for (let cur: SegmentLS | undefined = this._prev; cur; cur = cur._prev) {
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
		return new MoveLS(this, this.end.add(pos));
	}
	Z(): SegmentLS {
		const end = this.prevMove?.end;
		if (end) {
			return new CloseLS(this, end);
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
		return new LineLS(this, this.end.add(pos));
	}
	H(n: number) {
		return new LineLS(this, this.end.withX(n));
	}
	h(n: number) {
		return new LineLS(this, this.end.shiftX(n));
	}
	V(n: number) {
		return new LineLS(this, this.end.withY(n));
	}
	v(n: number) {
		return new LineLS(this, this.end.shiftY(n));
	}
	Q(...args: Vec[] | number[]) {
		const [p, pE] = pickPos(args);
		return new QuadLS(this, p, pE);
	}
	q(...args: Vec[] | number[]) {
		const [p, pE] = pickPos(args);
		const { end: rel } = this;
		return new QuadLS(this, rel.add(p), rel.add(pE));
	}
	C(...args: Vec[] | number[]) {
		const [c1, c2, pE] = pickPos(args);
		return new CubicLS(this, c1, c2, pE);
	}
	c(...args: Vec[] | number[]) {
		const [c1, c2, pE] = pickPos(args);
		const { end: rel } = this;
		return new CubicLS(this, rel.add(c1), rel.add(c2), rel.add(pE));
	}
	S(...args: Vec[] | number[]): CubicLS {
		const [p2, pE] = pickPos(args);
		const { end } = this;
		if (this instanceof CubicLS) {
			return new CubicLS(this, this.c2.reflectAt(end), p2, pE);
		} else {
			return new CubicLS(this, end, p2, pE);
		}
	}
	s(...args: Vec[] | number[]): CubicLS {
		const [p2, pE] = pickPos(args);
		const { end } = this;
		if (this instanceof CubicLS) {
			return new CubicLS(this, this.c2.reflectAt(end), end.add(p2), end.add(pE));
		} else {
			return new CubicLS(this, end, end.add(p2), end.add(pE));
		}
	}
	T(...args: Vec[] | number[]): QuadLS {
		const [pE] = pickPos(args);
		const { end } = this;
		if (this instanceof QuadLS) {
			return new QuadLS(this, this.p.reflectAt(end), pE);
		} else {
			return new QuadLS(this, end, pE);
		}
	}
	t(...args: Vec[] | number[]): QuadLS {
		const [pE] = pickPos(args);
		const { end } = this;
		if (this instanceof QuadLS) {
			return new QuadLS(this, this.p.reflectAt(end), end.add(pE));
		} else {
			return new QuadLS(this, end, end.add(pE));
		}
	}

	A(
		rx: number,
		ry: number,
		φ: number,
		arc: boolean | number,
		sweep: boolean | number,
		...args: Vec[] | number[]
	) {
		const [pE] = pickPos(args);
		return new ArcLS(this, rx, ry, φ, arc, sweep, pE);
	}

	a(
		rx: number,
		ry: number,
		φ: number,
		arc: boolean | number,
		sweep: boolean | number,
		...args: Vec[] | number[]
	) {
		const [pE] = pickPos(args);
		const { end: rel } = this;
		return new ArcLS(this, rx, ry, φ, arc, sweep, rel.add(pE));
	}

	override toString() {
		return this.descArray()
			.filter((v) => (typeof v == 'number' ? fmtN(v) : v))
			.join(' ');
		// return this.d();
	}

	descArray(): (number | string)[] {
		const { _prev } = this;
		if (_prev) {
			const a = _prev.descArray();
			a.push(...this._descs());
			return a;
		} else {
			return [...this._descs()];
		}
	}
	cutAt(t: number) {
		return t < 0 ? this.splitAt(-t)[1] : this.splitAt(t)[0];
	}
	cropAt(t0: number, t1: number): SegmentLS | undefined {
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

	abstract _descs(): (number | string)[];
	abstract splitAt(t: number): [SegmentLS, SegmentLS];
	static moveTo(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return new MoveLS(undefined, pos);
	}
	static lineTo(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return this.moveTo(Vec.pos(0, 0)).lineTo(pos);
	}
	static bezierCurveTo(...args: Vec[] | number[]) {
		const [c1, c2, end] = pickPos(args);
		return this.moveTo(Vec.pos(0, 0)).bezierCurveTo(c1, c2, end);
	}
	static quadraticCurveTo(...args: Vec[] | number[]) {
		const [p, end] = pickPos(args);
		return this.moveTo(Vec.pos(0, 0)).quadraticCurveTo(p, end);
	}
	static parse(d: string) {
		return parseLS(d);
	}
}

function* pickPos(args: Vec[] | number[]) {
	let n: number | undefined = undefined;
	for (const v of args) {
		if (typeof v == 'number') {
			if (n == undefined) {
				n = v;
			} else {
				yield Vec.pos(n, v);
				n = undefined;
			}
		} else if (n != undefined) {
			throw new Error(`n == ${n}`);
		} else if (v instanceof Vec) {
			yield v;
		} else {
			yield Vec.new(v);
		}
	}
}
const { min, max, abs, PI } = Math;
export class LineLS extends SegmentLS {
	override bbox() {
		const {
			start: [x1, y1],
			end: [x2, y2],
		} = this;
		const [xmin, xmax] = [min(x1, x2), max(x1, x2)];
		const [ymin, ymax] = [min(y1, y2), max(y1, y2)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}
	override get length() {
		const { start, end } = this;
		return end.sub(start).abs();
	}
	override pointAt(t: number) {
		const { start, end } = this;
		return end.sub(start).mul(t).postAdd(start);
	}
	override slopeAt(t: number) {
		const { start, end } = this;
		const vec = end.sub(start);
		return vec.div(vec.abs());
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const { end } = this;
		const c = this.pointAt(t);
		return [new LineLS(this._prev, c), new LineLS(new MoveLS(undefined, c), end)];
	}
	// override reversed() {
	// 	// throw new Error('NOTIMPL');
	// }
	override _descs() {
		const {
			end: [x, y],
		} = this;
		return ['L', x, y];
	}
}
export class MoveLS extends LineLS {
	override _descs() {
		const {
			end: [x, y],
		} = this;
		return ['M', x, y];
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const { end } = this;
		const c = this.pointAt(t);
		return [new MoveLS(this._prev, c), new MoveLS(new MoveLS(undefined, c), end)];
	}
}
export class CloseLS extends LineLS {
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const { end } = this;
		const c = this.pointAt(t);
		return [new LineLS(this._prev, c), new CloseLS(new MoveLS(undefined, c), end)];
	}

	override _descs() {
		return ['Z'];
	}
}
import { quadLength, quadSplitAt, quadSlopeAt, quadPointAt, quadBBox } from './quadratic.js';
export class QuadLS extends SegmentLS {
	readonly p: Vec;
	constructor(prev: SegmentLS | undefined, p: Vec, end: Vec) {
		super(prev, end);
		this.p = p;
	}
	private get _qpts(): Vec[] {
		const { start, p, end } = this;
		return [start, p, end];
	}
	override get length() {
		return quadLength(this._qpts);
	}
	override slopeAt(t: number): Vec {
		return quadSlopeAt(this._qpts, t);
	}
	override pointAt(t: number) {
		return quadPointAt(this._qpts, t);
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const [a, b] = quadSplitAt(this._qpts, t);
		return [
			new QuadLS(this._prev, a[1], a[2]),
			new QuadLS(new MoveLS(undefined, b[0]), b[1], b[2]),
		];
	}
	override bbox() {
		return quadBBox(this._qpts);
	}
	override _descs() {
		const {
			p: { x: x1, y: y1 },
			end: { x: ex, y: ey },
		} = this;
		return ['Q', x1, y1, ex, ey];
	}
}
import { cubicLength, cubicSlopeAt, cubicPointAt, cubicBox, cubicSplitAt } from './cubic.js';
export class CubicLS extends SegmentLS {
	readonly c1: Vec;
	readonly c2: Vec;
	constructor(prev: SegmentLS | undefined, c1: Vec, c2: Vec, end: Vec) {
		super(prev, end);
		this.c1 = c1;
		this.c2 = c2;
	}
	private get _cpts(): Vec[] {
		const { start, c1, c2, end } = this;
		return [start, c1, c2, end];
	}
	/////
	override pointAt(t: number) {
		return cubicPointAt(this._cpts, t);
	}
	override bbox() {
		return cubicBox(this._cpts);
	}
	override slopeAt(t: number): Vec {
		return cubicSlopeAt(this._cpts, t);
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const [a, b] = cubicSplitAt(this._cpts, t);
		return [
			new CubicLS(this._prev, a[1], a[2], a[3]),
			new CubicLS(new MoveLS(undefined, b[0]), b[1], b[2], b[3]),
		];
	}
	override get length() {
		return cubicLength(this._cpts);
	}
	// override reversed() {
	// 	const { start, c1, c2, end } = this;
	// 	return new CubicLS(new MoveLS(undefined, end), c2, c1, start);
	// }
	// override transform(M: any) {
	// 	const { start, c1, c2, end } = this;
	// 	return new CubicLS(
	// 		new MoveLS(undefined, start.transform(M)),
	// 		c1.transform(M),
	// 		c2.transform(M),
	// 		end.transform(M),
	// 	);
	// }
	override _descs() {
		const {
			c1: { x: x1, y: y1 },
			c2: { x: x2, y: y2 },
			end: [ex, ey],
		} = this;
		return ['C', x1, y1, x2, y2, ex, ey];
	}
}
import { arcBBox, arcLength, arcPointAt, arcSlopeAt } from './arc.js';
import { arcParams } from '../util.js';
export class ArcLS extends SegmentLS {
	readonly rx: number;
	readonly ry: number;
	readonly phi: number;
	readonly arc: boolean;
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
		arc: boolean | number,
		sweep: boolean | number,
		end: Vec,
	) {
		if (!(isFinite(φ) && isFinite(rx) && isFinite(ry))) throw Error(`${JSON.stringify(arguments)}`);
		super(prev, end);
		const { x: x1, y: y1 } = this.start;
		const { x: x2, y: y2 } = this.end;
		[this.phi, this.rx, this.ry, this.sinφ, this.cosφ, this.cx, this.cy, this.rtheta, this.rdelta] =
			arcParams(x1, y1, rx, ry, φ, (this.arc = !!arc), (this.sweep = !!sweep), x2, y2);
	}
	override bbox() {
		return arcBBox(this);
	}
	override get length() {
		return arcLength(this);
	}
	override pointAt(t: number) {
		return arcPointAt(this, t);
	}
	override slopeAt(t: number): Vec {
		return arcSlopeAt(this, t);
	}
	override splitAt(t: number): [SegmentLS, SegmentLS] {
		const { rx, ry, phi, sweep, rdelta, start, end, _prev } = this;
		const deltaA = abs(rdelta);
		const mid = arcPointAt(this, t);
		return [
			new ArcLS(_prev, rx, ry, phi, deltaA * t > PI, sweep, mid),
			new ArcLS(new MoveLS(undefined, mid), rx, ry, phi, deltaA * (1 - t) > PI, sweep, end),
		];
	}
	override _descs() {
		const {
			rx,
			ry,
			phi,
			sweep,
			arc,
			end: [x, y],
		} = this;
		return ['A', rx, ry, phi, arc ? 1 : 0, sweep ? 1 : 0, x, y];
	}
}
