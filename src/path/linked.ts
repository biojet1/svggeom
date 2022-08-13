import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Segment } from './index.js';

export abstract class SegmentLS extends Segment {
	protected _prev?: SegmentLS;
	private readonly _end: Vec;

	constructor(prev: SegmentLS | undefined, end: Vec) {
		super();
		this._prev = prev;
		this._end = end;
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

	moveTo(pos: Vec) {
		return new MoveLS(this, pos);
	}

	lineTo(pos: Vec) {
		return new LineLS(this, pos);
	}

	closePath(): SegmentLS {
		const end = this.prevMove?.end;
		if (end) {
			return new CloseLS(this, end);
		}
		return this;
	}

	// bezierCurveTo(...args: Vec[] | number[]) {
	// 	const [c1, c2, end] = pickPos(args);
	// 	return new CubicLS(this, c1, c2, end);
	// }
	quadraticCurveTo(...args: Vec[] | number[]) {
		const [c, end] = pickPos(args);
		return new QuadLS(this, c, end);
	}

	toString() {
		return this.d();
	}
	abstract d(): string;
	// private *enumDesc() {}

	static moveTo(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return new MoveLS(undefined, pos);
	}

	static lineTo(...args: Vec[] | number[]) {
		const [pos] = pickPos(args);
		return this.moveTo(Vec.pos(0, 0)).lineTo(pos);
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
		} else {
			if (n != undefined) {
				throw new Error(`n == ${n}`);
			}
			yield v;
		}
	}
}

export class LineLS extends SegmentLS {
	bbox() {
		const {
			start: { x: p1x, y: p1y },
			end: { x: p2x, y: p2y },
		} = this;
		const [xmin, xmax] = [Math.min(p1x, p2x), Math.max(p1x, p2x)];
		const [ymin, ymax] = [Math.min(p1y, p2y), Math.max(p1y, p2y)];
		return Box.new([xmin, ymin, xmax - xmin, ymax - ymin]);
	}

	get length() {
		const { start, end } = this;
		return end.sub(start).abs();
	}
	pointAt(t: number) {
		const { start, end } = this;
		return end.sub(start).mul(t).postAdd(start);
	}

	slopeAt(t: number) {
		const { start, end } = this;
		const vec = end.sub(start);
		return vec.div(vec.abs());
	}

	d() {
		const {
			_prev,
			end: { x, y },
		} = this;
		return `${_prev?.d() ?? ''}L${x},${y}`;
	}
}

export class MoveLS extends LineLS {
	d() {
		const {
			_prev,
			end: { x, y },
		} = this;
		return `${_prev?.d() ?? ''}M${x},${y}`;
	}
}

export class CloseLS extends LineLS {
	d() {
		const {
			_prev,
			end: { x, y },
		} = this;
		return `${_prev?.d() ?? ''}Z`;
	}
}

import { quadLength, quadSlopeAt, quadPointAt, quadBBox } from './quadratic.js';
export class QuadLS extends SegmentLS {
	readonly c: Vec;
	constructor(prev: SegmentLS | undefined, c: Vec, end: Vec) {
		super(prev, end);
		this.c = c;
	}

	private get _qpts(): Vec[] {
		const { start, c, end } = this;
		return [start, c, end];
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

	override bbox() {
		return quadBBox(this._qpts);
	}
	override d() {
		const {
			_prev,
			c: { x: x1, y: y1 },
			end: { x: ex, y: ey },
		} = this;
		return `${_prev?.d() ?? ''}Q${x1},${y1} ${ex},${ey}`;
	}
}

import { cubicLength, cubicSlopeAt, cubicPointAt, cubicBox, cubicSplitAt } from './cubic.js';

export class CubicLS extends SegmentLS {
	readonly c1: Vec;
	readonly c2: Vec;

	constructor(
		prev: SegmentLS | undefined,
		c1: Vec,
		c2: Vec,
		end: Vec,
	) {
		super(prev, end);
		this.c1 = Vec.new(c1);
		this.c2 = Vec.new(c2);
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

	override splitAt(t: number) {
		const [x, y] = cubicSplitAt(this._cpts, t);
		return [
			new CubicLS(this._prev, x[1], x[2], x[3]),
			new CubicLS(new MoveLS(undefined, y[0]), y[1], y[2], y[3]),
		];
	}
	override get length() {
		return cubicLength(this._cpts);
	}
	override reversed() {
		const { start, c1, c2, end } = this;
		return new CubicLS(new MoveLS(undefined, end), c2, c1, start);
	}
	override transform(M: any) {
		const { start, c1, c2, end } = this;
		return new CubicLS(
			new MoveLS(undefined, start.transform(M)),
			c1.transform(M),
			c2.transform(M),
			end.transform(M),
		);
	}
	d() {
		const {
			_prev,
			c1: { x: x1, y: y1 },
			c2: { x: x2, y: y2 },
			end: { x: ex, y: ey },
		} = this;
		return `${_prev?.d() ?? ''}C${x1},${y1} ${x2},${y2} ${ex},${ey}`;
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
	protected constructor(
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
	override d() {
		const {
			_prev,
			rx,
			ry,
			phi,
			sweep,
			arc,
			end: [x, y],
		} = this;
		return `${_prev?.d() ?? ''}A${rx},${ry} ${phi},${arc ? 1 : 0},${sweep ? 1 : 0} ${x},${y}`;
	}
}
