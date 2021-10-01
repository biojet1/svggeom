import { /*pathParser,*/ parseDesc } from "./path/parser.js";
import { Segment } from "./path/index.js";
import { Box } from "./box.js";
// import assert from "assert";
interface IDescOpt {
	relative?: boolean;
	close?: boolean | null;
	smooth?: boolean;
	short?: boolean;
}
const iterator = Symbol.iterator;
// const parseDesc = pathParser;
export class Path {
	private _segs: Segment[];
	private _length?: number;
	private _lengths?: Array<number>;
	private constructor(segs: Segment[]) {
		this._segs = segs;
	}

	getTotalLength() {
		return this.calcLength();
	}
	getBBox() {
		return this._segs.reduce(
			(box, seg) => box.merge(seg.bbox()),
			Box.new()
		);
	}
	get length() {
		return this.calcLength();
	}
	get totalLength() {
		return this.calcLength();
	}
	bbox() {
		return this._segs.reduce(
			(box, seg) => box.merge(seg.bbox()),
			Box.new()
		);
	}
	// segments() {
	// 	return this._segs;
	// }
	[iterator]() {
		return this._segs.values();
	}

	private calcLength() {
		if (this._lengths) {
			return this._length;
		}
		const lens = this._segs.map((c: Segment) => c.length);
		const len = (this._length = lens.reduce((a, b) => a + b, 0));
		this._lengths = lens.map((v) => v / len);
		return len;
	}
	private get lengths() {
		return this._lengths || [];
	}
	get firstPoint() {
		const segs = this._segs;

		for (const seg of segs) {
			return seg.p1;
		}
	}
	get lastPoint() {
		const segs = this._segs;
		const { length } = segs;
		if (length > 0) {
			return segs[length - 1].p2;
		}
	}

