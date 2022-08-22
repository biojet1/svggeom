import { parseDesc, dSplit } from './path/parser.js';
import { SegmentSE } from './path/index.js';
import { Box } from './box.js';

export interface DParams {
	relative?: boolean;
	close?: boolean | null;
	smooth?: boolean;
	short?: boolean;
	dfix?: number;
}

export class Path {
	static digits = 5;
	private _segs: SegmentSE[];
	private _length?: number;
	private _lengths?: Array<number>;

	private constructor(segs: SegmentSE[]) {
		this._segs = segs;
	}

	getTotalLength() {
		return this.calcLength();
	}

	getBBox() {
		return this._segs.reduce((box, seg) => box.merge(seg.bbox()), Box.new());
	}

	tangentAt(T: number) {
		// SegmentSE method
		const [seg, t] = this.segmentAt(T);
		if (seg) return seg.tangentAt(t);
	}

	slopeAt(T: number) {
		// SegmentSE method
		const [seg, t] = this.segmentAt(T);
		if (seg) return seg.slopeAt(t);
	}

	pointAt(T: number) {
		// SegmentSE method
		const [seg, t] = this.segmentAt(T);
		if (seg) return seg.pointAt(t);
	}

	bbox() {
		// SegmentSE method
		return this._segs.reduce((box, seg) => box.merge(seg.bbox()), Box.new());
	}

	splitAt(T: number) {
		// SegmentSE method
		const [seg, t, i] = this.segmentAt(T);
		if (seg) {
			const { _segs: segs } = this;
			let s;
			let a = segs.slice(0, i);
			let b = segs.slice(i + 1);
			(s = seg.cropAt(0, t)) && a.push(s);
			(s = seg.cropAt(t, 1)) && b.unshift(s);
			return [new Path(a), new Path(b)];
		}
	}

	cutAt(T: number): Path {
		// SegmentSE method
		const [seg, t, i] = this.segmentAt(T < 0 ? -T : T);
		if (seg) {
			const { _segs: segs } = this;
			if (T < 0) {
				const a = segs.slice(i + 1);
				const s = seg.cropAt(t, 1);
				s && a.unshift(s);
				return new Path(a);
			} else {
				const a = segs.slice(0, i);
				const s = seg.cropAt(0, t);
				s && a.push(s);
				return new Path(a);
			}
		}
		return new Path([]);
	}

	cropAt(T0: number, T1: number = 1): Path {
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
		return new Path([]);
	}

	transform(M: any) {
		// SegmentSE method
		return new Path(this._segs.map((seg) => seg.transform(M)));
	}

	reversed() {
		// SegmentSE method
		return new Path(this._segs.map((seg) => seg.reversed()).reverse());
	}

	get length() {
		// SegmentSE method
		return this.calcLength();
	}

	get totalLength() {
		return this.calcLength();
	}

	pointAtLength(L: number) {
		const { totalLength } = this;
		return totalLength && this.pointAt(L / totalLength);
	}

	[Symbol.iterator]() {
		return this._segs.values();
	}

	private calcLength() {
		if (this._lengths) {
			return this._length;
		}
		const lens = this._segs.map((c: SegmentSE) => c.length);
		const len = (this._length = lens.reduce((a, b) => a + b, 0));
		this._lengths = lens.map((v) => v / len);
		return len;
	}

	private get lengths() {
		return this._lengths || [];
	}

	get firstPoint() {
		const { _segs: segs } = this;
		for (const seg of segs) {
			return seg.start;
		}
	}

	get firstSegmentSE() {
		const { _segs: segs } = this;
		for (const seg of segs) {
			return seg;
		}
	}

	get lastPoint() {
		const { _segs: segs } = this;
		const { length } = segs;
		if (length > 0) {
			return segs[length - 1].end;
		}
	}

	get lastSegmentSE() {
		const { _segs: segs } = this;
		const { length } = segs;
		if (length > 0) {
			return segs[length - 1];
		}
	}

