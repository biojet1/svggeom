import { Vec } from '../point.js';
import { Box } from '../box.js';
import { Segment } from './index.js';

export abstract class PathLS extends Segment {
	protected _prev?: PathLS;
	private readonly _end: Vec;

	constructor(prev: PathLS | undefined, end: Iterable<number>) {
		super();
		this._prev = prev;
		this._end = Vec.new(end);
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

	get first(): PathLS | undefined {
		let cur: PathLS | undefined = this;
		while (cur) {
			const _prev: PathLS | undefined = cur._prev;
			if (_prev) {
				cur = _prev;
			} else {
				break;
			}
		}
		return cur;
	}
	get prevMove(): MoveLS | undefined {
		for (let cur: PathLS | undefined = this._prev; cur; cur = cur._prev) {
			if (cur instanceof MoveLS) {
				return cur;
			}
		}
	}
	*enum() {
		for (let cur: PathLS | undefined = this; cur; cur = cur._prev) {
			yield cur;
		}
	}

	moveTo(pos: Vec) {
		return new MoveLS(this, pos);
	}

	lineTo(pos: Vec) {
		return new LineLS(this, pos);
	}

	closePath(): PathLS {
		const end = this.prevMove?.end;
		if (end) {
			return new CloseLS(this, end);
		}
		return this;
	}

	bezierCurveTo(...args: Vec[] | number[]) {
		const [c1, c2, end] = pickPos(args);
		return new CubicLS(this, c1, c2, end);
	}

	toString() {
		return this.d();
	}
	abstract d(): string;
	private *enumDesc() {}

	static moveTo(pos: Vec) {
		return new MoveLS(undefined, pos);
	}

	static lineTo(pos: Vec) {
		return this.moveTo(Vec.pos(0, 0)).lineTo(pos);
	}
}

export class LineLS extends PathLS {
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

function* pickPos(args: Vec[] | number[]) {
	let n: number | undefined = undefined;
	for (const v of args) {
		if (typeof v == 'number') {
			if (n == null) {
				n = v;
			} else {
				yield Vec.pos(n, v);
			}
		} else {
			yield v;
		}
	}
}
import { CubicLS } from './cubic.js';