	segmentAt(T: number): [Segment | undefined, number, number] {
		const segs = this._segs;
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
		const segs = this._segs;
		const f = segs.length - 1;
		let i = 0;
		while (i < f) {
			const { p2 } = segs[i];
			const { p1 } = segs[++i];
			if (!p2.equals(p1)) {
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
			return segs[0].p1.equals(segs[n - 1].p2);
		}
		return false;
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
		const {totalLength} = this;
		return totalLength && this.pointAt(L/totalLength);
	}

	splitAt(T: number) {
		const [seg, t, i] = this.segmentAt(T);
		if (seg) {
			const { _segs: segs } = this;
			let s;
			let a = segs.slice(0, i);
			let b = segs.slice(i + 1);
			(s = seg.cropAt(0, t)) && a.push(s);
			(s = seg.cropAt(t, 1)) && b.unshift(s);
			// const a = new Path(
			// 	segs
			// 		.slice(0, i)
			// 		.filter((v) => !!v)
			// 		.concat([seg.cropAt(0, t)])
			// 		.filter((v) => !!v)
			// );
			// const b = new Path(
			// 	[seg.cropAt(t, 1)].concat(segs.slice(i + 1)).filter((v) => !!v)
			// );
			return [new Path(a), new Path(b)];
		}
	}
	cutAt(T: number): Path {
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
		return new Path(this._segs.map((seg) => seg.transform(M)));
	}

	reversed() {
		return new Path(this._segs.map((seg) => seg.reversed()).reverse());
	}

	private *enumDesc(params: IDescOpt) {
		const {
			relative: rel = false,
			close = true,
			smooth = false,
			short = false,
		} = params;

		let segs = this._segs;
		const n = segs.length;
		let self_closed = false;

		// let self_closed =
		// 	use_closed_attrib && this.isContinuous() && this.isClosed();

		// if (self_closed) {
		// 	segs = segs.slice(0, -1);
		// }
		let current_pos = null;
		let move_pos = null;
		let previous_segment;
		const end = segs.length > 0 ? segs[segs.length - 1].p2 : undefined;
		for (const [i, seg] of segs.entries()) {
			const { p1: seg_start } = seg;
			if (
				!current_pos ||
				!seg_start.equals(current_pos) ||
				(self_closed && end && seg_start.equals(end))
			) {
				move_pos = seg_start;
				const _seg_start = rel
					? current_pos
						? seg_start.sub(current_pos)
						: seg_start
					: seg_start;
				// console.error('Move', rel, _seg_start, current_pos, seg_start);

				yield rel ? "m" : "M";
				yield _seg_start.x;
				yield _seg_start.y;
			}
			if (seg instanceof Line) {
				OUT: {
					if (seg instanceof Close) {
						if (move_pos) {
							if (close || close === undefined) {
								if (move_pos.equals(seg.p2)) {
									yield rel ? "z" : "Z";
									break OUT;
								}
							}
						}
						if (close === false) {
							break OUT;
						}
					}

					const { x, y } = rel ? seg.p2.sub(seg_start) : seg.p2;
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
							yield rel ? "h" : "H";
							yield x;
						} else if (seg instanceof Vertical && !x) {
							yield rel ? "v" : "V";
							yield y;
						}
					} else {
						yield rel ? "l" : "L";
						yield x;
						yield y;
					}
				}
			} else if (seg instanceof Arc) {
				const p2 = rel ? seg.p2.sub(seg_start) : seg.p2;
				const { rx, ry, phi, arc, sweep } = seg;
				yield rel ? "a" : "A";
				yield rx;
				yield ry;
				yield phi;
				yield arc;
				yield sweep;
				yield p2.x;
				yield p2.y;
			} else if (seg instanceof Quadratic) {
				let { c, p2 } = seg;
				let _smooth = smooth;
				if (_smooth) {
					if (previous_segment instanceof Quadratic) {
						const { c: cP, p2: p2P } = previous_segment;
						_smooth =
							seg_start.closeTo(p2P) &&
							c.sub(seg_start).closeTo(p2P.sub(cP));
					} else {
						_smooth = seg_start.closeTo(c);
					}
				}
				if (rel) {
					c = c.sub(seg_start);
					p2 = p2.sub(seg_start);
				}
				if (_smooth) {
					yield rel ? "t" : "T";
				} else {
					yield rel ? "q" : "Q";
					yield c.x;
					yield c.y;
				}
				yield p2.x;
				yield p2.y;
			} else if (seg instanceof Cubic) {
				let { c1, c2, p2 } = seg;
				let _smooth = smooth;
				if (_smooth) {
					if (previous_segment instanceof Cubic) {
						const { c2: prev_c2, p2: prev_p2 } = previous_segment;
						_smooth =
							seg_start.closeTo(prev_p2) &&
							c1.sub(seg_start).closeTo(prev_p2.sub(prev_c2));
					} else {
						_smooth = seg_start.closeTo(c1);
					}
				}
				if (rel) {
					c2 = c2.sub(seg_start);
					p2 = p2.sub(seg_start);
				}
				if (_smooth) {
					yield rel ? "s" : "S";
				} else {
					yield rel ? "c" : "C";
					if (rel) {
						c1 = c1.sub(seg_start);
					}
					yield c1.x;
					yield c1.y;
				}
				yield c2.x;
				yield c2.y;
				yield p2.x;
				yield p2.y;
			}
			current_pos = seg.p2;
			previous_segment = seg;
		}
	}
	descArray(params: IDescOpt = {}) {
		return Array.from(this.enumDesc(params));
	}
	describe(params: IDescOpt = {}) {
		return this.descArray(params).join(" ");
	}

	*enumSubPaths() {
		const { _segs: segs } = this;
		let prev;
		let subpath_start = 0;
		for (const [i, seg] of segs.entries()) {
			if (prev && !seg.p1.equals(prev.p2)) {
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
	// static tryParse(d: string): Path {
	// 	try {
	// 		return new Path(parseDesc(d));
	// 	} catch (err) {
	// 		return new Path([]);
	// 	}
	// }
	// static parse1(d: string): Path {
	// 	try {
	// 		return new Path(parseDesc(d));
	// 	} catch (err) {
	// 		console.error("Failed to parse ", d);
	// 		throw err;
	// 	}
	// }
	// static parse2(d: string): Path {
	// 	try {
	// 		return new Path(pathParser(d));
	// 	} catch (err) {
	// 		console.error("Failed to parse ", d);
	// 		throw err;
	// 	}
	// }
	// static fromPath(d: string): Path {
	// 	return new Path(parseDesc(d));
	// 	// return new Path(pathParser(d, new Array<Segment>()));
	// }

	// static from(v?: Segment[] | string | Segment | Path): Path {
	// 	if (Array.isArray(v)) {
	// 		return new Path(v);
	// 	} else if (!v) {
	// 		return new Path([]);
	// 	} else if (v instanceof Path) {
	// 		return v;
	// 	} else if (v instanceof Segment) {
	// 		return new Path([v]);
	// 	} else {
	// 		return Path.parse(v);
	// 	}
	// }
	static new(v?: Segment[] | string | Segment | Path): Path {
		if (Array.isArray(v)) {
			return new Path(v);
		} else if (!v) {
			return new Path([]);
		} else if (v instanceof Path) {
			return v;
		} else if (v instanceof Segment) {
			return new Path([v]);
		} else {
			return Path.parse(v);
		}
	}
}

import { Line, Close, Vertical, Horizontal } from "./path/index.js";
import { Arc } from "./path/arc.js";
import { Cubic } from "./path/cubic.js";
import { Quadratic } from "./path/quadratic.js";
export { Line, Arc, Cubic, Quadratic, Segment, Close };