	segmentAt(T: number): [SegmentSE | undefined, number, number] {
		const { _segs: segs } = this;
		if (segs.length > 0) {
			this.calcLength();
			const { lengths } = this;
			if (T <= 0) {
				for (const [i, seg] of segs.entries()) {
					if (lengths[i] > 0) {
						return [seg, 0, i];
					}
				}
			} else if (T >= 1) {
				for (let i = segs.length; i-- > 0; ) {
					if (lengths[i] > 0) {
						return [segs[i], 1, i];
					}
				}
			} else {
				let start = 0;
				for (const [i, seg] of segs.entries()) {
					const len = lengths[i];
				 	if (len > 0) {
						const end = start + len;
						if (end >= T) {
							return [seg, (T - start) / (end - start), i];
						}
						start = end;
					}
				}
			}
		}
		return [undefined, NaN, NaN];
		// throw new Error('No segments');
	}

	isContinuous() {
		// Checks if a path is continuous with respect to its
		// parameterization.
		const { _segs: segs } = this;
		const f = segs.length - 1;
		let i = 0;
		while (i < f) {
			const { end } = segs[i];
			const { start } = segs[++i];
			if (!end.equals(start)) {
				return false;
			}
		}
		//     return all(self[i].end == self[i+1].start for i in range(len(self) - 1))
		return i > 0;
	}

	isClosed() {
		const { _segs: segs } = this;
		const n = segs.length;
		if (n > 0 && this.isContinuous()) {
			return segs[0].start.equals(segs[n - 1].end);
		}
		return false;
	}

	private *enumDesc(params: DParams) {
		const {
			relative: rel = false,
			close = true,
			smooth = false,
			short = false,
			dfix = Path.digits,
		} = params;

		let segs = this._segs;
		const n = segs.length;
		let self_closed = false;
		function fixNum(n: number) {
			const v = n.toFixed(dfix);
			return v.indexOf('.') < 0 ? v : v.replace(/0+$/g, '').replace(/\.$/g, '');
		}

		// let self_closed =
		// 	use_closed_attrib && this.isContinuous() && this.isClosed();

		// if (self_closed) {
		// 	segs = segs.slice(0, -1);
		// }
		let current_pos = null;
		let move_pos = null;
		let previous_segment;
		const end = segs.length > 0 ? segs[segs.length - 1].end : undefined;
		TOP:for (const [i, seg] of segs.entries()) {
			const { start: seg_start } = seg;
			if (
				!current_pos ||
				!seg_start.equals(current_pos) ||
				(self_closed && end && seg_start.equals(end))
			) {
				move_pos = seg_start;
				const _seg_start = rel ? (current_pos ? seg_start.sub(current_pos) : seg_start) : seg_start;
				// console.error('Move', rel, _seg_start, current_pos, seg_start);

				yield rel ? 'm' : 'M';
				yield fixNum(_seg_start.x);
				yield fixNum(_seg_start.y);
			}
			if (seg instanceof Line) {
				OUT: {
					if (seg instanceof Close) {
						if (move_pos) {
							if (close || close == undefined) {
								if (move_pos.closeTo(seg.end)) {
									yield rel ? 'z' : 'Z';
									break OUT;
								}
							}
						}
						if (close === false) {
							break OUT;
						}
					}

					const { x, y } = rel ? seg.end.sub(seg_start) : seg.end;
					// if (x) {
					// 	if (y) {
					// 		yield rel ? 'l' : 'L';
					// 		yield x;
					// 		yield y;
					// 	} else {
					// 		yield rel ? 'h' : 'H';
					// 		yield x;
					// 	}
					// } else if (y) {
					// 	yield rel ? 'v' : 'V';
					// 	yield y;
					// } else {
					// 	yield rel ? 'l' : 'L';
					// 	yield x;
					// 	yield y;
					// }
					if (short) {
						if (seg instanceof Horizontal && !y) {
							yield rel ? 'h' : 'H';
							yield fixNum(x);
						} else if (seg instanceof Vertical && !x) {
							yield rel ? 'v' : 'V';
							yield fixNum(y);
						}
					} else {
						yield rel ? 'l' : 'L';
						yield fixNum(x);
						yield fixNum(y);
					}
				}
			} else if (seg instanceof Arc) {
				const end = rel ? seg.end.sub(seg_start) : seg.end;
				const { rx, ry, phi, bigArc, sweep } = seg;
				yield rel ? 'a' : 'A';
				yield fixNum(rx);
				yield fixNum(ry);
				yield fixNum(phi);
				yield bigArc ? 1 : 0;
				yield sweep ? 1 : 0;
				yield fixNum(end.x);
				yield fixNum(end.y);
			} else if (seg instanceof Quadratic) {
				let { c, end } = seg;
				let _smooth = smooth;
				if (_smooth) {
					if (previous_segment instanceof Quadratic) {
						const { c: cP, end: p2P } = previous_segment;
						_smooth = seg_start.closeTo(p2P) && c.sub(seg_start).closeTo(p2P.sub(cP));
					} else {
						_smooth = seg_start.closeTo(c);
					}
				}
				if (rel) {
					c = c.sub(seg_start);
					end = end.sub(seg_start);
				}
				if (_smooth) {
					yield rel ? 't' : 'T';
				} else {
					yield rel ? 'q' : 'Q';
					yield fixNum(c.x);
					yield fixNum(c.y);
				}
				yield fixNum(end.x);
				yield fixNum(end.y);
			} else if (seg instanceof Cubic) {
				let { c1, c2, end } = seg;
				let _smooth = smooth;
				if (_smooth) {
					if (previous_segment instanceof Cubic) {
						const { c2: prev_c2, end: prev_p2 } = previous_segment;
						_smooth = seg_start.closeTo(prev_p2) && c1.sub(seg_start).closeTo(prev_p2.sub(prev_c2));
					} else {
						_smooth = seg_start.closeTo(c1);
					}
				}
				if (rel) {
					c2 = c2.sub(seg_start);
					end = end.sub(seg_start);
				}
				if (_smooth) {
					yield rel ? 's' : 'S';
				} else {
					yield rel ? 'c' : 'C';
					if (rel) {
						c1 = c1.sub(seg_start);
					}
					yield fixNum(c1.x);
					yield fixNum(c1.y);
				}
				yield fixNum(c2.x);
				yield fixNum(c2.y);
				yield fixNum(end.x);
				yield fixNum(end.y);
			}
			current_pos = seg.end;
			previous_segment = seg;
		}
	}

	descArray(params: DParams = {}) {
		return Array.from(this.enumDesc(params));
	}

	describe(params: DParams = {}) {
		return this.descArray(params).join(' ');
	}

	toString() {
		return this.descArray().join(' ');
	}

	*enumSubPaths() {
		const { _segs: segs } = this;
		let prev;
		let subpath_start = 0;
		for (const [i, seg] of segs.entries()) {
			if (prev && !seg.start.equals(prev.end)) {
				yield new Path(segs.slice(subpath_start, i));
				subpath_start = i;
			}
			prev = seg;
		}
		yield new Path(segs.slice(subpath_start));
	}

	static parse(d: string): Path {
		return new Path(parseDesc(d));
	}

	static new(v?: SegmentSE[] | string | SegmentSE | Path): Path {
		if (Array.isArray(v)) {
			return new Path(v);
		} else if (!v) {
			return new Path([]);
		} else if (v instanceof Path) {
			return v;
		} else if (v instanceof SegmentSE) {
			return new Path([v]);
		} else {
			return Path.parse(v);
		}
	}
}

import { Line, Close, Vertical, Horizontal } from './path/line.js';
import { Arc } from './path/arc.js';
import { Cubic } from './path/cubic.js';
import { Quadratic } from './path/quadratic.js';
export * from './path/cubic.js';
import { SegmentLS } from './path/linked.js';
export { SegmentLS} ;
export { Arc, Quadratic, Line, dSplit };
